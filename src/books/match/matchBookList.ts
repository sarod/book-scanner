import type { IsbnBookData } from "../isbn/IsbnBookData";
import type { LibraryBookData } from "../library/LibraryBookData";

/**
 * Union type for match results
 */
export type MatchResultItem =
  | MatchedBook
  | UnmatchedLibraryBook
  | UnmatchedIsbnBook;

/**
 * A library book that has been matched with an ISBN book
 */
export interface MatchedBook {
  type: "matched";
  libraryBook: LibraryBookData;
  matchedIsbnBook: IsbnBookData;
}

/**
 * A library book that could not be matched with any ISBN book
 */
export interface UnmatchedLibraryBook {
  type: "unmatched-library";
  libraryBook: LibraryBookData;
}

/**
 * An ISBN book that could not be matched with any library book
 */
export interface UnmatchedIsbnBook {
  type: "unmatched-isbn";
  isbnBook: IsbnBookData;
}

/**
 * Type guard to check if a MatchResultItem is a MatchedBook
 */
export function isMatchedBook(item: MatchResultItem): item is MatchedBook {
  return item.type === "matched";
}

/**
 * Type guard to check if a MatchResultItem is an UnmatchedLibraryBook
 */
export function isUnmatchedLibraryBook(
  item: MatchResultItem
): item is UnmatchedLibraryBook {
  return item.type === "unmatched-library";
}

/**
 * Type guard to check if a MatchResultItem is an UnmatchedIsbnBook
 */
export function isUnmatchedIsbnBook(
  item: MatchResultItem
): item is UnmatchedIsbnBook {
  return item.type === "unmatched-isbn";
}

export function matchBookList(
  libraryBooks: LibraryBookData[],
  isbnBooks: IsbnBookData[]
): MatchResultItem[] {
  const unmatchedIsbnBooks = [...isbnBooks];
  const results: MatchResultItem[] = [];

  // Process library books and try to match them with ISBN books
  for (const libraryBook of libraryBooks) {
    const isbnBookIndex = unmatchedIsbnBooks.findIndex((isbnBook) =>
      isMatching(libraryBook, isbnBook)
    );

    if (isbnBookIndex !== -1) {
      const isbnBook = unmatchedIsbnBooks[isbnBookIndex];
      unmatchedIsbnBooks.splice(isbnBookIndex, 1);
      results.push({
        type: "matched",
        libraryBook,
        matchedIsbnBook: isbnBook,
      });
    } else {
      results.push({
        type: "unmatched-library",
        libraryBook,
      });
    }
  }

  // Add remaining unmatched ISBN books
  for (const isbnBook of unmatchedIsbnBooks) {
    results.push({
      type: "unmatched-isbn",
      isbnBook,
    });
  }

  return results;
}

function isMatching(
  libraryBook: LibraryBookData,
  isbnBook: IsbnBookData
): boolean {
  const normalizedTitle = normalizeForCompare(libraryBook.title);
  const normalizedIsbnTitle = normalizeForCompare(isbnBook.title);
  if (normalizedTitle === normalizedIsbnTitle) {
    return true;
  }

  const libraryTitleParts = splitForFragmentsCompare(normalizedTitle);
  const isbnTitleFragments = [
    ...splitForFragmentsCompare(normalizedIsbnTitle),
    ...splitForFragmentsCompare(normalizeForCompare(isbnBook.subtitle ?? "")),
  ];

  return libraryTitleParts.some((tp) => isbnTitleFragments.includes(tp));
}

function splitForFragmentsCompare(
  input: string,
  minFragmentsLength = 6
): string[] {
  return input
    .split(/(-|:)/)
    .map((s) => s.trim())
    .filter((s) => s.length >= minFragmentsLength);
}

function normalizeForCompare(s: string): string {
  return normalizeVolumeNotation(
    s
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
  );
}

export function normalizeVolumeNotation(s: string): string {
  // tome 1 => (1)
  // - tome 1 => (1)
  // tome 01 => (1)
  // (1) => (1)
  // : tome 1 => (1)

  return s.replace(
    //   /[-:\s]\s*(?:(?:(?:volume)|(?:tome)|(?:book))\s+\(?(?<vol1>\d+)\)?)|(?:\((?<vol2>\d+)\))/gi,
    /(?:^|(?<space>\s)|-|:)\s*(?:(?:(?:(?:volume)|(?:tome)|(?:book))\s+\(?(?<vol1>\d+)\)?)|(?:\((?<vol2>\d+)\)))/gi,
    (...args) => {
      const namedGroups = args[args.length - 1] as {
        space?: string;
        vol1?: string;
        vol2?: string;
      };
      const volumeNumber = Number(namedGroups.vol1 ?? namedGroups.vol2);
      return (namedGroups.space ?? "") + "(" + volumeNumber.toString() + ")";
    }
  );
}
