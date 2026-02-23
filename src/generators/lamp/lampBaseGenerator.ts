/**
 * Lamp base geometry generator.
 * Generates a hollow decorative base with socket cavity, wire channel,
 * and connection lip for shade attachment.
 */

import { primitives, booleans, transforms } from '@jscad/modeling';
import type { Geom3 } from '@jscad/modeling';
import type { LampParams } from '@/types/design';
import { buildDecorativeShell } from '../shared/shellBuilder';
import { SOCKET_SPECS, WIRE_CHANNEL, CONNECTION_LIP, LAMP_BASE_THICKNESS } from './socketConstants';

/**
 * Generate the lamp base.
 * Pure function: (LampParams) => Geom3
 */
export function generateLampBase(params: LampParams): Geom3 {
  const baseParams = params.base;
  const socketSpec = SOCKET_SPECS[params.socketType];

  // 1. Build outer decorative shell (solid)
  const outerShell = buildDecorativeShell(baseParams, {
    resolution: params.resolution,
    wallInset: 0,
  });

  // 2. Build inner shell (wall offset)
  const innerShell = buildDecorativeShell(baseParams, {
    resolution: params.resolution,
    wallInset: baseParams.wallThickness,
    skipModulation: baseParams.smoothInnerWall,
  });

  // 3. Raise inner shell for solid bottom
  const innerShellRaised = transforms.translate(
    [0, 0, LAMP_BASE_THICKNESS],
    innerShell
  );

  // 4. Hollow base
  let base = booleans.subtract(outerShell, innerShellRaised);

  // 5. Subtract socket cavity at top center
  const cavityDepth = socketSpec.collarHeight + 5; // extra clearance
  const cavity = primitives.cylinder({
    radius: socketSpec.mountHoleDiameter / 2,
    height: cavityDepth,
    segments: Math.max(params.resolution, 32),
    center: [0, 0, baseParams.height - cavityDepth / 2],
  });
  base = booleans.subtract(base, cavity);

  // 6. Wire channel (optional)
  if (params.wireChannelEnabled) {
    // Lamp pipe bore through center of socket area
    const bore = primitives.cylinder({
      radius: socketSpec.lampPipeBore / 2,
      height: baseParams.height,
      segments: 16,
      center: [0, 0, baseParams.height / 2],
    });
    base = booleans.subtract(base, bore);

    // Rectangular wire groove from center to edge
    const grooveLength = baseParams.diameter / 2;
    const groove = primitives.cuboid({
      size: [WIRE_CHANNEL.width, grooveLength, WIRE_CHANNEL.depth],
      center: [0, grooveLength / 2, LAMP_BASE_THICKNESS / 2],
    });
    base = booleans.subtract(base, groove);
  }

  // 7. Connection lip at top
  const lipOuter = baseParams.diameter / 2 + CONNECTION_LIP.wallThickness;
  const lipInner = baseParams.diameter / 2 - CONNECTION_LIP.tolerance;
  const lipHeight = params.connectionType === 'friction-fit'
    ? CONNECTION_LIP.height
    : CONNECTION_LIP.height / 2;

  const outerLipCylinder = primitives.cylinder({
    radius: lipOuter,
    height: lipHeight,
    segments: Math.max(params.resolution, 32),
    center: [0, 0, baseParams.height + lipHeight / 2],
  });
  const innerLipCylinder = primitives.cylinder({
    radius: lipInner,
    height: lipHeight,
    segments: Math.max(params.resolution, 32),
    center: [0, 0, baseParams.height + lipHeight / 2],
  });
  const lipRing = booleans.subtract(outerLipCylinder, innerLipCylinder);
  base = booleans.union(base, lipRing);

  return base;
}
