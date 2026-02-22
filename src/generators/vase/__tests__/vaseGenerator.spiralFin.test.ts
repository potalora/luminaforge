import { describe, it, expect } from 'vitest';
import { geometries } from '@jscad/modeling';
import type { Geom3 } from '@jscad/modeling';
import { generateVase } from '../vaseGenerator';
import { DEFAULT_VASE_PARAMS } from '@/types/design';
import type { VaseParams } from '@/types/design';

/** Lightweight spiral-fin params for spiral-fin-specific tests */
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

describe('generateVase (spiral-fin style)', () => {
  it('produces non-empty geometry', () => {
    const result = generateVase(TEST_PARAMS_SPIRAL_FIN);
    const polygons = getPolygons(result);
    expect(polygons.length).toBeGreaterThan(0);
    expect(allVerticesFinite(result)).toBe(true);
  });

  it('works with circle cross-section', () => {
    const params: VaseParams = {
      ...TEST_PARAMS_SPIRAL_FIN,
      crossSection: 'circle',
    };
    const result = generateVase(params);
    expect(getPolygons(result).length).toBeGreaterThan(0);
    expect(allVerticesFinite(result)).toBe(true);
  });

  it('works with oval cross-section', () => {
    const params: VaseParams = {
      ...TEST_PARAMS_SPIRAL_FIN,
      crossSection: 'oval',
      ovalRatio: 0.7,
    };
    const result = generateVase(params);
    expect(getPolygons(result).length).toBeGreaterThan(0);
    expect(allVerticesFinite(result)).toBe(true);
  });

  it('works with flower cross-section', () => {
    const params: VaseParams = {
      ...TEST_PARAMS_SPIRAL_FIN,
      crossSection: 'flower',
      petalCount: 5,
    };
    const result = generateVase(params);
    expect(getPolygons(result).length).toBeGreaterThan(0);
    expect(allVerticesFinite(result)).toBe(true);
  });

  it('with twist produces valid geometry', () => {
    const params: VaseParams = {
      ...TEST_PARAMS_SPIRAL_FIN,
      twistAngle: 360,
    };
    const result = generateVase(params);
    expect(getPolygons(result).length).toBeGreaterThan(0);
    expect(allVerticesFinite(result)).toBe(true);
  });

  it('with profileCurve produces valid geometry', () => {
    const params: VaseParams = {
      ...TEST_PARAMS_SPIRAL_FIN,
      profileCurve: 0.5,
    };
    const result = generateVase(params);
    expect(getPolygons(result).length).toBeGreaterThan(0);
    expect(allVerticesFinite(result)).toBe(true);
  });

  it('smoothInnerWall: true produces smooth inner wall', () => {
    const params: VaseParams = {
      ...TEST_PARAMS_SPIRAL_FIN,
      smoothInnerWall: true,
    };
    const result = generateVase(params);
    expect(getPolygons(result).length).toBeGreaterThan(0);
    expect(allVerticesFinite(result)).toBe(true);
  });

  it('smoothInnerWall: false produces finned inner wall', () => {
    const params: VaseParams = {
      ...TEST_PARAMS_SPIRAL_FIN,
      smoothInnerWall: false,
    };
    const result = generateVase(params);
    expect(getPolygons(result).length).toBeGreaterThan(0);
    expect(allVerticesFinite(result)).toBe(true);
  });

  it('works with polygon cross-section', () => {
    const params: VaseParams = {
      ...TEST_PARAMS_SPIRAL_FIN,
      crossSection: 'polygon',
      polygonSides: 6,
    };
    const result = generateVase(params);
    expect(getPolygons(result).length).toBeGreaterThan(0);
    expect(allVerticesFinite(result)).toBe(true);
  });

  it('works with star cross-section', () => {
    const params: VaseParams = {
      ...TEST_PARAMS_SPIRAL_FIN,
      crossSection: 'star',
      starPoints: 5,
      starInnerRatio: 0.5,
    };
    const result = generateVase(params);
    expect(getPolygons(result).length).toBeGreaterThan(0);
    expect(allVerticesFinite(result)).toBe(true);
  });

  it('smooth vs finned inner wall produce different polygon counts', () => {
    const smooth = generateVase({ ...TEST_PARAMS_SPIRAL_FIN, smoothInnerWall: true });
    const finned = generateVase({ ...TEST_PARAMS_SPIRAL_FIN, smoothInnerWall: false });
    const smoothCount = getPolygons(smooth).length;
    const finnedCount = getPolygons(finned).length;
    expect(smoothCount).not.toBe(finnedCount);
  });
});
