import { useQuery } from "@tanstack/react-query";
import { fetchIsbnBookData } from "./api/isbn/fetchIsbnBook";

export function IsbnBookInfo({ isbn }: { isbn: string }) {
  const query = useQuery({
    queryKey: ["book-info", isbn],
    queryFn: async () => {
      return await fetchIsbnBookData(isbn);
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
