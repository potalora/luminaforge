'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useDesignStore } from '@/store/designStore';
import type { DecorativeShellParams } from '@/types/design';

interface LampParamSliderProps {
  part: 'base' | 'shade';
  paramKey: keyof DecorativeShellParams;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  maxOverride?: number;
}

/** Slider for lamp base/shade decorative params */
export const LampParamSlider = React.memo(function LampParamSlider({
  part,
  paramKey,
  label,
  min,
  max: staticMax,
  step,
  unit = '',
  maxOverride,
}: LampParamSliderProps) {
  const max = maxOverride ?? staticMax;
  const value = useDesignStore((s) => s.lampParams[part][paramKey]) as number;
  const setter = useDesignStore((s) =>
    part === 'base' ? s.setLampBaseParam : s.setLampShadeParam
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(paramKey, Number(e.target.value));
    },
    [paramKey, setter]
  );

  const handleValueClick = useCallback(() => {
    setEditValue(String(value));
    setIsEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  }, [value]);

  const commitEdit = useCallback(() => {
    const num = Number(editValue);
    if (!isNaN(num)) {
      const clamped = Math.min(max, Math.max(min, num));
      setter(paramKey, clamped);
    }
    setIsEditing(false);
  }, [editValue, min, max, paramKey, setter]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') commitEdit();
      if (e.key === 'Escape') setIsEditing(false);
    },
    [commitEdit]
  );

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-text-secondary font-sans tracking-wide uppercase">
          {label}
        </label>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleEditKeyDown}
            className="w-16 text-right text-xs font-mono bg-bg-tertiary text-text-primary
              border border-accent-primary/30 rounded-sm px-1.5 py-0.5 outline-none
              focus:border-accent-primary"
            data-testid={`lamp-${part}-${paramKey}-edit-input`}
          />
        ) : (
          <button
            onClick={handleValueClick}
            className="text-xs font-mono text-text-primary hover:text-accent-primary
              transition-colors cursor-text px-1"
            data-testid={`lamp-${part}-${paramKey}-value`}
          >
            {typeof value === 'number' && step < 1
              ? value.toFixed(1)
              : value}
            {unit && (
              <span className="text-text-tertiary ml-0.5">{unit}</span>
            )}
          </button>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        data-testid={`lamp-${part}-${paramKey}-slider`}
        aria-label={label}
      />
    </div>
  );
});
