export type VaseStyle = 'classic' | 'spiral-fin';

export type CrossSection =
  | 'circle' | 'oval' | 'squircle' | 'superellipse'   // smooth
  | 'heart' | 'teardrop' | 'petal' | 'leaf'            // organic
  | 'polygon' | 'star' | 'gear' | 'flower';            // geometric

export type RidgeProfile = 'round' | 'sharp' | 'flat';

export type TwistEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

// Shared decorative params used by vase generator
export interface DecorativeShellParams {
  height: number;             // mm
  diameter: number;           // mm (base width)
  taper: number;              // -0.7 to 0.7 (0 = straight, + = wider top, - = narrower top)
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

export const DEFAULT_VASE_PARAMS: VaseParams = {
  height: 150,
  diameter: 80,
  taper: 0,
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
