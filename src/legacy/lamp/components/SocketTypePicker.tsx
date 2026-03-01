'use client';

import React from 'react';
import { useDesignStore } from '@/store/designStore';
import type { SocketType } from '@/types/design';

interface SocketOption {
  value: SocketType;
  name: string;
  description: string;
  diameter: string;
}

const SOCKETS: SocketOption[] = [
  { value: 'E12', name: 'E12', description: 'Candelabra', diameter: '12mm' },
  { value: 'E14', name: 'E14', description: 'Small Edison', diameter: '14mm' },
  { value: 'E26', name: 'E26', description: 'Standard US', diameter: '26mm' },
  { value: 'E27', name: 'E27', description: 'Standard EU', diameter: '27mm' },
];

/** Visual 2x2 grid picker for lamp socket types */
export const SocketTypePicker = React.memo(function SocketTypePicker() {
  const socketType = useDesignStore((s) => s.lampParams.socketType);
  const setLampParam = useDesignStore((s) => s.setLampParam);

  return (
    <div
      className="grid grid-cols-2 gap-2"
      data-testid="socket-type-picker"
      role="radiogroup"
      aria-label="Socket type"
    >
      {SOCKETS.map(({ value, name, description, diameter }) => {
        const isActive = socketType === value;
        return (
          <button
            key={value}
            onClick={() => setLampParam('socketType', value)}
            data-testid={`socket-${value}`}
            role="radio"
            aria-checked={isActive}
            className={`
              profile-card
              flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg
              transition-all duration-200 cursor-pointer
              ${
                isActive
                  ? 'profile-card-active bg-[var(--bg-elevated)] border border-[var(--accent-primary)]/50'
                  : 'bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--bg-elevated)]'
              }
            `}
          >
            <span
              className={`text-sm font-mono font-medium tracking-wide ${
                isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              {name}
            </span>
            <span
              className={`text-[10px] leading-tight font-sans ${
                isActive ? 'text-[var(--accent-primary)]/80' : 'text-[var(--text-tertiary)]'
              }`}
            >
              {description}
            </span>
            <span
              className={`text-[9px] font-mono ${
                isActive ? 'text-[var(--accent-primary)]/60' : 'text-[var(--text-tertiary)]/70'
              }`}
            >
              {diameter}
            </span>
          </button>
        );
      })}
    </div>
  );
});
