import type { IsbnBookData } from "./api/isbn/IsbnBookData";
import type { ImportedBookData } from "./ImportedBookData";

export type ExtendedImportedBookData = ImportedBookData & {
  matchedIsbnBook?: IsbnBookData;
};

export type MatchBookStats = {
  matchedBooks: number;
  unmatchedBooks: number;
  extraneousIsbns: number;
};

export type MatchBookListResult = {
  books: ExtendedImportedBookData[];
  extraneousIsbns: IsbnBookData[];
  stats: MatchBookStats;
};

export function matchBookList(
  importedBookList: ImportedBookData[],
  isbnBooks: IsbnBookData[]
): MatchBookListResult {
  const unmatchedIsbnBooks = [...isbnBooks];
  const booksExtended: ExtendedImportedBookData[] = importedBookList.map(
    (importedBook) => {
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
    }
  );
  const matchedCount = booksExtended.filter((b) => b.matchedIsbnBook).length;
  const stats = {
    matchedBooks: matchedCount,
    unmatchedBooks: importedBookList.length - matchedCount,
    extraneousIsbns: isbnBooks.length - matchedCount,
  };
  return {
    books: booksExtended,
    extraneousIsbns: unmatchedIsbnBooks,
    stats: stats,
  };
}
function isMatching(
  importedBook: ImportedBookData,
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
