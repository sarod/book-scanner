import { Table, Tooltip } from "@mantine/core";
import type { MatchBookListResult } from "./books/match/matchBookList";

export const matchedBookEmoji = "✅";
export const unmatchedBookEmoji = "🔎";
export const extraneousIsbn = "⚠️";

export function BookList({ bookList }: { bookList: MatchBookListResult }) {
  return (
    <Table style={{ textAlign: "left", maxWidth: "100%" }}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Titre</Table.Th>
          <Table.Th style={{ width: "80px" }}>Status</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {bookList.books.map((b, index) => (
          <Table.Tr key={index}>
            <Table.Td> {b.title}</Table.Td>
            <Table.Td>
              {b.matchedIsbnBook ? (
                <MatchedBookPicto />
              ) : (
                <UnmatchedBookPicto />
              )}
            </Table.Td>
          </Table.Tr>
        ))}
        {bookList.extraneousIsbns.map((b, index) => (
          <Table.Tr key={index}>
            <Table.Td> {b.title}</Table.Td>
            <Table.Td>
              <ExtraneousIsbnPicto />
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
export function MatchedBookPicto() {
  return (
    <Tooltip label="Matched">
      <span>{matchedBookEmoji}</span>
    </Tooltip>
  );
}
export function UnmatchedBookPicto() {
  return (
    <Tooltip label="Unmatched">
      <span>{unmatchedBookEmoji}</span>
    </Tooltip>
  );
}
export function ExtraneousIsbnPicto() {
  return (
    <Tooltip label="Scanned but not in list">
      <span>{extraneousIsbn}</span>
    </Tooltip>
  );
}
