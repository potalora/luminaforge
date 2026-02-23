/**
 * Shared decorative shell builder.
 * Builds a solid shape via extrudeFromSlices with per-layer profile scaling,
 * twist, and ridge/fin modulation. Used by vase, lamp base, and lamp shade.
 */

import { extrusions } from '@jscad/modeling';
import type { Geom3 } from '@jscad/modeling';
import type { DecorativeShellParams } from '@/types/design';
import {
  createCrossSection,
  applyRidgeModulation,
  applyFinModulation,
} from '../vase/crossSections';
import { getProfileScale, getTwistProgress } from '../vase/profiles';
import { offsetPolygonInward } from './offsetPolygon';

const { extrudeFromSlices, slice } = extrusions;

export interface ShellBuildOptions {
  resolution: number;
  wallInset: number;
  skipModulation?: boolean;
  closedBottom?: boolean;   // true = cap with solid bottom slice
  baseThickness?: number;   // inner shell Z offset (solid bottom)
}

/**
 * Build a decorative shell (solid) via extrudeFromSlices.
 * Returns a solid Geom3 — caller is responsible for boolean operations
 * to create hollow shells.
 */
export function buildDecorativeShell(
  params: DecorativeShellParams,
  options: ShellBuildOptions
): Geom3 {
  const { resolution, wallInset, skipModulation = false } = options;
  const baseRadius = params.diameter / 2;
  const minRadius = wallInset * 0.3;
  const sliceCount = Math.max(
    Math.ceil(params.height / 2),
    Math.ceil(Math.abs(params.twistAngle) / 10),
    16
  );

  const isSpiralFin = params.style === 'spiral-fin' && !skipModulation;
  const skipRidges = skipModulation;

  // Segment count for cross-section
  let crossSectionSegments =
    params.crossSection === 'polygon'
      ? params.polygonSides
      : params.crossSection === 'star'
        ? params.starPoints * 2
        : Math.max(resolution, 32);

  // Spiral-fin needs enough samples per fin cycle for smooth cosine waves
  if (isSpiralFin) {
    crossSectionSegments = Math.max(crossSectionSegments, params.finCount * 10);
  }

  // Create the base cross-section points at unit radius
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

        const profileScale = getProfileScale(
          params.profileCurve,
          t,
          params.taper
        );
        const layerRadius = baseRadius * profileScale;

        const twistProgress = getTwistProgress(params.twistEasing, t);
        const layerTwist = twistAngleRad * twistProgress;

        let layerPoints: [number, number][];

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
