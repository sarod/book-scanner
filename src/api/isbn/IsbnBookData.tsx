export type IsbnBookData = {
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
