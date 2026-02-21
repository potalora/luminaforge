/**
 * Profile curves: map normalized height t ∈ [0,1] to a scale factor.
 * Used to vary the vase radius along its height.
 *
 * Twist easing: map normalized height t ∈ [0,1] to a twist progress factor.
 */

import type { ProfileShape, TwistEasing } from '@/types/design';

// --- Profile curves ---

/** Constant radius */
function profileCylinder(_t: number): number {
  return 1;
}

/** Linear interpolation between base and top scale */
function profileTapered(t: number, topRatio: number): number {
  return 1 + (topRatio - 1) * t;
}

/** Sine curve bulge at mid-height */
function profileBulbous(t: number, topRatio: number): number {
  const base = 1 + (topRatio - 1) * t;
  const bulge = Math.sin(t * Math.PI) * 0.3;
  return base + bulge;
}

/** Square root curve — rapid opening at top */
function profileFlared(t: number, topRatio: number): number {
  const flare = Math.sqrt(t);
  return 1 + (topRatio - 1) * flare;
}

/** Pinch at middle (min at t=0.5) */
function profileHourglass(t: number, topRatio: number): number {
  const base = 1 + (topRatio - 1) * t;
  const pinch = Math.cos(t * Math.PI) * 0.25;
  return base - pinch + 0.25;
}

/** S-curve (sigmoid) — slow start, rapid middle, slow end */
function profileScurve(t: number, topRatio: number): number {
  // Sigmoid mapped to [0,1]
  const k = 8; // steepness
  const sigmoid = 1 / (1 + Math.exp(-k * (t - 0.5)));
  return 1 + (topRatio - 1) * sigmoid;
}

/**
 * Get the profile scale factor at normalized height t.
 * Returns a multiplier for the base radius.
 */
export function getProfileScale(
  shape: ProfileShape,
  t: number,
  baseDiameter: number,
  topDiameter: number
): number {
  const topRatio = topDiameter / baseDiameter;

  switch (shape) {
    case 'cylinder':
      return profileCylinder(t);
    case 'tapered':
      return profileTapered(t, topRatio);
    case 'bulbous':
      return profileBulbous(t, topRatio);
    case 'flared':
      return profileFlared(t, topRatio);
    case 'hourglass':
      return profileHourglass(t, topRatio);
    case 'scurve':
      return profileScurve(t, topRatio);
    default:
      return profileTapered(t, topRatio);
  }
}

// --- Twist easing functions ---

/** Linear twist (constant angular velocity) */
function easingLinear(t: number): number {
  return t;
}

/** Accelerating twist */
function easingEaseIn(t: number): number {
  return t * t;
}

/** Decelerating twist */
function easingEaseOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/** Smooth acceleration + deceleration */
function easingEaseInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Get the eased twist progress at normalized height t.
 * Returns a value in [0,1] representing how much of the total twist
 * has been applied at this height.
 */
export function getTwistProgress(easing: TwistEasing, t: number): number {
  switch (easing) {
    case 'linear':
      return easingLinear(t);
    case 'easeIn':
      return easingEaseIn(t);
    case 'easeOut':
      return easingEaseOut(t);
    case 'easeInOut':
      return easingEaseInOut(t);
    default:
      return easingLinear(t);
  }
}
