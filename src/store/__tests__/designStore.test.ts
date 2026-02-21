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
    it('has objectType "vase"', () => {
      expect(store.getState().objectType).toBe('vase');
    });

    it('params match DEFAULT_VASE_PARAMS values', () => {
      const { params } = store.getState();
      expect(params.height).toBe(DEFAULT_VASE_PARAMS.height);
      expect(params.baseDiameter).toBe(DEFAULT_VASE_PARAMS.baseDiameter);
      expect(params.topDiameter).toBe(DEFAULT_VASE_PARAMS.topDiameter);
      expect(params.wallThickness).toBe(DEFAULT_VASE_PARAMS.wallThickness);
      expect(params.resolution).toBe(DEFAULT_VASE_PARAMS.resolution);
      expect(params.profileShape).toBe(DEFAULT_VASE_PARAMS.profileShape);
      expect(params.twistAngle).toBe(DEFAULT_VASE_PARAMS.twistAngle);
      expect(params.crossSection).toBe(DEFAULT_VASE_PARAMS.crossSection);
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
      const originalBaseDiameter = store.getState().params.baseDiameter;
      store.getState().setParam('height', 200);
      expect(store.getState().params.baseDiameter).toBe(originalBaseDiameter);
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
      store.getState().setParams({ height: 999, twistAngle: 720, ribCount: 24 });
      store.getState().resetParams();
      const { params } = store.getState();
      expect(params.height).toBe(DEFAULT_VASE_PARAMS.height);
      expect(params.twistAngle).toBe(DEFAULT_VASE_PARAMS.twistAngle);
      expect(params.ribCount).toBe(DEFAULT_VASE_PARAMS.ribCount);
    });
  });

  describe('setObjectType', () => {
    it('changes the object type', () => {
      store.getState().setObjectType('lamp');
      expect(store.getState().objectType).toBe('lamp');
    });

    it('preserves params when changing type', () => {
      store.getState().setParam('height', 300);
      store.getState().setObjectType('lamp');
      expect(store.getState().params.height).toBe(300);
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
});
