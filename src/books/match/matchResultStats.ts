import type { MatchResultItem } from "./matchBookList";

export function matchResultStats(results: MatchResultItem[]): MatchResultStats {
  return {
    matchedBooks: results.filter((r) => r.type === "matched").length,
    unmatchedLibraryBooks: results.filter((r) => r.type === "unmatched-library")
      .length,
    unmatchedIsbnBooks: results.filter((r) => r.type === "unmatched-isbn")
      .length,
    total: results.length,
  };
}
/**
 * Statistics for match results
 */

export interface MatchResultStats {
  matchedBooks: number;
  unmatchedLibraryBooks: number;
  unmatchedIsbnBooks: number;
  total: number;
}
