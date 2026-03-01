'use client';

import React from 'react';
import { useDesignStore } from '@/store/designStore';
import type { VaseStyle } from '@/types/design';

const STYLES: { value: VaseStyle; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'spiral-fin', label: 'Spiral Fin' },
];

interface LampStyleSelectorProps {
  part: 'base' | 'shade';
}

/** Classic / Spiral Fin segmented control for lamp base or shade */
export const LampStyleSelector = React.memo(function LampStyleSelector({ part }: LampStyleSelectorProps) {
  const style = useDesignStore((s) => s.lampParams[part].style);
  const setter = useDesignStore((s) => part === 'base' ? s.setLampBaseParam : s.setLampShadeParam);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-text-secondary font-sans tracking-wide uppercase">
        Style
      </label>
      <div
        className="flex bg-bg-tertiary rounded-sm overflow-hidden"
        role="radiogroup"
        aria-label={`${part} style`}
        data-testid={`lamp-${part}-style-selector`}
      >
        {STYLES.map(({ value, label }) => (
          <button
            key={value}
            role="radio"
            aria-checked={style === value}
            onClick={() => setter('style', value)}
            data-testid={`lamp-${part}-style-${value}`}
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
