import { useMemo, useState } from "react";
import H5qrLowLevelScanner from "./H5qrLowLevelScanner";
import H5qrScanner from "./H5qrScanner";
import type { ScannerProps } from "./ScannerProps";
import ZXingScanner from "./ZXingScanner";
import { Button, TextInput } from "@mantine/core";
import { removeHyphens } from "../books/isbn/isIsbn";

export type ScannerImpl = "h5qr-scanner" | "h5qr-low-level" | "zxing" | "debug";

export function Scanner({
  onDetected,
}: ScannerProps & { scannerImpl?: ScannerImpl }) {
  const scannerImpl = useMemo(() => findScannerImpl(document.URL), []);
  return (
    <>
      {scannerImpl === "zxing" && <ZXingScanner onDetected={onDetected} />}
      {scannerImpl === "h5qr-low-level" && (
        <H5qrLowLevelScanner onDetected={onDetected} />
      )}
      {scannerImpl === "h5qr-scanner" && (
        <H5qrScanner onDetected={onDetected} />
      )}
      {scannerImpl === "debug" && (
        <DebugScanner onDetected={onDetected}></DebugScanner>
      )}
    </>
  );
}

function DebugScanner({ onDetected }: ScannerProps) {
  const [code, setCode] = useState("");
  return (
    <div>
      <TextInput
        label="Code"
        onChange={(e) => {
          setCode(e.currentTarget.value);
        }}
        value={code}
        id="isbn-code"
        autoComplete="true"
      />
      <Button
        onClick={() => {
          onDetected(removeHyphens(code.trim()));
        }}
      >
        Send
      </Button>
    </div>
  );
}

function findScannerImpl(url: string): ScannerImpl {
  const param = new URL(url).searchParams.get("scanner");
  if (
    param === "h5qr-scanner" ||
    param === "zxing" ||
    param === "h5qr-low-level" ||
    param === "debug"
  ) {
    return param;
  } else {
    return "h5qr-scanner";
  }
}
