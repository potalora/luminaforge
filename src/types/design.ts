export type ObjectType = 'vase' | 'lamp';

export type ProfileShape =
  | 'cylinder'
  | 'tapered'
  | 'bulbous'
  | 'flared'
  | 'hourglass'
  | 'scurve';

export type CrossSection = 'circle' | 'polygon' | 'star';

export type RibProfile = 'round' | 'sharp' | 'flat';

export type TwistEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

export interface VaseParams {
  // Base dimensions
  height: number; // mm, 50-400
  baseDiameter: number; // mm, 30-200
  topDiameter: number; // mm, 30-250
  wallThickness: number; // mm, 0.8-4
  baseThickness: number; // mm, 1-6
  resolution: number; // segments, 32-256

  // Profile
  profileShape: ProfileShape;

  // Twist
  twistAngle: number; // degrees, 0-720
  twistDirection: 'cw' | 'ccw';
  ribCount: number; // 0-24
  ribDepth: number; // mm, 0-20
  ribProfile: RibProfile;
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
  baseDiameter: 80,
  topDiameter: 100,
  wallThickness: 1.6,
  baseThickness: 2,
  resolution: 64,

  profileShape: 'tapered',

  twistAngle: 180,
  twistDirection: 'ccw',
  ribCount: 6,
  ribDepth: 3,
  ribProfile: 'round',
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
  resolution: 64,
} as const;
