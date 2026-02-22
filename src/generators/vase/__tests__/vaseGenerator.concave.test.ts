import { describe, it, expect } from 'vitest';
import { geometries } from '@jscad/modeling';
import type { Geom3 } from '@jscad/modeling';
import { generateVase } from '../vaseGenerator';
import { DEFAULT_VASE_PARAMS } from '@/types/design';
import type { VaseParams, CrossSection } from '@/types/design';

/** Lightweight classic-style params for concave shape tests */
const TEST_PARAMS_CLASSIC: VaseParams = {
  ...DEFAULT_VASE_PARAMS,
  style: 'classic',
  resolution: 16,
  height: 50,
};

/** Lightweight spiral-fin params for concave + spiral-fin combo tests */
const TEST_PARAMS_SPIRAL_FIN: VaseParams = {
  ...DEFAULT_VASE_PARAMS,
  style: 'spiral-fin',
  resolution: 16,
  height: 50,
  finCount: 8,
  finHeight: 4,
  finWidth: 5,
};

/** Extract all polygons from a Geom3 */
function getPolygons(geom: Geom3) {
  return geometries.geom3.toPolygons(geom);
}

/** Check that all vertex coordinates are finite (no NaN/Infinity) */
function allVerticesFinite(geom: Geom3): boolean {
  const polygons = getPolygons(geom);
  for (const poly of polygons) {
    for (const v of poly.vertices) {
      if (!Number.isFinite(v[0]) || !Number.isFinite(v[1]) || !Number.isFinite(v[2])) {
        return false;
      }
    }
  }
  return true;
}

describe('generateVase (concave shapes with wall thickness)', () => {
  // These shapes have concave regions where a uniform radius offset
  // would cause inner wall collapse. The per-point clamping should
  // prevent negative/zero radii.
  const concaveShapes: { shape: CrossSection; extraParams?: Partial<VaseParams> }[] = [
    { shape: 'star', extraParams: { starPoints: 5, starInnerRatio: 0.3 } },
    { shape: 'heart' },
    { shape: 'teardrop' },
    { shape: 'petal' },
    { shape: 'leaf' },
    { shape: 'gear', extraParams: { gearTeeth: 12 } },
    { shape: 'flower', extraParams: { petalCount: 5 } },
  ];

  it.each(concaveShapes)(
    '$shape with thick wall produces valid geometry',
    ({ shape, extraParams }) => {
      const params: VaseParams = {
        ...TEST_PARAMS_CLASSIC,
        crossSection: shape,
        wallThickness: 4,
        ...extraParams,
      };
      const result = generateVase(params);
      const polygons = getPolygons(result);
      expect(polygons.length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    }
  );

  it('star with deep inner valleys (low innerRatio) and thick wall', () => {
    const params: VaseParams = {
      ...TEST_PARAMS_CLASSIC,
      crossSection: 'star',
      starPoints: 6,
      starInnerRatio: 0.2,
      wallThickness: 4,
    };
    const result = generateVase(params);
    expect(getPolygons(result).length).toBeGreaterThan(0);
    expect(allVerticesFinite(result)).toBe(true);
  });

  it('heart with spiral-fin style and thick wall', () => {
    const params: VaseParams = {
      ...TEST_PARAMS_SPIRAL_FIN,
      crossSection: 'heart',
      wallThickness: 3,
    };
    const result = generateVase(params);
    expect(getPolygons(result).length).toBeGreaterThan(0);
    expect(allVerticesFinite(result)).toBe(true);
  });
});

describe('slope compensation (integration)', () => {
  it('bulbous profile (curve=1.0) with thick wall generates valid geometry', () => {
    const params: VaseParams = {
      ...TEST_PARAMS_CLASSIC,
      profileCurve: 1.0,
      wallThickness: 4,
      taper: 0.6,
    };
    const result = generateVase(params);
    expect(getPolygons(result).length).toBeGreaterThan(0);
    expect(allVerticesFinite(result)).toBe(true);
  });

  it('hourglass profile (curve=-1.0) with thick wall generates valid geometry', () => {
    const params: VaseParams = {
      ...TEST_PARAMS_CLASSIC,
      profileCurve: -1.0,
      wallThickness: 4,
      taper: 0.5,
    };
    const result = generateVase(params);
    expect(getPolygons(result).length).toBeGreaterThan(0);
    expect(allVerticesFinite(result)).toBe(true);
  });

  it('steep taper with thick wall generates valid geometry', () => {
    const params: VaseParams = {
      ...TEST_PARAMS_CLASSIC,
      taper: 0.3,
      wallThickness: 3,
      profileCurve: 0,
    };
    const result = generateVase(params);
    expect(getPolygons(result).length).toBeGreaterThan(0);
    expect(allVerticesFinite(result)).toBe(true);
  });
});
