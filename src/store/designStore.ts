import { create } from 'zustand';
import { createStore } from 'zustand/vanilla';
import type { VaseParams } from '@/types/design';
import { DEFAULT_VASE_PARAMS } from '@/types/design';

export interface DesignState {
  /** Backward-compatible alias for vaseParams — existing code reads s.params */
  params: VaseParams;
  vaseParams: VaseParams;

  // Vase setters
  setParam: <K extends keyof VaseParams>(key: K, value: VaseParams[K]) => void;
  setParams: (partial: Partial<VaseParams>) => void;
  resetParams: () => void;
}

const stateCreator = (set: (fn: (state: DesignState) => Partial<DesignState>) => void): DesignState => ({
  params: { ...DEFAULT_VASE_PARAMS },
  vaseParams: { ...DEFAULT_VASE_PARAMS },

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
});

/** React hook for accessing the design store */
export const useDesignStore = create<DesignState>()(stateCreator);

/** Vanilla store factory for testing (creates a new isolated store each time) */
export const createDesignStore = () => createStore<DesignState>()(stateCreator);
