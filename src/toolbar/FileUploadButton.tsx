import { useRef } from 'react';
import { ActionButton } from './ActionButton';
import { FilePlusIcon } from 'lucide-react';

export function FileUploadButton({
  label,
  onUpload,
  accept,
  disabled,
}: {
  label: string;
  onUpload: (files: File[]) => void;
  accept?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      {' '}
      <ActionButton
        label={label}
        onClick={() => {
          inputRef.current?.click();
        }}
        disabled={disabled}
      >
        <FilePlusIcon size={24} />
      </ActionButton>
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        accept={accept}
        multiple
        onChange={(e) => {
          onUpload(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />
    </>
  );
}
