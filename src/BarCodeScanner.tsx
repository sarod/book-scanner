// BarcodeScanner.tsx
import { useEffect, useMemo } from "react";
import { Html5QrcodeScanner, type Html5QrcodeResult } from "html5-qrcode";

type Props = {
  onDetected: (code: string) => void;
  scannerId?: string;
};

let incrementId = 1;

export default function BarcodeScanner({ onDetected }: Props) {
  const scannerId = useMemo(() => "scanner-" + incrementId++, []);
  useEffect(() => {
    console.log(
      "initialize scanner " + scannerId + " onDetected=" + onDetected
    );
    const scanner = new Html5QrcodeScanner(
      scannerId,
      { fps: 5, qrbox: { width: 300, height: 200 } },
      false
    );

    scanner.render(
      (decodedText: string, result: Html5QrcodeResult) => {
        console.log(decodedText, result);
        onDetected(decodedText);
      },
      (err: string) => {
        console.log("QR scan error", err);
      }
    );

    // Cleanup when closed
    return () => {
      scanner.clear();
    };
  }, [onDetected, scannerId]);

  return <div id={scannerId} style={{ width: "100%", minHeight: 300 }} />;
}
