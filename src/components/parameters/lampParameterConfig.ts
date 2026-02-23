import type { DecorativeShellParams } from '@/types/design';

export type LampParamType = 'slider' | 'select' | 'toggle';

interface BaseLampParamConfig {
  key: keyof DecorativeShellParams;
  label: string;
  type: LampParamType;
  /** Only show this param when condition returns true */
  condition?: (params: DecorativeShellParams) => boolean;
}

export interface LampSliderConfig extends BaseLampParamConfig {
  type: 'slider';
  min: number;
  max: number;
  step: number;
  unit?: string;
  /** Compute a dynamic max from current params (overrides static max) */
  dynamicMax?: (params: DecorativeShellParams) => number;
}

export interface LampSelectConfig extends BaseLampParamConfig {
  type: 'select';
  options: { value: string; label: string }[];
}

export interface LampToggleConfig extends BaseLampParamConfig {
  type: 'toggle';
  options: [{ value: string; label: string }, { value: string; label: string }];
}

export type LampParamConfig = LampSliderConfig | LampSelectConfig | LampToggleConfig;

/** Shape parameters — cross-section picker is separate, these are sliders */
export const LAMP_SHAPE_PARAMS: LampParamConfig[] = [
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
    key: 'profileCurve',
    label: 'Profile Curve',
    type: 'slider',
    min: -1,
    max: 1,
    step: 0.05,
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
];

/** Cross-section sub-params — shown conditionally below the picker */
export const LAMP_CROSS_SECTION_SUB_PARAMS: LampParamConfig[] = [
  {
    key: 'ovalRatio',
    label: 'Oval Ratio',
    type: 'slider',
    min: 0.4,
    max: 1.0,
    step: 0.05,
    condition: (params) => params.crossSection === 'oval',
  },
  {
    key: 'squircleN',
    label: 'Roundness',
    type: 'slider',
    min: 2.5,
    max: 5,
    step: 0.1,
    condition: (params) => params.crossSection === 'squircle',
  },
  {
    key: 'superN',
    label: 'Exponent',
    type: 'slider',
    min: 0.5,
    max: 5,
    step: 0.1,
    condition: (params) => params.crossSection === 'superellipse',
  },
  {
    key: 'polygonSides',
    label: 'Sides',
    type: 'slider',
    min: 3,
    max: 12,
    step: 1,
    condition: (params) => params.crossSection === 'polygon',
  },
  {
    key: 'starPoints',
    label: 'Points',
    type: 'slider',
    min: 3,
    max: 12,
    step: 1,
    condition: (params) => params.crossSection === 'star',
  },
  {
    key: 'starInnerRatio',
    label: 'Inner Ratio',
    type: 'slider',
    min: 0.2,
    max: 0.8,
    step: 0.05,
    condition: (params) => params.crossSection === 'star',
  },
  {
    key: 'gearTeeth',
    label: 'Teeth',
    type: 'slider',
    min: 6,
    max: 24,
    step: 1,
    condition: (params) => params.crossSection === 'gear',
  },
  {
    key: 'petalCount',
    label: 'Petals',
    type: 'slider',
    min: 3,
    max: 8,
    step: 1,
    condition: (params) => params.crossSection === 'flower',
  },
];

/** Ridge parameters — shown only in classic style */
export const LAMP_RIDGE_PARAMS: LampParamConfig[] = [
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
  {
    key: 'smoothInnerWall',
    label: 'Smooth Inner Wall',
    type: 'toggle',
    options: [
      { value: 'true', label: 'Smooth' },
      { value: 'false', label: 'Ridged' },
    ],
  },
];

/** Fin parameters — shown only in spiral-fin style */
export const LAMP_FIN_PARAMS: LampParamConfig[] = [
  {
    key: 'finCount',
    label: 'Fin Count',
    type: 'slider',
    min: 30,
    max: 80,
    step: 1,
  },
  {
    key: 'finHeight',
    label: 'Fin Height',
    type: 'slider',
    min: 1,
    max: 6,
    step: 0.5,
    unit: 'mm',
  },
  {
    key: 'finWidth',
    label: 'Fin Broadness',
    type: 'slider',
    min: 0.5,
    max: 4,
    step: 0.1,
  },
  {
    key: 'smoothInnerWall',
    label: 'Smooth Inner Wall',
    type: 'toggle',
    options: [
      { value: 'true', label: 'Smooth' },
      { value: 'false', label: 'Finned' },
    ],
  },
];

/** Advanced parameters — collapsible, closed by default. No baseThickness for lamps. */
export const LAMP_ADVANCED_PARAMS: LampParamConfig[] = [
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
    condition: (params) => params.style === 'classic',
  },
];
