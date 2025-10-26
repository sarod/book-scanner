import { parse } from "papaparse";
import type { ImportedBookData } from "./ImportedBookData";
export async function parseBookFiles(
  files: File[]
): Promise<ImportedBookData[]> {
  const all = await Promise.all(files.map(parseBookFile));
  return all.flat().sort(bookCompareFn);
}

export async function parseBookFile(file: File): Promise<ImportedBookData[]> {
  return new Promise<ImportedBookData[]>((resolve, reject) => {
    parse(file, {
      header: false,
      complete: function (results, file) {
        const rows: string[][] = results.data as string[][];
        const headersRow = rows[0];
        const titleColumnIndex = headersRow.findIndex(
          (f) =>
            f.toLowerCase().startsWith("titre") ||
            f.toLowerCase().startsWith("title")
        );
        if (titleColumnIndex === -1) {
          reject("No Title column found");
        }
        const books = rows
          .slice(1)
          .map((row) => {
            if (row.length === headersRow.length) {
              return row[titleColumnIndex];
            } else {
              const extraCommas = row.length - headersRow.length;
              // assume title contained badly escaped commas cuasing extra columns
              // and include them in title.
              const recomposedTitle = row
                .slice(titleColumnIndex, titleColumnIndex + extraCommas)
                .join(",");
              return recomposedTitle;
            }
          })
          .filter((t) => !!t)
          .map((t) => ({
            title: t,
            authors: [],
          }))
          .sort(bookCompareFn);
        resolve(books);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}

function bookCompareFn(a: ImportedBookData, b: ImportedBookData) {
  return a.title.localeCompare(b.title);
}
