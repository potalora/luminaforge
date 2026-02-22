/**
 * Profile curves: map normalized height t ∈ [0,1] to a scale factor.
 * Each profile has a baked-in characteristic curve multiplied by a linear taper.
 *
 * radius(t) = (diameter/2) * profileCurve(t) * (1 + (taper - 1) * t)
 *
 * Twist easing: map normalized height t ∈ [0,1] to a twist progress factor.
 */

import type { ProfileShape, TwistEasing } from '@/types/design';

// --- Profile characteristic curves ---

/** Constant — pure taper control */
function profileCylinder(_t: number): number {
  return 1.0;
}

/** Slight natural narrowing */
function profileTapered(t: number): number {
  return 1.0 - 0.08 * t;
}

/** Always has belly at mid-height */
function profileBulbous(t: number): number {
  return 1.0 + 0.3 * Math.sin(Math.PI * t);
}

/** Always opens at top */
function profileFlared(t: number): number {
  return 1.0 + 0.25 * (Math.sqrt(t) - t);
}

/** Actually pinches at middle */
function profileHourglass(t: number): number {
  return 1.0 - 0.25 * Math.sin(Math.PI * t);
}

/** Gentle double wave */
function profileScurve(t: number): number {
  return 1.0 + 0.15 * Math.sin(2 * Math.PI * t);
}

/**
 * Get the profile scale factor at normalized height t.
 * Returns: profileCurve(t) * (1 + (taper - 1) * t)
 */
export function getProfileScale(
  shape: ProfileShape,
  t: number,
  taper: number
): number {
  let curve: number;

  switch (shape) {
    case 'cylinder':
      curve = profileCylinder(t);
      break;
    case 'tapered':
      curve = profileTapered(t);
      break;
    case 'bulbous':
      curve = profileBulbous(t);
      break;
    case 'flared':
      curve = profileFlared(t);
      break;
    case 'hourglass':
      curve = profileHourglass(t);
      break;
    case 'scurve':
      curve = profileScurve(t);
      break;
    default:
      curve = profileTapered(t);
  }

  return curve * (1 + (taper - 1) * t);
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
