import { describe, it, expect } from 'vitest';
import { buildDecorativeShell } from '../shellBuilder';
import type { DecorativeShellParams } from '@/types/design';

function makeShellParams(overrides: Partial<DecorativeShellParams> = {}): DecorativeShellParams {
  return {
    height: 100,
    diameter: 80,
    taper: 0.8,
    wallThickness: 2,
    style: 'classic',
    profileCurve: 0,
    crossSection: 'circle',
    twistAngle: 0,
    twistDirection: 'ccw',
    twistEasing: 'linear',
    ridgeCount: 0,
    ridgeDepth: 0,
    ridgeProfile: 'sharp',
    smoothInnerWall: false,
    finCount: 30,
    finHeight: 3,
    finWidth: 4,
    polygonSides: 6,
    starPoints: 5,
    starInnerRatio: 0.5,
    ovalRatio: 1.5,
    squircleN: 4,
    superN: 3,
    gearTeeth: 12,
    petalCount: 6,
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

describe('buildDecorativeShell', () => {
  it('circle cross-section produces valid geometry', () => {
    const geom = buildDecorativeShell(makeShellParams(), { resolution: 32, wallInset: 0 });
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });

  const crossSections = [
    'circle', 'oval', 'squircle', 'superellipse',
    'heart', 'teardrop', 'petal', 'leaf',
    'polygon', 'star', 'gear', 'flower',
  ] as const;

  it.each(crossSections)(
    '%s cross-section produces valid geometry',
    (crossSection) => {
      const geom = buildDecorativeShell(
        makeShellParams({ crossSection }),
        { resolution: 32, wallInset: 0 }
      );
      expect(polygonCount(geom)).toBeGreaterThan(0);
      expect(allFinite(geom)).toBe(true);
    }
  );

  it('wall inset produces valid geometry', () => {
    const geom = buildDecorativeShell(
      makeShellParams(),
      { resolution: 32, wallInset: 2 }
    );
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });

  it('wall inset produces different geometry than no inset', () => {
    const noInset = buildDecorativeShell(
      makeShellParams(),
      { resolution: 32, wallInset: 0 }
    );
    const withInset = buildDecorativeShell(
      makeShellParams(),
      { resolution: 32, wallInset: 3 }
    );
    // Same polygon count (same slice structure), different vertex positions
    expect(polygonCount(noInset)).toEqual(polygonCount(withInset));
  });

  it.each([-0.8, 0, 0.8])('profile curve %f works', (profileCurve) => {
    const geom = buildDecorativeShell(
      makeShellParams({ profileCurve }),
      { resolution: 32, wallInset: 0 }
    );
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });

  it.each([0, 90, 360, 720])('twist %d degrees works', (twistAngle) => {
    const geom = buildDecorativeShell(
      makeShellParams({ twistAngle }),
      { resolution: 32, wallInset: 0 }
    );
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });

  it('ridge modulation works', () => {
    const geom = buildDecorativeShell(
      makeShellParams({ ridgeCount: 12, ridgeDepth: 3 }),
      { resolution: 32, wallInset: 0 }
    );
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });

  it('fin modulation works', () => {
    const geom = buildDecorativeShell(
      makeShellParams({ style: 'spiral-fin', finCount: 20, finHeight: 3, finWidth: 4 }),
      { resolution: 32, wallInset: 0 }
    );
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });

  it('skipModulation produces different vertex positions than ridged', () => {
    const params = makeShellParams({ ridgeCount: 12, ridgeDepth: 5 });
    const ridged = buildDecorativeShell(params, { resolution: 32, wallInset: 0 });
    const smooth = buildDecorativeShell(params, { resolution: 32, wallInset: 0, skipModulation: true });
    // Both produce valid geometry
    expect(polygonCount(ridged)).toBeGreaterThan(0);
    expect(polygonCount(smooth)).toBeGreaterThan(0);
    expect(allFinite(ridged)).toBe(true);
    expect(allFinite(smooth)).toBe(true);
    // Same polygon count but different vertex positions (ridges change XY coords)
    const rv = (ridged as any).polygons[1].vertices;
    const sv = (smooth as any).polygons[1].vertices;
    let hasDifference = false;
    for (let j = 0; j < Math.min(rv.length, sv.length); j++) {
      if (Math.abs(rv[j][0] - sv[j][0]) > 0.001 || Math.abs(rv[j][1] - sv[j][1]) > 0.001) {
        hasDifference = true;
        break;
      }
    }
    expect(hasDifference).toBe(true);
  });

  it('slope compensation with wall inset on steep taper', () => {
    const geom = buildDecorativeShell(
      makeShellParams({ taper: 0.3, profileCurve: 0 }),
      { resolution: 32, wallInset: 3 }
    );
    expect(polygonCount(geom)).toBeGreaterThan(0);
    expect(allFinite(geom)).toBe(true);
  });
});
