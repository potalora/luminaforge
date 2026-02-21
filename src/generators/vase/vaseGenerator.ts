/**
 * Main vase geometry generator.
 * Pure function: (VaseParams) => Geom3
 *
 * Algorithm:
 * 1. Build outer shell using extrudeFromSlices with per-layer:
 *    - Profile-scaled radius
 *    - Twist rotation (with easing)
 *    - Rib modulation
 * 2. Build inner shell (same shape, radius reduced by wallThickness)
 * 3. Subtract inner from outer to create hollow vase
 * 4. Add solid base disc
 */

import { primitives, booleans, transforms, extrusions, geometries } from '@jscad/modeling';
import type { Geom3 } from '@jscad/modeling';
import type { VaseParams } from '@/types/design';
import { createCrossSection, applyRibModulation } from './crossSections';
import { getProfileScale, getTwistProgress } from './profiles';

const { extrudeFromSlices, slice } = extrusions;

/**
 * Build a shell (outer or inner) as a solid of revolution with
 * profile curves, twist, and rib modulation applied per-layer.
 */
function buildShell(params: VaseParams, radiusOffset: number): Geom3 {
  const baseRadius = params.baseDiameter / 2 + radiusOffset;
  const sliceCount = Math.max(
    Math.ceil(params.height / 2),
    Math.ceil(Math.abs(params.twistAngle) / 10),
    16
  );

  // Segment count for cross-section: use fewer for polygon/star
  const crossSectionSegments =
    params.crossSection === 'circle'
      ? Math.max(params.resolution, 32)
      : params.crossSection === 'polygon'
        ? params.polygonSides
        : params.starPoints * 2;

  // Create the base cross-section points (unscaled, at unit radius)
  const basePoints = createCrossSection(
    params.crossSection,
    1, // unit radius — we scale per layer
    crossSectionSegments,
    params.polygonSides,
    params.starPoints,
    params.starInnerRatio
  );

  // Create initial slice from base points at actual base radius
  const scaledBasePoints = basePoints.map(
    ([x, y]) => [x * baseRadius, y * baseRadius] as [number, number]
  );
  const ribModulatedBase = applyRibModulation(
    scaledBasePoints,
    params.ribCount,
    params.ribDepth + radiusOffset, // scale rib depth with wall offset
    params.ribProfile
  );
  const baseSlice = slice.fromPoints(
    ribModulatedBase.map(([x, y]) => [x, y, 0])
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
          params.profileShape,
          t,
          params.baseDiameter,
          params.topDiameter
        );
        const layerRadius = baseRadius * profileScale;

        // Twist angle at this height (with easing)
        const twistProgress = getTwistProgress(params.twistEasing, t);
        const layerTwist = twistAngleRad * twistProgress;

        // Create cross-section at this layer's radius
        const layerPoints = basePoints.map(
          ([x, y]) => [x * layerRadius, y * layerRadius] as [number, number]
        );

        // Apply rib modulation
        const ribDepthAtLayer = (params.ribDepth + radiusOffset) * profileScale;
        const modulatedPoints = applyRibModulation(
          layerPoints,
          params.ribCount,
          ribDepthAtLayer > 0 ? ribDepthAtLayer : 0,
          params.ribProfile
        );

        // Apply twist rotation and translate to height
        const rotatedPoints = modulatedPoints.map(([x, y]) => {
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

/** Create a solid disc for the vase base */
function createBase(params: VaseParams): Geom3 {
  const baseRadius = params.baseDiameter / 2;

  // Cross-section points at base radius with rib modulation
  const crossSectionSegments =
    params.crossSection === 'circle'
      ? Math.max(params.resolution, 32)
      : params.crossSection === 'polygon'
        ? params.polygonSides
        : params.starPoints * 2;

  const basePoints = createCrossSection(
    params.crossSection,
    baseRadius,
    crossSectionSegments,
    params.polygonSides,
    params.starPoints,
    params.starInnerRatio
  );

  const modulatedPoints = applyRibModulation(
    basePoints,
    params.ribCount,
    params.ribDepth,
    params.ribProfile
  );

  // Create a 2D polygon from the base cross-section
  const baseShape = geometries.geom2.fromPoints(modulatedPoints);

  // Extrude to baseThickness
  return extrusions.extrudeLinear(
    { height: params.baseThickness },
    baseShape
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
  const innerShell = buildShell(params, -params.wallThickness);

  // Move inner shell up by baseThickness so the bottom is solid
  const innerShellRaised = transforms.translate(
    [0, 0, params.baseThickness],
    innerShell
  );

  // Subtract inner from outer to create hollow shell
  const hollowShell = booleans.subtract(outerShell, innerShellRaised);

  return hollowShell;
}
