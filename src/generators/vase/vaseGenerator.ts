/**
 * Main vase geometry generator.
 * Pure function: (VaseParams) => Geom3
 *
 * Algorithm:
 * 1. Build outer shell using extrudeFromSlices with per-layer:
 *    - Profile-scaled radius
 *    - Twist rotation (with easing)
 *    - Ridge modulation (classic) or fin cross-section (spiral-fin)
 * 2. Build inner shell (same shape, radius reduced by wallThickness)
 * 3. Subtract inner from outer to create hollow vase
 */

import { booleans, transforms, extrusions } from '@jscad/modeling';
import type { Geom3 } from '@jscad/modeling';
import type { VaseParams } from '@/types/design';
import {
  createCrossSection,
  applyRidgeModulation,
  applyFinModulation,
  type ShapeSubParams,
} from './crossSections';
import { getProfileScale, getTwistProgress } from './profiles';

const { extrudeFromSlices, slice } = extrusions;

/** Extract shape sub-params from VaseParams */
function getShapeSubParams(params: VaseParams): ShapeSubParams {
  return {
    ovalRatio: params.ovalRatio,
    squircleN: params.squircleN,
    superN: params.superN,
    polygonSides: params.polygonSides,
    starPoints: params.starPoints,
    starInnerRatio: params.starInnerRatio,
    gearTeeth: params.gearTeeth,
    petalCount: params.petalCount,
  };
}

/**
 * Offset a closed polygon inward along vertex normals by `offset` distance.
 * Uses averaged edge normals (miter) at each vertex, with miter distance
 * capped to prevent spikes at sharp corners. Points are clamped to
 * `minRadius` from the origin to prevent wall collapse.
 *
 * Assumes counter-clockwise winding (which all cross-section generators produce).
 */
export function offsetPolygonInward(
  points: [number, number][],
  offset: number,
  minRadius: number
): [number, number][] {
  const n = points.length;
  const result: [number, number][] = [];

  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];

    // Edge vectors
    const dx1 = curr[0] - prev[0];
    const dy1 = curr[1] - prev[1];
    const dx2 = next[0] - curr[0];
    const dy2 = next[1] - curr[1];
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    if (len1 < 1e-10 || len2 < 1e-10) {
      result.push(curr);
      continue;
    }

    // Inward normals for CCW polygon: rotate edge 90° CCW → (-dy, dx)
    const n1x = -dy1 / len1;
    const n1y = dx1 / len1;
    const n2x = -dy2 / len2;
    const n2y = dx2 / len2;

    // Average normal direction
    let nx = n1x + n2x;
    let ny = n1y + n2y;
    const nlen = Math.sqrt(nx * nx + ny * ny);

    if (nlen < 1e-10) {
      // Edges are parallel — use either normal
      nx = n1x;
      ny = n1y;
    } else {
      nx /= nlen;
      ny /= nlen;
    }

    // Miter distance: offset / cos(half-angle between edges)
    // Capped to 2× offset to prevent spikes at sharp corners
    const cosHalf = n1x * nx + n1y * ny;
    const miterOffset = cosHalf > 0.25 ? offset / cosHalf : offset * 2;

    let newX = curr[0] + nx * miterOffset;
    let newY = curr[1] + ny * miterOffset;

    // Clamp minimum radius to prevent collapse
    const r = Math.sqrt(newX * newX + newY * newY);
    if (r < minRadius) {
      const scale = minRadius / r;
      newX *= scale;
      newY *= scale;
    }

    result.push([newX, newY]);
  }

  return result;
}

/**
 * Build a shell (outer or inner) as a solid of revolution with
 * profile curves, twist, and ridge/fin modulation applied per-layer.
 *
 * @param wallInset — when > 0, each point is offset inward along the local
 *   surface normal by this amount (with slope compensation and miter capping).
 *   Used for inner shell to achieve uniform perpendicular wall thickness.
 */
