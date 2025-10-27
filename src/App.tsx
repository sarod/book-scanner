import { useCallback, useMemo, useRef, useState } from "react";
import "./App.css";
import "@mantine/core/styles.css";
import { Divider, MantineProvider } from "@mantine/core";
import { isIsbn } from "./books/isbn/isIsbn";
import { Scanner } from "./scanner/Scanner";
import {
  CameraIcon,
  CameraOffIcon,
  FilePlusIcon,
  ListRestartIcon,
} from "lucide-react";
import type { IsbnBookData } from "./books/isbn/IsbnBookData";
import { fetchIsbnBookData } from "./books/isbn/fetchIsbnBookData";
import {
  matchBookList,
  type MatchBookListResult,
} from "./books/match/matchBookList";
import { BookList } from "./BookList";
import type { ImportedBookData } from "./books/ImportedBookData";
import { parseBookFiles } from "./books/parseBookFiles";
import { notifications } from "@mantine/notifications";
import { BookListStats } from "./toolbar/BookListStats";
import { ActionButton } from "./toolbar/ActionButton";

function App() {
  const [importedBooks, setImportedBooks] = useState<ImportedBookData[]>([]);
  const [, setIsbnCodes] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [isbnBooks, setIsbnBooks] = useState<IsbnBookData[]>([]);
  const reset = useCallback(() => {
    setImportedBooks([]);
    setIsbnCodes([]);
    setIsbnBooks([]);
    setScanning(false);
  }, []);
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
          () => {
            notifications.show({
              message: "Error fetching Book Data for isbn:" + code,
            });
          }
        );
        return [...codes, code];
      });
    }
  }, []);
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
        <div className="app-actions">
          <FileUploadButton
            accept="text/csv,text/plain"
            label="Upload book list"
            onUpload={onUpload}
            disabled={scanning}
          />
          <ActionButton label="Rest List" onClick={reset} disabled={scanning}>
            <ListRestartIcon size={24} />
          </ActionButton>
          <BookListStats stats={matchedBookList.stats} />
          <Divider orientation="vertical" />
          {scanning ? (
            <ActionButton
              label="Stop scanning"
              onClick={() => {
                setScanning(false);
              }}
            >
              <CameraOffIcon size={24} />
            </ActionButton>
          ) : (
            <ActionButton
              label="Start scanning"
              onClick={() => {
                setScanning(true);
              }}
            >
              <CameraIcon size={24} />
            </ActionButton>
          )}
        </div>
        {scanning && <Scanner onDetected={onDetected} />}
        {!scanning && <BookList bookList={matchedBookList} />}
      </MantineProvider>
    </>
  );
}
function FileUploadButton({
  label,
  onUpload,
  accept,
  disabled,
}: {
  label: string;
  onUpload: (files: File[]) => void;
  accept?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      {" "}
      <ActionButton
        label={label}
        onClick={() => {
          inputRef.current?.click();
        }}
        disabled={disabled}
      >
        <FilePlusIcon size={24} />
      </ActionButton>
      <input
        ref={inputRef}
        type="file"
        style={{ display: "none" }}
        accept={accept}
        multiple
        onChange={(e) => {
          onUpload(Array.from(e.target.files ?? []));
        }}
      />
    </>
  );
}

export default App;
