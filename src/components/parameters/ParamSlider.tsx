'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useDesignStore } from '@/store/designStore';
import type { VaseParams } from '@/types/design';

interface ParamSliderProps {
  paramKey: keyof VaseParams;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  /** Dynamic max override (computed from current params) */
  maxOverride?: number;
}

/** Slider with label, numeric value display, and click-to-edit */
export const ParamSlider = React.memo(function ParamSlider({
  paramKey,
  label,
  min,
  max: staticMax,
  step,
  unit = '',
  maxOverride,
}: ParamSliderProps) {
  const max = maxOverride ?? staticMax;
  const value = useDesignStore((s) => s.params[paramKey]) as number;
  const setParam = useDesignStore((s) => s.setParam);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setParam(paramKey, Number(e.target.value));
    },
    [paramKey, setParam]
  );

  const handleValueClick = useCallback(() => {
    setEditValue(String(value));
    setIsEditing(true);
    // Focus after render
    requestAnimationFrame(() => inputRef.current?.select());
  }, [value]);

  const commitEdit = useCallback(() => {
    const num = Number(editValue);
    if (!isNaN(num)) {
      const clamped = Math.min(max, Math.max(min, num));
      setParam(paramKey, clamped);
    }
    setIsEditing(false);
  }, [editValue, min, max, paramKey, setParam]);

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
            data-testid={`${paramKey}-edit-input`}
          />
        ) : (
          <button
            onClick={handleValueClick}
            className="text-xs font-mono text-text-primary hover:text-accent-primary
              transition-colors cursor-text px-1"
            data-testid={`${paramKey}-value`}
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
        data-testid={`${paramKey}-slider`}
        aria-label={label}
      />
    </div>
  );
});
