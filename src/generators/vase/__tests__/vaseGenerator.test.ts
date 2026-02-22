import { describe, it, expect } from 'vitest';
import { geometries } from '@jscad/modeling';
import type { Geom3 } from '@jscad/modeling';
import { generateVase } from '../vaseGenerator';
import { DEFAULT_VASE_PARAMS } from '@/types/design';
import type { VaseParams, ProfileShape } from '@/types/design';

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
  describe('default parameters', () => {
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
    it('cylinder profile with taper=1.0 (no tapering)', () => {
      const params: VaseParams = {
        ...LOW_RES_PARAMS,
        profileShape: 'cylinder',
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

  describe('all 6 profile shapes', () => {
    const profiles: ProfileShape[] = [
      'cylinder', 'tapered', 'bulbous', 'flared', 'hourglass', 'scurve',
    ];

    it.each(profiles)('%s profile produces non-empty geometry', (shape) => {
      const params: VaseParams = {
        ...LOW_RES_PARAMS,
        profileShape: shape,
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
      // buildShell clamps circle segments to Math.max(resolution, 32),
      // so we need resolution > 32 for it to have an effect
      const lowRes = generateVase({ ...LOW_RES_PARAMS, resolution: 32 });
      const highRes = generateVase({ ...LOW_RES_PARAMS, resolution: 64 });
      const lowCount = getPolygons(lowRes).length;
      const highCount = getPolygons(highRes).length;
      expect(highCount).toBeGreaterThan(lowCount);
    });
  });
});
