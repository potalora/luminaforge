/**
 * Lamp shade geometry generator.
 * Generates a hollow decorative shade with open bottom and
 * connection lip for attaching to base.
 */

import { primitives, booleans } from '@jscad/modeling';
import type { Geom3 } from '@jscad/modeling';
import type { LampParams } from '@/types/design';
import { buildDecorativeShell } from '../shared/shellBuilder';
import { CONNECTION_LIP } from './socketConstants';

/**
 * Generate the lamp shade.
 * Pure function: (LampParams) => Geom3
 */
export function generateLampShade(params: LampParams): Geom3 {
  const shadeParams = params.shade;

  // 1. Build outer decorative shell (solid)
  const outerShell = buildDecorativeShell(shadeParams, {
    resolution: params.resolution,
    wallInset: 0,
  });

  // 2. Build inner shell (wall offset)
  const innerShell = buildDecorativeShell(shadeParams, {
    resolution: params.resolution,
    wallInset: shadeParams.wallThickness,
    skipModulation: shadeParams.smoothInnerWall,
  });

  // 3. Hollow shade (no baseThickness offset — open bottom)
  let shade = booleans.subtract(outerShell, innerShell);

  // 4. Connection lip at bottom inner edge
  const lipHeight = params.connectionType === 'friction-fit'
    ? CONNECTION_LIP.height
    : CONNECTION_LIP.height / 2;

  // Inner lip ring that fits inside the base's outer lip
  const baseTopDiameter = params.base.diameter;
  const lipOuter = baseTopDiameter / 2 - CONNECTION_LIP.tolerance;
  const lipInner = lipOuter - CONNECTION_LIP.wallThickness;

  if (lipInner > 0) {
    const outerLipCylinder = primitives.cylinder({
      radius: lipOuter,
      height: lipHeight,
      segments: Math.max(params.resolution, 32),
      center: [0, 0, -lipHeight / 2],
    });
    const innerLipCylinder = primitives.cylinder({
      radius: lipInner,
      height: lipHeight,
      segments: Math.max(params.resolution, 32),
      center: [0, 0, -lipHeight / 2],
    });
    const lipRing = booleans.subtract(outerLipCylinder, innerLipCylinder);
    shade = booleans.union(shade, lipRing);
  }

  return shade;
}
