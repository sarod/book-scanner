import { useState } from "react";
import { fetchIsbnBookData } from "./books/isbn/fetchIsbnBookData";
import type { IsbnBookData } from "./books/isbn/IsbnBookData";
import { isIsbn } from "./books/isbn/isIsbn";

export interface IsbnFetchError {
  isbnCode: string;
  message: string;
  error: unknown;
}
export interface UseUsbnBooksResult {
  reset: () => void;
  addIsbnCode: (code: string) => void;
  isbnBooks: IsbnBookData[];
  fetching: boolean;
  fetchErrors: IsbnFetchError[];
}

export function useIsbnBooks(): UseUsbnBooksResult {
  const [isbnCodes, setIsbnCodes] = useState<string[]>([]);
  const [isbnBooks, setIsbnBooks] = useState<IsbnBookData[]>([]);
  const [fetchErrors, setFetchErrors] = useState<IsbnFetchError[]>([]);

  const reset = () => {
    setIsbnCodes([]);
    setIsbnBooks([]);
    setFetchErrors([]);
  };

  const addIsbnCode = (code: string) => {
    if (!isIsbn(code)) {
      console.debug("Ignoring invalid isbn code " + code);
      return;
    }
    if (isbnCodes.includes(code)) {
      console.debug("Ignoring already added isbn code " + code);
      return;
    }
    console.debug("Adding new valid isbn code " + code);
    setIsbnCodes([...isbnCodes, code]);
    console.debug("Fetching isbn data for code " + code);
    fetchIsbnBookData(code).then(
      (isbnBook: IsbnBookData) => {
        setIsbnBooks((isbnBooks) => {
          if (!isbnBooks.find((b) => b.isbnCode === isbnBook.isbnCode)) {
            return [...isbnBooks, isbnBook];
          } else {
            return isbnBooks;
          }
        });
      },
      (e: unknown) => {
        const message =
          "Error fetching isbn data for code " + code + ":\n" + String(e);
        console.debug(message);
        const fetchError: IsbnFetchError = {
          isbnCode: code,
          message,
          error: e,
        };
        setFetchErrors((errors) => [...errors, fetchError]);
      }
    );
  };

  return {
    reset,
    addIsbnCode,
    isbnBooks,
    fetching: isbnCodes.length !== isbnBooks.length + fetchErrors.length,
    fetchErrors,
  };
}
