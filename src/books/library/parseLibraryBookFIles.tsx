import { parse } from "papaparse";
import type { LibraryBookData } from "./LibraryBookData";
import { isDecalogCSV, parseDecalogCsv } from "./parseDecalogCsv";

export async function parseBookFiles(
  files: File[]
): Promise<LibraryBookData[]> {
  const all = await Promise.all(files.map(parseLibraryBookFile));
  return all.flat().sort(bookTitleCompareFn);
}

export async function parseLibraryBookFile(
  file: File
): Promise<LibraryBookData[]> {
  return new Promise<LibraryBookData[]>((resolve, reject) => {
    parse(file, {
      header: false,
      complete: function (results) {
        try {
          const allRows: string[][] = results.data as string[][];
          const headersRow = allRows[0];
          const rows = allRows.slice(1);

          let books: LibraryBookData[] = [];
          if (isDecalogCSV(headersRow)) {
            books = parseDecalogCsv(headersRow, rows);
          } else {
            books = parseUnknownCsv(headersRow, rows);
          }
          books.sort(bookTitleCompareFn);

          resolve(books);
        } catch (e: unknown) {
          reject(e as Error);
        }
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}

function parseUnknownCsv(
  headers: string[],
  rows: string[][]
): LibraryBookData[] {
  const titleColumnIndex = headers.findIndex(
    (f) =>
      f.toLowerCase().startsWith("titre") || f.toLowerCase().startsWith("title")
  );
  if (titleColumnIndex === -1) {
    throw new Error("No Title column found");
  }

  return rows
    .map((row) => {
      return row[titleColumnIndex];
    })
    .filter((t) => !!t)
    .map((t) => ({
      title: t,
      overdue: false,
      authors: [],
    }));
}

function bookTitleCompareFn(a: LibraryBookData, b: LibraryBookData) {
  return a.title.localeCompare(b.title);
}
