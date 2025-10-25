import { useCallback, useRef, useState } from "react";
import { Camera, StopCircle } from "lucide-react";

import { ActionIcon } from "@mantine/core";
import type { ScannerProps } from "./ScannerProps";
import { Html5Qrcode, type Html5QrcodeCameraScanConfig } from "html5-qrcode";

const id = "h5qrc-scanner";

export default function H5qrLowLevelScanner({ onDetected }: ScannerProps) {
  const codeReaderRef = useRef<Html5Qrcode>(null);
  const [scanning, setScanning] = useState<boolean>(false);

  const startScan = useCallback(() => {
    async function asyncStartScan() {
      const reader = new Html5Qrcode(id);
      const mediaContraints: MediaTrackConstraints = {
        facingMode: "environment",
      };
      const config: Html5QrcodeCameraScanConfig = {
        fps: 2,
        qrbox: { width: 450, height: 300 },
        videoConstraints: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      reader.start(
        mediaContraints,
        config,
        (decodedText, decodedResult) => {
          console.log(`Code matched = ${decodedText}`, decodedResult);
          onDetected(decodedText);
        },
        (errorMessage, error) => {
          console.debug("Code scan error", errorMessage, error);
        }
      );
      codeReaderRef.current = reader;
      setScanning(true);
    }
    asyncStartScan();
  }, [onDetected]);
  const stopScan = useCallback(() => {
    async function asyncStopScan() {
      const codeReader = codeReaderRef.current;
      if (codeReader) {
        await codeReader.stop();
        await codeReader.clear();
        codeReaderRef.current = null;
      }
      setScanning(false);
    }
    asyncStopScan();
  }, []);

  return (
    <div>
      <div className="scanner-actions">
        {scanning ? (
          <ActionIcon
            size={42}
            variant="default"
            aria-label="Stop scanning"
            onClick={stopScan}
          >
            <StopCircle size={24} />
          </ActionIcon>
        ) : (
          <ActionIcon
            size={42}
            variant="default"
            aria-label="Start scanning"
            onClick={startScan}
          >
            <Camera size={14} />
          </ActionIcon>
        )}
      </div>
      <div id="h5qrc-scanner"></div>
    </div>
  );
}
