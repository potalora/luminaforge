import { describe, it, expect } from 'vitest';
import { generateLampShade } from '../lampShadeGenerator';
import { DEFAULT_LAMP_PARAMS } from '@/types/design';
import type { LampParams, CrossSection } from '@/types/design';

/** Lightweight params for tests — resolution: 16 (not 128) to avoid OOM on 16GB machines */
const TEST_LAMP_PARAMS: LampParams = {
  ...DEFAULT_LAMP_PARAMS,
  resolution: 16,
  base: { ...DEFAULT_LAMP_PARAMS.base, height: 40 },
  shade: { ...DEFAULT_LAMP_PARAMS.shade, height: 60 },
};

function makeParams(overrides: Partial<LampParams> = {}): LampParams {
  return {
    ...TEST_LAMP_PARAMS,
    base: { ...TEST_LAMP_PARAMS.base },
    shade: { ...TEST_LAMP_PARAMS.shade },
    ...overrides,
  };
}

function allFinite(geom: any): boolean {
  const polygons = (geom as any).polygons;
  for (const poly of polygons) {
    for (const vertex of poly.vertices) {
      for (const val of vertex) {
        if (!isFinite(val)) return false;
      }
    }
  }
  return true;
}

function polygonCount(geom: any): number {
  return (geom as any).polygons.length;
}

describe('generateLampShade', () => {
  it('produces valid Geom3 with default params', () => {
    const geom = generateLampShade(makeParams());
    expect(geom).toBeDefined();
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });

  it('works with classic style', () => {
    const params = makeParams();
    params.shade = { ...params.shade, style: 'classic' };
    const geom = generateLampShade(params);
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });

  it('works with spiral-fin style', () => {
    const params = makeParams();
    params.shade = {
      ...params.shade,
      style: 'spiral-fin',
      finCount: 30,
      finHeight: 3,
      finWidth: 3,
    };
    const geom = generateLampShade(params);
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });

  const crossSections: CrossSection[] = [
    'circle', 'oval', 'squircle', 'superellipse',
    'heart', 'teardrop', 'petal', 'leaf',
    'polygon', 'star', 'gear', 'flower',
  ];

  it.each(crossSections)(
    'produces valid geometry with %s cross-section',
    (crossSection) => {
      const params = makeParams();
      params.shade = { ...params.shade, crossSection, style: 'classic' };
      const geom = generateLampShade(params);
      expect(polygonCount(geom)).toBeGreaterThan(0);
      expect(allFinite(geom)).toBe(true);
    }
  );

  it('works with twist', () => {
    const params = makeParams();
    params.shade = { ...params.shade, twistAngle: 180, twistDirection: 'ccw' };
    const geom = generateLampShade(params);
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });

  it('smooth inner wall toggle works', () => {
    const smoothParams = makeParams();
    smoothParams.shade = { ...smoothParams.shade, smoothInnerWall: true };
    const roughParams = makeParams();
    roughParams.shade = { ...roughParams.shade, smoothInnerWall: false };
    const smooth = generateLampShade(smoothParams);
    const rough = generateLampShade(roughParams);
    // Different modulation produces different polygon counts
    expect(polygonCount(smooth)).not.toEqual(polygonCount(rough));
  });

  it('works with ridges', () => {
    const params = makeParams();
    params.shade = { ...params.shade, ridgeCount: 16, ridgeDepth: 4 };
    const geom = generateLampShade(params);
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });

  it('works with profile curve variations', () => {
    for (const profileCurve of [-0.8, 0, 0.8]) {
      const params = makeParams();
      params.shade = { ...params.shade, profileCurve };
      const geom = generateLampShade(params);
      expect(polygonCount(geom)).toBeGreaterThan(0);
      expect(allFinite(geom)).toBe(true);
    }
  });
});
