import { create } from 'zustand';
import { createStore } from 'zustand/vanilla';
import type { ObjectType, VaseParams, LampParams, DecorativeShellParams } from '@/types/design';
import { DEFAULT_VASE_PARAMS, DEFAULT_LAMP_PARAMS } from '@/types/design';

export interface DesignState {
  objectType: ObjectType;

  /** Backward-compatible alias for vaseParams — existing code reads s.params */
  params: VaseParams;
  vaseParams: VaseParams;
  lampParams: LampParams;

  // Vase setters (backward-compatible)
  setParam: <K extends keyof VaseParams>(key: K, value: VaseParams[K]) => void;
  setParams: (partial: Partial<VaseParams>) => void;
  resetParams: () => void;

  // Lamp setters
  setLampParam: <K extends keyof LampParams>(key: K, value: LampParams[K]) => void;
  setLampBaseParam: <K extends keyof DecorativeShellParams>(key: K, value: DecorativeShellParams[K]) => void;
  setLampShadeParam: <K extends keyof DecorativeShellParams>(key: K, value: DecorativeShellParams[K]) => void;
  setLampParams: (partial: Partial<LampParams>) => void;
  resetLampParams: () => void;

  setObjectType: (type: ObjectType) => void;
}

const stateCreator = (set: (fn: (state: DesignState) => Partial<DesignState>) => void): DesignState => ({
  objectType: 'vase',
  params: { ...DEFAULT_VASE_PARAMS },
  vaseParams: { ...DEFAULT_VASE_PARAMS },
  lampParams: {
    ...DEFAULT_LAMP_PARAMS,
    base: { ...DEFAULT_LAMP_PARAMS.base },
    shade: { ...DEFAULT_LAMP_PARAMS.shade },
  },

  // Vase setters — update both params and vaseParams for backward compat
  setParam: (key, value) =>
    set((state) => {
      const newVaseParams = { ...state.vaseParams, [key]: value };
      return {
        vaseParams: newVaseParams,
        params: newVaseParams,
      };
    }),

  setParams: (partial) =>
    set((state) => {
      const newVaseParams = { ...state.vaseParams, ...partial };
      return {
        vaseParams: newVaseParams,
        params: newVaseParams,
      };
    }),

  resetParams: () =>
    set(() => {
      const newVaseParams = { ...DEFAULT_VASE_PARAMS };
      return {
        vaseParams: newVaseParams,
        params: newVaseParams,
      };
    }),

  // Lamp setters
  setLampParam: (key, value) =>
    set((state) => ({
      lampParams: { ...state.lampParams, [key]: value },
    })),

  setLampBaseParam: (key, value) =>
    set((state) => ({
      lampParams: {
        ...state.lampParams,
        base: { ...state.lampParams.base, [key]: value },
      },
    })),

  setLampShadeParam: (key, value) =>
    set((state) => ({
      lampParams: {
        ...state.lampParams,
        shade: { ...state.lampParams.shade, [key]: value },
      },
    })),

  setLampParams: (partial) =>
    set((state) => ({
      lampParams: { ...state.lampParams, ...partial },
    })),

  resetLampParams: () =>
    set(() => ({
      lampParams: {
        ...DEFAULT_LAMP_PARAMS,
        base: { ...DEFAULT_LAMP_PARAMS.base },
        shade: { ...DEFAULT_LAMP_PARAMS.shade },
      },
    })),

  setObjectType: (type) =>
    set(() => ({
      objectType: type,
    })),
});

/** React hook for accessing the design store */
export const useDesignStore = create<DesignState>()(stateCreator);

/** Vanilla store factory for testing (creates a new isolated store each time) */
export const createDesignStore = () => createStore<DesignState>()(stateCreator);
