import type { VaseParams, CrossSection } from '@/types/design';

export type ParamType = 'slider' | 'select' | 'toggle';

interface BaseParamConfig {
  key: keyof VaseParams;
  label: string;
  type: ParamType;
  /** Only show this param when condition returns true */
  condition?: (params: VaseParams) => boolean;
}

export interface SliderConfig extends BaseParamConfig {
  type: 'slider';
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export interface SelectConfig extends BaseParamConfig {
  type: 'select';
  options: { value: string; label: string }[];
}

export interface ToggleConfig extends BaseParamConfig {
  type: 'toggle';
  options: [{ value: string; label: string }, { value: string; label: string }];
}

export type ParamConfig = SliderConfig | SelectConfig | ToggleConfig;

/** Main parameters — always visible, ordered by visual impact */
export const MAIN_PARAMS: ParamConfig[] = [
  {
    key: 'profileShape',
    label: 'Profile Shape',
    type: 'select',
    options: [
      { value: 'cylinder', label: 'Cylinder' },
      { value: 'tapered', label: 'Tapered' },
      { value: 'bulbous', label: 'Bulbous' },
      { value: 'flared', label: 'Flared' },
      { value: 'hourglass', label: 'Hourglass' },
      { value: 'scurve', label: 'S-Curve' },
    ],
  },
  {
    key: 'height',
    label: 'Height',
    type: 'slider',
    min: 50,
    max: 400,
    step: 1,
    unit: 'mm',
  },
  {
    key: 'baseDiameter',
    label: 'Base Diameter',
    type: 'slider',
    min: 30,
    max: 200,
    step: 1,
    unit: 'mm',
  },
  {
    key: 'topDiameter',
    label: 'Top Diameter',
    type: 'slider',
    min: 30,
    max: 250,
    step: 1,
    unit: 'mm',
  },
  {
    key: 'twistAngle',
    label: 'Twist',
    type: 'slider',
    min: 0,
    max: 720,
    step: 1,
    unit: '\u00B0',
  },
  {
    key: 'crossSection',
    label: 'Cross Section',
    type: 'select',
    options: [
      { value: 'circle', label: 'Circle' },
      { value: 'polygon', label: 'Polygon' },
      { value: 'star', label: 'Star' },
    ],
  },
];

/** Advanced parameters — collapsible, closed by default */
export const ADVANCED_PARAMS: ParamConfig[] = [
  {
    key: 'wallThickness',
    label: 'Wall Thickness',
    type: 'slider',
    min: 0.8,
    max: 4,
    step: 0.1,
    unit: 'mm',
  },
  {
    key: 'baseThickness',
    label: 'Base Thickness',
    type: 'slider',
    min: 1,
    max: 6,
    step: 0.5,
    unit: 'mm',
  },
  {
    key: 'resolution',
    label: 'Resolution',
    type: 'slider',
    min: 32,
    max: 256,
    step: 8,
    unit: 'seg',
  },
  {
    key: 'twistDirection',
    label: 'Twist Direction',
    type: 'toggle',
    options: [
      { value: 'cw', label: 'CW' },
      { value: 'ccw', label: 'CCW' },
    ],
  },
  {
    key: 'twistEasing',
    label: 'Twist Easing',
    type: 'select',
    options: [
      { value: 'linear', label: 'Linear' },
      { value: 'easeIn', label: 'Ease In' },
      { value: 'easeOut', label: 'Ease Out' },
      { value: 'easeInOut', label: 'Ease In Out' },
    ],
  },
  {
    key: 'ribCount',
    label: 'Rib Count',
    type: 'slider',
    min: 0,
    max: 24,
    step: 1,
  },
  {
    key: 'ribDepth',
    label: 'Rib Depth',
    type: 'slider',
    min: 0,
    max: 20,
    step: 0.5,
    unit: 'mm',
  },
  {
    key: 'ribProfile',
    label: 'Rib Profile',
    type: 'select',
    options: [
      { value: 'round', label: 'Round' },
      { value: 'sharp', label: 'Sharp' },
      { value: 'flat', label: 'Flat' },
    ],
  },
  {
    key: 'polygonSides',
    label: 'Polygon Sides',
    type: 'slider',
    min: 3,
    max: 12,
    step: 1,
    condition: (params) => (params.crossSection as CrossSection) === 'polygon',
  },
  {
    key: 'starPoints',
    label: 'Star Points',
    type: 'slider',
    min: 3,
    max: 12,
    step: 1,
    condition: (params) => (params.crossSection as CrossSection) === 'star',
  },
  {
    key: 'starInnerRatio',
    label: 'Star Inner Ratio',
    type: 'slider',
    min: 0.2,
    max: 0.8,
    step: 0.05,
    condition: (params) => (params.crossSection as CrossSection) === 'star',
  },
];
