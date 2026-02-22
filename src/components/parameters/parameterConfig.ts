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

/** Shape parameters — profile picker is separate, these are sliders/selects */
export const SHAPE_PARAMS: ParamConfig[] = [
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
    key: 'diameter',
    label: 'Diameter',
    type: 'slider',
    min: 40,
    max: 200,
    step: 1,
    unit: 'mm',
  },
  {
    key: 'taper',
    label: 'Taper',
    type: 'slider',
    min: 0.3,
    max: 1.7,
    step: 0.01,
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

/** Ridge parameters — promoted to their own section */
export const RIDGE_PARAMS: ParamConfig[] = [
  {
    key: 'ridgeCount',
    label: 'Ridge Count',
    type: 'slider',
    min: 0,
    max: 32,
    step: 1,
  },
  {
    key: 'ridgeDepth',
    label: 'Ridge Depth',
    type: 'slider',
    min: 0,
    max: 20,
    step: 0.5,
    unit: 'mm',
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
    key: 'ridgeProfile',
    label: 'Ridge Profile',
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
