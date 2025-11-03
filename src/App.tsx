import { useCallback, useMemo, useState } from "react";
import "./App.css";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { isIsbn } from "./books/isbn/isIsbn";
import { Scanner } from "./scanner/Scanner";
import type { IsbnBookData } from "./books/isbn/IsbnBookData";
import { fetchIsbnBookData } from "./books/isbn/fetchIsbnBookData";
import {
  matchBookList,
  type MatchBookListResult,
} from "./books/match/matchBookList";
import { BookList } from "./BookList";
import type { LibraryBookData } from "./books/library/LibraryBookData";
import { parseBookFiles } from "./books/library/parseLibraryBookFIles";
import { notifications } from "@mantine/notifications";

import { AppBar } from "./toolbar/AppBar";

function useIsbnBooks(): {
  reset: () => void;
  addIsbnCode: (code: string) => void;
  isbnBooks: IsbnBookData[];
  fetching: boolean;
} {
  const [isbnCodes, setIsbnCodes] = useState<string[]>([]);
  const [isbnBooks, setIsbnBooks] = useState<IsbnBookData[]>([]);
  const [isbnErrors, setIsbnErrors] = useState<string[]>([]);

  const reset = () => {
    setIsbnCodes([]);
    setIsbnBooks([]);
    setIsbnErrors([]);
  };

  const addIsbnCode = (code: string) => {
    if (isIsbn(code)) {
      setIsbnCodes((codes: string[]) => {
        if (codes.includes(code)) {
          return codes;
        }
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
            isbnErrors.push(
              "Error fetching Book Data for isbn " + code + ":" + String(e)
            );
            notifications.show({
              message: "Error fetching Book Data for isbn:" + code,
            });
          }
        );
        return [...codes, code];
      });
    }
  };

  return {
    reset,
    addIsbnCode,
    isbnBooks,
    fetching: isbnCodes.length !== isbnBooks.length + isbnErrors.length,
  };
}

function App() {
  const [importedBooks, setImportedBooks] = useState<LibraryBookData[]>([]);
  const [scanning, setScanning] = useState(false);
  const isbnBooks = useIsbnBooks();
  const reset = useCallback(() => {
    setImportedBooks([]);
    isbnBooks.reset();
    setScanning(false);
  }, [isbnBooks]);
  const matchedBookList: MatchBookListResult = useMemo(
    () => matchBookList(importedBooks, isbnBooks.isbnBooks),
    [isbnBooks, importedBooks]
  );
  const onUpload = useCallback((files: File[]) => {
    parseBookFiles(files).then(
      (newBooks) => {
        setImportedBooks((prev) => [...prev, ...newBooks]);
      },
      (err: unknown) => {
        console.log(err);
      }
    );
  }, []);
  return (
    <>
      <MantineProvider defaultColorScheme="auto">
        <AppBar
          scanning={scanning}
          onReset={reset}
          startScanning={() => {
            setScanning(true);
          }}
          stopScanning={() => {
            setScanning(false);
          }}
          fetching={isbnBooks.fetching}
          onUpload={onUpload}
          stats={matchedBookList.stats}
        />
        {scanning && <Scanner onDetected={isbnBooks.addIsbnCode} />}
        {!scanning && <BookList bookList={matchedBookList} />}
      </MantineProvider>
    </>
  );
}

export default App;
