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
  importedBook: LibraryBookData,
  isbnBook: IsbnBookData
): boolean {
  if (importedBook.title.toLowerCase() === isbnBook.title.toLowerCase()) {
    return true;
  }
  if (importedBook.title.toLowerCase().includes(isbnBook.title.toLowerCase())) {
    return true;
  }
  return false;
}
