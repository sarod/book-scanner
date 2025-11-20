import { Tooltip, ActionIcon } from '@mantine/core';
import type { PropsWithChildren } from 'react';

export function ActionButton({
  label,
  onClick,
  children,
  disabled,
  name,
}: PropsWithChildren<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
  name?: string;
}>) {
  return (
    <Tooltip label={label}>
      <ActionIcon
        size={42}
        variant="default"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        name={name}
      >
        {children}
      </ActionIcon>
    </Tooltip>
  );
}
