import { useCallback, useMemo, useState } from "react";
import "./App.css";
import { ActionIcon, FileInput, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isIsbn } from "./isbn/isIsbn";
import { Scanner } from "./scanner/Scanner";
import { Camera, StopCircle } from "lucide-react";
import type { IsbnBookData } from "./api/isbn/IsbnBookData";
import {
  fetchIsbnBookData,
  fetchIsbnBookDataQueryKey,
} from "./api/isbn/fetchIsbnBookData";
import { matchBookList, type MatchBookListResult } from "./matchBookList";
import { BookList } from "./BookList";
import Papa from "papaparse";

const queryClient = new QueryClient();

export type ImportedBookData = {
  title: string;
  authors: string[];
  matchedScannedIsbnBook?: IsbnBookData;
};

function App() {
  const [importedBooks, setImportedBooks] = useState<ImportedBookData[]>([]);
  const [, setIsbnCodes] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);

  const [isbnBooks, setIsbnBooks] = useState<IsbnBookData[]>([]);
  const matchedBookList: MatchBookListResult = useMemo(
    () => matchBookList(importedBooks, isbnBooks),
    [isbnBooks, importedBooks]
  );
  const onDetected = useCallback((code: string) => {
    if (isIsbn(code)) {
      setIsbnCodes((codes: string[]) => {
        if (codes.includes(code)) {
          return codes;
        }
        queryClient
          .fetchQuery({
            queryKey: fetchIsbnBookDataQueryKey(code),
            queryFn: () => fetchIsbnBookData(code),
          })
          .then((isbnBook: IsbnBookData) => {
            setIsbnBooks((isbnBooks) => {
              if (!isbnBooks.find((b) => b.isbnCode === isbnBook.isbnCode)) {
                return [...isbnBooks, isbnBook];
              } else {
                return isbnBooks;
              }
            });
          });
        return [...codes, code];
      });
    }
  }, []);
  const onUpload = useCallback((f: File | null) => {
    if (f) {
      Papa.parse(f, {
        header: true,
        complete: function (results, file) {
          console.log("Parsing complete:", results, file);

          const titleField = results.meta.fields?.find(
            (f) =>
              f.toLowerCase().startsWith("titre") ||
              f.toLowerCase().startsWith("title")
          );
          const books = results.data
            .map((row) => (row as { [key: string]: string })[titleField!])
            .filter((t) => !!t)
            .map((t) => ({
              title: t,
              authors: [],
            }));
          setImportedBooks(books);
        },
        error: function (error, file) {
          console.log("Parsing failed:", error, file);
        },
      });
    }
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          {scanning && <Scanner onDetected={onDetected} />}
          <BookList bookList={matchedBookList} />

          <div className="app-actions">
            {scanning ? (
              <ActionIcon
                size={42}
                variant="default"
                aria-label="Stop scanning"
                onClick={() => setScanning(false)}
              >
                <StopCircle size={24} />
              </ActionIcon>
            ) : (
              <ActionIcon
                size={42}
                variant="default"
                aria-label="Start scanning"
                onClick={() => setScanning(true)}
              >
                <Camera size={14} />
              </ActionIcon>
            )}
            <FileInput
              onChange={onUpload}
              accept="text/csv,text/plain"
              placeholder="Upload CSV"
            ></FileInput>
          </div>
        </MantineProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
