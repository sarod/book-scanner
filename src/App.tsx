import { useCallback, useEffect, useState } from "react";
import "./App.css";
import BarcodeScanner from "./BarCodeScanner";
import { MantineProvider } from "@mantine/core";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

const queryClient = new QueryClient();
function App() {
  const [scannedBarCodes, setScannedBarCodes] = useState<string[]>([]);
  const onDetect = useCallback((code: string) => {
    console.log(code);
    setScannedBarCodes((codes: string[]) => {
      if (codes.includes(code)) {
        return codes;
      }
      return [...codes, code];
    });
  }, []);
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <h1>Scanner</h1>
          <BarcodeScanner onDetected={onDetect} />
          <ul>
            {scannedBarCodes.map((code, index) => (
              <li key={index}>
                <BookInfo isbn={code} />
              </li>
            ))}
          </ul>
        </MantineProvider>
      </QueryClientProvider>
    </>
  );
}

type BookData = {
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
type VolumeListResponse = {
  items: { volumeInfo: BookData }[];
};

function BookInfo({ isbn }: { isbn: string }) {
  const query = useQuery({
    queryKey: ["book-info", isbn],
    queryFn: async () => {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
      );
      const volumes = (await response.json()) as VolumeListResponse;
      if (volumes.items.length === 0) {
        throw new Error("No book found for ISBN " + isbn);
      }
      return volumes.items[0].volumeInfo;
    },
  });
  if (query.isLoading) {
    return <div>#{isbn} ...</div>;
  } else if (query.isError) {
    return (
      <div>
        #{isbn} Error: {(query.error as Error).message}
      </div>
    );
  } else {
    return (
      <div>
        {query.data?.title} ({query.data?.authors})
      </div>
    );
  }
}

export default App;
