'use client';

import { useDesignStore } from '@/store/designStore';
import { ObjectTypeToggle } from './ObjectTypeToggle';
import { ParamSection } from './ParamSection';
import { ParamSlider } from './ParamSlider';
import { ParamSelect } from './ParamSelect';
import { ParamToggle } from './ParamToggle';
import {
  MAIN_PARAMS,
  ADVANCED_PARAMS,
  type ParamConfig,
  type SliderConfig,
  type SelectConfig,
  type ToggleConfig,
} from './parameterConfig';
import type { VaseParams } from '@/types/design';

function renderParam(config: ParamConfig) {
  switch (config.type) {
    case 'slider': {
      const c = config as SliderConfig;
      return (
        <ParamSlider
          key={c.key}
          paramKey={c.key}
          label={c.label}
          min={c.min}
          max={c.max}
          step={c.step}
          unit={c.unit}
        />
      );
    }
    case 'select': {
      const c = config as SelectConfig;
      return (
        <ParamSelect
          key={c.key}
          paramKey={c.key}
          label={c.label}
          options={c.options}
        />
      );
    }
    case 'toggle': {
      const c = config as ToggleConfig;
      return (
        <ParamToggle
          key={c.key}
          paramKey={c.key}
          label={c.label}
          options={c.options}
        />
      );
    }
  }
}

/** Full parameter panel: object type toggle + main params + advanced params */
export function ParameterPanel() {
  const params = useDesignStore((s) => s.params);

  const filterVisible = (configs: ParamConfig[]) =>
    configs.filter((c) => !c.condition || c.condition(params as VaseParams));

  return (
    <div className="flex flex-col gap-2 p-5">
      <h1 className="font-display text-xl text-text-primary tracking-tight mb-2">
        LuminaForge
      </h1>

      <ObjectTypeToggle />

      <div className="mt-4">
        <ParamSection title="Shape" defaultOpen>
          {filterVisible(MAIN_PARAMS).map(renderParam)}
        </ParamSection>
      </div>

      <div className="border-t border-bg-tertiary">
        <ParamSection title="Advanced" defaultOpen={false}>
          {filterVisible(ADVANCED_PARAMS).map(renderParam)}
        </ParamSection>
      </div>
    </div>
  );
}
