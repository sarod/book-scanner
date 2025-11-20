import { useState } from 'react';
import { Select } from '@mantine/core';
import type { ScannerProps } from './ScannerProps';
import {
  Scanner,
  useDevices,
  type IDetectedBarcode,
} from '@yudiel/react-qr-scanner';
export default function ZXingYudielQRScanner({ onDetected }: ScannerProps) {
  const devices = useDevices();
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>(
    devices.find((_, i) => i === 0)?.deviceId
  );
  const highlightCodeOnCanvas = (
    detectedCodes: IDetectedBarcode[],
    ctx: CanvasRenderingContext2D
  ) => {
    detectedCodes.forEach((detectedCode) => {
      const { boundingBox, cornerPoints } = detectedCode;

      // Draw bounding box
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 4;
      ctx.strokeRect(
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height
      );

      // Draw corner points
      ctx.fillStyle = '#FF0000';
      cornerPoints.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
    });
  };
  return (
    <div>
      <Select
        value={selectedDevice}
        onChange={(value) => {
          setSelectedDevice(value || undefined);
        }}
        data={devices.map((device) => ({
          value: device.deviceId,
          label: device.label || `Camera ${device.deviceId}`,
        }))}
      ></Select>

      <Scanner
        onScan={(result: IDetectedBarcode[]) => {
          if (result.length > 0) {
            onDetected(result[0].rawValue);
          }
        }}
        formats={['ean_13']}
        components={{
          tracker: highlightCodeOnCanvas,
          torch: true,
          finder: true,
        }}
        sound={false}
        constraints={{
          deviceId: selectedDevice,
        }}
      />
    </div>
  );
}
