import type { IsbnBookData } from "../isbn/IsbnBookData";
import type { LibraryBookData } from "../library/LibraryBookData";

/**
 * Library book with matched isbn if matched
 */
export interface MatchedBookData extends LibraryBookData {
  matchedIsbnBook?: IsbnBookData;
}

export interface MatchBookStats {
  matchedBooks: number;
  unmatchedBooks: number;
  extraneousIsbns: number;
}

export interface MatchBookListResult {
  books: MatchedBookData[];
  /**
   * Isbn books that didn't match any libraryBook
   */
  extraneousIsbns: IsbnBookData[];
  stats: MatchBookStats;
}

export function matchBookList(
  libraryBooks: LibraryBookData[],
  isbnBooks: IsbnBookData[]
): MatchBookListResult {
  const unmatchedIsbnBooks = [...isbnBooks];
  const booksExtended: MatchedBookData[] = libraryBooks.map((importedBook) => {
    const isbnBookIndex = unmatchedIsbnBooks.findIndex((isbnBook) =>
      isMatching(importedBook, isbnBook)
    );
    if (isbnBookIndex !== -1) {
      const isbnBook = unmatchedIsbnBooks[isbnBookIndex];
      unmatchedIsbnBooks.splice(isbnBookIndex, 1);
      return {
        ...importedBook,
        matchedIsbnBook: isbnBook,
      };
    } else {
      return importedBook;
    }
  });
  const matchedCount = booksExtended.filter((b) => b.matchedIsbnBook).length;
  const stats = {
    matchedBooks: matchedCount,
    unmatchedBooks: libraryBooks.length - matchedCount,
    extraneousIsbns: isbnBooks.length - matchedCount,
  };
  return {
    books: booksExtended,
    extraneousIsbns: unmatchedIsbnBooks,
    stats: stats,
  };
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
