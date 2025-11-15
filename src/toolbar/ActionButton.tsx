import { Tooltip, ActionIcon } from '@mantine/core';
import type { PropsWithChildren } from 'react';

export function ActionButton({
  label,
  onClick,
  children,
  disabled,
}: PropsWithChildren<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
}>) {
  return (
    <Tooltip label={label}>
      <ActionIcon
        size={42}
        variant="default"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </ActionIcon>
    </Tooltip>
  );
}
