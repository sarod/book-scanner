import { useMemo } from 'react';
import H5qrScanner from './H5qrScanner';
import type { ScannerProps } from './ScannerProps';
import { IsbnForm } from './IsbnForm';
import ZXingYudielQRScanner from './YudielQRScanner';

export type ScannerImpl = 'yudiel-react-qr-scanner' | 'h5qr-scanner' | 'form';

export function Scanner({
  onDetected,
}: ScannerProps & { scannerImpl?: ScannerImpl }) {
  const scannerImpl = useMemo(() => findScannerImpl(document.URL), []);
  return (
    <>
      {scannerImpl === 'h5qr-scanner' && (
        <H5qrScanner onDetected={onDetected} />
      )}
      {scannerImpl === 'yudiel-react-qr-scanner' && (
        <ZXingYudielQRScanner onDetected={onDetected} />
      )}
      {scannerImpl === 'form' && <IsbnForm onDetected={onDetected} />}
    </>
  );
}

function findScannerImpl(url: string): ScannerImpl {
  const param = new URL(url).searchParams.get('scanner');
  if (
    param === 'h5qr-scanner' ||
    param === 'yudiel-react-qr-scanner' ||
    param === 'form'
  ) {
    return param;
  } else {
    return 'yudiel-react-qr-scanner';
  }
}
