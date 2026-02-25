import { describe, it, expect, beforeAll } from 'vitest';
import { geometries } from '@jscad/modeling';
import type { Geom3 } from '@jscad/modeling';
import { generateVase } from '../vaseGenerator';
import { DEFAULT_VASE_PARAMS } from '@/types/design';
import type { VaseParams, CrossSection } from '@/types/design';

/** Lightweight classic-style params for tests that don't need spiral-fin */
const TEST_PARAMS_CLASSIC: VaseParams = {
  ...DEFAULT_VASE_PARAMS,
  style: 'classic',
  resolution: 16,
  height: 50,
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

describe('generateVase (classic style)', () => {
  describe('default parameters', () => {
    let result: Geom3;
    beforeAll(() => {
      result = generateVase(TEST_PARAMS_CLASSIC);
    });

    it('returns a non-null Geom3 object', () => {
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });

    it('produces geometry with polygons', () => {
      const polygons = getPolygons(result);
      expect(polygons.length).toBeGreaterThan(0);
    });

    it('polygons have valid vertices (3+ per polygon, finite numbers)', () => {
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
        ...TEST_PARAMS_CLASSIC,
        profileCurve: 0,
        taper: 1.0,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('zero twist angle', () => {
      const params: VaseParams = {
        ...TEST_PARAMS_CLASSIC,
        twistAngle: 0,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('zero ridge count', () => {
      const params: VaseParams = {
        ...TEST_PARAMS_CLASSIC,
        ridgeCount: 0,
        ridgeDepth: 0,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('polygon cross-section (hexagon)', () => {
      const params: VaseParams = {
        ...TEST_PARAMS_CLASSIC,
        crossSection: 'polygon',
        polygonSides: 6,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('star cross-section', () => {
      const params: VaseParams = {
        ...TEST_PARAMS_CLASSIC,
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
        ...TEST_PARAMS_CLASSIC,
        twistAngle: 720,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('minimum dimensions (height=50, diameter=40)', () => {
      const params: VaseParams = {
        ...TEST_PARAMS_CLASSIC,
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
        ...TEST_PARAMS_CLASSIC,
        taper: 1.5,
      };
      const result = generateVase(params);
      expect(getPolygons(result).length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('narrow taper (taper=0.5 — top narrower than base)', () => {
      const params: VaseParams = {
        ...TEST_PARAMS_CLASSIC,
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
        ...TEST_PARAMS_CLASSIC,
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
        ...TEST_PARAMS_CLASSIC,
        crossSection: shape,
      };
      const result = generateVase(params);
      const polygons = getPolygons(result);
      expect(polygons.length).toBeGreaterThan(0);
      expect(allVerticesFinite(result)).toBe(true);
    });
  });

  describe('geometry validity', () => {
    let result: Geom3;
    beforeAll(() => {
      result = generateVase(TEST_PARAMS_CLASSIC);
    });

    it('all vertex coordinates are finite', () => {
      expect(allVerticesFinite(result)).toBe(true);
    });

    it('polygon count is positive', () => {
      expect(getPolygons(result).length).toBeGreaterThan(0);
    });

    it('higher resolution produces more polygons', () => {
      // crossSectionSegments = Math.max(resolution, 32), so both values must be >= 32
      const lowRes = generateVase({ ...TEST_PARAMS_CLASSIC, resolution: 32 });
      const highRes = generateVase({ ...TEST_PARAMS_CLASSIC, resolution: 64 });
      const lowCount = getPolygons(lowRes).length;
      const highCount = getPolygons(highRes).length;
      expect(highCount).toBeGreaterThan(lowCount);
    });
  });

  describe('polygon/star with ridges resolution', () => {
    it('polygon cross-section with ridges has comparable complexity to circle', () => {
      const polygonResult = generateVase({
        ...TEST_PARAMS_CLASSIC,
        crossSection: 'polygon',
        polygonSides: 6,
        ridgeCount: 8,
        ridgeDepth: 5,
      });
      const circleResult = generateVase({
        ...TEST_PARAMS_CLASSIC,
        crossSection: 'circle',
        ridgeCount: 8,
        ridgeDepth: 5,
      });
      const polyCount = getPolygons(polygonResult).length;
      const circleCount = getPolygons(circleResult).length;
      expect(polyCount).toBeGreaterThan(0);
      expect(allVerticesFinite(polygonResult)).toBe(true);
      // With uniform segment count, polygon complexity should be in the same ballpark as circle
      expect(polyCount).toBeGreaterThan(circleCount * 0.3);
    });

    it('star cross-section with ridges has comparable complexity to circle', () => {
      const starResult = generateVase({
        ...TEST_PARAMS_CLASSIC,
        crossSection: 'star',
        starPoints: 5,
        starInnerRatio: 0.5,
        ridgeCount: 8,
        ridgeDepth: 5,
      });
      const circleResult = generateVase({
        ...TEST_PARAMS_CLASSIC,
        crossSection: 'circle',
        ridgeCount: 8,
        ridgeDepth: 5,
      });
      const starCount = getPolygons(starResult).length;
      const circleCount = getPolygons(circleResult).length;
      expect(starCount).toBeGreaterThan(0);
      expect(allVerticesFinite(starResult)).toBe(true);
      expect(starCount).toBeGreaterThan(circleCount * 0.3);
    });
  });

  describe('smooth inner wall', () => {
    it('smoothInnerWall: true generates valid geometry', () => {
      const params: VaseParams = {
        ...TEST_PARAMS_CLASSIC,
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
        ...TEST_PARAMS_CLASSIC,
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
        ...TEST_PARAMS_CLASSIC,
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
});
