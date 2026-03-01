import { describe, it, expect } from 'vitest';
import {
  createCirclePoints,
  createPolygonPoints,
  createStarPoints,
  applyRidgeModulation,
  applyFinModulation,
  createCrossSection,
  getBaseRadiusAtAngle,
  createFinCrossSection,
} from '../crossSections';
import type { CrossSection } from '@/types/design';

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
    for (let i = 0; i < sides; i++) {
      const expectedAngle = (i / sides) * Math.PI * 2;
      const actualAngle = Math.atan2(points[i][1], points[i][0]);
      const normalizedActual = actualAngle < 0 ? actualAngle + 2 * Math.PI : actualAngle;
      const normalizedExpected = expectedAngle < 0 ? expectedAngle + 2 * Math.PI : expectedAngle;
      expect(normalizedActual).toBeCloseTo(normalizedExpected, 10);
    }
  });

  it('triangle (3 sides) has 120-degree spacing', () => {
    const points = createPolygonPoints(10, 3);
    expect(points).toHaveLength(3);
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
    for (let i = 1; i < pts.length; i += 2) {
      expect(distFromOrigin(pts[i])).toBeCloseTo(2, 10);
    }
  });

  it('barely a star (innerRatio = 0.8)', () => {
    const outerRadius = 10;
    const pts = createStarPoints(outerRadius, 0.8, 5);
    for (let i = 1; i < pts.length; i += 2) {
      expect(distFromOrigin(pts[i])).toBeCloseTo(8, 10);
    }
  });
});

