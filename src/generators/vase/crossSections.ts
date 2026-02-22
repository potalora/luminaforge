/**
 * Cross-section generators for vase profiles.
 * All functions return arrays of 2D points (counter-clockwise)
 * that describe a cross-section at a given radius.
 *
 * Shape families:
 * - Smooth: circle, oval, squircle, superellipse
 * - Organic: heart, teardrop, petal, leaf
 * - Geometric: polygon, star, gear, flower
 */

import type { CrossSection, RidgeProfile, VaseParams } from '@/types/design';

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

/** Apply sinusoidal ridge modulation to a set of cross-section points */
export function applyRidgeModulation(
  points: [number, number][],
  ridgeCount: number,
  ridgeDepth: number,
  ridgeProfile: RidgeProfile
): [number, number][] {
  if (ridgeCount <= 0 || ridgeDepth <= 0) return points;

  return points.map(([x, y]) => {
    const angle = Math.atan2(y, x);
    const r = Math.sqrt(x * x + y * y);

    // Sinusoidal ridge pattern
    const ridgeAngle = angle * ridgeCount;
    let modulation: number;

    switch (ridgeProfile) {
      case 'round':
        // Smooth sine wave
        modulation = (Math.cos(ridgeAngle) + 1) / 2;
        break;
      case 'sharp':
        // Triangle wave (sharper ridges)
        modulation = Math.abs(((ridgeAngle / Math.PI) % 2) - 1);
        break;
      case 'flat':
        // Square-ish wave (smoothed step function)
        modulation = (Math.tanh(Math.sin(ridgeAngle) * 3) + 1) / 2;
        break;
      default:
        modulation = (Math.cos(ridgeAngle) + 1) / 2;
    }

    const modulatedR = r + ridgeDepth * modulation;
    return [Math.cos(angle) * modulatedR, Math.sin(angle) * modulatedR] as [
      number,
      number,
    ];
  });
}

// --- Shape sub-param interfaces for getBaseRadiusAtAngle ---

export interface ShapeSubParams {
  ovalRatio?: number;
  squircleN?: number;
  superN?: number;
  polygonSides?: number;
  starPoints?: number;
  starInnerRatio?: number;
  gearTeeth?: number;
  petalCount?: number;
}

/**
 * Get the body surface radius at any angle for any cross-section shape.
 * This is the core function that enables fins to project from any body shape.
 *
 * Returns the radius as a multiplier of baseRadius.
 */
export function getBaseRadiusAtAngle(
  angle: number,
  crossSection: CrossSection,
  baseRadius: number,
  subParams: ShapeSubParams = {}
): number {
  switch (crossSection) {
    case 'circle':
      return baseRadius;

    case 'oval': {
      const ratio = subParams.ovalRatio ?? 0.7;
      const a = baseRadius; // major axis
      const b = baseRadius * ratio; // minor axis
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      return (a * b) / Math.sqrt((b * cosA) ** 2 + (a * sinA) ** 2);
    }

    case 'squircle': {
      const n = subParams.squircleN ?? 4;
      const cosA = Math.abs(Math.cos(angle));
      const sinA = Math.abs(Math.sin(angle));
      // Avoid division by zero for very small cos/sin
      if (cosA < 1e-10 || sinA < 1e-10) return baseRadius;
      return baseRadius / Math.pow(cosA ** n + sinA ** n, 1 / n);
    }

    case 'superellipse': {
      const n = subParams.superN ?? 2.5;
      const cosA = Math.abs(Math.cos(angle));
      const sinA = Math.abs(Math.sin(angle));
      if (cosA < 1e-10 || sinA < 1e-10) return baseRadius;
      return baseRadius / Math.pow(cosA ** n + sinA ** n, 1 / n);
    }

    case 'heart': {
      // Heart curve: parametric form normalized to baseRadius
      // Use pre-computed lookup for smooth interpolation
      return getHeartRadius(angle, baseRadius);
    }

    case 'teardrop': {
      // r = R * (1 - k*sin(theta)) where k=0.4
      const k = 0.4;
      return baseRadius * (1 - k * Math.sin(angle));
    }

    case 'petal': {
      // r = R * (0.6 + 0.4*cos^2(theta))
      const cosA = Math.cos(angle);
      return baseRadius * (0.6 + 0.4 * cosA * cosA);
    }

    case 'leaf': {
      // r = R * (0.7 + 0.3*cos(theta)) * (1 - 0.15*sin(2*theta))
      return baseRadius * (0.7 + 0.3 * Math.cos(angle)) * (1 - 0.15 * Math.sin(2 * angle));
    }

    case 'polygon': {
      const sides = subParams.polygonSides ?? 6;
      return getPolygonRadius(angle, baseRadius, sides);
    }

    case 'star': {
      const points = subParams.starPoints ?? 5;
      const innerRatio = subParams.starInnerRatio ?? 0.5;
      return getStarRadius(angle, baseRadius, points, innerRatio);
    }

    case 'gear': {
      const teeth = subParams.gearTeeth ?? 12;
      // Smoothed square wave: depth = 15% of radius
      const depth = baseRadius * 0.15;
      const wave = Math.tanh(Math.sin(teeth * angle) * 4);
      return baseRadius + depth * wave;
    }

    case 'flower': {
      const petals = subParams.petalCount ?? 5;
      // r = R * (1 + 0.3*cos(N*theta))
      return baseRadius * (1 + 0.3 * Math.cos(petals * angle));
    }

    default:
      return baseRadius;
  }
}

