import { describe, it, expect } from 'vitest';
import { offsetPolygonInward } from '../vaseGenerator';

/** Generate a CCW circle as an array of 2D points */
function makeCircle(radius: number, segments: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    pts.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }
  return pts;
}

describe('offsetPolygonInward', () => {
  it('circle offset produces uniform distance from origin', () => {
    const radius = 50;
    const offset = 3;
    const circle = makeCircle(radius, 64);
    const inner = offsetPolygonInward(circle, offset, 0.1);

    // Every inner point should be at approximately (radius - offset) from origin
    const expectedR = radius - offset;
    for (const [x, y] of inner) {
      const r = Math.sqrt(x * x + y * y);
      expect(r).toBeCloseTo(expectedR, 1);
    }
  });

  it('circle offset points are all finite', () => {
    const circle = makeCircle(30, 32);
    const inner = offsetPolygonInward(circle, 2, 0.1);
    for (const [x, y] of inner) {
      expect(Number.isFinite(x)).toBe(true);
      expect(Number.isFinite(y)).toBe(true);
    }
  });

  it('preserves point count', () => {
    const circle = makeCircle(40, 48);
    const inner = offsetPolygonInward(circle, 5, 0.1);
    expect(inner.length).toBe(circle.length);
  });

  it('minRadius clamp prevents collapse to zero', () => {
    // Small circle with large offset would collapse without clamping
    const circle = makeCircle(5, 32);
    const inner = offsetPolygonInward(circle, 10, 2);
    for (const [x, y] of inner) {
      const r = Math.sqrt(x * x + y * y);
      expect(r).toBeGreaterThanOrEqual(2 - 0.01);
    }
  });

  it('square offset produces correct perpendicular distance', () => {
    // A CCW square: right → top → left → bottom
    const s = 20;
    const square: [number, number][] = [
      [s, -s], [s, s], [-s, s], [-s, -s],
    ];
    const offset = 3;
    const inner = offsetPolygonInward(square, offset, 0.1);

    // For a square, the offset should move each side inward by `offset`.
    // The 90° corner has cosHalf = cos(45°) ≈ 0.707, which is > 0.25,
    // so miter = offset / cos(45°) ≈ offset * 1.414. The resulting
    // corner should be at (s - offset, s - offset) etc.
    const expected = s - offset;
    for (const [x, y] of inner) {
      expect(Math.abs(x)).toBeCloseTo(expected, 1);
      expect(Math.abs(y)).toBeCloseTo(expected, 1);
    }
  });

  it('star shape offset produces all-finite points with no collapse', () => {
    // Star shape (concave) — verify robustness
    const points = 5;
    const outerR = 30;
    const innerR = 12;
    const star: [number, number][] = [];
    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? outerR : innerR;
      star.push([Math.cos(angle) * r, Math.sin(angle) * r]);
    }
    const inner = offsetPolygonInward(star, 3, 1);
    expect(inner.length).toBe(star.length);
    for (const [x, y] of inner) {
      expect(Number.isFinite(x)).toBe(true);
      expect(Number.isFinite(y)).toBe(true);
      const r = Math.sqrt(x * x + y * y);
      expect(r).toBeGreaterThanOrEqual(1 - 0.01);
    }
  });
});
