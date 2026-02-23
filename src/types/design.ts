export type ObjectType = 'vase' | 'lamp';

export type VaseStyle = 'classic' | 'spiral-fin';

export type CrossSection =
  | 'circle' | 'oval' | 'squircle' | 'superellipse'   // smooth
  | 'heart' | 'teardrop' | 'petal' | 'leaf'            // organic
  | 'polygon' | 'star' | 'gear' | 'flower';            // geometric

export type RidgeProfile = 'round' | 'sharp' | 'flat';

export type TwistEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

export type SocketType = 'E12' | 'E14' | 'E26' | 'E27';

export type ConnectionType = 'friction-fit' | 'gravity-sit';

// Shared decorative params used by vase, lamp base, and lamp shade
export interface DecorativeShellParams {
  height: number;             // mm
  diameter: number;           // mm (base width)
  taper: number;              // 0.3-1.7 (ratio: top width / base width)
  wallThickness: number;      // mm

  style: VaseStyle;
  profileCurve: number;       // -1.0 to 1.0 (hourglass to bulbous)

  twistAngle: number;         // degrees, 0-720
  twistDirection: 'cw' | 'ccw';
  twistEasing: TwistEasing;
  ridgeCount: number;         // 0-32
  ridgeDepth: number;         // mm, 0-20
  ridgeProfile: RidgeProfile;
  smoothInnerWall: boolean;

  crossSection: CrossSection;
  polygonSides: number;       // 3-12
  starPoints: number;         // 3-12
  starInnerRatio: number;     // 0.2-0.8

  ovalRatio: number;          // 0.4-1.0
  squircleN: number;          // 2.5-5
  superN: number;             // 0.5-5
  gearTeeth: number;          // 6-24
  petalCount: number;         // 3-8

  finCount: number;           // 30-80
  finHeight: number;          // mm, 1-6
  finWidth: number;           // broadness factor, 0.5-4.0
}

export interface VaseParams extends DecorativeShellParams {
  baseThickness: number;      // mm, 1-6
  resolution: number;         // segments, 32-256
}

export interface LampParams {
  socketType: SocketType;
  connectionType: ConnectionType;
  wireChannelEnabled: boolean;
  resolution: number;         // segments, 32-256

  base: DecorativeShellParams;
  shade: DecorativeShellParams;
}

export type DesignParams =
  | { type: 'vase'; params: VaseParams }
  | { type: 'lamp'; params: LampParams };

const DEFAULT_DECORATIVE_BASE: DecorativeShellParams = {
  height: 60,
  diameter: 120,
  taper: 0.85,
  wallThickness: 2.5,

  style: 'classic',
  profileCurve: 0.0,

  twistAngle: 0,
  twistDirection: 'ccw',
  twistEasing: 'linear',
  ridgeCount: 0,
  ridgeDepth: 0,
  ridgeProfile: 'round',
  smoothInnerWall: true,

  crossSection: 'circle',
  polygonSides: 6,
  starPoints: 5,
  starInnerRatio: 0.5,

  ovalRatio: 0.7,
  squircleN: 4,
  superN: 2.5,
  gearTeeth: 12,
  petalCount: 5,

  finCount: 55,
  finHeight: 3.5,
  finWidth: 2.2,
};

const DEFAULT_DECORATIVE_SHADE: DecorativeShellParams = {
  height: 200,
  diameter: 150,
  taper: 0.7,
  wallThickness: 1.6,

  style: 'spiral-fin',
  profileCurve: 0.0,

  twistAngle: 180,
  twistDirection: 'ccw',
  twistEasing: 'linear',
  ridgeCount: 20,
  ridgeDepth: 5,
  ridgeProfile: 'round',
  smoothInnerWall: true,

  crossSection: 'circle',
  polygonSides: 6,
  starPoints: 5,
  starInnerRatio: 0.5,

  ovalRatio: 0.7,
  squircleN: 4,
  superN: 2.5,
  gearTeeth: 12,
  petalCount: 5,

  finCount: 55,
  finHeight: 3.5,
  finWidth: 2.2,
};

export const DEFAULT_VASE_PARAMS: VaseParams = {
  height: 150,
  diameter: 80,
  taper: 1.0,
  wallThickness: 1.6,

  style: 'spiral-fin',
  profileCurve: 0.0,

  twistAngle: 180,
  twistDirection: 'ccw',
  twistEasing: 'linear',
  ridgeCount: 20,
  ridgeDepth: 5,
  ridgeProfile: 'round',
  smoothInnerWall: true,

  crossSection: 'circle',
  polygonSides: 6,
  starPoints: 5,
  starInnerRatio: 0.5,

  ovalRatio: 0.7,
  squircleN: 4,
  superN: 2.5,
  gearTeeth: 12,
  petalCount: 5,

  finCount: 55,
  finHeight: 3.5,
  finWidth: 2.2,

  baseThickness: 2,
  resolution: 128,
} as const;

export const DEFAULT_LAMP_PARAMS: LampParams = {
  socketType: 'E26',
  connectionType: 'friction-fit',
  wireChannelEnabled: true,
  resolution: 128,

  base: { ...DEFAULT_DECORATIVE_BASE },
  shade: { ...DEFAULT_DECORATIVE_SHADE },
} as const;
