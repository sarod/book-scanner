import type { IsbnBookData } from "./IsbnBookData";

export async function fetchIsbnBookData(isbn: string): Promise<IsbnBookData> {
  type VolumeListResponse = {
    items: { volumeInfo: IsbnBookData }[];
  };
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
  );
  const volumes = (await response.json()) as VolumeListResponse;
  if (volumes.items.length === 0) {
    throw new Error("No book found for ISBN " + isbn);
  }
  return volumes.items[0].volumeInfo;
}