/**
 * Heart shape radius via parametric curve.
 * Pre-computes lookup table for smooth interpolation.
 */
function getHeartRadius(angle: number, baseRadius: number): number {
  // Heart parametric: x = 16*sin^3(t), y = 13*cos(t) - 5*cos(2t) - 2*cos(3t) - cos(4t)
  // We sample parametrically and find the radius at the given angle
  const SAMPLES = 360;
  const lookup = getHeartLookup();

  // Normalize angle to [0, 2*PI)
  let normAngle = angle % (2 * Math.PI);
  if (normAngle < 0) normAngle += 2 * Math.PI;

  // Find the lookup index
  const idx = (normAngle / (2 * Math.PI)) * SAMPLES;
  const lo = Math.floor(idx) % SAMPLES;
  const hi = (lo + 1) % SAMPLES;
  const frac = idx - Math.floor(idx);

  // Linear interpolation
  const r = lookup[lo] * (1 - frac) + lookup[hi] * frac;
  return r * baseRadius;
}

// Cached heart lookup table (normalized radii)
let _heartLookup: number[] | null = null;

function getHeartLookup(): number[] {
  if (_heartLookup) return _heartLookup;

  const SAMPLES = 360;
  // First pass: compute heart points parametrically
  const heartPoints: [number, number][] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t = (i / SAMPLES) * 2 * Math.PI;
    const sinT = Math.sin(t);
    const x = 16 * sinT * sinT * sinT;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    heartPoints.push([x, y]);
  }

  // Find max radius for normalization
  let maxR = 0;
  for (const [x, y] of heartPoints) {
    const r = Math.sqrt(x * x + y * y);
    if (r > maxR) maxR = r;
  }

  // Build angle→radius lookup (sorted by angle from origin)
  const angleRadiusPairs: { angle: number; radius: number }[] = [];
  for (const [x, y] of heartPoints) {
    let angle = Math.atan2(y, x);
    if (angle < 0) angle += 2 * Math.PI;
    const radius = Math.sqrt(x * x + y * y) / maxR;
    angleRadiusPairs.push({ angle, radius });
  }
  angleRadiusPairs.sort((a, b) => a.angle - b.angle);

  // Resample to uniform angle spacing
  const lookup: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const targetAngle = (i / SAMPLES) * 2 * Math.PI;
    // Binary search for surrounding pair
    let lo = 0;
    let hi = angleRadiusPairs.length - 1;
    while (lo < hi - 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (angleRadiusPairs[mid].angle <= targetAngle) lo = mid;
      else hi = mid;
    }
    const a0 = angleRadiusPairs[lo];
    const a1 = angleRadiusPairs[hi];
    const span = a1.angle - a0.angle;
    const frac = span > 1e-10 ? (targetAngle - a0.angle) / span : 0;
    lookup.push(a0.radius * (1 - frac) + a1.radius * frac);
  }

  _heartLookup = lookup;
  return lookup;
}

/**
 * Polygon radius at angle — distance from center to polygon edge at given angle.
 * Uses the inscribed radius formula for regular polygons.
 */
function getPolygonRadius(angle: number, baseRadius: number, sides: number): number {
  const sectorAngle = (2 * Math.PI) / sides;
  // Normalize angle into a sector [0, sectorAngle)
  let normAngle = angle % (2 * Math.PI);
  if (normAngle < 0) normAngle += 2 * Math.PI;
  const withinSector = normAngle % sectorAngle;
  // Distance from center to edge at this angle
  const halfSector = sectorAngle / 2;
  const offsetFromCenter = Math.abs(withinSector - halfSector);
  return baseRadius * Math.cos(halfSector) / Math.cos(offsetFromCenter);
}

/**
 * Star radius at angle — smooth interpolation between outer and inner radii.
 */
function getStarRadius(
  angle: number,
  outerRadius: number,
  points: number,
  innerRatio: number
): number {
  const innerRadius = outerRadius * innerRatio;
  const totalPoints = points * 2;
  const sectorAngle = (2 * Math.PI) / totalPoints;

  let normAngle = angle % (2 * Math.PI);
  if (normAngle < 0) normAngle += 2 * Math.PI;

  // Which sector are we in? Even sectors = outer peak, odd = inner valley
  const sectorIdx = Math.floor(normAngle / sectorAngle);
  const withinSector = (normAngle % sectorAngle) / sectorAngle;

  const isOuter = sectorIdx % 2 === 0;
  const fromR = isOuter ? outerRadius : innerRadius;
  const toR = isOuter ? innerRadius : outerRadius;

  // Linear interpolation from current vertex to next
  return fromR + (toR - fromR) * withinSector;
}