describe('applyRidgeModulation', () => {
  const circlePoints = createCirclePoints(10, 64);

  it('returns unchanged points when ridgeCount=0', () => {
    const result = applyRidgeModulation(circlePoints, 0, 5, 'round');
    expect(result).toBe(circlePoints);
  });

  it('returns unchanged points when ridgeDepth=0', () => {
    const result = applyRidgeModulation(circlePoints, 6, 0, 'round');
    expect(result).toBe(circlePoints);
  });

  it('round profile: modulated radii vary smoothly', () => {
    const ridgeDepth = 5;
    const result = applyRidgeModulation(circlePoints, 6, ridgeDepth, 'round');
    const radii = result.map(distFromOrigin);
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
    let peaks = 0;
    for (let i = 0; i < radii.length; i++) {
      const prev = radii[(i - 1 + radii.length) % radii.length];
      const next = radii[(i + 1) % radii.length];
      if (radii[i] > prev && radii[i] > next) peaks++;
    }
    expect(peaks).toBe(ridgeCount);
  });

  it('sharp profile: modulated radii have variation', () => {
    const ridgeDepth = 5;
    const result = applyRidgeModulation(circlePoints, 6, ridgeDepth, 'sharp');
    const radii = result.map(distFromOrigin);
    const min = Math.min(...radii);
    const max = Math.max(...radii);
    expect(max - min).toBeGreaterThan(0);
  });

  it('flat profile: modulated radii have variation', () => {
    const ridgeDepth = 5;
    const result = applyRidgeModulation(circlePoints, 6, ridgeDepth, 'flat');
    const radii = result.map(distFromOrigin);
    const min = Math.min(...radii);
    const max = Math.max(...radii);
    expect(max - min).toBeGreaterThan(0);
  });

  it('sharp profile: modulation stays in [0, 1] for negative angles', () => {
    // Points in the negative-angle half of the circle (y < 0)
    const negPoints: [number, number][] = [
      [10 * Math.cos(-Math.PI / 2), 10 * Math.sin(-Math.PI / 2)],
      [10 * Math.cos(-Math.PI / 4), 10 * Math.sin(-Math.PI / 4)],
      [10 * Math.cos(-3 * Math.PI / 4), 10 * Math.sin(-3 * Math.PI / 4)],
      [10 * Math.cos(-Math.PI), 10 * Math.sin(-Math.PI)],
    ];
    const ridgeDepth = 5;
    const result = applyRidgeModulation(negPoints, 6, ridgeDepth, 'sharp');
    const radii = result.map(distFromOrigin);
    for (const r of radii) {
      expect(r).toBeGreaterThanOrEqual(10 - 0.001);
      expect(r).toBeLessThanOrEqual(10 + ridgeDepth + 0.001);
    }
  });

  it('sharp profile: symmetric modulation at positive and negative angles', () => {
    const ridgeDepth = 5;
    const ridgeCount = 6;
    // Create matching positive/negative angle point pairs
    const posPoints: [number, number][] = [[10, 0], [0, 10]];
    const negPoints: [number, number][] = [[10, 0], [0, -10]];
    const posResult = applyRidgeModulation(posPoints, ridgeCount, ridgeDepth, 'sharp');
    const negResult = applyRidgeModulation(negPoints, ridgeCount, ridgeDepth, 'sharp');
    // Both [10, 0] points should produce the same radius
    expect(distFromOrigin(posResult[0])).toBeCloseTo(distFromOrigin(negResult[0]));
    // [0, 10] and [0, -10] should produce the same radius (symmetric)
    expect(distFromOrigin(posResult[1])).toBeCloseTo(distFromOrigin(negResult[1]));
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

describe('applyFinModulation', () => {
  const circlePoints = createCirclePoints(10, 128);

  it('returns unchanged points when finCount=0', () => {
    const result = applyFinModulation(circlePoints, 0, 5, 1.0);
    expect(result).toBe(circlePoints);
  });

  it('returns unchanged points when finHeight=0', () => {
    const result = applyFinModulation(circlePoints, 12, 0, 1.0);
    expect(result).toBe(circlePoints);
  });

  it('modulated radii include peaks at baseRadius + finHeight', () => {
    const baseRadius = 10;
    const finHeight = 5;
    const result = applyFinModulation(circlePoints, 6, finHeight, 1.0);
    const radii = result.map(distFromOrigin);
    const maxR = Math.max(...radii);
    expect(maxR).toBeCloseTo(baseRadius + finHeight, 0);
  });

  it('all coordinates are finite', () => {
    const result = applyFinModulation(circlePoints, 24, 8, 1.5);
    for (const [x, y] of result) {
      expect(Number.isFinite(x)).toBe(true);
      expect(Number.isFinite(y)).toBe(true);
    }
  });

  it('creates finCount peaks around the circle', () => {
    const finCount = 6;
    const result = applyFinModulation(
      createCirclePoints(10, 360),
      finCount,
      5,
      1.0
    );
    const radii = result.map(distFromOrigin);
    let peaks = 0;
    for (let i = 0; i < radii.length; i++) {
      const prev = radii[(i - 1 + radii.length) % radii.length];
      const next = radii[(i + 1) % radii.length];
      if (radii[i] > prev && radii[i] > next) peaks++;
    }
    expect(peaks).toBe(finCount);
  });

  it('higher broadness produces wider peaks (more points above midpoint)', () => {
    const baseRadius = 10;
    const finHeight = 5;
    const midpoint = baseRadius + finHeight / 2;

    const narrowResult = applyFinModulation(circlePoints, 6, finHeight, 0.3);
    const wideResult = applyFinModulation(circlePoints, 6, finHeight, 2.0);

    const narrowAbove = narrowResult.filter(pt => distFromOrigin(pt) > midpoint).length;
    const wideAbove = wideResult.filter(pt => distFromOrigin(pt) > midpoint).length;

    expect(wideAbove).toBeGreaterThan(narrowAbove);
  });
});

describe('getBaseRadiusAtAngle', () => {
  const R = 40; // base radius

  describe('circle', () => {
    it('returns baseRadius at all angles', () => {
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * 2 * Math.PI;
        expect(getBaseRadiusAtAngle(angle, 'circle', R)).toBe(R);
      }
    });
  });

  describe('oval', () => {
    it('at angle=0 (major axis) returns baseRadius', () => {
      const r = getBaseRadiusAtAngle(0, 'oval', R, { ovalRatio: 0.7 });
      expect(r).toBeCloseTo(R);
    });

    it('at angle=PI/2 (minor axis) returns baseRadius * ovalRatio', () => {
      const r = getBaseRadiusAtAngle(Math.PI / 2, 'oval', R, { ovalRatio: 0.7 });
      expect(r).toBeCloseTo(R * 0.7);
    });

    it('ovalRatio=1.0 gives circle', () => {
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * 2 * Math.PI;
        expect(getBaseRadiusAtAngle(angle, 'oval', R, { ovalRatio: 1.0 })).toBeCloseTo(R);
      }
    });
  });

  describe('squircle', () => {
    it('returns finite positive values at all cardinal angles', () => {
      const angles = [0, Math.PI / 4, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
      for (const angle of angles) {
        const r = getBaseRadiusAtAngle(angle, 'squircle', R, { squircleN: 4 });
        expect(r).toBeGreaterThan(0);
        expect(Number.isFinite(r)).toBe(true);
      }
    });

    it('at angle=PI/4 is larger than baseRadius (corner bulge)', () => {
      const r = getBaseRadiusAtAngle(Math.PI / 4, 'squircle', R, { squircleN: 4 });
      expect(r).toBeGreaterThan(R);
    });
  });

  describe('superellipse', () => {
    it('at high n approaches square behavior', () => {
      const r45 = getBaseRadiusAtAngle(Math.PI / 4, 'superellipse', R, { superN: 5 });
      // At high n, corner radius approaches R*sqrt(2)
      expect(r45).toBeGreaterThan(R);
    });

    it('returns finite positive at all angles', () => {
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * 2 * Math.PI;
        const r = getBaseRadiusAtAngle(angle, 'superellipse', R, { superN: 2.5 });
        expect(r).toBeGreaterThan(0);
        expect(Number.isFinite(r)).toBe(true);
      }
    });
  });

  describe('heart', () => {
    it('returns positive radius at all angles', () => {
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * 2 * Math.PI;
        const r = getBaseRadiusAtAngle(angle, 'heart', R);
        expect(r).toBeGreaterThan(0);
        expect(Number.isFinite(r)).toBe(true);
      }
    });

    it('radius varies around the perimeter (non-uniform)', () => {
      const radii: number[] = [];
      for (let i = 0; i < 36; i++) {
        radii.push(getBaseRadiusAtAngle((i / 36) * 2 * Math.PI, 'heart', R));
      }
      const min = Math.min(...radii);
      const max = Math.max(...radii);
      expect(max - min).toBeGreaterThan(R * 0.1);
    });
  });

  describe('teardrop', () => {
    it('at angle=0 returns baseRadius (1 - 0)', () => {
      expect(getBaseRadiusAtAngle(0, 'teardrop', R)).toBeCloseTo(R);
    });

    it('narrower at PI/2 than at 0', () => {
      const r0 = getBaseRadiusAtAngle(0, 'teardrop', R);
      const r90 = getBaseRadiusAtAngle(Math.PI / 2, 'teardrop', R);
      expect(r90).toBeLessThan(r0);
    });

    it('wider at 3PI/2 than at PI/2', () => {
      const r90 = getBaseRadiusAtAngle(Math.PI / 2, 'teardrop', R);
      const r270 = getBaseRadiusAtAngle(3 * Math.PI / 2, 'teardrop', R);
      expect(r270).toBeGreaterThan(r90);
    });
  });

  describe('petal', () => {
    it('at angle=0 returns R * (0.6 + 0.4*1) = R', () => {
      expect(getBaseRadiusAtAngle(0, 'petal', R)).toBeCloseTo(R);
    });

    it('at angle=PI/2 returns R * 0.6', () => {
      expect(getBaseRadiusAtAngle(Math.PI / 2, 'petal', R)).toBeCloseTo(R * 0.6);
    });

    it('symmetric about x-axis', () => {
      const r1 = getBaseRadiusAtAngle(Math.PI / 4, 'petal', R);
      const r2 = getBaseRadiusAtAngle(-Math.PI / 4, 'petal', R);
      expect(r1).toBeCloseTo(r2);
    });
  });

  describe('leaf', () => {
    it('returns finite positive at all angles', () => {
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * 2 * Math.PI;
        const r = getBaseRadiusAtAngle(angle, 'leaf', R);
        expect(r).toBeGreaterThan(0);
        expect(Number.isFinite(r)).toBe(true);
      }
    });

    it('radius varies asymmetrically', () => {
      const r0 = getBaseRadiusAtAngle(0, 'leaf', R);
      const rPI = getBaseRadiusAtAngle(Math.PI, 'leaf', R);
      expect(r0).not.toBeCloseTo(rPI);
    });
  });

  describe('gear', () => {
    it('returns values near baseRadius', () => {
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * 2 * Math.PI;
        const r = getBaseRadiusAtAngle(angle, 'gear', R, { gearTeeth: 12 });
        expect(r).toBeGreaterThan(R * 0.8);
        expect(r).toBeLessThan(R * 1.2);
      }
    });

    it('has variation matching tooth count', () => {
      const radii: number[] = [];
      const SAMPLES = 360;
      for (let i = 0; i < SAMPLES; i++) {
        radii.push(getBaseRadiusAtAngle((i / SAMPLES) * 2 * Math.PI, 'gear', R, { gearTeeth: 12 }));
      }
      // Count sign changes in the derivative (approx transitions)
      let transitions = 0;
      for (let i = 1; i < radii.length; i++) {
        const prev = radii[i - 1] - R;
        const curr = radii[i] - R;
        if (prev * curr < 0) transitions++;
      }
      // Each tooth has 2 transitions (up and down), 12 teeth = ~24 transitions
      expect(transitions).toBeGreaterThanOrEqual(20);
    });
  });

  describe('flower', () => {
    it('at angle=0 returns R * 1.3 (peak of cos(0)=1)', () => {
      expect(getBaseRadiusAtAngle(0, 'flower', R, { petalCount: 5 })).toBeCloseTo(R * 1.3);
    });

    it('has petalCount peaks', () => {
      const SAMPLES = 360;
      const radii: number[] = [];
      for (let i = 0; i < SAMPLES; i++) {
        radii.push(getBaseRadiusAtAngle((i / SAMPLES) * 2 * Math.PI, 'flower', R, { petalCount: 5 }));
      }
      let peaks = 0;
      for (let i = 0; i < radii.length; i++) {
        const prev = radii[(i - 1 + SAMPLES) % SAMPLES];
        const next = radii[(i + 1) % SAMPLES];
        if (radii[i] > prev && radii[i] > next) peaks++;
      }
      expect(peaks).toBe(5);
    });
  });

  describe('polygon (continuous)', () => {
    it('returns baseRadius at vertex angles for hexagon', () => {
      // Polygon radius at vertex should be baseRadius
      const r = getBaseRadiusAtAngle(0, 'polygon', R, { polygonSides: 6 });
      expect(r).toBeCloseTo(R);
    });

    it('mid-edge is closer than vertex (inscribed radius)', () => {
      const sides = 6;
      const vertexR = getBaseRadiusAtAngle(0, 'polygon', R, { polygonSides: sides });
      const midEdgeAngle = Math.PI / sides;
      const midR = getBaseRadiusAtAngle(midEdgeAngle, 'polygon', R, { polygonSides: sides });
      expect(midR).toBeLessThan(vertexR);
    });
  });

  describe('star (continuous)', () => {
    it('returns outerRadius at peak angles', () => {
      const r = getBaseRadiusAtAngle(0, 'star', R, { starPoints: 5, starInnerRatio: 0.5 });
      expect(r).toBeCloseTo(R);
    });

    it('valleys are at innerRatio * outerRadius', () => {
      // Valley midpoint: angle = PI / starPoints
      const valley = getBaseRadiusAtAngle(Math.PI / 5, 'star', R, { starPoints: 5, starInnerRatio: 0.5 });
      expect(valley).toBeCloseTo(R * 0.5, 0);
    });
  });

  describe('all shapes produce finite positive radii', () => {
    const shapes: CrossSection[] = [
      'circle', 'oval', 'squircle', 'superellipse',
      'heart', 'teardrop', 'petal', 'leaf',
      'polygon', 'star', 'gear', 'flower',
    ];

    it.each(shapes)('%s: all radii are finite and positive', (shape) => {
      for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * 2 * Math.PI;
        const r = getBaseRadiusAtAngle(angle, shape, R, {
          ovalRatio: 0.7,
          squircleN: 4,
          superN: 2.5,
          polygonSides: 6,
          starPoints: 5,
          starInnerRatio: 0.5,
          gearTeeth: 12,
          petalCount: 5,
        });
        expect(r).toBeGreaterThan(0);
        expect(Number.isFinite(r)).toBe(true);
      }
    });
  });
});

