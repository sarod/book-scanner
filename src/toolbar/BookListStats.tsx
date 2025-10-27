import {
  MatchedBookPicto,
  UnmatchedBookPicto,
  ExtraneousIsbnPicto,
} from "../BookList";
import type { MatchBookStats } from "../books/match/matchBookList";

export function BookListStats({ stats }: { stats: MatchBookStats }) {
  return (
    <div style={{ margin: "auto", fontSize: "1.2rem" }}>
      <MatchedBookPicto />: {stats.matchedBooks}&nbsp;
      <UnmatchedBookPicto />: {stats.unmatchedBooks}&nbsp;
      <ExtraneousIsbnPicto />: {stats.extraneousIsbns}
    </div>
  );
}