/** Parameters needed by createCrossSection for shape-specific sub-params */
export interface CrossSectionParams {
  crossSection: CrossSection;
  radius: number;
  segments: number;
  polygonSides: number;
  starPoints: number;
  starInnerRatio: number;
  ovalRatio: number;
  squircleN: number;
  superN: number;
  gearTeeth: number;
  petalCount: number;
}

/** Create a cross-section based on the design parameters */
export function createCrossSection(
  crossSection: CrossSection,
  radius: number,
  segments: number,
  polygonSides: number,
  starPoints: number,
  starInnerRatio: number,
  ovalRatio: number = 0.7,
  squircleN: number = 4,
  superN: number = 2.5,
  gearTeeth: number = 12,
  petalCount: number = 5
): [number, number][] {
  // For shapes that have fixed geometry (polygon, star), use their native point generators
  switch (crossSection) {
    case 'polygon':
      return createPolygonPoints(radius, polygonSides);
    case 'star':
      return createStarPoints(radius, starInnerRatio, starPoints);
    default:
      break;
  }

  // For all other shapes, sample getBaseRadiusAtAngle at uniform angles
  const subParams: ShapeSubParams = {
    ovalRatio,
    squircleN,
    superN,
    gearTeeth,
    petalCount,
  };

  const points: [number, number][] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const r = getBaseRadiusAtAngle(angle, crossSection, radius, subParams);
    points.push([Math.cos(angle) * r, Math.sin(angle) * r]);
  }
  return points;
}

/**
 * Create a cross-section with spiral fins projecting from the body shape.
 *
 * Algorithm — smart point placement:
 * For N fins around the circumference, each fin has 5 control points
 * (leading shoulder, ramp up, peak, ramp down, trailing shoulder)
 * plus arcPointsPerGap smooth body points between fins.
 */
export function createFinCrossSection(
  baseRadius: number,
  finCount: number,
  finHeight: number,
  finWidthDeg: number,
  crossSection: CrossSection,
  subParams: ShapeSubParams = {},
  arcPointsPerGap: number = 4
): [number, number][] {
  // Clamp fin width so fins don't overlap: max 90% of the gap between fins
  const maxWidthDeg = (360 / finCount) * 0.9;
  const clampedWidthDeg = Math.min(finWidthDeg, maxWidthDeg);
  const halfWidth = ((clampedWidthDeg / 2) * Math.PI) / 180;

  const points: [number, number][] = [];
  const finSpacing = (2 * Math.PI) / finCount;

  for (let i = 0; i < finCount; i++) {
    const centerAngle = i * finSpacing;

    // Body radius at the fin center
    const bodyR = getBaseRadiusAtAngle(centerAngle, crossSection, baseRadius, subParams);

    // 5 fin points: shoulder → ramp → peak → ramp → shoulder
    const finAngles = [
      centerAngle - halfWidth,          // leading shoulder
      centerAngle - halfWidth * 0.1,    // ramp up
      centerAngle,                      // peak
      centerAngle + halfWidth * 0.1,    // ramp down
      centerAngle + halfWidth,          // trailing shoulder
    ];
    const finRadii = [
      getBaseRadiusAtAngle(finAngles[0], crossSection, baseRadius, subParams),  // body surface
      getBaseRadiusAtAngle(finAngles[1], crossSection, baseRadius, subParams) + finHeight * 0.2,  // 20% ramp
      bodyR + finHeight,                // full peak
      getBaseRadiusAtAngle(finAngles[3], crossSection, baseRadius, subParams) + finHeight * 0.2,  // 20% ramp
      getBaseRadiusAtAngle(finAngles[4], crossSection, baseRadius, subParams),  // body surface
    ];

    for (let j = 0; j < 5; j++) {
      const a = finAngles[j];
      const r = finRadii[j];
      points.push([Math.cos(a) * r, Math.sin(a) * r]);
    }

    // Arc points between this fin's trailing shoulder and next fin's leading shoulder
    const trailAngle = centerAngle + halfWidth;
    const nextLeadAngle = (i + 1) * finSpacing - halfWidth;
    const gapAngle = nextLeadAngle - trailAngle;

    for (let j = 1; j <= arcPointsPerGap; j++) {
      const frac = j / (arcPointsPerGap + 1);
      const a = trailAngle + gapAngle * frac;
      const r = getBaseRadiusAtAngle(a, crossSection, baseRadius, subParams);
      points.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  return points;
}
