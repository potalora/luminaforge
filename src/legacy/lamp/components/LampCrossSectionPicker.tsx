'use client';

import React from 'react';
import { useDesignStore } from '@/store/designStore';
import { makeShapePath } from './shapePaths';
import type { CrossSection } from '@/types/design';

interface ShapeOption {
  value: CrossSection;
  label: string;
  family: 'smooth' | 'organic' | 'geometric';
}

const SHAPES: ShapeOption[] = [
  // Smooth family
  { value: 'circle', label: 'Circle', family: 'smooth' },
  { value: 'oval', label: 'Oval', family: 'smooth' },
  { value: 'squircle', label: 'Squircle', family: 'smooth' },
  { value: 'superellipse', label: 'Super', family: 'smooth' },
  // Organic family
  { value: 'heart', label: 'Heart', family: 'organic' },
  { value: 'teardrop', label: 'Teardrop', family: 'organic' },
  { value: 'petal', label: 'Petal', family: 'organic' },
  { value: 'leaf', label: 'Leaf', family: 'organic' },
  // Geometric family
  { value: 'polygon', label: 'Polygon', family: 'geometric' },
  { value: 'star', label: 'Star', family: 'geometric' },
  { value: 'gear', label: 'Gear', family: 'geometric' },
  { value: 'flower', label: 'Flower', family: 'geometric' },
];

interface LampCrossSectionPickerProps {
  part: 'base' | 'shade';
}

/** Visual cross-section picker for lamp base or shade — 4x3 grid of SVG shape outlines */
export const LampCrossSectionPicker = React.memo(function LampCrossSectionPicker({ part }: LampCrossSectionPickerProps) {
  const crossSection = useDesignStore((s) => s.lampParams[part].crossSection);
  const setter = useDesignStore((s) => part === 'base' ? s.setLampBaseParam : s.setLampShadeParam);

  return (
    <div
      className="grid grid-cols-4 gap-2"
      data-testid={`lamp-${part}-cross-section-picker`}
      role="radiogroup"
      aria-label={`${part} cross section shape`}
    >
      {SHAPES.map(({ value, label }) => {
        const isActive = crossSection === value;
        return (
          <button
            key={value}
            onClick={() => setter('crossSection', value)}
            data-testid={`lamp-${part}-shape-${value}`}
            role="radio"
            aria-checked={isActive}
            className={`
              profile-card
              flex flex-col items-center gap-0.5 py-1.5 px-0.5 rounded-lg
              transition-all duration-200 cursor-pointer
              ${
                isActive
                  ? 'profile-card-active bg-[var(--bg-elevated)] border border-[var(--accent-primary)]/50'
                  : 'bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--bg-elevated)]'
              }
            `}
          >
            <svg
              viewBox="0 0 60 60"
              className="w-8 h-8"
              aria-hidden="true"
            >
              <path
                d={makeShapePath(value)}
                fill="none"
                stroke={isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)'}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className={`text-[9px] leading-tight tracking-wide font-sans ${
                isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
});
