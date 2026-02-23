import { describe, it, expect } from 'vitest';
import { generateLamp } from '../lampGenerator';
import { generateLampBase } from '../lampBaseGenerator';
import { generateLampShade } from '../lampShadeGenerator';
import { DEFAULT_LAMP_PARAMS } from '@/types/design';
import type { LampParams } from '@/types/design';

function makeParams(overrides: Partial<LampParams> = {}): LampParams {
  return {
    ...DEFAULT_LAMP_PARAMS,
    base: { ...DEFAULT_LAMP_PARAMS.base },
    shade: { ...DEFAULT_LAMP_PARAMS.shade },
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

describe('generateLamp (combined)', () => {
  it('produces valid Geom3 with all vertices finite', () => {
    const geom = generateLamp(makeParams());
    expect(geom).toBeDefined();
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });

  it('combined has more polygons than either part alone', () => {
    const params = makeParams();
    const combined = generateLamp(params);
    const base = generateLampBase(params);
    const shade = generateLampShade(params);
    expect(polygonCount(combined)).toBeGreaterThan(polygonCount(base));
    expect(polygonCount(combined)).toBeGreaterThan(polygonCount(shade));
  });

  it('both parts are independently valid', () => {
    const params = makeParams();
    const base = generateLampBase(params);
    const shade = generateLampShade(params);
    expect(allFinite(base)).toBe(true);
    expect(allFinite(shade)).toBe(true);
    expect(polygonCount(base)).toBeGreaterThan(0);
    expect(polygonCount(shade)).toBeGreaterThan(0);
  });
});
