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
  createFinCrossSection,
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
 * Build a shell (outer or inner) as a solid of revolution with
 * profile curves, twist, and ridge/fin modulation applied per-layer.
 */
function buildShell(
  params: VaseParams,
  radiusOffset: number,
  skipRidges: boolean = false
): Geom3 {
  const baseRadius = params.diameter / 2 + radiusOffset;
  const sliceCount = Math.max(
    Math.ceil(params.height / 2),
    Math.ceil(Math.abs(params.twistAngle) / 10),
    16
  );

  const isSpiralFin = params.style === 'spiral-fin' && !skipRidges;
  const subParams = getShapeSubParams(params);

  // Segment count for cross-section
  const crossSectionSegments =
    params.crossSection === 'polygon'
      ? params.polygonSides
      : params.crossSection === 'star'
        ? params.starPoints * 2
        : Math.max(params.resolution, 32);

  // Create the base cross-section points (unscaled, at unit radius for classic)
  // For spiral-fin, we generate at actual radius since fin cross-section uses absolute coords
  let basePoints: [number, number][];

  if (isSpiralFin) {
    basePoints = createFinCrossSection(
      baseRadius,
      params.finCount,
      params.finHeight,
      params.finWidth,
      params.crossSection,
      subParams
    );
  } else {
    basePoints = createCrossSection(
      params.crossSection,
      1, // unit radius — we scale per layer
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
  }

  // Create initial slice (t=0)
  let baseSlicePoints: [number, number][];

  if (isSpiralFin) {
    // Fin cross-section is already at actual radius
    baseSlicePoints = basePoints;
  } else {
    const scaledBasePoints = basePoints.map(
      ([x, y]) => [x * baseRadius, y * baseRadius] as [number, number]
    );
    baseSlicePoints = skipRidges
      ? scaledBasePoints
      : applyRidgeModulation(
          scaledBasePoints,
          params.ridgeCount,
          params.ridgeDepth + radiusOffset,
          params.ridgeProfile
        );
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

        if (isSpiralFin) {
          // Generate fin cross-section at this layer's radius
          const finHeightAtLayer = params.finHeight * profileScale;
          layerPoints = createFinCrossSection(
            layerRadius,
            params.finCount,
            finHeightAtLayer,
            params.finWidth,
            params.crossSection,
            subParams
          );
        } else {
          // Classic mode: scale unit-radius base points to layer radius
          const scaled = basePoints.map(
            ([x, y]) => [x * layerRadius, y * layerRadius] as [number, number]
          );

          // Apply ridge modulation (skip for smooth inner wall)
          if (skipRidges) {
            layerPoints = scaled;
          } else {
            const ridgeDepthAtLayer = (params.ridgeDepth + radiusOffset) * profileScale;
            layerPoints = applyRidgeModulation(
              scaled,
              params.ridgeCount,
              ridgeDepthAtLayer > 0 ? ridgeDepthAtLayer : 0,
              params.ridgeProfile
            );
          }
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

  // Build inner shell (offset inward by wallThickness)
  // For spiral-fin: always force smooth inner wall (no fins on inside — physically correct)
  const forceSmooth = params.style === 'spiral-fin' ? true : params.smoothInnerWall;
  const innerShell = buildShell(params, -params.wallThickness, forceSmooth);

  // Move inner shell up by baseThickness so the bottom is solid
  const innerShellRaised = transforms.translate(
    [0, 0, params.baseThickness],
    innerShell
  );

  // Subtract inner from outer to create hollow shell
  const hollowShell = booleans.subtract(outerShell, innerShellRaised);

  return hollowShell;
}
