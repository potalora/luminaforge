import { describe, it, expect } from 'vitest';
import { generateLampBase } from '../lampBaseGenerator';
import { DEFAULT_LAMP_PARAMS } from '@/types/design';
import type { LampParams, SocketType, ConnectionType, CrossSection } from '@/types/design';

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

describe('generateLampBase', () => {
  it('produces valid Geom3 with default params', () => {
    const geom = generateLampBase(makeParams());
    expect(geom).toBeDefined();
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });

  it.each(['E12', 'E14', 'E26', 'E27'] as SocketType[])(
    'produces valid geometry with %s socket',
    (socketType) => {
      const geom = generateLampBase(makeParams({ socketType }));
      expect(polygonCount(geom)).toBeGreaterThan(0);
      expect(allFinite(geom)).toBe(true);
    }
  );

  it('wire channel on vs off produces different polygon counts', () => {
    const withChannel = generateLampBase(makeParams({ wireChannelEnabled: true }));
    const withoutChannel = generateLampBase(makeParams({ wireChannelEnabled: false }));
    expect(polygonCount(withChannel)).not.toEqual(polygonCount(withoutChannel));
  });

  it.each(['friction-fit', 'gravity-sit'] as ConnectionType[])(
    'produces valid geometry with %s connection',
    (connectionType) => {
      const geom = generateLampBase(makeParams({ connectionType }));
      expect(polygonCount(geom)).toBeGreaterThan(0);
      expect(allFinite(geom)).toBe(true);
    }
  );

  it('works with non-circle cross-section', () => {
    const params = makeParams();
    params.base = { ...params.base, crossSection: 'polygon' as CrossSection, polygonSides: 6 };
    const geom = generateLampBase(params);
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });

  it('works with twist', () => {
    const params = makeParams();
    params.base = { ...params.base, twistAngle: 90 };
    const geom = generateLampBase(params);
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });

  it('works with ridges', () => {
    const params = makeParams();
    params.base = { ...params.base, ridgeCount: 12, ridgeDepth: 3 };
    const geom = generateLampBase(params);
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });

  it('works with spiral-fin style', () => {
    const params = makeParams();
    params.base = {
      ...params.base,
      style: 'spiral-fin',
      finCount: 20,
      finHeight: 3,
      finWidth: 4,
    };
    const geom = generateLampBase(params);
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });
});
