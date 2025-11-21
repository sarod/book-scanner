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
import React, { useMemo } from 'react';
import type { IsbnFetchError } from './useIsbnBooks';
import { AccessibleIcon } from '@radix-ui/react-accessible-icon';

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
    header: () => (
      <LabeledIconWrapper label="Match Status">
        <ScanBarcodeIcon size={iconSize} />
      </LabeledIconWrapper>
    ),
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
    header: () => (
      <LabeledIconWrapper label="Ontime/Overdue Status">
        <ClockFadingIcon size={iconSize} />
      </LabeledIconWrapper>
    ),
    cell: (props) => {
      if (props.getValue() == null) {
        return '-';
      } else if (props.getValue()) {
        return (
          <LabeledIconWrapper label="Overdue">
            <ClockAlertIcon size={iconSize} color="#D32F2F" />
          </LabeledIconWrapper>
        );
      } else {
        return (
          <LabeledIconWrapper label="On time">
            <ClockCheckIcon size={iconSize} />
          </LabeledIconWrapper>
        );
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
                    // TODO Convert to action buton for accessibility
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

export function LabeledIconWrapper({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <AccessibleIcon label={label}>
      <Tooltip label={label}>{children}</Tooltip>
    </AccessibleIcon>
  );
}

export function MatchedBookPicto() {
  const label = 'Matched Book';

  return (
    <LabeledIconWrapper label={label}>
      <BookCheckIcon aria-label={label} size={iconSize} color="#388E3C" />
    </LabeledIconWrapper>
  );
}

export function UnmatchedLibraryBookPicto() {
  const label = 'Unmatched Library Book';
  return (
    <LabeledIconWrapper label={label}>
      <BookDashedIcon size={iconSize} color="#1565C0" />
    </LabeledIconWrapper>
  );
}
export function FetchErrorIsbnPicto() {
  const label = 'Failed to fetch book data for isbn';

  return (
    <LabeledIconWrapper label={label}>
      <OctagonAlertIcon size={iconSize} color="#D32F2F" />
    </LabeledIconWrapper>
  );
}
export function UnmatchedIsbnBookPicto() {
  const label = 'Scanned but not in list';
  return (
    <LabeledIconWrapper label={label}>
      <TriangleAlertIcon size={iconSize} color="#FBC02D" />
    </LabeledIconWrapper>
  );
}
