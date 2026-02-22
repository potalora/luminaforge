import { describe, it, expect } from 'vitest';
import { geometries } from '@jscad/modeling';
import type { Geom3 } from '@jscad/modeling';
import { generateVase } from '../vaseGenerator';
import { DEFAULT_VASE_PARAMS } from '@/types/design';
import type { VaseParams, CrossSection } from '@/types/design';

// Use low resolution for speed in integration tests
const LOW_RES_PARAMS: VaseParams = {
  ...DEFAULT_VASE_PARAMS,
  resolution: 16,
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

describe('generateVase', () => {
  describe('default parameters (classic style)', () => {
    it('returns a non-null Geom3 object', () => {
      const result = generateVase(LOW_RES_PARAMS);
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });

    it('produces geometry with polygons', () => {
      const result = generateVase(LOW_RES_PARAMS);
      const polygons = getPolygons(result);
      expect(polygons.length).toBeGreaterThan(0);
    });

    it('polygons have valid vertices (3+ per polygon, finite numbers)', () => {
      const result = generateVase(LOW_RES_PARAMS);
      const polygons = getPolygons(result);
      for (const poly of polygons) {
        expect(poly.vertices.length).toBeGreaterThanOrEqual(3);
      }
      expect(allVerticesFinite(result)).toBe(true);
    });
  });

  describe('parameter variations', () => {
    it('profileCurve=0 with taper=1.0 (cylinder, no tapering)', () => {
      const params: VaseParams = {
        ...LOW_RES_PARAMS,
        profileCurve: 0,
        taper: 1.0,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('zero twist angle', () => {
      const params: VaseParams = {
        ...LOW_RES_PARAMS,
        twistAngle: 0,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('zero ridge count', () => {
      const params: VaseParams = {
        ...LOW_RES_PARAMS,
        ridgeCount: 0,
        ridgeDepth: 0,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('polygon cross-section (hexagon)', () => {
      const params: VaseParams = {
        ...LOW_RES_PARAMS,
        crossSection: 'polygon',
        polygonSides: 6,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('star cross-section', () => {
      const params: VaseParams = {
        ...LOW_RES_PARAMS,
        crossSection: 'star',
        starPoints: 5,
        starInnerRatio: 0.5,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('maximum twist (720 degrees)', () => {
      const params: VaseParams = {
        ...LOW_RES_PARAMS,
        twistAngle: 720,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('minimum dimensions (height=50, diameter=40)', () => {
      const params: VaseParams = {
        ...LOW_RES_PARAMS,
        height: 50,
        diameter: 40,
        taper: 1.0,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('wide taper (taper=1.5 — top wider than base)', () => {
      const params: VaseParams = {
        ...LOW_RES_PARAMS,
        taper: 1.5,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('narrow taper (taper=0.5 — top narrower than base)', () => {
      const params: VaseParams = {
        ...LOW_RES_PARAMS,
        taper: 0.5,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });
  });

  describe('profile curve values', () => {
    const curves = [-1.0, -0.5, 0.0, 0.5, 1.0];

    it.each(curves)('profileCurve=%f produces non-empty geometry', (curve) => {
      const params: VaseParams = {
        ...LOW_RES_PARAMS,
        profileCurve: curve,
      };
      const result = generateVase(params);
      const polygons = getPolygons(result);
      expect(polygons.length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });
  });

  describe('new cross-section shapes', () => {
    const sampledShapes: CrossSection[] = [
      'oval', 'squircle', 'superellipse',
      'heart', 'teardrop', 'petal', 'leaf',
      'gear', 'flower',
    ];

    it.each(sampledShapes)('%s cross-section produces valid geometry', (shape) => {
      const params: VaseParams = {
        ...LOW_RES_PARAMS,
        crossSection: shape,
      };
      const result = generateVase(params);
      const polygons = getPolygons(result);
      expect(polygons.length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });
  });

  describe('geometry validity', () => {
    it('all vertex coordinates are finite', () => {
      const result = generateVase(LOW_RES_PARAMS);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('polygon count is positive', () => {
      const result = generateVase(LOW_RES_PARAMS);
      expect(getPolygons(result).length).toBeGreaterThan(0);
    });

    it('higher resolution produces more polygons', () => {
      const lowRes = generateVase({ ...LOW_RES_PARAMS, resolution: 32 });
      const highRes = generateVase({ ...LOW_RES_PARAMS, resolution: 64 });
      const lowCount = getPolygons(lowRes).length;
      const highCount = getPolygons(highRes).length;
      expect(highCount).toBeGreaterThan(lowCount);
    });
  });

  describe('smooth inner wall', () => {
    it('smoothInnerWall: true generates valid geometry', () => {
      const params: VaseParams = {
        ...LOW_RES_PARAMS,
        smoothInnerWall: true,
        ridgeCount: 8,
        ridgeDepth: 5,
      };
      const result = generateVase(params);
      const polygons = getPolygons(result);
      expect(polygons.length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('smoothInnerWall: false generates valid geometry', () => {
      const params: VaseParams = {
        ...LOW_RES_PARAMS,
        smoothInnerWall: false,
        ridgeCount: 8,
        ridgeDepth: 5,
      };
      const result = generateVase(params);
      const polygons = getPolygons(result);
      expect(polygons.length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('smooth vs ridged inner wall produce different polygon counts', () => {
      const base: VaseParams = {
        ...LOW_RES_PARAMS,
        style: 'classic',
        ridgeCount: 8,
        ridgeDepth: 5,
      };
      const smooth = generateVase({ ...base, smoothInnerWall: true });
      const ridged = generateVase({ ...base, smoothInnerWall: false });
      const smoothCount = getPolygons(smooth).length;
      const ridgedCount = getPolygons(ridged).length;
      expect(smoothCount).not.toBe(ridgedCount);
    });
  });

  describe('spiral-fin style', () => {
    const spiralFinParams: VaseParams = {
      ...LOW_RES_PARAMS,
      style: 'spiral-fin',
      finCount: 12,
      finHeight: 8,
      finWidth: 5,
    };

    it('produces non-empty geometry', () => {
      const result = generateVase(spiralFinParams);
      const polygons = getPolygons(result);
      expect(polygons.length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('works with circle cross-section', () => {
      const params: VaseParams = {
        ...spiralFinParams,
        crossSection: 'circle',
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('works with oval cross-section', () => {
      const params: VaseParams = {
        ...spiralFinParams,
        crossSection: 'oval',
        ovalRatio: 0.7,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('works with flower cross-section', () => {
      const params: VaseParams = {
        ...spiralFinParams,
        crossSection: 'flower',
        petalCount: 5,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('with twist produces valid geometry', () => {
      const params: VaseParams = {
        ...spiralFinParams,
        twistAngle: 360,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('with profileCurve produces valid geometry', () => {
      const params: VaseParams = {
        ...spiralFinParams,
        profileCurve: 0.5,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('inner wall is always smooth (no fins)', () => {
      // Spiral-fin forces smooth inner wall. This means inner/outer have
      // different point counts, which would cause issues if not handled.
      // The test verifies the generation doesn't crash.
      const params: VaseParams = {
        ...spiralFinParams,
        smoothInnerWall: false, // should be overridden for spiral-fin
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });
  });
});
