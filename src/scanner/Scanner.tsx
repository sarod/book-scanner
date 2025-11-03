import { useMemo } from "react";
import H5qrLowLevelScanner from "./H5qrLowLevelScanner";
import H5qrScanner from "./H5qrScanner";
import type { ScannerProps } from "./ScannerProps";
import ZXingScanner from "./ZXingScanner";
import { IsbnForm } from "./IsbnForm";

export type ScannerImpl = "h5qr-scanner" | "h5qr-low-level" | "zxing" | "form";

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
      {scannerImpl === "form" && <IsbnForm onDetected={onDetected} />}
    </>
  );
}

function findScannerImpl(url: string): ScannerImpl {
  const param = new URL(url).searchParams.get("scanner");
  if (
    param === "h5qr-scanner" ||
    param === "zxing" ||
    param === "h5qr-low-level" ||
    param === "form"
  ) {
    return param;
  } else {
    return "h5qr-scanner";
  }
}
