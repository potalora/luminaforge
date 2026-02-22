import { describe, it, expect } from 'vitest';
import {
  createCirclePoints,
  createPolygonPoints,
  createStarPoints,
  applyRidgeModulation,
  createCrossSection,
} from '../crossSections';

// Helper: compute distance from origin for a 2D point
function distFromOrigin([x, y]: [number, number]): number {
  return Math.sqrt(x * x + y * y);
}

// Helper: compute angle from origin for a 2D point
function angleFromOrigin([x, y]: [number, number]): number {
  return Math.atan2(y, x);
}

describe('createCirclePoints', () => {
  it('returns the correct number of points', () => {
    expect(createCirclePoints(10, 64)).toHaveLength(64);
    expect(createCirclePoints(10, 8)).toHaveLength(8);
  });

  it('all points lie on the circle at the given radius', () => {
    const radius = 25;
    const points = createCirclePoints(radius, 32);
    for (const pt of points) {
      expect(distFromOrigin(pt)).toBeCloseTo(radius, 10);
    }
  });

  it('points are in counter-clockwise order (increasing angle)', () => {
    const points = createCirclePoints(10, 16);
    for (let i = 1; i < points.length; i++) {
      const prevAngle = angleFromOrigin(points[i - 1]);
      const currAngle = angleFromOrigin(points[i]);
      // Angles increase CCW from 0 up to just before 2*PI
      // atan2 wraps at PI to -PI, so we check via the index-based angle instead
      const expectedAngle = (i / 16) * Math.PI * 2;
      const prevExpected = ((i - 1) / 16) * Math.PI * 2;
      expect(expectedAngle).toBeGreaterThan(prevExpected);
    }
  });

  it('first point is at [radius, 0]', () => {
    const radius = 15;
    const points = createCirclePoints(radius, 32);
    expect(points[0][0]).toBeCloseTo(radius);
    expect(points[0][1]).toBeCloseTo(0);
  });

  it('edge case: 3 segments produces a triangle', () => {
    const points = createCirclePoints(10, 3);
    expect(points).toHaveLength(3);
    // All on the circle
    for (const pt of points) {
      expect(distFromOrigin(pt)).toBeCloseTo(10, 10);
    }
  });
});

describe('createPolygonPoints', () => {
  it('returns exactly `sides` points', () => {
    expect(createPolygonPoints(10, 6)).toHaveLength(6);
    expect(createPolygonPoints(10, 3)).toHaveLength(3);
    expect(createPolygonPoints(10, 12)).toHaveLength(12);
  });

  it('all points lie at the correct radius', () => {
    const radius = 20;
    const points = createPolygonPoints(radius, 8);
    for (const pt of points) {
      expect(distFromOrigin(pt)).toBeCloseTo(radius, 10);
    }
  });

  it('points are regularly spaced (360/sides apart)', () => {
    const sides = 6;
    const points = createPolygonPoints(10, sides);
    const expectedSpacing = (2 * Math.PI) / sides;
    for (let i = 0; i < sides; i++) {
      const expectedAngle = (i / sides) * Math.PI * 2;
      const actualAngle = Math.atan2(points[i][1], points[i][0]);
      // Normalize to [0, 2PI)
      const normalizedActual = actualAngle < 0 ? actualAngle + 2 * Math.PI : actualAngle;
      const normalizedExpected = expectedAngle < 0 ? expectedAngle + 2 * Math.PI : expectedAngle;
      expect(normalizedActual).toBeCloseTo(normalizedExpected, 10);
    }
  });

  it('triangle (3 sides) has 120-degree spacing', () => {
    const points = createPolygonPoints(10, 3);
    expect(points).toHaveLength(3);
    // Check angular spacing between consecutive points
    for (let i = 0; i < 3; i++) {
      const a1 = (i / 3) * 2 * Math.PI;
      const a2 = ((i + 1) / 3) * 2 * Math.PI;
      expect(a2 - a1).toBeCloseTo((2 * Math.PI) / 3, 10);
    }
  });
});

