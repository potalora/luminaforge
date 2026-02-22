export type ObjectType = 'vase' | 'lamp';

export type VaseStyle = 'classic' | 'spiral-fin';

export type CrossSection =
  | 'circle' | 'oval' | 'squircle' | 'superellipse'   // smooth
  | 'heart' | 'teardrop' | 'petal' | 'leaf'            // organic
  | 'polygon' | 'star' | 'gear' | 'flower';            // geometric

export type RidgeProfile = 'round' | 'sharp' | 'flat';

export type TwistEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

export interface VaseParams {
  // Base dimensions
  height: number; // mm, 50-400
  diameter: number; // mm, 40-200 (base width)
  taper: number; // 0.3-1.7 (ratio: top width / base width)
  wallThickness: number; // mm, 0.8-4
  baseThickness: number; // mm, 1-6
  resolution: number; // segments, 32-256

  // Style
  style: VaseStyle;

  // Profile
  profileCurve: number; // -1.0 to 1.0 (hourglass ↔ bulbous)

  // Twist
  twistAngle: number; // degrees, 0-720
  twistDirection: 'cw' | 'ccw';
  ridgeCount: number; // 0-32
  ridgeDepth: number; // mm, 0-20
  ridgeProfile: RidgeProfile;
  smoothInnerWall: boolean; // true = inner wall smooth, false = ridges on both walls
  twistEasing: TwistEasing;

  // Cross-section
  crossSection: CrossSection;
  polygonSides: number; // 3-12, for polygon
  starPoints: number; // 3-12, for star
  starInnerRatio: number; // 0.2-0.8, for star

  // Cross-section sub-params (shape-specific)
  ovalRatio: number; // 0.4-1.0, for oval (minor/major)
  squircleN: number; // 2.5-5, for squircle (roundness)
  superN: number; // 0.5-5, for superellipse (full range)
  gearTeeth: number; // 6-24, for gear
  petalCount: number; // 3-8, for flower

  // Spiral fin params
  finCount: number; // 4-60
  finHeight: number; // mm, 2-30
  finWidth: number; // degrees, 1-20
}

export interface LampParams {
  height: number;
  diameter: number;
  wallThickness: number;
  resolution: number;
}

export type DesignParams =
  | { type: 'vase'; params: VaseParams }
  | { type: 'lamp'; params: LampParams };

export const DEFAULT_VASE_PARAMS: VaseParams = {
  height: 150,
  diameter: 80,
  taper: 1.0,
  wallThickness: 1.6,
  baseThickness: 2,
  resolution: 128,

  style: 'classic',

  profileCurve: 0.0,

  twistAngle: 180,
  twistDirection: 'ccw',
  ridgeCount: 20,
  ridgeDepth: 5,
  ridgeProfile: 'round',
  smoothInnerWall: true,
  twistEasing: 'linear',

  crossSection: 'circle',
  polygonSides: 6,
  starPoints: 5,
  starInnerRatio: 0.5,

  ovalRatio: 0.7,
  squircleN: 4,
  superN: 2.5,
  gearTeeth: 12,
  petalCount: 5,

  finCount: 24,
  finHeight: 8,
  finWidth: 3,
} as const;

export const DEFAULT_LAMP_PARAMS: LampParams = {
  height: 200,
  diameter: 150,
  wallThickness: 2,
  resolution: 128,
} as const;
