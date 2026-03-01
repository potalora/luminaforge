'use client';

import { useDesignStore } from '@/store/designStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { StyleSelector } from './StyleSelector';
import { CrossSectionPicker } from './CrossSectionPicker';
import { ParamSection } from './ParamSection';
import { ParamSlider } from './ParamSlider';
import { ParamSelect } from './ParamSelect';
import { ParamToggle } from './ParamToggle';
import {
  SHAPE_PARAMS,
  CROSS_SECTION_SUB_PARAMS,
  RIDGE_PARAMS,
  FIN_PARAMS,
  ADVANCED_PARAMS,
  type ParamConfig,
  type SliderConfig,
  type SelectConfig,
  type ToggleConfig,
} from './parameterConfig';
import type { VaseParams } from '@/types/design';

function renderParam(config: ParamConfig, params: VaseParams) {
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
          maxOverride={c.dynamicMax ? c.dynamicMax(params) : undefined}
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

/** Full parameter panel: vase params */
export function ParameterPanel() {
  const params = useDesignStore((s) => s.params);

  const filterVisible = (configs: ParamConfig[]) =>
    configs.filter((c) => !c.condition || c.condition(params as VaseParams));

  const isClassic = params.style === 'classic';

  return (
    <div className="flex flex-col gap-2 p-5 sidebar-gradient">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-xl font-light text-text-primary tracking-wide">
          LuminaForge
        </h1>
        <ThemeToggle />
      </div>

      <div className="mt-3">
        <ParamSection title="Style" defaultOpen>
          <StyleSelector />
        </ParamSection>
      </div>

      <div className="border-t border-bg-tertiary">
        <ParamSection title="Shape" defaultOpen>
          <CrossSectionPicker />
          {filterVisible(CROSS_SECTION_SUB_PARAMS).map((c) => renderParam(c, params as VaseParams))}
          {filterVisible(SHAPE_PARAMS).map((c) => renderParam(c, params as VaseParams))}
        </ParamSection>
      </div>

      <div className="border-t border-bg-tertiary">
        {isClassic ? (
          <ParamSection title="Ridges" defaultOpen>
            {filterVisible(RIDGE_PARAMS).map((c) => renderParam(c, params as VaseParams))}
          </ParamSection>
        ) : (
          <ParamSection title="Fins" defaultOpen>
            {filterVisible(FIN_PARAMS).map((c) => renderParam(c, params as VaseParams))}
          </ParamSection>
        )}
      </div>

      <div className="border-t border-bg-tertiary">
        <ParamSection title="Advanced" defaultOpen={false}>
          {filterVisible(ADVANCED_PARAMS).map((c) => renderParam(c, params as VaseParams))}
        </ParamSection>
      </div>
    </div>
  );
}
