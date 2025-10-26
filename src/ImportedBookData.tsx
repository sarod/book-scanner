import type { IsbnBookData } from "./api/isbn/IsbnBookData";

export type ImportedBookData = {
  title: string;
  authors: string[];
  matchedScannedIsbnBook?: IsbnBookData;
};
