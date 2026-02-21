import { describe, it, expect } from 'vitest';
import { getProfileScale, getTwistProgress } from '../profiles';
import type { ProfileShape, TwistEasing } from '@/types/design';

describe('getProfileScale', () => {
  const base = 80;
  const top = 100;
  const topRatio = top / base; // 1.25

  describe('cylinder', () => {
    it('returns 1.0 for all t values', () => {
      expect(getProfileScale('cylinder', 0, base, top)).toBe(1);
      expect(getProfileScale('cylinder', 0.5, base, top)).toBe(1);
      expect(getProfileScale('cylinder', 1, base, top)).toBe(1);
    });

    it('ignores top/base diameter', () => {
      expect(getProfileScale('cylinder', 0.5, 50, 200)).toBe(1);
    });
  });

  describe('tapered', () => {
    it('at t=0 returns 1.0', () => {
      expect(getProfileScale('tapered', 0, base, top)).toBeCloseTo(1.0);
    });

    it('at t=1 returns topRatio', () => {
      expect(getProfileScale('tapered', 1, base, top)).toBeCloseTo(topRatio);
    });

    it('at t=0.5 returns midpoint (linear)', () => {
      const expected = 1 + (topRatio - 1) * 0.5;
      expect(getProfileScale('tapered', 0.5, base, top)).toBeCloseTo(expected);
    });

    it('linear between 0 and 1', () => {
      const s1 = getProfileScale('tapered', 0.25, base, top);
      const s2 = getProfileScale('tapered', 0.5, base, top);
      const s3 = getProfileScale('tapered', 0.75, base, top);
      // Equal spacing
      expect(s2 - s1).toBeCloseTo(s3 - s2, 10);
    });
  });

  describe('bulbous', () => {
    it('at t=0 returns ~1.0 (sin(0)=0, no bulge)', () => {
      expect(getProfileScale('bulbous', 0, base, top)).toBeCloseTo(1.0);
    });

    it('at t=0.5 has maximum bulge', () => {
      const atMid = getProfileScale('bulbous', 0.5, base, top);
      const taperedMid = 1 + (topRatio - 1) * 0.5;
      // bulge = sin(0.5*PI)*0.3 = 0.3
      expect(atMid).toBeCloseTo(taperedMid + 0.3);
    });

    it('at t=1 returns ~topRatio (sin(PI)≈0)', () => {
      expect(getProfileScale('bulbous', 1, base, top)).toBeCloseTo(topRatio, 5);
    });
  });

  describe('flared', () => {
    it('at t=0 returns 1.0', () => {
      expect(getProfileScale('flared', 0, base, top)).toBeCloseTo(1.0);
    });

    it('at t=1 returns topRatio', () => {
      expect(getProfileScale('flared', 1, base, top)).toBeCloseTo(topRatio);
    });

    it('grows faster at top (sqrt curve): t=0.25 > linear equivalent', () => {
      const flaredVal = getProfileScale('flared', 0.25, base, top);
      const taperedVal = getProfileScale('tapered', 0.25, base, top);
      // sqrt(0.25) = 0.5, so flared at 0.25 ≈ tapered at 0.5 — bigger
      expect(flaredVal).toBeGreaterThan(taperedVal);
    });
  });

  describe('hourglass', () => {
    it('at t=0 returns ~1.0', () => {
      // base = 1 + 0 = 1, pinch = cos(0)*0.25 = 0.25, result = 1 - 0.25 + 0.25 = 1
      expect(getProfileScale('hourglass', 0, base, top)).toBeCloseTo(1.0);
    });

    it('at t=1 includes the +0.25 offset and cos contribution', () => {
      // formula: base - cos(PI)*0.25 + 0.25 = topRatio + 0.25 + 0.25 = topRatio + 0.5
      expect(getProfileScale('hourglass', 1, base, top)).toBeCloseTo(topRatio + 0.5);
    });

    it('midpoint is wider than tapered profile (cos contribution adds material)', () => {
      const taperedMid = getProfileScale('tapered', 0.5, base, top);
      const hourglassMid = getProfileScale('hourglass', 0.5, base, top);
      // At t=0.5: cos(PI/2)≈0, so result = tapered + 0.25
      expect(hourglassMid).toBeCloseTo(taperedMid + 0.25);
      expect(hourglassMid).toBeGreaterThan(taperedMid);
    });
  });

  describe('scurve', () => {
    it('at t=0 returns ~1.0 (sigmoid ≈ 0)', () => {
      expect(getProfileScale('scurve', 0, base, top)).toBeCloseTo(1.0, 1);
    });

    it('at t=1 returns ~topRatio (sigmoid ≈ 1)', () => {
      expect(getProfileScale('scurve', 1, base, top)).toBeCloseTo(topRatio, 1);
    });

    it('at t=0.5 returns midpoint (sigmoid = 0.5)', () => {
      const expected = 1 + (topRatio - 1) * 0.5;
      expect(getProfileScale('scurve', 0.5, base, top)).toBeCloseTo(expected);
    });
  });

  describe('same base and top diameter', () => {
    it.each([
      'cylinder', 'tapered', 'bulbous', 'flared', 'hourglass', 'scurve',
    ] as ProfileShape[])('%s returns ~1.0 at t=0', (shape) => {
      const scale = getProfileScale(shape, 0, 80, 80);
      expect(scale).toBeCloseTo(1.0, 1);
    });
  });

  describe('larger topDiameter', () => {
    it('tapered increases with t', () => {
      const s1 = getProfileScale('tapered', 0.25, 80, 120);
      const s2 = getProfileScale('tapered', 0.75, 80, 120);
      expect(s2).toBeGreaterThan(s1);
    });

    it('flared increases with t', () => {
      const s1 = getProfileScale('flared', 0.25, 80, 120);
      const s2 = getProfileScale('flared', 0.75, 80, 120);
      expect(s2).toBeGreaterThan(s1);
    });
  });

  it('falls back to tapered for unknown shape', () => {
    const result = getProfileScale('unknown' as any, 0.5, 80, 100);
    const tapered = getProfileScale('tapered', 0.5, 80, 100);
    expect(result).toBe(tapered);
  });
});