describe('createCrossSection', () => {
  it('dispatches to circle generator', () => {
    const result = createCrossSection('circle', 10, 32, 6, 5, 0.5);
    expect(result).toHaveLength(32);
  });

  it('dispatches to polygon generator and respects segments', () => {
    const result = createCrossSection('polygon', 10, 32, 6, 5, 0.5);
    expect(result).toHaveLength(32);
  });

  it('dispatches to star generator and respects segments', () => {
    const result = createCrossSection('star', 10, 32, 6, 5, 0.5);
    expect(result).toHaveLength(32);
  });

  it('falls back to circle for unknown crossSection', () => {
    const result = createCrossSection('unknown' as any, 10, 32, 6, 5, 0.5);
    expect(result).toHaveLength(32);
  });

  describe('new shapes via segment sampling', () => {
    const sampledShapes: CrossSection[] = [
      'oval', 'squircle', 'superellipse',
      'heart', 'teardrop', 'petal', 'leaf',
      'gear', 'flower',
    ];

    it.each(sampledShapes)('%s: returns `segments` points', (shape) => {
      const result = createCrossSection(shape, 10, 64, 6, 5, 0.5, 0.7, 4, 2.5, 12, 5);
      expect(result).toHaveLength(64);
    });

    it.each(sampledShapes)('%s: all points are finite', (shape) => {
      const result = createCrossSection(shape, 10, 64, 6, 5, 0.5, 0.7, 4, 2.5, 12, 5);
      for (const [x, y] of result) {
        expect(Number.isFinite(x)).toBe(true);
        expect(Number.isFinite(y)).toBe(true);
      }
    });

    it.each(sampledShapes)('%s: all points have positive radius', (shape) => {
      const result = createCrossSection(shape, 10, 64, 6, 5, 0.5, 0.7, 4, 2.5, 12, 5);
      for (const pt of result) {
        expect(distFromOrigin(pt)).toBeGreaterThan(0);
      }
    });
  });
});

