export type ObjectType = 'vase' | 'lamp';

export type ProfileShape =
  | 'cylinder'
  | 'tapered'
  | 'bulbous'
  | 'flared'
  | 'hourglass'
  | 'scurve';

export type CrossSection = 'circle' | 'polygon' | 'star';

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

  // Profile
  profileShape: ProfileShape;

  // Twist
  twistAngle: number; // degrees, 0-720
  twistDirection: 'cw' | 'ccw';
  ridgeCount: number; // 0-32
  ridgeDepth: number; // mm, 0-20
  ridgeProfile: RidgeProfile;
  twistEasing: TwistEasing;

  // Cross-section
  crossSection: CrossSection;
  polygonSides: number; // 3-12, for polygon
  starPoints: number; // 3-12, for star
  starInnerRatio: number; // 0.2-0.8, for star
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

  profileShape: 'tapered',

  twistAngle: 180,
  twistDirection: 'ccw',
  ridgeCount: 20,
  ridgeDepth: 5,
  ridgeProfile: 'round',
  twistEasing: 'linear',

  crossSection: 'circle',
  polygonSides: 6,
  starPoints: 5,
  starInnerRatio: 0.5,
} as const;

export const DEFAULT_LAMP_PARAMS: LampParams = {
  height: 200,
  diameter: 150,
  wallThickness: 2,
  resolution: 128,
} as const;
