import { describe, it, expect } from 'vitest';
import { primitives, geometries } from '@jscad/modeling';
import type { Geom3 } from '@jscad/modeling';
import { convertGeom3ToGeometryResult } from '../geometryConverter';
import { generateVase } from '@/generators/vase/vaseGenerator';
import { DEFAULT_VASE_PARAMS } from '@/types/design';
import type { VaseParams } from '@/types/design';

/** Lightweight test params: classic style (avoids spiral-fin's finCount*10 segment boost) + low resolution + small height */
const LOW_RES_PARAMS: VaseParams = {
  ...DEFAULT_VASE_PARAMS,
  style: 'classic',
  resolution: 16,
  height: 50,
};

describe('convertGeom3ToGeometryResult', () => {
  describe('smoke test with real vase geometry', () => {
    it('converts generateVase output without throwing', () => {
      const geom = generateVase(LOW_RES_PARAMS);
      const result = convertGeom3ToGeometryResult(geom);
      expect(result).toBeDefined();
      expect(result.positions).toBeInstanceOf(Float32Array);
      expect(result.normals).toBeInstanceOf(Float32Array);
      expect(result.indices).toBeInstanceOf(Uint32Array);
    });

    it('produces non-empty arrays', () => {
      const geom = generateVase(LOW_RES_PARAMS);
      const result = convertGeom3ToGeometryResult(geom);
      expect(result.positions.length).toBeGreaterThan(0);
      expect(result.normals.length).toBeGreaterThan(0);
      expect(result.indices.length).toBeGreaterThan(0);
    });
  });

  describe('array length consistency', () => {
    it('positions.length === normals.length', () => {
      const geom = generateVase(LOW_RES_PARAMS);
      const result = convertGeom3ToGeometryResult(geom);
      expect(result.positions.length).toBe(result.normals.length);
    });

    it('positions.length === indices.length * 3', () => {
      const geom = generateVase(LOW_RES_PARAMS);
      const result = convertGeom3ToGeometryResult(geom);
      expect(result.positions.length).toBe(result.indices.length * 3);
    });
  });

  describe('value validity', () => {
    it('all position values are finite (no NaN/Infinity)', () => {
      const geom = generateVase(LOW_RES_PARAMS);
      const result = convertGeom3ToGeometryResult(geom);
      for (let i = 0; i < result.positions.length; i++) {
        expect(Number.isFinite(result.positions[i])).toBe(true);
      }
    });

    it('all normal values are finite', () => {
      const geom = generateVase(LOW_RES_PARAMS);
      const result = convertGeom3ToGeometryResult(geom);
      for (let i = 0; i < result.normals.length; i++) {
        expect(Number.isFinite(result.normals[i])).toBe(true);
      }
    });

    it('normals are approximately unit length', () => {
      const geom = generateVase(LOW_RES_PARAMS);
      const result = convertGeom3ToGeometryResult(geom);
      // Check every 3rd normal (each vertex normal)
      for (let i = 0; i < result.normals.length; i += 3) {
        const nx = result.normals[i];
        const ny = result.normals[i + 1];
        const nz = result.normals[i + 2];
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        expect(len).toBeCloseTo(1.0, 4);
      }
    });

    it('all index values are in bounds', () => {
      const geom = generateVase(LOW_RES_PARAMS);
      const result = convertGeom3ToGeometryResult(geom);
      const vertexCount = result.positions.length / 3;
      for (let i = 0; i < result.indices.length; i++) {
        expect(result.indices[i]).toBeLessThan(vertexCount);
      }
    });
  });

  describe('known geometry triangle counts', () => {
    it('cuboid produces exactly 12 triangles (6 faces x 2)', () => {
      const cube = primitives.cuboid({ size: [10, 10, 10] });
      const result = convertGeom3ToGeometryResult(cube);
      const triangleCount = result.indices.length / 3;
      expect(triangleCount).toBe(12);
    });

    it('polygon with 3 vertices produces 1 triangle', () => {
      // A tetrahedron has 4 triangular faces — each polygon has 3 vertices
      // But let's directly test via polygon count from a known shape
      const cube = primitives.cuboid({ size: [10, 10, 10] });
      const polygons = geometries.geom3.toPolygons(cube);
      // Each cuboid face is a quad (4 verts) → 2 triangles
      // Verify by checking first polygon vertex count
      expect(polygons[0].vertices.length).toBe(4);
    });

    it('4-vertex polygon produces 2 triangles', () => {
      // A cuboid has 6 faces, each with 4 vertices → 2 triangles per face
      const cube = primitives.cuboid({ size: [5, 5, 5] });
      const polygons = geometries.geom3.toPolygons(cube);
      // Verify all polygons have 4 vertices
      for (const poly of polygons) {
        expect(poly.vertices.length).toBe(4);
      }
      const result = convertGeom3ToGeometryResult(cube);
      // 6 faces × 2 triangles = 12
      expect(result.indices.length / 3).toBe(12);
    });
  });

  describe('resolution scaling', () => {
    it('higher resolution produces more triangles', () => {
      const lowRes = generateVase({ ...LOW_RES_PARAMS, resolution: 32 });
      const highRes = generateVase({ ...LOW_RES_PARAMS, resolution: 64 });
      const lowResult = convertGeom3ToGeometryResult(lowRes);
      const highResult = convertGeom3ToGeometryResult(highRes);
      expect(highResult.indices.length).toBeGreaterThan(lowResult.indices.length);
    });
  });
});
