import { describe, it, expect } from "vitest";
import { matchResultStats } from "./matchResultStats";
import type { MatchResultItem } from "./matchBookList";
import type { LibraryBookData } from "../library/LibraryBookData";
import type { IsbnBookData } from "../isbn/IsbnBookData";

describe("matchResultStats", () => {
  const createMatchedBook = (
    libraryBook: LibraryBookData,
    isbnBook: IsbnBookData
  ): MatchResultItem => ({
    type: "matched",
    libraryBook,
    matchedIsbnBook: isbnBook,
  });

  const createUnmatchedLibraryBook = (
    libraryBook: LibraryBookData
  ): MatchResultItem => ({
    type: "unmatched-library",
    libraryBook,
  });

  const createUnmatchedIsbnBook = (
    isbnBook: IsbnBookData
  ): MatchResultItem => ({
    type: "unmatched-isbn",
    isbnBook,
  });

  it("should return zero stats for empty results", () => {
    const results: MatchResultItem[] = [];
    const stats = matchResultStats(results);

    expect(stats.matchedBooks).toBe(0);
    expect(stats.unmatchedLibraryBooks).toBe(0);
    expect(stats.unmatchedIsbnBooks).toBe(0);
    expect(stats.total).toBe(0);
  });

  it("should count matched books correctly", () => {
    const libraryBook: LibraryBookData = {
      title: "Test Book",
      authors: ["Author"],
      overdue: false,
    };
    const isbnBook: IsbnBookData = {
      isbnCode: "1234567890",
      title: "Test Book",
      authors: ["Author"],
    };

    const results: MatchResultItem[] = [
      createMatchedBook(libraryBook, isbnBook),
      createMatchedBook(libraryBook, isbnBook),
      createMatchedBook(libraryBook, isbnBook),
    ];

    const stats = matchResultStats(results);

    expect(stats.matchedBooks).toBe(3);
    expect(stats.unmatchedLibraryBooks).toBe(0);
    expect(stats.unmatchedIsbnBooks).toBe(0);
    expect(stats.total).toBe(3);
  });

  it("should count unmatched library books correctly", () => {
    const libraryBook1: LibraryBookData = {
      title: "Book 1",
      authors: ["Author 1"],
      overdue: false,
    };
    const libraryBook2: LibraryBookData = {
      title: "Book 2",
      authors: ["Author 2"],
      overdue: true,
    };

    const results: MatchResultItem[] = [
      createUnmatchedLibraryBook(libraryBook1),
      createUnmatchedLibraryBook(libraryBook2),
    ];

    const stats = matchResultStats(results);

    expect(stats.matchedBooks).toBe(0);
    expect(stats.unmatchedLibraryBooks).toBe(2);
    expect(stats.unmatchedIsbnBooks).toBe(0);
    expect(stats.total).toBe(2);
  });

  it("should count unmatched ISBN books correctly", () => {
    const isbnBook1: IsbnBookData = {
      isbnCode: "1234567890",
      title: "ISBN Book 1",
      authors: ["Author 1"],
    };
    const isbnBook2: IsbnBookData = {
      isbnCode: "0987654321",
      title: "ISBN Book 2",
      authors: ["Author 2"],
    };

    const results: MatchResultItem[] = [
      createUnmatchedIsbnBook(isbnBook1),
      createUnmatchedIsbnBook(isbnBook2),
    ];

    const stats = matchResultStats(results);

    expect(stats.matchedBooks).toBe(0);
    expect(stats.unmatchedLibraryBooks).toBe(0);
    expect(stats.unmatchedIsbnBooks).toBe(2);
    expect(stats.total).toBe(2);
  });

  it("should count mixed result types correctly", () => {
    const libraryBook: LibraryBookData = {
      title: "Test Book",
      authors: ["Author"],
      overdue: false,
    };
    const isbnBook: IsbnBookData = {
      isbnCode: "1234567890",
      title: "Test Book",
      authors: ["Author"],
    };

    const results: MatchResultItem[] = [
      createMatchedBook(libraryBook, isbnBook),
      createUnmatchedLibraryBook(libraryBook),
      createUnmatchedIsbnBook(isbnBook),
      createMatchedBook(libraryBook, isbnBook),
      createUnmatchedLibraryBook(libraryBook),
    ];

    const stats = matchResultStats(results);

    expect(stats.matchedBooks).toBe(2);
    expect(stats.unmatchedLibraryBooks).toBe(2);
    expect(stats.unmatchedIsbnBooks).toBe(1);
    expect(stats.total).toBe(5);
  });

  it("should handle large arrays efficiently", () => {
    const libraryBook: LibraryBookData = {
      title: "Test Book",
      authors: ["Author"],
      overdue: false,
    };
    const isbnBook: IsbnBookData = {
      isbnCode: "1234567890",
      title: "Test Book",
      authors: ["Author"],
    };

    // Create large arrays
    const matchedBooks: MatchResultItem[] = Array.from({ length: 100 }, () =>
      createMatchedBook(libraryBook, isbnBook)
    );
    const unmatchedLibraryBooks: MatchResultItem[] = Array.from(
      { length: 50 },
      () => createUnmatchedLibraryBook(libraryBook)
    );
    const unmatchedIsbnBooks: MatchResultItem[] = Array.from(
      { length: 25 },
      () => createUnmatchedIsbnBook(isbnBook)
    );

    const results: MatchResultItem[] = [
      ...matchedBooks,
      ...unmatchedLibraryBooks,
      ...unmatchedIsbnBooks,
    ];

    const stats = matchResultStats(results);

    expect(stats.matchedBooks).toBe(100);
    expect(stats.unmatchedLibraryBooks).toBe(50);
    expect(stats.unmatchedIsbnBooks).toBe(25);
    expect(stats.total).toBe(175);
  });
});
