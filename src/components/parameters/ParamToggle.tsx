'use client';

import React, { useCallback } from 'react';
import { useDesignStore } from '@/store/designStore';
import type { VaseParams } from '@/types/design';

interface ToggleOption {
  value: string;
  label: string;
}

interface ParamToggleProps {
  paramKey: keyof VaseParams;
  label: string;
  options: [ToggleOption, ToggleOption];
}

/** Binary segmented control (e.g. CW/CCW) */
export const ParamToggle = React.memo(function ParamToggle({
  paramKey,
  label,
  options,
}: ParamToggleProps) {
  const rawValue = useDesignStore((s) => s.params[paramKey]);
  const value = String(rawValue);
  const setParam = useDesignStore((s) => s.setParam);

  const handleClick = useCallback(
    (optValue: string) => {
      // Convert 'true'/'false' strings to booleans for boolean params
      const parsed =
        optValue === 'true' ? true : optValue === 'false' ? false : optValue;
      setParam(paramKey, parsed as VaseParams[typeof paramKey]);
    },
    [paramKey, setParam]
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
            data-testid={`${paramKey}-${opt.value}`}
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
