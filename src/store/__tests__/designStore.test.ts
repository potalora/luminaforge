import { describe, it, expect, beforeEach } from 'vitest';
import type { StoreApi } from 'zustand';
import { createDesignStore, type DesignState } from '../designStore';
import { DEFAULT_VASE_PARAMS } from '@/types/design';

describe('designStore', () => {
  let store: StoreApi<DesignState>;

  beforeEach(() => {
    store = createDesignStore();
  });

  describe('initial state', () => {
    it('params match DEFAULT_VASE_PARAMS values', () => {
      const { params } = store.getState();
      expect(params.height).toBe(DEFAULT_VASE_PARAMS.height);
      expect(params.diameter).toBe(DEFAULT_VASE_PARAMS.diameter);
      expect(params.taper).toBe(DEFAULT_VASE_PARAMS.taper);
      expect(params.wallThickness).toBe(DEFAULT_VASE_PARAMS.wallThickness);
      expect(params.resolution).toBe(DEFAULT_VASE_PARAMS.resolution);
      expect(params.profileCurve).toBe(DEFAULT_VASE_PARAMS.profileCurve);
      expect(params.twistAngle).toBe(DEFAULT_VASE_PARAMS.twistAngle);
      expect(params.crossSection).toBe(DEFAULT_VASE_PARAMS.crossSection);
      expect(params.style).toBe(DEFAULT_VASE_PARAMS.style);
    });

    it('new params have correct defaults', () => {
      const { params } = store.getState();
      expect(params.style).toBe('spiral-fin');
      expect(params.profileCurve).toBe(0.0);
      expect(params.finCount).toBe(55);
      expect(params.finHeight).toBe(3.5);
      expect(params.finWidth).toBe(2.2);
      expect(params.ovalRatio).toBe(0.7);
      expect(params.squircleN).toBe(4);
      expect(params.superN).toBe(2.5);
      expect(params.gearTeeth).toBe(12);
      expect(params.petalCount).toBe(5);
    });

    it('params is a new object (not a reference to DEFAULT_VASE_PARAMS)', () => {
      const { params } = store.getState();
      expect(params).not.toBe(DEFAULT_VASE_PARAMS);
    });
  });

  describe('setParam', () => {
    it('updates a single parameter', () => {
      store.getState().setParam('height', 200);
      expect(store.getState().params.height).toBe(200);
    });

    it('leaves other parameters unchanged', () => {
      const originalDiameter = store.getState().params.diameter;
      store.getState().setParam('height', 200);
      expect(store.getState().params.diameter).toBe(originalDiameter);
    });

    it('updates style parameter', () => {
      store.getState().setParam('style', 'spiral-fin');
      expect(store.getState().params.style).toBe('spiral-fin');
    });

    it('updates profileCurve parameter', () => {
      store.getState().setParam('profileCurve', 0.5);
      expect(store.getState().params.profileCurve).toBe(0.5);
    });

    it('updates fin parameters', () => {
      store.getState().setParam('finCount', 32);
      expect(store.getState().params.finCount).toBe(32);
    });

    it('updates cross-section sub-params', () => {
      store.getState().setParam('ovalRatio', 0.5);
      expect(store.getState().params.ovalRatio).toBe(0.5);
      store.getState().setParam('gearTeeth', 18);
      expect(store.getState().params.gearTeeth).toBe(18);
    });
  });

  describe('setParams', () => {
    it('updates multiple parameters at once', () => {
      store.getState().setParams({ height: 200, twistAngle: 360 });
      expect(store.getState().params.height).toBe(200);
      expect(store.getState().params.twistAngle).toBe(360);
    });

    it('leaves non-specified parameters unchanged', () => {
      const originalResolution = store.getState().params.resolution;
      store.getState().setParams({ height: 200 });
      expect(store.getState().params.resolution).toBe(originalResolution);
    });
  });

  describe('resetParams', () => {
    it('restores all params to defaults after modifications', () => {
      store.getState().setParams({
        height: 999,
        twistAngle: 720,
        ridgeCount: 24,
        style: 'spiral-fin',
        profileCurve: 0.8,
        finCount: 40,
      });
      store.getState().resetParams();
      const { params } = store.getState();
      expect(params.height).toBe(DEFAULT_VASE_PARAMS.height);
      expect(params.twistAngle).toBe(DEFAULT_VASE_PARAMS.twistAngle);
      expect(params.ridgeCount).toBe(DEFAULT_VASE_PARAMS.ridgeCount);
      expect(params.style).toBe('spiral-fin');
      expect(params.profileCurve).toBe(0.0);
      expect(params.finCount).toBe(55);
    });
  });

  describe('immutability', () => {
    it('params object is a new reference after setParam', () => {
      const paramsBefore = store.getState().params;
      store.getState().setParam('height', 200);
      const paramsAfter = store.getState().params;
      expect(paramsAfter).not.toBe(paramsBefore);
    });

    it('params object is a new reference after setParams', () => {
      const paramsBefore = store.getState().params;
      store.getState().setParams({ height: 200 });
      const paramsAfter = store.getState().params;
      expect(paramsAfter).not.toBe(paramsBefore);
    });
  });

  describe('vaseParams alias', () => {
    it('vaseParams and params stay in sync', () => {
      store.getState().setParam('height', 250);
      expect(store.getState().vaseParams.height).toBe(250);
      expect(store.getState().params.height).toBe(250);
    });
  });
});
