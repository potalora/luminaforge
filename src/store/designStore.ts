import { create } from 'zustand';
import { createStore } from 'zustand/vanilla';
import type { ObjectType, VaseParams } from '@/types/design';
import { DEFAULT_VASE_PARAMS } from '@/types/design';

export interface DesignState {
  objectType: ObjectType;
  params: VaseParams;
  setParam: <K extends keyof VaseParams>(key: K, value: VaseParams[K]) => void;
  setParams: (partial: Partial<VaseParams>) => void;
  resetParams: () => void;
  setObjectType: (type: ObjectType) => void;
}

function createDesignSlice(): DesignState {
  return {
    objectType: 'vase',
    params: { ...DEFAULT_VASE_PARAMS },
    setParam: () => {},
    setParams: () => {},
    resetParams: () => {},
    setObjectType: () => {},
  };
}

const stateCreator = (set: (fn: (state: DesignState) => Partial<DesignState>) => void): DesignState => ({
  ...createDesignSlice(),

  setParam: (key, value) =>
    set((state) => ({
      params: { ...state.params, [key]: value },
    })),

  setParams: (partial) =>
    set((state) => ({
      params: { ...state.params, ...partial },
    })),

  resetParams: () =>
    set(() => ({
      params: { ...DEFAULT_VASE_PARAMS },
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
