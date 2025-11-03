import type { LibraryBookData } from "./LibraryBookData";

const statusColumnIndex = 0;
const titleColumnIndex = 1;
const infoColumnIndex = 2;
const headersLength = 3;

export function isDecalogCSV(headers: string[]) {
  return (
    headers.length === headersLength &&
    headers[statusColumnIndex] === "État" &&
    headers[titleColumnIndex] === "Titre du document" &&
    headers[infoColumnIndex] === "Informations"
  );
}

export function parseDecalogCsv(
  headers: string[],
  rows: string[][]
): LibraryBookData[] {
  if (!isDecalogCSV(headers)) {
    throw new Error("Not a decalog CSV");
  }
  const books = rows
    .map((row) => {
      const fixedRow = fixDecalogCsvRowLength(row);
      return parseDecalogRow(fixedRow);
    })
    // Remove empty books
    .filter((book) => !!book.title);
  return books;
}

function parseDecalogRow(row: string[]): LibraryBookData {
  const decaStatus = row[statusColumnIndex];
  const decaTitle = row[titleColumnIndex];
  const decaInfo = row[infoColumnIndex];
  const overdue = decaStatus === "En retard";

  const { title, authors } = splitDecaTitle(decaTitle);
  const returnDate = extractReturnDateFromDecaInfo(decaInfo);
  return {
    title,
    overdue,
    authors,
    returnDate,
  };
}

function splitDecaTitle(decaTitle: string): {
  title: string;
  authors: string[];
} {
  // Deca title looks like this:
  // <Title> par <authors> Publié par <publisher>, <publish date>
  // or like this <Title> par <authors> Publié en <publish date>
  const titleAndAuthor = removePublishInfo(decaTitle);

  const splitAuthor = titleAndAuthor.split("par");
  if (splitAuthor.length !== 2) {
    return { title: titleAndAuthor.trim(), authors: [] };
  }
  const [title, authorsStr] = splitAuthor;
  const authors = authorsStr.split(",").map((a) => a.trim());
  return {
    title: title.trim(),
    authors,
  };
}

function extractReturnDateFromDecaInfo(decaInfo: string): string | undefined {
  // Look for "Retour prévu le <DD>/<MM>/<YYYY>"
  const matchRegex =
    /Retour prévu le (?<day>\d{2})\/(?<month>\d{2})\/(?<year>\d{4})/;
  const res = matchRegex.exec(decaInfo);
  if (!res?.groups) {
    return undefined;
  } else {
    const day = res.groups.day;
    const month = res.groups.month;

    const year = res.groups.year;

    // ISO
    return `${year}-${month}-${day}`;
  }
}

function removePublishInfo(decaTitle: string): string {
  const indexPublishedBy = decaTitle.lastIndexOf("Publié par");
  if (indexPublishedBy !== -1) {
    return decaTitle.slice(0, indexPublishedBy);
  }
  const indexPublishedIn = decaTitle.lastIndexOf("Publié en");
  if (indexPublishedIn !== -1) {
    return decaTitle.slice(0, indexPublishedIn);
  }
  return decaTitle;
}

function fixDecalogCsvRowLength(row: string[]): string[] {
  if (row.length === headersLength) {
    return row;
  } else {
    // Rows has more item than header length
    // Decalog does not escape commas which causes extra columns when parsed with papaparse.
    // Assume the extra columns belong to title.
    const extraCommas = row.length - headersLength;
    const fullTitle = row
      .slice(titleColumnIndex, titleColumnIndex + extraCommas)
      .join(",");
    return [row[0], fullTitle, row[row.length - 1]];
  }
}