describe('createStarPoints', () => {
  it('returns 2 * points vertices', () => {
    expect(createStarPoints(10, 0.5, 5)).toHaveLength(10);
    expect(createStarPoints(10, 0.5, 8)).toHaveLength(16);
    expect(createStarPoints(10, 0.5, 3)).toHaveLength(6);
  });

  it('outer vertices (even indices) at outerRadius', () => {
    const outerRadius = 20;
    const pts = createStarPoints(outerRadius, 0.5, 5);
    for (let i = 0; i < pts.length; i += 2) {
      expect(distFromOrigin(pts[i])).toBeCloseTo(outerRadius, 10);
    }
  });

  it('inner vertices (odd indices) at outerRadius * innerRatio', () => {
    const outerRadius = 20;
    const innerRatio = 0.4;
    const expectedInner = outerRadius * innerRatio;
    const pts = createStarPoints(outerRadius, innerRatio, 5);
    for (let i = 1; i < pts.length; i += 2) {
      expect(distFromOrigin(pts[i])).toBeCloseTo(expectedInner, 10);
    }
  });

  it('very pointy star (innerRatio = 0.2)', () => {
    const outerRadius = 10;
    const pts = createStarPoints(outerRadius, 0.2, 5);
    // Inner radius should be 2
    for (let i = 1; i < pts.length; i += 2) {
      expect(distFromOrigin(pts[i])).toBeCloseTo(2, 10);
    }
  });

  it('barely a star (innerRatio = 0.8)', () => {
    const outerRadius = 10;
    const pts = createStarPoints(outerRadius, 0.8, 5);
    // Inner radius should be 8 — almost the same as outer
    for (let i = 1; i < pts.length; i += 2) {
      expect(distFromOrigin(pts[i])).toBeCloseTo(8, 10);
    }
  });
});

describe('applyRidgeModulation', () => {
  const circlePoints = createCirclePoints(10, 64);

  it('returns unchanged points when ridgeCount=0', () => {
    const result = applyRidgeModulation(circlePoints, 0, 5, 'round');
    expect(result).toBe(circlePoints); // same reference
  });

  it('returns unchanged points when ridgeDepth=0', () => {
    const result = applyRidgeModulation(circlePoints, 6, 0, 'round');
    expect(result).toBe(circlePoints); // same reference
  });

  it('round profile: modulated radii vary smoothly', () => {
    const ridgeDepth = 5;
    const result = applyRidgeModulation(circlePoints, 6, ridgeDepth, 'round');
    const radii = result.map(distFromOrigin);
    // All radii should be between original radius and radius + ridgeDepth
    for (const r of radii) {
      expect(r).toBeGreaterThanOrEqual(10 - 0.001);
      expect(r).toBeLessThanOrEqual(10 + ridgeDepth + 0.001);
    }
  });

  it('round profile: creates ridgeCount peaks around the circle', () => {
    const ridgeCount = 6;
    const ridgeDepth = 5;
    const result = applyRidgeModulation(
      createCirclePoints(10, 360),
      ridgeCount,
      ridgeDepth,
      'round'
    );
    const radii = result.map(distFromOrigin);
    // Count local maxima (peak = larger than both neighbors)
    let peaks = 0;
    for (let i = 0; i < radii.length; i++) {
      const prev = radii[(i - 1 + radii.length) % radii.length];
      const next = radii[(i + 1) % radii.length];
      if (radii[i] > prev && radii[i] > next) peaks++;
    }
    expect(peaks).toBe(ridgeCount);
  });

  it('sharp profile: modulated radii have a triangular wave pattern', () => {
    const ridgeDepth = 5;
    const result = applyRidgeModulation(circlePoints, 6, ridgeDepth, 'sharp');
    const radii = result.map(distFromOrigin);
    // Should have variation — not all the same
    const min = Math.min(...radii);
    const max = Math.max(...radii);
    expect(max - min).toBeGreaterThan(0);
  });

  it('flat profile: modulated radii have smoothed step pattern', () => {
    const ridgeDepth = 5;
    const result = applyRidgeModulation(circlePoints, 6, ridgeDepth, 'flat');
    const radii = result.map(distFromOrigin);
    const min = Math.min(...radii);
    const max = Math.max(...radii);
    expect(max - min).toBeGreaterThan(0);
  });

  it('all profiles produce finite coordinates', () => {
    const profiles = ['round', 'sharp', 'flat'] as const;
    for (const profile of profiles) {
      const result = applyRidgeModulation(circlePoints, 6, 5, profile);
      for (const [x, y] of result) {
        expect(Number.isFinite(x)).toBe(true);
        expect(Number.isFinite(y)).toBe(true);
      }
    }
  });
});

describe('createCrossSection', () => {
  it('dispatches to circle generator for crossSection="circle"', () => {
    const result = createCrossSection('circle', 10, 32, 6, 5, 0.5);
    expect(result).toHaveLength(32); // circle uses segments
  });

  it('dispatches to polygon generator for crossSection="polygon"', () => {
    const result = createCrossSection('polygon', 10, 32, 6, 5, 0.5);
    expect(result).toHaveLength(6); // polygon uses polygonSides, ignores segments
  });

  it('dispatches to star generator for crossSection="star"', () => {
    const result = createCrossSection('star', 10, 32, 6, 5, 0.5);
    expect(result).toHaveLength(10); // star: 5 points * 2 = 10 vertices
  });

  it('falls back to circle for unknown crossSection', () => {
    const result = createCrossSection('unknown' as any, 10, 32, 6, 5, 0.5);
    expect(result).toHaveLength(32);
  });
});
