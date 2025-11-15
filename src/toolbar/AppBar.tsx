import { CameraIcon, CameraOffIcon, ListRestartIcon } from "lucide-react";
import { ActionButton } from "./ActionButton";
import { FileUploadButton } from "./FileUploadButton";
import {
  UnmatchedIsbnBookPicto,
  MatchedBookPicto,
  UnmatchedLibraryBookPicto,
} from "../BookList";
import type { MatchResultStats } from "../books/match/matchResultStats";
import { Divider, Loader } from "@mantine/core";

export function AppBar({
  onReset,
  scanning,
  fetching,
  stats,
  startScanning,
  stopScanning,
  onUpload,
}: {
  onReset: () => void;
  fetching: boolean;
  stats: MatchResultStats;
  scanning: boolean;
  startScanning: () => void;
  stopScanning: () => void;
  onUpload: (files: File[]) => void;
}) {
  return (
    <div className="app-actions">
      <FileUploadButton
        accept="text/csv,text/plain"
        label="Upload book list"
        onUpload={onUpload}
      />
      <ActionButton label="Reset List" onClick={onReset}>
        <ListRestartIcon size={24} />
      </ActionButton>
      <div
        style={{
          margin: "auto",
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        <MatchedBookPicto />
        <span>: {stats.matchedBooks}&nbsp;</span>
        <UnmatchedLibraryBookPicto />
        <span>: {stats.unmatchedLibraryBooks}&nbsp;</span>
        <UnmatchedIsbnBookPicto />
        <span>: {stats.unmatchedIsbnBooks}</span>
        {fetching ? (
          <Loader type="dots" size={16} style={{ margin: "0px 8px" }} />
        ) : (
          <div style={{ width: "16px", margin: "0px 8px" }}></div>
        )}
      </div>

      <Divider orientation="vertical" />
      {scanning ? (
        <ActionButton
          label="Stop scanning"
          onClick={() => {
            stopScanning();
          }}
        >
          <CameraOffIcon size={24} />
        </ActionButton>
      ) : (
        <ActionButton
          label="Start scanning"
          onClick={() => {
            startScanning();
          }}
        >
          <CameraIcon size={24} />
        </ActionButton>
      )}
    </div>
  );
}
