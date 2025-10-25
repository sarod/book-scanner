import H5qrLowLevelScanner from "./H5qrLowLevelScanner";
import H5qrScanner from "./H5qrScanner";
import type { ScannerProps } from "./ScannerProps";
import ZXingScanner from "./ZXingScanner";

export type ScannerImpl = "h5qr-scanner" | "h5qr-low-level" | "zxing";

export function Scanner({
  onDetected,
  scannerImpl = "h5qr-scanner",
}: ScannerProps & { scannerImpl?: ScannerImpl }) {
  return (
    <>
      {scannerImpl === "zxing" && <ZXingScanner onDetected={onDetected} />}
      {scannerImpl === "h5qr-low-level" && (
        <H5qrLowLevelScanner onDetected={onDetected} />
      )}
      {scannerImpl === "h5qr-scanner" && (
        <H5qrScanner onDetected={onDetected} />
      )}
    </>
  );
}
