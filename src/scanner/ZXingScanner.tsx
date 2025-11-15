import { useCallback, useRef, useState } from 'react';
import { Camera, StopCircle } from 'lucide-react';

import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { ActionIcon } from '@mantine/core';
import type { ScannerProps } from './ScannerProps';
import { closeMediaStream } from './closeMediaStream';
import { getUserMedia } from './getUserMedia';

export default function ZXingScanner({ onDetected }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader>(null);
  const [scanning, setScanning] = useState<boolean>(false);

  const startScan = useCallback(() => {
    async function asyncStartScan() {
      if (!videoRef.current) {
        throw new Error('no videoRef');
      }
      console.log('Requesting camera access...');
      const stream = await getUserMedia();

      console.log('Configuring video feedback...');
      videoRef.current.srcObject = stream;
      console.log('Initializing code reader...');
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;
      console.log('Initiatizing decode');

      await codeReader.decodeFromVideoContinuously(
        videoRef.current,
        null,
        (result, err) => {
          console.log(result);
          onDetected(result.getText());
          if (err && !(err instanceof NotFoundException)) {
            console.error(err);
          }
        }
      );
      console.log('Scanning started.');
      setScanning(true);
    }
    asyncStartScan().catch((e: unknown) => {
      console.error('start scan errors', e);
    });
  }, [onDetected]);
  const stopScan = useCallback(() => {
    const codeReader = codeReaderRef.current;
    if (codeReader) {
      codeReader.stopContinuousDecode();
      codeReaderRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      const mediaStream = videoRef.current.srcObject as MediaStream;
      closeMediaStream(mediaStream);
      videoRef.current.srcObject = null;
    }
    setScanning(false);
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
      <video
        className="scanner-preview"
        ref={videoRef}
        muted
        autoPlay
        width="300"
        height="200"
        style={{ visibility: scanning ? 'visible' : 'hidden' }}
      />
    </div>
  );
}
