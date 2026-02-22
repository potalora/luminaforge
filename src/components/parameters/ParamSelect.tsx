'use client';

import React, { useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDesignStore } from '@/store/designStore';
import type { VaseParams } from '@/types/design';

interface ParamSelectOption {
  value: string;
  label: string;
}

interface ParamSelectProps {
  paramKey: keyof VaseParams;
  label: string;
  options: ParamSelectOption[];
}

/** Styled native select dropdown */
export const ParamSelect = React.memo(function ParamSelect({
  paramKey,
  label,
  options,
}: ParamSelectProps) {
  const value = useDesignStore((s) => s.params[paramKey]) as string;
  const setParam = useDesignStore((s) => s.setParam);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setParam(paramKey, e.target.value as VaseParams[typeof paramKey]);
    },
    [paramKey, setParam]
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-text-secondary font-sans tracking-wide uppercase">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          data-testid={`${paramKey}-select`}
          aria-label={label}
          className="w-full appearance-none bg-bg-tertiary text-text-primary text-sm font-sans
            rounded-sm border border-transparent px-3 py-2 pr-8
            hover:border-bg-elevated focus:border-accent-primary/40
            outline-none transition-colors cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
        />
      </div>
    </div>
  );
});
