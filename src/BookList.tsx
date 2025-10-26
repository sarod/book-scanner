import { Table } from "@mantine/core";
import type { MatchBookListResult } from "./matchBookList";

export function BookList({ bookList }: { bookList: MatchBookListResult }) {
  return (
    <Table style={{ textAlign: "left" }}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Titre</Table.Th>
          <Table.Th>Status</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {bookList.books.map((b, index) => (
          <Table.Tr key={index}>
            <Table.Td> {b.title}</Table.Td>
            <Table.Td>{b.matchedIsbnBook ? " ✅ " : " 🔎 "}</Table.Td>
          </Table.Tr>
        ))}
        {bookList.unmatchedIsbns.map((b, index) => (
          <Table.Tr key={index}>
            <Table.Td> {b.title}</Table.Td>
            <Table.Td>❓</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
