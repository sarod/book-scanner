import { Table, Tooltip } from '@mantine/core';
import type { MatchResultItem } from './books/match/matchBookList';
import {
  isMatchedBook,
  isUnmatchedLibraryBook,
  isUnmatchedIsbnBook,
} from './books/match/matchBookList';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookCheckIcon,
  BookDashedIcon,
  ClockAlertIcon,
  ClockCheckIcon,
  ClockFadingIcon,
  OctagonAlertIcon,
  ScanBarcodeIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useMemo } from 'react';
import type { IsbnFetchError } from './useIsbnBooks';

type BookListItem = MatchResultItem | IsbnFetchErrorItem;

interface IsbnFetchErrorItem extends IsbnFetchError {
  type: 'isbn-fetch-error';
}

type BookListItemType = BookListItem['type'];

function errorItem(fetchError: IsbnFetchError): IsbnFetchErrorItem {
  return { ...fetchError, type: 'isbn-fetch-error' };
}
function isErrorItem(item: BookListItem): item is IsbnFetchErrorItem {
  return item.type === 'isbn-fetch-error';
}

function getType(item: BookListItem): BookListItemType {
  return item.type;
}

function getOverdue(item: BookListItem): boolean | null {
  if (isErrorItem(item) || isUnmatchedIsbnBook(item)) {
    return null;
  } else {
    return item.libraryBook.overdue;
  }
}

function getTitle(item: BookListItem): string {
  if (isErrorItem(item)) {
    return item.message;
  } else if (isMatchedBook(item)) {
    return (
      item.libraryBook.title +
      ' <=>' +
      item.matchedIsbnBook.title +
      (item.matchedIsbnBook.subtitle
        ? ' - ' + item.matchedIsbnBook.subtitle
        : '')
    );
  } else if (isUnmatchedLibraryBook(item)) {
    return item.libraryBook.title;
  } else {
    return (
      item.isbnBook.title +
      (item.isbnBook.subtitle ? ' - ' + item.isbnBook.subtitle : '') +
      ' [' +
      item.isbnBook.isbnCode +
      ']'
    );
  }
}

const columns: ColumnDef<BookListItem>[] = [
  {
    id: 'match-item-type',
    accessorFn: getType,
    header: () => {
      return <ScanBarcodeIcon size={iconSize} />;
    },
    cell: (props) => {
      switch (props.getValue() as BookListItemType) {
        case 'matched':
          return <MatchedBookPicto />;
        case 'unmatched-isbn':
          return <UnmatchedIsbnBookPicto />;
        case 'unmatched-library':
          return <UnmatchedLibraryBookPicto />;
        case 'isbn-fetch-error':
          return <FetchErrorIsbnPicto />;
      }
    },
  },
  {
    id: 'title',
    accessorFn: getTitle,
    header: 'Title',
    cell: (props) => props.getValue(),
    meta: {
      largeColumn: true,
    },
  },
  {
    id: 'return-state',
    accessorFn: getOverdue,
    header: () => {
      return <ClockFadingIcon size={iconSize} />;
    },
    cell: (props) => {
      if (props.getValue() == null) {
        return '-';
      } else if (props.getValue()) {
        return <ClockAlertIcon size={iconSize} color="#D32F2F" />;
      } else {
        return <ClockCheckIcon size={iconSize} />;
      }
    },
  },
];

const iconSize = 20;
const iconColumns = ['return-state', 'match-item-type'];

export function BookList({
  matchList: bookList,
  fetchErrors,
}: {
  matchList: MatchResultItem[];
  fetchErrors: IsbnFetchError[];
}) {
  const data: BookListItem[] = useMemo(
    () => [...bookList, ...fetchErrors.map((e) => errorItem(e))],
    [bookList, fetchErrors]
  );
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), //client-side sorting
    initialState: {
      sorting: [
        {
          id: 'return-state',
          desc: true,
        },
        {
          id: 'title',
          desc: false,
        },
      ],
    },
  });
  return (
    <Table style={{ textAlign: 'left', maxWidth: '100%' }}>
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
                          width: '40px',
                        }
                      : {}
                  }
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={
                        header.column.getCanSort()
                          ? 'cursor-pointer select-none'
                          : ''
                      }
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ display: 'flex' }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                      {header.column.getIsSorted() === 'asc' && (
                        <ArrowUpIcon size={iconSize} />
                      )}
                      {header.column.getIsSorted() === 'desc' && (
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
    <Tooltip label="Failed to fetch book data for isbn">
      <OctagonAlertIcon size={iconSize} color="#D32F2F" />
    </Tooltip>
  );
}
export function UnmatchedIsbnBookPicto() {
  return (
    <Tooltip label="Scanned but not in list">
      <TriangleAlertIcon size={iconSize} color="#FBC02D" />
    </Tooltip>
  );
}
