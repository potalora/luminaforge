'use client';

import React, { useState, useCallback } from 'react';
import { useDesignStore } from '@/store/designStore';
import { ParamSection } from './ParamSection';
import { SocketTypePicker } from './SocketTypePicker';
import { LampCrossSectionPicker } from './LampCrossSectionPicker';
import { LampStyleSelector } from './LampStyleSelector';
import { LampParamSlider } from './LampParamSlider';
import { LampParamSelect } from './LampParamSelect';
import { LampParamToggle } from './LampParamToggle';
import {
  LAMP_SHAPE_PARAMS,
  LAMP_CROSS_SECTION_SUB_PARAMS,
  LAMP_RIDGE_PARAMS,
  LAMP_FIN_PARAMS,
  LAMP_ADVANCED_PARAMS,
  type LampParamConfig,
  type LampSliderConfig,
  type LampSelectConfig,
  type LampToggleConfig,
} from './lampParameterConfig';
import type { DecorativeShellParams, ConnectionType } from '@/types/design';

type LampPart = 'base' | 'shade';

function renderLampParam(
  config: LampParamConfig,
  part: LampPart,
  params: DecorativeShellParams,
) {
  switch (config.type) {
    case 'slider': {
      const c = config as LampSliderConfig;
      return (
        <LampParamSlider
          key={c.key}
          part={part}
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
      const c = config as LampSelectConfig;
      return (
        <LampParamSelect
          key={c.key}
          part={part}
          paramKey={c.key}
          label={c.label}
          options={c.options}
        />
      );
    }
    case 'toggle': {
      const c = config as LampToggleConfig;
      return (
        <LampParamToggle
          key={c.key}
          part={part}
          paramKey={c.key}
          label={c.label}
          options={c.options}
        />
      );
    }
  }
}

function filterVisible(
  configs: LampParamConfig[],
  params: DecorativeShellParams,
) {
  return configs.filter((c) => !c.condition || c.condition(params));
}

/** Decorative param sections for a single lamp part (base or shade) */
function PartParams({ part }: { part: LampPart }) {
  const partParams = useDesignStore((s) => s.lampParams[part]);
  const isClassic = partParams.style === 'classic';

  return (
    <>
      <LampStyleSelector part={part} />

      <ParamSection title="Shape" defaultOpen>
        <LampCrossSectionPicker part={part} />
        {filterVisible(LAMP_CROSS_SECTION_SUB_PARAMS, partParams).map((c) =>
          renderLampParam(c, part, partParams),
        )}
        {filterVisible(LAMP_SHAPE_PARAMS, partParams).map((c) =>
          renderLampParam(c, part, partParams),
        )}
      </ParamSection>

      <div className="border-t border-bg-tertiary">
        {isClassic ? (
          <ParamSection title="Ridges" defaultOpen>
            {filterVisible(LAMP_RIDGE_PARAMS, partParams).map((c) =>
              renderLampParam(c, part, partParams),
            )}
          </ParamSection>
        ) : (
          <ParamSection title="Fins" defaultOpen>
            {filterVisible(LAMP_FIN_PARAMS, partParams).map((c) =>
              renderLampParam(c, part, partParams),
            )}
          </ParamSection>
        )}
      </div>

      <div className="border-t border-bg-tertiary">
        <ParamSection title="Advanced" defaultOpen={false}>
          {filterVisible(LAMP_ADVANCED_PARAMS, partParams).map((c) =>
            renderLampParam(c, part, partParams),
          )}
        </ParamSection>
      </div>
    </>
  );
}

/** Full lamp parameter panel: socket, connection, wire channel, base/shade tabs, resolution */
export function LampParameterPanel() {
  const [activeTab, setActiveTab] = useState<LampPart>('shade');

  const connectionType = useDesignStore((s) => s.lampParams.connectionType);
  const wireChannelEnabled = useDesignStore(
    (s) => s.lampParams.wireChannelEnabled,
  );
  const resolution = useDesignStore((s) => s.lampParams.resolution);
  const setLampParam = useDesignStore((s) => s.setLampParam);

  const handleConnectionChange = useCallback(
    (value: string) => {
      setLampParam('connectionType', value as ConnectionType);
    },
    [setLampParam],
  );

  const handleWireChannelChange = useCallback(
    (value: string) => {
      setLampParam('wireChannelEnabled', value === 'true');
    },
    [setLampParam],
  );

  const handleResolutionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLampParam('resolution', Number(e.target.value));
    },
    [setLampParam],
  );

  return (
    <div className="flex flex-col gap-2" data-testid="lamp-parameter-panel">
      {/* Socket type */}
      <ParamSection title="Socket" defaultOpen>
        <SocketTypePicker />

        {/* Connection type toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-sans tracking-wide uppercase">
            Connection
          </label>
          <div
            className="flex bg-bg-tertiary rounded-sm overflow-hidden"
            role="radiogroup"
            aria-label="Connection type"
          >
            {(['friction-fit', 'gravity-sit'] as const).map((value) => (
              <button
                key={value}
                role="radio"
                aria-checked={connectionType === value}
                onClick={() => handleConnectionChange(value)}
                data-testid={`connection-${value}`}
                className={`flex-1 text-[11px] font-sans tracking-wider py-2 transition-colors ${
                  connectionType === value
                    ? 'bg-accent-primary/15 text-accent-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {value === 'friction-fit' ? 'Friction Fit' : 'Gravity Sit'}
              </button>
            ))}
          </div>
        </div>

        {/* Wire channel toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-sans tracking-wide uppercase">
            Wire Channel
          </label>
          <div
            className="flex bg-bg-tertiary rounded-sm overflow-hidden"
            role="radiogroup"
            aria-label="Wire channel"
          >
            {[
              { value: 'true', label: 'Enabled' },
              { value: 'false', label: 'Disabled' },
            ].map((opt) => (
              <button
                key={opt.value}
                role="radio"
                aria-checked={String(wireChannelEnabled) === opt.value}
                onClick={() => handleWireChannelChange(opt.value)}
                data-testid={`wire-channel-${opt.value}`}
                className={`flex-1 text-[11px] font-sans tracking-wider py-2 transition-colors ${
                  String(wireChannelEnabled) === opt.value
                    ? 'bg-accent-primary/15 text-accent-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </ParamSection>

      {/* Base / Shade tab switcher */}
      <div className="border-t border-bg-tertiary pt-2">
        <div className="flex bg-bg-tertiary rounded-sm overflow-hidden mb-3">
          {(['base', 'shade'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-testid={`lamp-tab-${tab}`}
              className={`flex-1 text-sm font-sans py-2 transition-colors ${
                activeTab === tab
                  ? 'bg-accent-primary/15 text-accent-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab === 'base' ? 'Base' : 'Shade'}
            </button>
          ))}
        </div>

        <PartParams part={activeTab} />
      </div>

      {/* Global resolution */}
      <div className="border-t border-bg-tertiary pt-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-text-secondary font-sans tracking-wide uppercase">
              Resolution
            </label>
            <span className="text-xs font-mono text-text-primary">
              {resolution}
              <span className="text-text-tertiary ml-0.5">seg</span>
            </span>
          </div>
          <input
            type="range"
            min={32}
            max={256}
            step={8}
            value={resolution}
            onChange={handleResolutionChange}
            data-testid="lamp-resolution-slider"
            aria-label="Resolution"
          />
        </div>
      </div>
    </div>
  );
}