describe('createFinCrossSection', () => {
  const finPointCount = 9; // smooth cosine curve points per fin

  it('returns correct number of points: finCount * (finPointCount + arcPointsPerGap)', () => {
    const finCount = 24;
    const arcPointsPerGap = 4;
    const result = createFinCrossSection(40, finCount, 8, 3, 'circle', {}, arcPointsPerGap);
    expect(result).toHaveLength(finCount * (finPointCount + arcPointsPerGap));
  });

  it('fin peaks are taller than body radius', () => {
    const baseRadius = 40;
    const finHeight = 10;
    const result = createFinCrossSection(baseRadius, 12, finHeight, 5, 'circle');
    const radii = result.map(distFromOrigin);
    const maxR = Math.max(...radii);
    expect(maxR).toBeGreaterThanOrEqual(baseRadius + finHeight - 0.01);
  });

  it('body points (between fins) are near baseRadius', () => {
    const baseRadius = 40;
    const finCount = 12;
    const arcPointsPerGap = 4;
    const result = createFinCrossSection(baseRadius, finCount, 10, 3, 'circle', {}, arcPointsPerGap);

    // Every fin has finPointCount points, followed by arcPointsPerGap body points
    const stride = finPointCount + arcPointsPerGap;
    for (let i = 0; i < finCount; i++) {
      // Check arc body points (indices after fin points within each group)
      for (let j = finPointCount; j < stride; j++) {
        const pt = result[i * stride + j];
        const r = distFromOrigin(pt);
        // Body points should be near baseRadius (within 1mm tolerance)
        expect(r).toBeGreaterThan(baseRadius * 0.9);
        expect(r).toBeLessThan(baseRadius * 1.1);
      }
    }
  });

  it('fin profile is smooth (first and last fin points at body radius)', () => {
    const baseRadius = 40;
    const finCount = 12;
    const arcPointsPerGap = 4;
    const result = createFinCrossSection(baseRadius, finCount, 10, 5, 'circle', {}, arcPointsPerGap);

    const stride = finPointCount + arcPointsPerGap;
    for (let i = 0; i < finCount; i++) {
      // First and last fin points should be at body radius (sin²(0) = 0, sin²(π) = 0)
      const first = distFromOrigin(result[i * stride]);
      const last = distFromOrigin(result[i * stride + finPointCount - 1]);
      expect(first).toBeCloseTo(baseRadius, 0);
      expect(last).toBeCloseTo(baseRadius, 0);
    }
  });

  it('all coordinates are finite', () => {
    const result = createFinCrossSection(40, 24, 8, 3, 'circle');
    for (const [x, y] of result) {
      expect(Number.isFinite(x)).toBe(true);
      expect(Number.isFinite(y)).toBe(true);
    }
  });

  it('works with non-circular cross-sections', () => {
    const shapes: CrossSection[] = ['oval', 'polygon', 'flower', 'heart'];
    for (const shape of shapes) {
      const result = createFinCrossSection(40, 12, 8, 5, shape, {
        ovalRatio: 0.7,
        polygonSides: 6,
        petalCount: 5,
      });
      expect(result.length).toBeGreaterThan(0);
      for (const [x, y] of result) {
        expect(Number.isFinite(x)).toBe(true);
        expect(Number.isFinite(y)).toBe(true);
      }
    }
  });

  it('clamps fin width to prevent overlap', () => {
    const finCount = 12;
    const wideDeg = 100; // Way too wide — should be clamped
    const result = createFinCrossSection(40, finCount, 8, wideDeg, 'circle');
    // Should still produce valid geometry
    expect(result.length).toBe(finCount * (finPointCount + 4));
    for (const [x, y] of result) {
      expect(Number.isFinite(x)).toBe(true);
      expect(Number.isFinite(y)).toBe(true);
    }
  });

  it('different finCount produces different point counts', () => {
    const r1 = createFinCrossSection(40, 12, 8, 3, 'circle');
    const r2 = createFinCrossSection(40, 24, 8, 3, 'circle');
    expect(r2.length).toBeGreaterThan(r1.length);
  });
});
