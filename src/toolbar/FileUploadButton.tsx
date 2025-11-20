import { useRef } from 'react';
import { ActionButton } from './ActionButton';
import { FilePlusIcon } from 'lucide-react';

export function FileUploadButton({
  label,
  onUpload,
  accept,
  disabled,
  name,
}: {
  label: string;
  onUpload: (files: File[]) => void;
  accept?: string;
  disabled?: boolean;
  name?: string;
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
        name={name ? name + '-button' : undefined}
      >
        <FilePlusIcon size={24} />
      </ActionButton>
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        accept={accept}
        name={name ? name + '-input' : undefined}
        date-testid={name ? name + '-input' : undefined}
        multiple
        onChange={(e) => {
          onUpload(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />
    </>
  );
}
