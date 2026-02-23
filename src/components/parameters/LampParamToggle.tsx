'use client';

import React, { useCallback } from 'react';
import { useDesignStore } from '@/store/designStore';
import type { DecorativeShellParams } from '@/types/design';

interface ToggleOption {
  value: string;
  label: string;
}

interface LampParamToggleProps {
  part: 'base' | 'shade';
  paramKey: keyof DecorativeShellParams;
  label: string;
  options: [ToggleOption, ToggleOption];
}

/** Binary segmented control for lamp base/shade params */
export const LampParamToggle = React.memo(function LampParamToggle({
  part,
  paramKey,
  label,
  options,
}: LampParamToggleProps) {
  const rawValue = useDesignStore((s) => s.lampParams[part][paramKey]);
  const value = String(rawValue);
  const setter = useDesignStore((s) =>
    part === 'base' ? s.setLampBaseParam : s.setLampShadeParam
  );

  const handleClick = useCallback(
    (optValue: string) => {
      const parsed =
        optValue === 'true' ? true : optValue === 'false' ? false : optValue;
      setter(paramKey, parsed as DecorativeShellParams[typeof paramKey]);
    },
    [paramKey, setter]
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-text-secondary font-sans tracking-wide uppercase">
        {label}
      </label>
      <div
        className="flex bg-bg-tertiary rounded-sm overflow-hidden"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => handleClick(opt.value)}
            data-testid={`lamp-${part}-${paramKey}-${opt.value}`}
            className={`flex-1 text-xs font-sans py-2 transition-colors ${
              value === opt.value
                ? 'bg-accent-primary/15 text-accent-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
});
