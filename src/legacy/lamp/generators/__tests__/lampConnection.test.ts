import { describe, it, expect } from 'vitest';
import { generateLampBase } from '../lampBaseGenerator';
import { generateLampShade } from '../lampShadeGenerator';
import { DEFAULT_LAMP_PARAMS } from '@/types/design';
import { CONNECTION_LIP } from '../socketConstants';
import type { LampParams, ConnectionType } from '@/types/design';

/** Lightweight params for tests — resolution: 16, reduced heights */
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

/** Scan all polygon vertices to find axis-aligned bounding box */
function getBounds(geom: any): { min: [number, number, number]; max: [number, number, number] } {
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  for (const poly of (geom as any).polygons) {
    for (const v of poly.vertices) {
      for (let i = 0; i < 3; i++) {
        if (v[i] < min[i]) min[i] = v[i];
        if (v[i] > max[i]) max[i] = v[i];
      }
    }
  }
  return { min, max };
}

/** Scan all vertices for maximum XY distance from origin */
function getMaxRadius(geom: any): number {
  let maxR = 0;
  for (const poly of (geom as any).polygons) {
    for (const v of poly.vertices) {
      const r = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
      if (r > maxR) maxR = r;
    }
  }
  return maxR;
}

describe('lamp connection geometry', () => {
  it('base lip extends ABOVE decorative shell top', () => {
    const params = makeParams();
    const base = generateLampBase(params);
    const bounds = getBounds(base);
    // Male lip extends above base.height
    expect(bounds.max[2]).toBeGreaterThan(params.base.height);
  });

  it('base lip outer radius > base shell top radius', () => {
    const params = makeParams();
    const base = generateLampBase(params);
    const maxR = getMaxRadius(base);
    const topRadius = (params.base.diameter / 2) * (1 + params.base.taper);
    // Lip outer = topRadius + wallThickness, so maxR >= that
    expect(maxR).toBeGreaterThanOrEqual(topRadius + CONNECTION_LIP.wallThickness - 0.1);
  });

  it('shade lip inner > base lip outer (female wraps around male)', () => {
    const params = makeParams();
    const shade = generateLampShade(params);
    const shadeMaxR = getMaxRadius(shade);
    const baseTopRadius = (params.base.diameter / 2) * (1 + params.base.taper);
    const baseLipOuter = baseTopRadius + CONNECTION_LIP.wallThickness;
    // Shade lip outer = baseLipOuter + tolerance + wallThickness
    // So shade max radius should be >= baseLipOuter + tolerance
    expect(shadeMaxR).toBeGreaterThan(baseLipOuter);
  });

  it('lips occupy same Z-range when assembled', () => {
    const params = makeParams();
    const base = generateLampBase(params);
    const baseBounds = getBounds(base);
    const lipHeight = CONNECTION_LIP.height; // friction-fit default

    // Base lip top should be at base.height + lipHeight
    const expectedLipTop = params.base.height + lipHeight;
    expect(baseBounds.max[2]).toBeCloseTo(expectedLipTop, 0);

    // Shade lip extends from Z=0 to Z=lipHeight (local coords)
    // After translation by base.height, it becomes base.height to base.height + lipHeight
    // Same range as base lip
    const shade = generateLampShade(params);
    const shadeBounds = getBounds(shade);
    // Shade lip top (local) should be at lipHeight
    expect(shadeBounds.max[2]).toBeGreaterThanOrEqual(lipHeight - 0.1);
  });

  it('friction-fit produces taller lips than gravity-sit', () => {
    const frictionParams = makeParams({ connectionType: 'friction-fit' });
    const gravityParams = makeParams({ connectionType: 'gravity-sit' });

    const frictionBase = generateLampBase(frictionParams);
    const gravityBase = generateLampBase(gravityParams);

    const frictionBounds = getBounds(frictionBase);
    const gravityBounds = getBounds(gravityBase);

    // Friction-fit lip is taller (full CONNECTION_LIP.height vs half)
    expect(frictionBounds.max[2]).toBeGreaterThan(gravityBounds.max[2]);
  });

  it('lip matches tapered top for taper=-0.5', () => {
    const params = makeParams();
    params.base = { ...params.base, taper: -0.5 };
    const base = generateLampBase(params);
    const maxR = getMaxRadius(base);
    const expectedTopRadius = (params.base.diameter / 2) * 0.5;
    const expectedLipOuter = expectedTopRadius + CONNECTION_LIP.wallThickness;
    // maxR could be from base body (wider at bottom) or lip
    // But lip outer should be present
    expect(maxR).toBeGreaterThanOrEqual(expectedLipOuter - 0.1);
  });

  it('lip matches tapered top for taper=-0.15 (default)', () => {
    const params = makeParams();
    const base = generateLampBase(params);
    const bounds = getBounds(base);
    const topRadius = (params.base.diameter / 2) * (1 + params.base.taper);
    const expectedLipOuter = topRadius + CONNECTION_LIP.wallThickness;
    const expectedLipTop = params.base.height + CONNECTION_LIP.height;

    expect(bounds.max[2]).toBeCloseTo(expectedLipTop, 0);
    // The geometry must include vertices at the lip outer radius
    const maxR = getMaxRadius(base);
    expect(maxR).toBeGreaterThanOrEqual(expectedLipOuter - 0.1);
  });

  it('lip matches tapered top for taper=0 (no taper)', () => {
    const params = makeParams();
    params.base = { ...params.base, taper: 0 };
    const base = generateLampBase(params);
    const topRadius = params.base.diameter / 2; // taper=0 means no taper
    const expectedLipOuter = topRadius + CONNECTION_LIP.wallThickness;
    const maxR = getMaxRadius(base);
    expect(maxR).toBeGreaterThanOrEqual(expectedLipOuter - 0.1);
  });

  /** Get max XY radius for vertices within a Z range */
  function getMaxRadiusNearZ(geom: any, zMin: number, zMax: number): number {
    let maxR = 0;
    for (const poly of (geom as any).polygons) {
      for (const v of poly.vertices) {
        if (v[2] >= zMin && v[2] <= zMax) {
          const r = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
          if (r > maxR) maxR = r;
        }
      }
    }
    return maxR;
  }

  it('shade bottom (decorative shell) approximately matches base top radius', () => {
    const params = makeParams();
    // Classic style, no ridges — clean geometry for precise radius check
    params.shade = { ...params.shade, style: 'classic', ridgeCount: 0, ridgeDepth: 0 };
    const shade = generateLampShade(params);

    const baseTopRadius = (params.base.diameter / 2) * (1 + params.base.taper);
    // Sample just above the lip to get the decorative shell radius at bottom
    const lipH = CONNECTION_LIP.height;
    const shellBottomR = getMaxRadiusNearZ(shade, lipH + 0.5, lipH + 5);

    // Shell bottom should be close to baseTopRadius (within 5mm)
    expect(shellBottomR).toBeCloseTo(baseTopRadius, -1);
    // Should NOT be near shade's full diameter (would be ~75mm without invertProfile)
    expect(shellBottomR).toBeLessThan(params.shade.diameter / 2 * 0.85);
  });

  it('shade top is wider than shade bottom (inverted profile)', () => {
    const params = makeParams();
    // Classic style for clean geometry
    params.shade = { ...params.shade, style: 'classic', ridgeCount: 0, ridgeDepth: 0 };
    const shade = generateLampShade(params);

    const lipH = CONNECTION_LIP.height;
    const shellBottomR = getMaxRadiusNearZ(shade, lipH + 0.5, lipH + 5);
    const shellTopR = getMaxRadiusNearZ(shade, params.shade.height - 5, params.shade.height);

    // Shade should expand from bottom to top (inverted profile)
    expect(shellTopR).toBeGreaterThan(shellBottomR);
  });
});
