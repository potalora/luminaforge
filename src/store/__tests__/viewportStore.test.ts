import { describe, it, expect, beforeEach } from 'vitest';
import { createViewportStore } from '../viewportStore';

describe('viewportStore', () => {
  let store: ReturnType<typeof createViewportStore>;

  beforeEach(() => {
    store = createViewportStore();
  });

  it('initializes with correct defaults', () => {
    const state = store.getState();
    expect(state.autoRotate).toBe(false);
    expect(state.showGrid).toBe(true);
    expect(state.isSidebarOpen).toBe(true);
  });

  it('toggleAutoRotate flips autoRotate', () => {
    store.getState().toggleAutoRotate();
    expect(store.getState().autoRotate).toBe(true);

    store.getState().toggleAutoRotate();
    expect(store.getState().autoRotate).toBe(false);
  });

  it('toggleGrid flips showGrid', () => {
    store.getState().toggleGrid();
    expect(store.getState().showGrid).toBe(false);

    store.getState().toggleGrid();
    expect(store.getState().showGrid).toBe(true);
  });

  it('toggleSidebar flips isSidebarOpen', () => {
    store.getState().toggleSidebar();
    expect(store.getState().isSidebarOpen).toBe(false);

    store.getState().toggleSidebar();
    expect(store.getState().isSidebarOpen).toBe(true);
  });

  it('setSidebarOpen sets isSidebarOpen directly', () => {
    store.getState().setSidebarOpen(false);
    expect(store.getState().isSidebarOpen).toBe(false);

    store.getState().setSidebarOpen(true);
    expect(store.getState().isSidebarOpen).toBe(true);
  });

  it('toggling one value does not affect others', () => {
    store.getState().toggleAutoRotate();
    expect(store.getState().showGrid).toBe(true);
    expect(store.getState().isSidebarOpen).toBe(true);
  });
});
