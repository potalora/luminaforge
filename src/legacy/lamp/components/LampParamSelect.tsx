'use client';

import React, { useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDesignStore } from '@/store/designStore';
import type { DecorativeShellParams } from '@/types/design';

interface LampParamSelectProps {
  part: 'base' | 'shade';
  paramKey: keyof DecorativeShellParams;
  label: string;
  options: { value: string; label: string }[];
}

/** Styled native select dropdown for lamp base/shade params */
export const LampParamSelect = React.memo(function LampParamSelect({
  part,
  paramKey,
  label,
  options,
}: LampParamSelectProps) {
  const value = useDesignStore((s) => s.lampParams[part][paramKey]) as string;
  const setter = useDesignStore((s) =>
    part === 'base' ? s.setLampBaseParam : s.setLampShadeParam
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(paramKey, e.target.value as DecorativeShellParams[typeof paramKey]);
    },
    [paramKey, setter]
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
          data-testid={`lamp-${part}-${paramKey}-select`}
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
