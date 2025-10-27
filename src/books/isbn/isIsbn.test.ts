import { isIsbn } from "./isIsbn";
import { describe, test, expect } from "vitest";

describe("isIsbn", () => {
  describe("ISBN-10 validation", () => {
    test("should return true for valid ISBN-10", () => {
      expect(isIsbn("0306406152")).toBe(true); // Example: The Great Gatsby
      expect(isIsbn("0140449132")).toBe(true); // Example: Moby-Dick
      expect(isIsbn("067973452X")).toBe(true); // Example: To Kill a Mockingbird (with X check digit)
      expect(isIsbn("0-306-40615-2")).toBe(true); // Hyphenated: The Great Gatsby
      expect(isIsbn("0-140-44913-2")).toBe(true); // Hyphenated: Moby-Dick
      expect(isIsbn("0-679-73452-X")).toBe(true); // Hyphenated: To Kill a Mockingbird
    });

    test("should return false for invalid ISBN-10", () => {
      expect(isIsbn("0306406153")).toBe(false); // Invalid check digit
      expect(isIsbn("0140449133")).toBe(false); // Invalid check digit
      expect(isIsbn("067973452Y")).toBe(false); // Invalid character
      expect(isIsbn("1234567890")).toBe(false); // Invalid check digit
      expect(isIsbn("0-306-40615-3")).toBe(false); // Invalid check digit, hyphenated
    });
  });

  describe("ISBN-13 validation", () => {
    test("should return true for valid ISBN-13 starting with 978", () => {
      expect(isIsbn("9780987733344")).toBe(true); // Example: Free to Live
      expect(isIsbn("9780306406157")).toBe(true); // Example: The Great Gatsby
      expect(isIsbn("9780140449136")).toBe(true); // Example: Moby-Dick
      expect(isIsbn("9780679734529")).toBe(true); // Example: To Kill a Mockingbird
      expect(isIsbn("978-0-306-40615-7")).toBe(true); // Hyphenated: The Great Gatsby
      expect(isIsbn("978-0-140-44913-6")).toBe(true); // Hyphenated: Moby-Dick
      expect(isIsbn("978-0-679-73452-9")).toBe(true); // Hyphenated: To Kill a Mockingbird
    });

    test("should return true for valid ISBN-13 starting with 979", () => {
      expect(isIsbn("9791234567896")).toBe(true); // Hypothetical valid ISBN-13 with 979
      expect(isIsbn("979-1-234-56789-6")).toBe(true); // Hypothetical valid ISBN-13 with 979, hyphenated
    });

    test("should return false for invalid ISBN-13", () => {
      expect(isIsbn("9780306406158")).toBe(false); // Invalid check digit
      expect(isIsbn("9780140449137")).toBe(false); // Invalid check digit
      expect(isIsbn("9770306406157")).toBe(false); // Does not start with 978 or 979
      expect(isIsbn("978067973452A")).toBe(false); // Invalid character
      expect(isIsbn("978-0-306-40615-8")).toBe(false); // Invalid check digit, hyphenated
    });
  });

  describe("Invalid lengths and formats", () => {
    test("should return false for strings with invalid lengths", () => {
      expect(isIsbn("123456789")).toBe(false); // 9 digits
      expect(isIsbn("12345678901")).toBe(false); // 11 digits
      expect(isIsbn("123456789012")).toBe(false); // 12 digits
      expect(isIsbn("12345678901234")).toBe(false); // 14 digits
      expect(isIsbn("")).toBe(false); // Empty string
    });

    test("should return false for non-numeric strings", () => {
      expect(isIsbn("abcdefghij")).toBe(false); // Non-numeric
      expect(isIsbn("123456789a")).toBe(false); // Mixed characters
    });
  });
});
