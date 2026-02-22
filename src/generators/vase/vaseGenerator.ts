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
 * Shrink each 2D point radially inward by `inset`, clamped so no point's
 * radius drops below `minRadius`. Prevents wall collapse on concave shapes
 * where the local radius can be smaller than wallThickness.
 */
function applyWallInset(
  points: [number, number][],
  inset: number,
  minRadius: number
): [number, number][] {
  return points.map(([x, y]) => {
    const r = Math.sqrt(x * x + y * y);
    if (r < 1e-6) return [x, y] as [number, number];
    const innerR = Math.max(r - inset, minRadius);
    const scale = innerR / r;
    return [x * scale, y * scale] as [number, number];
  });
}

/**
 * Build a shell (outer or inner) as a solid of revolution with
 * profile curves, twist, and ridge/fin modulation applied per-layer.
 *
 * @param wallInset — when > 0, each point is offset radially inward by this
 *   amount (clamped to a floor) after shape generation. Used for inner shell.
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
      baseSlicePoints = applyWallInset(baseSlicePoints, wallInset, minRadius);
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

        // Apply per-point wall inset for inner shell (clamped to prevent collapse)
        if (wallInset > 0) {
          layerPoints = applyWallInset(layerPoints, wallInset, minRadius);
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
