import { Table } from "@mantine/core";
import type { MatchBookListResult } from "./matchBookList";

export const matchedBookEmoji = "✅";
export const unmatchedBookEmoji = "🔎";
export const extraneousIsbn = "❓";

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
              {b.matchedIsbnBook ? matchedBookEmoji : unmatchedBookEmoji}
            </Table.Td>
          </Table.Tr>
        ))}
        {bookList.extraneousIsbns.map((b, index) => (
          <Table.Tr key={index}>
            <Table.Td> {b.title}</Table.Td>
            <Table.Td> {extraneousIsbn} </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
