// BarcodeScanner.tsx
import { useEffect, useMemo } from "react";
import { Html5QrcodeScanner, type Html5QrcodeResult } from "html5-qrcode";
import type { ScannerProps } from "./ScannerProps";
import "./H5qrScanner.css";

let incrementId = 1;

export default function H5qrScanner({ onDetected }: ScannerProps) {
  const scannerId = useMemo(() => "scanner-" + (incrementId++).toString(), []);
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      scannerId,
      {
        fps: 5,
        qrbox: { width: 300, height: 200 },
        showTorchButtonIfSupported: true,
      },
      false
    );
    scanner.render(
      (decodedText: string, result: Html5QrcodeResult) => {
        console.log(decodedText, result.result.bounds);
        onDetected(decodedText);
      },
      (err: string) => {
        console.debug("QR scan error", err);
      }
    );

    // Cleanup when closed
    return () => {
      scanner.clear().catch((e: unknown) => {
        console.error(e);
      });
    };
  }, [onDetected, scannerId]);

  return <div id={scannerId} style={{ width: "100%", minHeight: 300 }} />;
}
