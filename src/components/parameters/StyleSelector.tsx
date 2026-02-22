'use client';

import React from 'react';
import { useDesignStore } from '@/store/designStore';
import type { VaseStyle } from '@/types/design';

const STYLES: { value: VaseStyle; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'spiral-fin', label: 'Spiral Fin' },
];

/** Classic / Spiral Fin segmented control */
export const StyleSelector = React.memo(function StyleSelector() {
  const style = useDesignStore((s) => s.params.style);
  const setParam = useDesignStore((s) => s.setParam);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-text-secondary font-sans tracking-wide uppercase">
        Style
      </label>
      <div
        className="flex bg-bg-tertiary rounded-sm overflow-hidden"
        role="radiogroup"
        aria-label="Vase style"
        data-testid="style-selector"
      >
        {STYLES.map(({ value, label }) => (
          <button
            key={value}
            role="radio"
            aria-checked={style === value}
            onClick={() => setParam('style', value)}
            data-testid={`style-${value}`}
            className={`flex-1 text-[11px] font-sans tracking-wider py-2 transition-colors ${
              style === value
                ? 'bg-accent-primary/15 text-accent-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
});
