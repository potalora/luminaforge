/**
 * Cross-section generators for vase profiles.
 * All functions return arrays of 2D points (counter-clockwise)
 * that describe a cross-section at a given radius.
 */

import type { CrossSection, RibProfile } from '@/types/design';

/** Create a circle cross-section as an array of 2D points */
export function createCirclePoints(
  radius: number,
  segments: number
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }
  return points;
}

/** Create a regular polygon cross-section */
export function createPolygonPoints(
  radius: number,
  sides: number
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    points.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }
  return points;
}

/** Create a star cross-section */
export function createStarPoints(
  outerRadius: number,
  innerRatio: number,
  points: number
): [number, number][] {
  const innerRadius = outerRadius * innerRatio;
  const result: [number, number][] = [];
  const totalPoints = points * 2;
  for (let i = 0; i < totalPoints; i++) {
    const angle = (i / totalPoints) * Math.PI * 2;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    result.push([Math.cos(angle) * r, Math.sin(angle) * r]);
  }
  return result;
}

/** Apply sinusoidal rib modulation to a set of cross-section points */
export function applyRibModulation(
  points: [number, number][],
  ribCount: number,
  ribDepth: number,
  ribProfile: RibProfile
): [number, number][] {
  if (ribCount <= 0 || ribDepth <= 0) return points;

  return points.map(([x, y]) => {
    const angle = Math.atan2(y, x);
    const r = Math.sqrt(x * x + y * y);

    // Sinusoidal rib pattern
    const ribAngle = angle * ribCount;
    let modulation: number;

    switch (ribProfile) {
      case 'round':
        // Smooth sine wave
        modulation = (Math.cos(ribAngle) + 1) / 2;
        break;
      case 'sharp':
        // Triangle wave (sharper ribs)
        modulation = Math.abs(((ribAngle / Math.PI) % 2) - 1);
        break;
      case 'flat':
        // Square-ish wave (smoothed step function)
        modulation = (Math.tanh(Math.sin(ribAngle) * 3) + 1) / 2;
        break;
      default:
        modulation = (Math.cos(ribAngle) + 1) / 2;
    }

    const modulatedR = r + ribDepth * modulation;
    return [Math.cos(angle) * modulatedR, Math.sin(angle) * modulatedR] as [
      number,
      number,
    ];
  });
}

/** Create a cross-section based on the design parameters */
export function createCrossSection(
  crossSection: CrossSection,
  radius: number,
  segments: number,
  polygonSides: number,
  starPoints: number,
  starInnerRatio: number
): [number, number][] {
  switch (crossSection) {
    case 'circle':
      return createCirclePoints(radius, segments);
    case 'polygon':
      return createPolygonPoints(radius, polygonSides);
    case 'star':
      return createStarPoints(radius, starInnerRatio, starPoints);
    default:
      return createCirclePoints(radius, segments);
  }
}