describe('getTwistProgress', () => {
  describe('boundary values: all easings', () => {
    const easings: TwistEasing[] = ['linear', 'easeIn', 'easeOut', 'easeInOut'];

    it.each(easings)('%s: t=0 returns 0', (easing) => {
      expect(getTwistProgress(easing, 0)).toBe(0);
    });

    it.each(easings)('%s: t=1 returns 1', (easing) => {
      expect(getTwistProgress(easing, 1)).toBeCloseTo(1);
    });
  });

  describe('linear', () => {
    it('t=0.5 returns 0.5', () => {
      expect(getTwistProgress('linear', 0.5)).toBe(0.5);
    });

    it('output equals input for any t', () => {
      for (const t of [0.1, 0.25, 0.33, 0.5, 0.75, 0.9]) {
        expect(getTwistProgress('linear', t)).toBeCloseTo(t);
      }
    });
  });

  describe('easeIn', () => {
    it('t=0.5 < 0.5 (starts slow)', () => {
      expect(getTwistProgress('easeIn', 0.5)).toBeLessThan(0.5);
    });

    it('t=0.5 = 0.25 (t*t)', () => {
      expect(getTwistProgress('easeIn', 0.5)).toBeCloseTo(0.25);
    });
  });

  describe('easeOut', () => {
    it('t=0.5 > 0.5 (starts fast)', () => {
      expect(getTwistProgress('easeOut', 0.5)).toBeGreaterThan(0.5);
    });

    it('t=0.5 = 0.75 (1 - (1-t)^2)', () => {
      expect(getTwistProgress('easeOut', 0.5)).toBeCloseTo(0.75);
    });
  });

  describe('easeInOut', () => {
    it('t=0.5 = 0.5 (midpoint)', () => {
      expect(getTwistProgress('easeInOut', 0.5)).toBeCloseTo(0.5);
    });

    it('t=0.25 < 0.25 (slow start)', () => {
      expect(getTwistProgress('easeInOut', 0.25)).toBeLessThan(0.25);
    });

    it('t=0.75 > 0.75 (fast middle)', () => {
      expect(getTwistProgress('easeInOut', 0.75)).toBeGreaterThan(0.75);
    });
  });

  describe('monotonicity: all easings', () => {
    const easings: TwistEasing[] = ['linear', 'easeIn', 'easeOut', 'easeInOut'];

    it.each(easings)('%s: output is monotonically non-decreasing', (easing) => {
      const steps = 100;
      let prev = getTwistProgress(easing, 0);
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const curr = getTwistProgress(easing, t);
        expect(curr).toBeGreaterThanOrEqual(prev - 1e-10);
        prev = curr;
      }
    });
  });

  describe('range: all easings', () => {
    const easings: TwistEasing[] = ['linear', 'easeIn', 'easeOut', 'easeInOut'];

    it.each(easings)('%s: output stays in [0, 1] for input in [0, 1]', (easing) => {
      for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        const val = getTwistProgress(easing, t);
        expect(val).toBeGreaterThanOrEqual(-1e-10);
        expect(val).toBeLessThanOrEqual(1 + 1e-10);
      }
    });
  });

  it('falls back to linear for unknown easing', () => {
    const result = getTwistProgress('unknown' as any, 0.5);
    expect(result).toBe(0.5);
  });
});
