/**
 * Lamp geometry orchestrator.
 * Combines base + shade for preview, re-exports individual generators
 * for separate STL export.
 */

import { booleans, transforms } from '@jscad/modeling';
import type { Geom3 } from '@jscad/modeling';
import type { LampParams } from '@/types/design';
import { generateLampBase } from './lampBaseGenerator';
import { generateLampShade } from './lampShadeGenerator';
import { CONNECTION_LIP } from './socketConstants';

/**
 * Generate the complete lamp (base + shade) for 3D preview.
 * The shade is positioned on top of the base with connection lip gap.
 */
export function generateLamp(params: LampParams): Geom3 {
  const base = generateLampBase(params);
  const shade = generateLampShade(params);

  // Position shade on top of base: base height + lip height + small gap
  const lipHeight = params.connectionType === 'friction-fit'
    ? CONNECTION_LIP.height
    : CONNECTION_LIP.height / 2;
  const shadeOffset = params.base.height + lipHeight;
  const shadePositioned = transforms.translate([0, 0, shadeOffset], shade);

  return booleans.union(base, shadePositioned);
}

// Re-export individual generators for separate STL export
export { generateLampBase, generateLampShade };
