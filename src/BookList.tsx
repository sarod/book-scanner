import { Table, Tooltip } from "@mantine/core";
import type { MatchResultItem } from "./books/match/matchBookList";
import {
  isMatchedBook,
  isUnmatchedLibraryBook,
  isUnmatchedIsbnBook,
} from "./books/match/matchBookList";
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
  CrossIcon,
  ScanBarcodeIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useMemo } from "react";

type MatchResultItemType = MatchResultItem["type"];

function getType(matchResultItem: MatchResultItem): MatchResultItemType {
  return matchResultItem.type;
}

function getOverdue(bookData: MatchResultItem): boolean | null {
  if (isUnmatchedIsbnBook(bookData)) {
    return null;
  } else {
    return bookData.libraryBook.overdue;
  }
}

function getTitle(book: MatchResultItem): string {
  if (isMatchedBook(book)) {
    return (
      book.libraryBook.title +
      " <=>" +
      book.matchedIsbnBook.title +
      (book.matchedIsbnBook.subtitle
        ? " - " + book.matchedIsbnBook.subtitle
        : "")
    );
  } else if (isUnmatchedLibraryBook(book)) {
    return book.libraryBook.title;
  } else {
    return (
      book.isbnBook.title +
      (book.isbnBook.subtitle ? " - " + book.isbnBook.subtitle : "") +
      " [" +
      book.isbnBook.isbnCode +
      "]"
    );
  }
}

const columns: ColumnDef<MatchResultItem>[] = [
  {
    id: "match-item-type",
    accessorFn: getType,
    header: () => {
      return <ScanBarcodeIcon size={iconSize} />;
    },
    cell: (props) => {
      switch (props.getValue() as MatchResultItemType) {
        case "matched":
          return <MatchedBookPicto />;
        case "unmatched-isbn":
          return <UnmatchedIsbnBookPicto />;
        case "unmatched-library":
          return <UnmatchedLibraryBookPicto />;
      }
    },
  },
  {
    id: "title",
    accessorFn: getTitle,
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

const iconSize = 20;
const iconColumns = ["return-state", "match-item-type"];

export function BookList({ bookList }: { bookList: MatchResultItem[] }) {
  const data: MatchResultItem[] = useMemo(() => bookList, [bookList]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), //client-side sorting
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
export function UnmatchedLibraryBookPicto() {
  return (
    <Tooltip label="To match">
      <BookDashedIcon size={iconSize} color="#1565C0" />
    </Tooltip>
  );
}
export function FetchErrorIsbnPicto() {
  return (
    <Tooltip label="Scanned but not in list">
      <TriangleAlertIcon size={iconSize} color="#FBC02D" />
    </Tooltip>
  );
}
export function UnmatchedIsbnBookPicto() {
  return (
    <Tooltip label="Scanned but not in list">
      <CrossIcon size={iconSize} color="#D32F2F" />
    </Tooltip>
  );
}
