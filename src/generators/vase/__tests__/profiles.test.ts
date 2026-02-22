import { describe, it, expect } from 'vitest';
import { getProfileScale, getTwistProgress } from '../profiles';
import type { ProfileShape, TwistEasing } from '@/types/design';

describe('getProfileScale', () => {
  describe('characteristic curves at taper=1.0 (no taper)', () => {
    const taper = 1.0;

    describe('cylinder', () => {
      it('returns 1.0 for all t values', () => {
        expect(getProfileScale('cylinder', 0, taper)).toBe(1);
        expect(getProfileScale('cylinder', 0.5, taper)).toBe(1);
        expect(getProfileScale('cylinder', 1, taper)).toBe(1);
      });
    });

    describe('tapered', () => {
      it('at t=0 returns 1.0', () => {
        expect(getProfileScale('tapered', 0, taper)).toBeCloseTo(1.0);
      });

      it('at t=1 returns 0.92 (slight natural narrowing)', () => {
        // 1.0 - 0.08*1 = 0.92
        expect(getProfileScale('tapered', 1, taper)).toBeCloseTo(0.92);
      });

      it('at t=0.5 returns 0.96', () => {
        // 1.0 - 0.08*0.5 = 0.96
        expect(getProfileScale('tapered', 0.5, taper)).toBeCloseTo(0.96);
      });
    });

    describe('bulbous', () => {
      it('at t=0 returns 1.0 (sin(0)=0)', () => {
        expect(getProfileScale('bulbous', 0, taper)).toBeCloseTo(1.0);
      });

      it('at t=0.5 returns 1.3 (maximum belly)', () => {
        // 1.0 + 0.3*sin(PI*0.5) = 1.0 + 0.3 = 1.3
        expect(getProfileScale('bulbous', 0.5, taper)).toBeCloseTo(1.3);
      });

      it('at t=1 returns ~1.0 (sin(PI)≈0)', () => {
        expect(getProfileScale('bulbous', 1, taper)).toBeCloseTo(1.0, 5);
      });
    });

    describe('flared', () => {
      it('at t=0 returns 1.0', () => {
        expect(getProfileScale('flared', 0, taper)).toBeCloseTo(1.0);
      });

      it('at t=1 returns 1.0 (sqrt(1)-1 = 0)', () => {
        // 1.0 + 0.25*(1 - 1) = 1.0
        expect(getProfileScale('flared', 1, taper)).toBeCloseTo(1.0);
      });

      it('at t=0.25 has max opening (sqrt(t)-t peaks around t=0.25)', () => {
        // 1.0 + 0.25*(sqrt(0.25) - 0.25) = 1.0 + 0.25*(0.5 - 0.25) = 1.0 + 0.0625 = 1.0625
        expect(getProfileScale('flared', 0.25, taper)).toBeCloseTo(1.0625);
      });
    });

    describe('hourglass', () => {
      it('at t=0 returns 1.0 (sin(0)=0)', () => {
        expect(getProfileScale('hourglass', 0, taper)).toBeCloseTo(1.0);
      });

      it('at t=0.5 returns 0.75 (pinches at middle)', () => {
        // 1.0 - 0.25*sin(PI*0.5) = 1.0 - 0.25 = 0.75
        expect(getProfileScale('hourglass', 0.5, taper)).toBeCloseTo(0.75);
      });

      it('at t=1 returns ~1.0 (sin(PI)≈0)', () => {
        expect(getProfileScale('hourglass', 1, taper)).toBeCloseTo(1.0, 5);
      });
    });

    describe('scurve', () => {
      it('at t=0 returns 1.0 (sin(0)=0)', () => {
        expect(getProfileScale('scurve', 0, taper)).toBeCloseTo(1.0);
      });

      it('at t=0.25 has positive wave (~1.15)', () => {
        // 1.0 + 0.15*sin(2*PI*0.25) = 1.0 + 0.15*sin(PI/2) = 1.0 + 0.15 = 1.15
        expect(getProfileScale('scurve', 0.25, taper)).toBeCloseTo(1.15);
      });

      it('at t=0.75 has negative wave (~0.85)', () => {
        // 1.0 + 0.15*sin(2*PI*0.75) = 1.0 + 0.15*sin(3PI/2) = 1.0 - 0.15 = 0.85
        expect(getProfileScale('scurve', 0.75, taper)).toBeCloseTo(0.85);
      });

      it('at t=1 returns ~1.0 (sin(2PI)≈0)', () => {
        expect(getProfileScale('scurve', 1, taper)).toBeCloseTo(1.0, 5);
      });
    });
  });

  describe('taper multiplication', () => {
    it('taper=1.5 at t=1: cylinder becomes 1.5', () => {
      // curve=1.0 * (1 + (1.5-1)*1) = 1.0 * 1.5 = 1.5
      expect(getProfileScale('cylinder', 1, 1.5)).toBeCloseTo(1.5);
    });

    it('taper=0.5 at t=1: cylinder becomes 0.5', () => {
      // curve=1.0 * (1 + (0.5-1)*1) = 1.0 * 0.5 = 0.5
      expect(getProfileScale('cylinder', 1, 0.5)).toBeCloseTo(0.5);
    });

    it('taper=1.0 at any t: no taper effect', () => {
      const base = getProfileScale('bulbous', 0.5, 1.0);
      // bulbous curve at t=0.5 is 1.3, taper=1.0 keeps it
      expect(base).toBeCloseTo(1.3);
    });

    it('taper at t=0 always equals the curve value (no taper applied yet)', () => {
      // At t=0: curve * (1 + (taper-1)*0) = curve * 1 = curve
      expect(getProfileScale('cylinder', 0, 2.0)).toBeCloseTo(1.0);
      expect(getProfileScale('bulbous', 0, 0.3)).toBeCloseTo(1.0);
    });

    it('taper compounds with profile for bulbous at t=0.5', () => {
      // bulbous at t=0.5: 1.3
      // taper=1.5 at t=0.5: 1 + (1.5-1)*0.5 = 1.25
      // result: 1.3 * 1.25 = 1.625
      expect(getProfileScale('bulbous', 0.5, 1.5)).toBeCloseTo(1.625);
    });
  });

  describe('boundary values', () => {
    const shapes: ProfileShape[] = [
      'cylinder', 'tapered', 'bulbous', 'flared', 'hourglass', 'scurve',
    ];

    it.each(shapes)('%s returns positive value at t=0, taper=1.0', (shape) => {
      expect(getProfileScale(shape, 0, 1.0)).toBeGreaterThan(0);
    });

    it.each(shapes)('%s returns positive value at t=1, taper=1.0', (shape) => {
      expect(getProfileScale(shape, 1, 1.0)).toBeGreaterThan(0);
    });

    it.each(shapes)('%s returns positive value at t=0.5, taper=0.5', (shape) => {
      expect(getProfileScale(shape, 0.5, 0.5)).toBeGreaterThan(0);
    });
  });

  it('falls back to tapered for unknown shape', () => {
    const result = getProfileScale('unknown' as any, 0.5, 1.0);
    const tapered = getProfileScale('tapered', 0.5, 1.0);
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
