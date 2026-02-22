import { create } from 'zustand';
import { createStore } from 'zustand/vanilla';

export interface ViewportState {
  autoRotate: boolean;
  showGrid: boolean;
  isSidebarOpen: boolean;
  toggleAutoRotate: () => void;
  toggleGrid: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const stateCreator = (
  set: (fn: (state: ViewportState) => Partial<ViewportState>) => void
): ViewportState => ({
  autoRotate: false,
  showGrid: true,
  isSidebarOpen: true,

  toggleAutoRotate: () =>
    set((state) => ({ autoRotate: !state.autoRotate })),

  toggleGrid: () =>
    set((state) => ({ showGrid: !state.showGrid })),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (open) =>
    set(() => ({ isSidebarOpen: open })),
});

/** React hook for viewport UI state */
export const useViewportStore = create<ViewportState>()(stateCreator);

/** Vanilla store factory for testing */
export const createViewportStore = () => createStore<ViewportState>()(stateCreator);
