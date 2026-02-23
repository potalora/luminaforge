/**
 * Main vase geometry generator.
 * Pure function: (VaseParams) => Geom3
 *
 * Algorithm:
 * 1. Build outer shell using shared buildDecorativeShell
 * 2. Build inner shell (wallThickness inward, optionally smooth)
 * 3. Subtract inner from outer to create hollow vase
 */

import { booleans, transforms } from '@jscad/modeling';
import type { Geom3 } from '@jscad/modeling';
import type { VaseParams } from '@/types/design';
import { buildDecorativeShell } from '../shared/shellBuilder';

// Re-export for backward compatibility (used by existing tests)
export { offsetPolygonInward } from '../shared/offsetPolygon';

/**
 * Generate a complete vase from parameters.
 * Pure function — no side effects.
 */
export function generateVase(params: VaseParams): Geom3 {
  // Build outer shell (solid)
  const outerShell = buildDecorativeShell(params, {
    resolution: params.resolution,
    wallInset: 0,
  });

  // Build inner shell (per-point inward offset by wallThickness)
  const forceSmooth = params.smoothInnerWall;
  const innerShell = buildDecorativeShell(params, {
    resolution: params.resolution,
    wallInset: params.wallThickness,
    skipModulation: forceSmooth,
  });

  // Move inner shell up by baseThickness so the bottom is solid
  const innerShellRaised = transforms.translate(
    [0, 0, params.baseThickness],
    innerShell
  );

  // Subtract inner from outer to create hollow shell
  const hollowShell = booleans.subtract(outerShell, innerShellRaised);

  return hollowShell;
}
