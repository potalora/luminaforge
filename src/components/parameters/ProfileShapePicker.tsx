'use client';

import React from 'react';
import { useDesignStore } from '@/store/designStore';
import type { ProfileShape } from '@/types/design';

interface ProfileOption {
  value: ProfileShape;
  label: string;
  /** SVG path data for the profile silhouette (left side, mirrored for right) */
  pathData: string;
}

/**
 * Generate SVG path for a profile silhouette.
 * Samples the profile curve from t=0 to t=1, draws left outline then mirrors right.
 * viewBox is 60x80, vase drawn centered.
 */
function makeProfilePath(
  curveFn: (t: number) => number,
  steps: number = 32
): string {
  const cx = 30; // center x
  const top = 8; // top margin
  const bottom = 72; // bottom margin
  const maxRadius = 18; // max half-width

  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = top + (bottom - top) * (1 - t); // t=0 at bottom, t=1 at top
    const r = curveFn(t) * maxRadius;
    points.push([cx + r, y]);
  }

  // Right side (bottom to top)
  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i][0].toFixed(1)} ${points[i][1].toFixed(1)}`;
  }

  // Left side (top to bottom, mirrored)
  for (let i = points.length - 1; i >= 0; i--) {
    const mx = cx - (points[i][0] - cx);
    d += ` L ${mx.toFixed(1)} ${points[i][1].toFixed(1)}`;
  }

  d += ' Z';
  return d;
}

const PROFILES: ProfileOption[] = [
  {
    value: 'cylinder',
    label: 'Cylinder',
    pathData: makeProfilePath(() => 1.0),
  },
  {
    value: 'tapered',
    label: 'Tapered',
    pathData: makeProfilePath((t) => 1.0 - 0.08 * t),
  },
  {
    value: 'bulbous',
    label: 'Bulbous',
    pathData: makeProfilePath((t) => 1.0 + 0.3 * Math.sin(Math.PI * t)),
  },
  {
    value: 'flared',
    label: 'Flared',
    pathData: makeProfilePath((t) => 1.0 + 0.25 * (Math.sqrt(t) - t)),
  },
  {
    value: 'hourglass',
    label: 'Hourglass',
    pathData: makeProfilePath((t) => 1.0 - 0.25 * Math.sin(Math.PI * t)),
  },
  {
    value: 'scurve',
    label: 'S-Curve',
    pathData: makeProfilePath((t) => 1.0 + 0.15 * Math.sin(2 * Math.PI * t)),
  },
];

/** Visual profile shape picker — 3x2 grid of SVG silhouette cards */
export const ProfileShapePicker = React.memo(function ProfileShapePicker() {
  const profileShape = useDesignStore((s) => s.params.profileShape);
  const setParam = useDesignStore((s) => s.setParam);

  return (
    <div
      className="grid grid-cols-3 gap-2"
      data-testid="profile-shape-picker"
      role="radiogroup"
      aria-label="Profile shape"
    >
      {PROFILES.map(({ value, label, pathData }) => {
        const isActive = profileShape === value;
        return (
          <button
            key={value}
            onClick={() => setParam('profileShape', value)}
            data-testid={`profile-${value}`}
            role="radio"
            aria-checked={isActive}
            className={`
              profile-card
              flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg
              transition-all duration-200 cursor-pointer
              ${
                isActive
                  ? 'profile-card-active bg-[var(--bg-elevated)] border border-[var(--accent-primary)]/50'
                  : 'bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--bg-elevated)]'
              }
            `}
          >
            <svg
              viewBox="0 0 60 80"
              className="w-10 h-14"
              aria-hidden="true"
            >
              <path
                d={pathData}
                fill="none"
                stroke={isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)'}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className={`text-[10px] tracking-wide font-sans ${
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
