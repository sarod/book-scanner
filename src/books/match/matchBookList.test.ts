import { describe, it, expect } from "vitest";
import { matchBookList, normalizeVolumeNotation } from "./matchBookList";
import type { LibraryBookData } from "../library/LibraryBookData";
import type { IsbnBookData } from "../isbn/IsbnBookData";

describe("matchBookList", () => {
  const sampleImportedBook: LibraryBookData = {
    title: "Sample Book",
    authors: ["Author One"],
    overdue: false,
  };

  const sampleIsbnBook: IsbnBookData = {
    isbnCode: "1234567890",
    title: "Sample Book",
    authors: ["Author One"],
  };

  it("should match books with exact title match", () => {
    const importedBooks: LibraryBookData[] = [sampleImportedBook];
    const isbnBooks: IsbnBookData[] = [sampleIsbnBook];

    const result = matchBookList(importedBooks, isbnBooks);

    expect(result.books).toHaveLength(1);
    expect(result.books[0].matchedIsbnBook).toEqual(sampleIsbnBook);
    expect(result.extraneousIsbns).toHaveLength(0);
    expect(result.stats.matchedBooks).toBe(1);
    expect(result.stats.unmatchedBooks).toBe(0);
    expect(result.stats.extraneousIsbns).toBe(0);
  });

  it("should match books on parts", () => {
    const importedBook: LibraryBookData = {
      title: "Sample Book: A Story",
      authors: ["Author One"],
      overdue: false,
    };
    const isbnBooks: IsbnBookData[] = [sampleIsbnBook];

    const result = matchBookList([importedBook], isbnBooks);

    expect(result.books[0].matchedIsbnBook).toEqual(sampleIsbnBook);
    expect(result.stats.matchedBooks).toBe(1);
  });
  it("should match book on normalized title", () => {
    const importedBook: LibraryBookData = {
      title: "A Song of Ice and Fire (6)",
      authors: [],
      overdue: false,
    };
    const isbnBook: IsbnBookData = {
      isbnCode: "9782331078996",
      title: "A Song of Ice and Fire - Tome 06",
      authors: [],
    };

    const result = matchBookList([importedBook], [isbnBook]);

    expect(result.books[0].matchedIsbnBook).toBe(isbnBook);
    expect(result.extraneousIsbns).toHaveLength(0);
  });

  it("should not match books with different titles", () => {
    const importedBook: LibraryBookData = {
      title: "Different Book",
      authors: ["Author Two"],
      overdue: false,
    };
    const isbnBooks: IsbnBookData[] = [sampleIsbnBook];

    const result = matchBookList([importedBook], isbnBooks);

    expect(result.books[0].matchedIsbnBook).toBeUndefined();
    expect(result.extraneousIsbns).toHaveLength(1);
    expect(result.stats.matchedBooks).toBe(0);
    expect(result.stats.unmatchedBooks).toBe(1);
    expect(result.stats.extraneousIsbns).toBe(1);
  });

  it("should handle multiple books with partial matches", () => {
    const importedBooks: LibraryBookData[] = [
      { title: "Book One", authors: ["Author A"], overdue: false },
      { title: "Book Two: Extended", authors: ["Author B"], overdue: false },
      { title: "Book Three", authors: ["Author C"], overdue: false },
    ];
    const isbnBooks: IsbnBookData[] = [
      { isbnCode: "1", title: "Book One", authors: ["Author A"] },
      { isbnCode: "2", title: "Book Two", authors: ["Author B"] },
      { isbnCode: "3", title: "Book Four", authors: ["Author D"] },
    ];

    const result = matchBookList(importedBooks, isbnBooks);

    expect(result.books).toHaveLength(3);
    expect(result.books[0].matchedIsbnBook?.isbnCode).toBe("1");
    expect(result.books[1].matchedIsbnBook?.isbnCode).toBe("2");
    expect(result.books[2].matchedIsbnBook).toBeUndefined();
    expect(result.extraneousIsbns).toHaveLength(1);
    expect(result.extraneousIsbns[0].isbnCode).toBe("3");
    expect(result.stats.matchedBooks).toBe(2);
    expect(result.stats.unmatchedBooks).toBe(1);
    expect(result.stats.extraneousIsbns).toBe(1);
  });

  it("should handle case insensitive matching", () => {
    const importedBook: LibraryBookData = {
      title: "sample book",
      authors: ["Author One"],
      overdue: false,
    };
    const isbnBooks: IsbnBookData[] = [sampleIsbnBook];

    const result = matchBookList([importedBook], isbnBooks);

    expect(result.books[0].matchedIsbnBook).toEqual(sampleIsbnBook);
  });

  it("should handle empty lists", () => {
    const result = matchBookList([], []);

    expect(result.books).toHaveLength(0);
    expect(result.extraneousIsbns).toHaveLength(0);
    expect(result.stats.matchedBooks).toBe(0);
    expect(result.stats.unmatchedBooks).toBe(0);
    expect(result.stats.extraneousIsbns).toBe(0);
  });

  it("should handle extraneous ISBNs", () => {
    const importedBooks: LibraryBookData[] = [];
    const isbnBooks: IsbnBookData[] = [sampleIsbnBook];

    const result = matchBookList(importedBooks, isbnBooks);

    expect(result.books).toHaveLength(0);
    expect(result.extraneousIsbns).toHaveLength(1);
    expect(result.stats.extraneousIsbns).toBe(1);
  });

  describe("normalizeVolumeNotation", () => {
    it("should leave '(1)' unchanged", () => {
      expect(normalizeVolumeNotation("(1)")).toBe("(1)");
    });

    it("should normalize '(01)' to '(1)'", () => {
      expect(normalizeVolumeNotation("tome 01")).toBe("(1)");
    });

    it("should normalize 'tome 1' to '(1)'", () => {
      expect(normalizeVolumeNotation("tome 1")).toBe("(1)");
    });

    it("should normalize 'volume 2' to '(2)'", () => {
      expect(normalizeVolumeNotation("Volume 2")).toBe("(2)");
    });

    it("should normalize 'book 3' to '(3)'", () => {
      expect(normalizeVolumeNotation("book 3")).toBe("(3)");
    });

    it("should normalize '- tome 1' to '(1)'", () => {
      expect(normalizeVolumeNotation("- tome 1")).toBe("(1)");
    });

    it("should normalize ': tome 1' to '(1)'", () => {
      expect(normalizeVolumeNotation(": tome 1")).toBe("(1)");
    });

    it("should handle multiple volumes in string", () => {
      expect(normalizeVolumeNotation("tome 1 and tome 2")).toBe("(1) and (2)");
    });

    it("should be case insensitive", () => {
      expect(normalizeVolumeNotation("TOME 1")).toBe("(1)");
      expect(normalizeVolumeNotation("Volume 2")).toBe("(2)");
      expect(normalizeVolumeNotation("Book 3")).toBe("(3)");
    });

    it("should ignore non separated notation", () => {
      expect(normalizeVolumeNotation("MyVolume 1")).toBe("MyVolume 1");
      expect(normalizeVolumeNotation("Word(1)")).toBe("Word(1)");
    });

    it("should handle no volume notation", () => {
      expect(normalizeVolumeNotation("some title")).toBe("some title");
    });
  });
});
