import { useCallback, useState } from "react";
import "./App.css";
import { ActionIcon, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isIsbn } from "./isbn/isIsbn";
import { IsbnBookInfo } from "./BookInfo";
import { Scanner } from "./scanner/Scanner";
import { Camera, StopCircle } from "lucide-react";

const queryClient = new QueryClient();

function App() {
  const [isbnCodes, setIsbnCodes] = useState<string[]>([]);
  const [notIsbnCodes, setNotIsbnCodes] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const onDetected = useCallback((code: string) => {
    console.log(code);
    if (isIsbn(code)) {
      setIsbnCodes((codes: string[]) => {
        if (codes.includes(code)) {
          return codes;
        }
        return [...codes, code];
      });
    } else {
      setNotIsbnCodes((codes: string[]) => {
        if (codes.includes(code)) {
          return codes;
        }
        return [...codes, code];
      });
    }
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <div className="scanner-actions">
            {scanning ? (
              <ActionIcon
                size={42}
                variant="default"
                aria-label="Stop scanning"
                onClick={() => setScanning(false)}
              >
                <StopCircle size={24} />
              </ActionIcon>
            ) : (
              <ActionIcon
                size={42}
                variant="default"
                aria-label="Start scanning"
                onClick={() => setScanning(true)}
              >
                <Camera size={14} />
              </ActionIcon>
            )}
          </div>
          {scanning && <Scanner onDetected={onDetected} />}
          <div>Livres scannés ({isbnCodes.length})</div>
          <ul>
            {isbnCodes.map((code, index) => (
              <li key={index}>
                <IsbnBookInfo isbn={code} />
              </li>
            ))}
          </ul>
          <details>
            <summary>Autres codes scannés ({notIsbnCodes.length})</summary>
            <ul>
              {notIsbnCodes.map((code, index) => (
                <li key={index}>{code}</li>
              ))}
            </ul>
          </details>
        </MantineProvider>
      </QueryClientProvider>
    </>
  );
}
export default App;
