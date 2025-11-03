import { Table, Tooltip } from "@mantine/core";
import type {
  MatchBookListResult,
  MatchedBookData,
} from "./books/match/matchBookList";
import type { IsbnBookData } from "./books/isbn/IsbnBookData";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookCheckIcon,
  BookDashedIcon,
  ClockAlertIcon,
  ClockCheckIcon,
  ClockFadingIcon,
  ScanBarcodeIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useMemo } from "react";

type BookData = MatchedBookData | IsbnBookData;

type MatchState = "matched" | "unmatched" | "extraneous";

function isIsbnBook(bookData: BookData): bookData is IsbnBookData {
  return "isbnCode" in bookData;
}

const iconSize = 20;

function getMatchState(bookData: BookData): MatchState {
  if (isIsbnBook(bookData)) {
    return "extraneous";
  } else if (bookData.matchedIsbnBook) {
    return "matched";
  } else {
    return "unmatched";
  }
}

function getOverdue(bookData: BookData): boolean | null {
  if (isIsbnBook(bookData)) {
    return null;
  } else {
    return "overdue" in bookData && bookData.overdue;
  }
}

const columns: ColumnDef<BookData>[] = [
  {
    id: "match-state",
    accessorFn: getMatchState,
    header: () => {
      return <ScanBarcodeIcon size={iconSize} />;
    },
    cell: (props) => {
      switch (props.getValue()) {
        case "extraneous":
          return <ExtraneousIsbnPicto />;
        case "matched":
          return <MatchedBookPicto />;
        case "unmatched":
          return <ToMatchBookPicto />;
      }
    },
  },
  {
    id: "title",
    accessorFn: (book) => {
      if (isIsbnBook(book)) {
        return (
          book.title +
          (book.subtitle ? " - " + book.subtitle : "") +
          " [" +
          book.isbnCode +
          "]"
        );
      } else {
        if (book.matchedIsbnBook) {
          return (
            book.title +
            " <=>" +
            book.matchedIsbnBook.title +
            (book.matchedIsbnBook.subtitle
              ? " - " + book.matchedIsbnBook.subtitle
              : "")
          );
        }
        return book.title;
      }
    },
    header: "Title",
    cell: (props) => props.getValue(),
    meta: {
      largeColumn: true,
    },
  },
  {
    id: "return-state",
    accessorFn: getOverdue,
    header: () => {
      return <ClockFadingIcon size={iconSize} />;
    },
    cell: (props) => {
      if (props.getValue() == null) {
        return "-";
      } else if (props.getValue()) {
        return <ClockAlertIcon size={iconSize} color="#D32F2F" />;
      } else {
        return <ClockCheckIcon size={iconSize} />;
      }
    },
  },
];

const iconColumns = ["return-state", "match-state"];

export function BookList({ bookList }: { bookList: MatchBookListResult }) {
  const data: BookData[] = useMemo(
    () => [...bookList.books, ...bookList.extraneousIsbns],
    [bookList]
  );
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), //client-side sorti
    initialState: {
      sorting: [
        {
          id: "return-state",
          desc: true,
        },
        {
          id: "title",
          desc: false,
        },
      ],
    },
  });
  return (
    <Table style={{ textAlign: "left", maxWidth: "100%" }}>
      <Table.Thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <Table.Th
                  key={header.id}
                  colSpan={header.colSpan}
                  style={
                    iconColumns.includes(header.id)
                      ? {
                          width: "40px",
                        }
                      : {}
                  }
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ display: "flex" }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                      {header.column.getIsSorted() === "asc" && (
                        <ArrowUpIcon size={iconSize} />
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <ArrowDownIcon size={iconSize} />
                      )}
                    </div>
                  )}
                </Table.Th>
              );
            })}
          </Table.Tr>
        ))}
      </Table.Thead>
      <Table.Tbody>
        {table.getRowModel().rows.map((row) => {
          return (
            <Table.Tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <Table.Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                );
              })}
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}

export function MatchedBookPicto() {
  return (
    <Tooltip label="Matched">
      <BookCheckIcon size={iconSize} color="#388E3C" />
    </Tooltip>
  );
}
export function ToMatchBookPicto() {
  return (
    <Tooltip label="To match">
      <BookDashedIcon size={iconSize} color="#1565C0" />
    </Tooltip>
  );
}
export function ExtraneousIsbnPicto() {
  return (
    <Tooltip label="Scanned but not in list">
      <TriangleAlertIcon size={iconSize} color="#FBC02D" />
    </Tooltip>
  );
}
