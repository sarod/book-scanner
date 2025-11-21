import { useCallback, useMemo, useState } from 'react';
import './App.css';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Scanner } from './scanner/Scanner';
import {
  matchBookList,
  type MatchResultItem,
} from './books/match/matchBookList';
import { matchResultStats } from './books/match/matchResultStats';
import { BookList } from './BookList';
import type { LibraryBookData } from './books/library/LibraryBookData';
import { parseBookFiles } from './books/library/parseLibraryBookFIles';

import { AppBar } from './toolbar/AppBar';
import { useIsbnBooks } from './useIsbnBooks';

function App() {
  const [importedBooks, setImportedBooks] = useState<LibraryBookData[]>([]);
  const [scanning, setScanning] = useState(false);
  const isbnBooks = useIsbnBooks();
  const reset = useCallback(() => {
    setImportedBooks([]);
    isbnBooks.reset();
  }, [isbnBooks]);
  const matchedBookList: MatchResultItem[] = useMemo(
    () => matchBookList(importedBooks, isbnBooks.isbnBooks),
    [isbnBooks, importedBooks]
  );
  const stats = useMemo(
    () => matchResultStats(matchedBookList),
    [matchedBookList]
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
      <main>
        <MantineProvider defaultColorScheme="auto">
          <h1>Book Scanner App</h1>

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
            stats={stats}
          />
          {scanning && <Scanner onDetected={isbnBooks.addIsbnCode} />}
          {!scanning && (
            <BookList
              matchList={matchedBookList}
              fetchErrors={isbnBooks.fetchErrors}
            />
          )}
        </MantineProvider>
        {/* 
        Create mantine defult portal target manually.
        This is to avoid mantine creating it outside <main>
        and generating a11y violations.
        This target is used for instance by Tooltip and Select */}
        <div data-portal="true" data-mantine-shared-portal-node="true"></div>
      </main>
    </>
  );
}

export default App;