function buildShell(
  params: VaseParams,
  wallInset: number,
  skipRidges: boolean = false
): Geom3 {
  const baseRadius = params.diameter / 2;
  const minRadius = wallInset * 0.3;
  const sliceCount = Math.max(
    Math.ceil(params.height / 2),
    Math.ceil(Math.abs(params.twistAngle) / 10),
    16
  );

  const isSpiralFin = params.style === 'spiral-fin' && !skipRidges;
  const subParams = getShapeSubParams(params);

  // Segment count for cross-section
  let crossSectionSegments =
    params.crossSection === 'polygon'
      ? params.polygonSides
      : params.crossSection === 'star'
        ? params.starPoints * 2
        : Math.max(params.resolution, 32);

  // Spiral-fin needs enough samples per fin cycle for smooth cosine waves.
  // Minimum ~10 points per cycle avoids Nyquist aliasing.
  if (isSpiralFin) {
    crossSectionSegments = Math.max(crossSectionSegments, params.finCount * 10);
  }

  // Create the base cross-section points at unit radius — we scale per layer
  const basePoints = createCrossSection(
    params.crossSection,
    1, // unit radius
    crossSectionSegments,
    params.polygonSides,
    params.starPoints,
    params.starInnerRatio,
    params.ovalRatio,
    params.squircleN,
    params.superN,
    params.gearTeeth,
    params.petalCount
  );

  // Create initial slice (t=0)
  let baseSlicePoints: [number, number][];

  {
    const scaledBasePoints = basePoints.map(
      ([x, y]) => [x * baseRadius, y * baseRadius] as [number, number]
    );

    if (isSpiralFin) {
      baseSlicePoints = applyFinModulation(
        scaledBasePoints,
        params.finCount,
        params.finHeight,
        params.finWidth
      );
    } else if (skipRidges) {
      baseSlicePoints = scaledBasePoints;
    } else {
      baseSlicePoints = applyRidgeModulation(
        scaledBasePoints,
        params.ridgeCount,
        params.ridgeDepth,
        params.ridgeProfile
      );
    }

    if (wallInset > 0) {
      // Slope compensation at t=0: compute profile slope at bottom
      const eps = 0.001;
      const pLo = getProfileScale(params.profileCurve, 0, params.taper);
      const pHi = getProfileScale(params.profileCurve, eps, params.taper);
      const dProfileDt = (pHi - pLo) / eps;
      const dR_dH = baseRadius * dProfileDt / params.height;
      const slopeCompensation = Math.sqrt(1 + dR_dH * dR_dH);
      const adjustedInset = wallInset * slopeCompensation;
      baseSlicePoints = offsetPolygonInward(baseSlicePoints, adjustedInset, minRadius);
    }
  }

  const baseSlice = slice.fromPoints(
    baseSlicePoints.map(([x, y]) => [x, y, 0])
  );

  const twistAngleRad =
    (params.twistAngle * Math.PI) / 180 *
    (params.twistDirection === 'cw' ? -1 : 1);

  return extrudeFromSlices(
    {
      numberOfSlices: sliceCount + 1,
      capStart: true,
      capEnd: true,
      callback: (progress: number, _index: number, _base: any) => {
        const t = progress;
        const height = t * params.height;

        // Profile scale at this height
        const profileScale = getProfileScale(
          params.profileCurve,
          t,
          params.taper
        );
        const layerRadius = baseRadius * profileScale;

        // Twist angle at this height (with easing)
        const twistProgress = getTwistProgress(params.twistEasing, t);
        const layerTwist = twistAngleRad * twistProgress;

        let layerPoints: [number, number][];

        // Scale unit-radius base points to layer radius
        const scaled = basePoints.map(
          ([x, y]) => [x * layerRadius, y * layerRadius] as [number, number]
        );

        if (isSpiralFin) {
          const finHeightAtLayer = params.finHeight * profileScale;
          layerPoints = applyFinModulation(
            scaled,
            params.finCount,
            finHeightAtLayer,
            params.finWidth
          );
        } else if (skipRidges) {
          layerPoints = scaled;
        } else {
          const ridgeDepthAtLayer = params.ridgeDepth * profileScale;
          layerPoints = applyRidgeModulation(
            scaled,
            params.ridgeCount,
            ridgeDepthAtLayer > 0 ? ridgeDepthAtLayer : 0,
            params.ridgeProfile
          );
        }

        // Apply normal-based wall inset with slope compensation for inner shell
        if (wallInset > 0) {
          const eps = 0.001;
          const pLo = getProfileScale(params.profileCurve, Math.max(0, t - eps), params.taper);
          const pHi = getProfileScale(params.profileCurve, Math.min(1, t + eps), params.taper);
          const dProfileDt = (pHi - pLo) / (Math.min(1, t + eps) - Math.max(0, t - eps));
          const dR_dH = baseRadius * dProfileDt / params.height;
          const slopeCompensation = Math.sqrt(1 + dR_dH * dR_dH);
          const adjustedInset = wallInset * slopeCompensation;
          layerPoints = offsetPolygonInward(layerPoints, adjustedInset, minRadius);
        }

        // Apply twist rotation and translate to height
        const rotatedPoints = layerPoints.map(([x, y]) => {
          const cos = Math.cos(layerTwist);
          const sin = Math.sin(layerTwist);
          return [cos * x - sin * y, sin * x + cos * y, height] as [
            number,
            number,
            number,
          ];
        });

        return slice.fromPoints(rotatedPoints);
      },
    },
    baseSlice
  );
}

/**
 * Generate a complete vase from parameters.
 * Pure function — no side effects.
 */
export function generateVase(params: VaseParams): Geom3 {
  // Build outer shell (solid)
  const outerShell = buildShell(params, 0);

  // Build inner shell (per-point inward offset by wallThickness, clamped for concave shapes)
  // smoothInnerWall toggle controls whether inner wall has ridges/fins for both styles
  const forceSmooth = params.smoothInnerWall;
  const innerShell = buildShell(params, params.wallThickness, forceSmooth);

  // Move inner shell up by baseThickness so the bottom is solid
  const innerShellRaised = transforms.translate(
    [0, 0, params.baseThickness],
    innerShell
  );

  // Subtract inner from outer to create hollow shell
  const hollowShell = booleans.subtract(outerShell, innerShellRaised);

  return hollowShell;
}
