/**
 * Profile curves: map normalized height t ∈ [0,1] to a scale factor.
 *
 * profileCurve ∈ [-1, 1]:
 *   -1 = strong hourglass (pinches inward at middle)
 *    0 = cylinder (straight sides, modified by taper)
 *   +1 = strong bulbous (belly outward at middle)
 *
 * radius(t) = (diameter/2) * getProfileScale(curve, t, taper)
 *
 * Twist easing: map normalized height t ∈ [0,1] to a twist progress factor.
 */

import type { TwistEasing } from '@/types/design';

/**
 * Get the profile scale factor at normalized height t.
 *
 * curve: -1.0 to 1.0 (hourglass ↔ bulbous)
 * t: 0.0 to 1.0 (bottom to top)
 * taper: ratio of top width to base width
 *
 * At curve=0: pure linear taper
 * At curve=+1: 40% outward belly at midpoint
 * At curve=-1: 40% inward pinch at midpoint (hourglass)
 */
export function getProfileScale(
  curve: number,
  t: number,
  taper: number
): number {
  const linearTaper = 1 + (taper - 1) * t;
  const curveFactor = curve * Math.sin(Math.PI * t) * 0.4;
  return linearTaper * (1 + curveFactor);
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
