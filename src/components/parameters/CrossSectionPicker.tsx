'use client';

import React from 'react';
import { useDesignStore } from '@/store/designStore';
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

/** Generate SVG path for a cross-section shape outline */
function makeShapePath(shape: CrossSection): string {
  const cx = 30;
  const cy = 30;
  const R = 20;
  const steps = 64;

  const pointsAt = (angleFn: (a: number) => number): [number, number][] => {
    const pts: [number, number][] = [];
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const r = angleFn(angle) * R;
      pts.push([cx + Math.cos(angle) * r, cy - Math.sin(angle) * r]);
    }
    return pts;
  };

  let pts: [number, number][];

  switch (shape) {
    case 'circle':
      pts = pointsAt(() => 1);
      break;
    case 'oval':
      pts = pointsAt((a) => {
        const cosA = Math.cos(a);
        const sinA = Math.sin(a);
        return 0.7 / Math.sqrt((0.7 * cosA) ** 2 + sinA ** 2);
      });
      break;
    case 'squircle':
      pts = pointsAt((a) => {
        const cosA = Math.abs(Math.cos(a));
        const sinA = Math.abs(Math.sin(a));
        if (cosA < 0.01 || sinA < 0.01) return 1;
        return 1 / Math.pow(cosA ** 4 + sinA ** 4, 0.25);
      });
      break;
    case 'superellipse':
      pts = pointsAt((a) => {
        const cosA = Math.abs(Math.cos(a));
        const sinA = Math.abs(Math.sin(a));
        if (cosA < 0.01 || sinA < 0.01) return 1;
        return 1 / Math.pow(cosA ** 2.5 + sinA ** 2.5, 1 / 2.5);
      });
      break;
    case 'heart': {
      // Parametric heart
      const heartPts: [number, number][] = [];
      for (let i = 0; i < steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const sinT = Math.sin(t);
        const x = 16 * sinT * sinT * sinT;
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        heartPts.push([cx + x * 0.9, cy - y * 0.9]);
      }
      pts = heartPts;
      break;
    }
    case 'teardrop':
      pts = pointsAt((a) => 1 - 0.4 * Math.sin(a));
      break;
    case 'petal':
      pts = pointsAt((a) => 0.6 + 0.4 * Math.cos(a) * Math.cos(a));
      break;
    case 'leaf':
      pts = pointsAt((a) => (0.7 + 0.3 * Math.cos(a)) * (1 - 0.15 * Math.sin(2 * a)));
      break;
    case 'polygon': {
      // Hexagon
      const hex: [number, number][] = [];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        hex.push([cx + Math.cos(a) * R, cy - Math.sin(a) * R]);
      }
      pts = hex;
      break;
    }
    case 'star': {
      const starPts: [number, number][] = [];
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const r = i % 2 === 0 ? R : R * 0.5;
        starPts.push([cx + Math.cos(a) * r, cy - Math.sin(a) * r]);
      }
      pts = starPts;
      break;
    }
    case 'gear':
      pts = pointsAt((a) => 1 + 0.15 * Math.tanh(Math.sin(12 * a) * 4));
      break;
    case 'flower':
      pts = pointsAt((a) => 1 + 0.3 * Math.cos(5 * a));
      break;
    default:
      pts = pointsAt(() => 1);
  }

  if (pts.length === 0) return '';
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
  }
  d += ' Z';
  return d;
}

/** Visual cross-section picker — 4×3 grid of SVG shape outlines */
export const CrossSectionPicker = React.memo(function CrossSectionPicker() {
  const crossSection = useDesignStore((s) => s.params.crossSection);
  const setParam = useDesignStore((s) => s.setParam);

  return (
    <div
      className="grid grid-cols-4 gap-2"
      data-testid="cross-section-picker"
      role="radiogroup"
      aria-label="Cross section shape"
    >
      {SHAPES.map(({ value, label }) => {
        const isActive = crossSection === value;
        return (
          <button
            key={value}
            onClick={() => setParam('crossSection', value)}
            data-testid={`shape-${value}`}
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
