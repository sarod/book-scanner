import { useCallback, useMemo, useState } from "react";
import "./App.css";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { Scanner } from "./scanner/Scanner";
import {
  matchBookList,
  type MatchBookListResult,
} from "./books/match/matchBookList";
import { BookList } from "./BookList";
import type { LibraryBookData } from "./books/library/LibraryBookData";
import { parseBookFiles } from "./books/library/parseLibraryBookFIles";

import { AppBar } from "./toolbar/AppBar";
import { useIsbnBooks } from "./useIsbnBooks";

function App() {
  const [importedBooks, setImportedBooks] = useState<LibraryBookData[]>([]);
  const [scanning, setScanning] = useState(false);
  const isbnBooks = useIsbnBooks();
  const reset = useCallback(() => {
    setImportedBooks([]);
    isbnBooks.reset();
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
