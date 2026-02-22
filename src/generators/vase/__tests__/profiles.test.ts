import { describe, it, expect } from 'vitest';
import { getProfileScale, getTwistProgress } from '../profiles';
import type { TwistEasing } from '@/types/design';

describe('getProfileScale', () => {
  describe('curve=0 (cylinder) at taper=1.0', () => {
    const taper = 1.0;

    it('returns 1.0 for all t values', () => {
      expect(getProfileScale(0, 0, taper)).toBe(1);
      expect(getProfileScale(0, 0.5, taper)).toBe(1);
      expect(getProfileScale(0, 1, taper)).toBe(1);
    });
  });

  describe('curve=+1 (max bulbous) at taper=1.0', () => {
    const taper = 1.0;

    it('at t=0 returns 1.0 (sin(0)=0)', () => {
      expect(getProfileScale(1, 0, taper)).toBeCloseTo(1.0);
    });

    it('at t=0.5 returns 1.4 (maximum belly: 1 + 0.4*sin(PI/2))', () => {
      // 1 * (1 + 1 * sin(PI*0.5) * 0.4) = 1 * 1.4 = 1.4
      expect(getProfileScale(1, 0.5, taper)).toBeCloseTo(1.4);
    });

    it('at t=1 returns ~1.0 (sin(PI)≈0)', () => {
      expect(getProfileScale(1, 1, taper)).toBeCloseTo(1.0, 5);
    });
  });

  describe('curve=-1 (max hourglass) at taper=1.0', () => {
    const taper = 1.0;

    it('at t=0 returns 1.0', () => {
      expect(getProfileScale(-1, 0, taper)).toBeCloseTo(1.0);
    });

    it('at t=0.5 returns 0.6 (maximum pinch: 1 - 0.4*sin(PI/2))', () => {
      // 1 * (1 + (-1) * sin(PI*0.5) * 0.4) = 1 * 0.6 = 0.6
      expect(getProfileScale(-1, 0.5, taper)).toBeCloseTo(0.6);
    });

    it('at t=1 returns ~1.0 (sin(PI)≈0)', () => {
      expect(getProfileScale(-1, 1, taper)).toBeCloseTo(1.0, 5);
    });
  });

  describe('intermediate curve values', () => {
    const taper = 1.0;

    it('curve=+0.5 at t=0.5 returns 1.2 (half belly)', () => {
      // 1 * (1 + 0.5 * sin(PI*0.5) * 0.4) = 1 * 1.2 = 1.2
      expect(getProfileScale(0.5, 0.5, taper)).toBeCloseTo(1.2);
    });

    it('curve=-0.5 at t=0.5 returns 0.8 (half pinch)', () => {
      // 1 * (1 + (-0.5) * sin(PI*0.5) * 0.4) = 1 * 0.8 = 0.8
      expect(getProfileScale(-0.5, 0.5, taper)).toBeCloseTo(0.8);
    });
  });

  describe('taper multiplication', () => {
    it('taper=1.5 at t=1, curve=0: pure taper = 1.5', () => {
      // linearTaper = 1 + (1.5-1)*1 = 1.5
      // curveFactor = 0 * sin(PI) * 0.4 ≈ 0
      // result ≈ 1.5
      expect(getProfileScale(0, 1, 1.5)).toBeCloseTo(1.5);
    });

    it('taper=0.5 at t=1, curve=0: pure taper = 0.5', () => {
      expect(getProfileScale(0, 1, 0.5)).toBeCloseTo(0.5);
    });

    it('taper=1.0 at any t: no taper effect on curve=+1', () => {
      const base = getProfileScale(1, 0.5, 1.0);
      expect(base).toBeCloseTo(1.4);
    });

    it('taper at t=0 always equals 1.0 (no taper applied yet)', () => {
      // At t=0: linearTaper=1, curveFactor=0 (sin(0)=0) → result=1
      expect(getProfileScale(0, 0, 2.0)).toBeCloseTo(1.0);
      expect(getProfileScale(1, 0, 0.3)).toBeCloseTo(1.0);
    });

    it('taper compounds with curve at t=0.5', () => {
      // curve=+1 at t=0.5: curveFactor = 1 * sin(PI/2) * 0.4 = 0.4
      // linearTaper = 1 + (1.5-1)*0.5 = 1.25
      // result = 1.25 * (1 + 0.4) = 1.25 * 1.4 = 1.75
      expect(getProfileScale(1, 0.5, 1.5)).toBeCloseTo(1.75);
    });
  });

  describe('boundary values', () => {
    const curves = [-1.0, -0.5, 0.0, 0.5, 1.0];

    it.each(curves)('curve=%f returns positive value at t=0, taper=1.0', (curve) => {
      expect(getProfileScale(curve, 0, 1.0)).toBeGreaterThan(0);
    });

    it.each(curves)('curve=%f returns positive value at t=1, taper=1.0', (curve) => {
      expect(getProfileScale(curve, 1, 1.0)).toBeGreaterThan(0);
    });

    it.each(curves)('curve=%f returns positive value at t=0.5, taper=0.5', (curve) => {
      expect(getProfileScale(curve, 0.5, 0.5)).toBeGreaterThan(0);
    });
  });

  describe('symmetry', () => {
    it('curve=+1 and curve=-1 are symmetric around 1.0 at t=0.5', () => {
      const bulbous = getProfileScale(1, 0.5, 1.0);
      const hourglass = getProfileScale(-1, 0.5, 1.0);
      // bulbous - 1 should equal 1 - hourglass
      expect(bulbous - 1).toBeCloseTo(1 - hourglass);
    });

    it('bottom and top are equal at curve=+1, taper=1.0', () => {
      expect(getProfileScale(1, 0, 1.0)).toBeCloseTo(getProfileScale(1, 1, 1.0), 5);
    });
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
