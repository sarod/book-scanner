import type { IsbnBookData } from "./IsbnBookData";

type VolumeListResponse = {
  items: { volumeInfo: VolumeInfo }[];
};
type VolumeInfo = {
  title: string;
  subtitle?: string;
  authors: string[];
  description?: string;
  publishedDate: string;
  industryIdentifiers: { type: string; identifier: string }[];
  pageCount: number;
  dimensions?: { height: string; width: string; thickness: string };
  imageLinks?: {
    thumbnail: string;
    smallThumbnail: string;
    small: string;
    medium: string;
  };
};

export async function fetchIsbnBookData(isbn: string): Promise<IsbnBookData> {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
  );
  const volumes = (await response.json()) as VolumeListResponse;
  if (volumes.items.length === 0) {
    throw new Error("No book found for ISBN " + isbn);
  }
  const volumeInfo = volumes.items[0].volumeInfo;
  return {
    isbnCode: isbn,
    title: volumeInfo.title,
    subtitle: volumeInfo.subtitle,
    authors: volumeInfo.authors,
    description: volumeInfo.description,
  };
}
