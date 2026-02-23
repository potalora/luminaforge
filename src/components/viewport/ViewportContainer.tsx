'use client';

import { useGeometryWorker } from '@/hooks/useGeometryWorker';
import { useDesignStore } from '@/store/designStore';
import { ViewportCanvas } from './ViewportCanvas';
import { ExportButton } from '@/components/ui/ExportButton';
import { GeneratingIndicator } from '@/components/ui/GeneratingIndicator';

/** Owns the geometry lifecycle. Passes geometry to canvas + export to button. */
export function ViewportContainer() {
  const { geometry, isGenerating, exportSTL } = useGeometryWorker();
  const objectType = useDesignStore((s) => s.objectType);
  const vaseHeight = useDesignStore((s) => s.params.height);
  const vaseDiameter = useDesignStore((s) => s.params.diameter);
  const vaseRidgeDepth = useDesignStore((s) => s.params.ridgeDepth);
  const lampParams = useDesignStore((s) => s.lampParams);

  let displayHeight: number;
  let plateRadius: number;

  if (objectType === 'lamp') {
    displayHeight = lampParams.base.height + lampParams.shade.height;
    const maxDiameter = Math.max(lampParams.base.diameter, lampParams.shade.diameter);
    const maxRidgeDepth = Math.max(lampParams.base.ridgeDepth, lampParams.shade.ridgeDepth);
    plateRadius = maxDiameter / 2 + maxRidgeDepth + 8;
  } else {
    displayHeight = vaseHeight;
    plateRadius = vaseDiameter / 2 + vaseRidgeDepth + 8;
  }

  return (
    <div className="relative flex-1 min-h-0">
      <ViewportCanvas
        geometry={geometry}
        vaseHeight={displayHeight}
        plateRadius={plateRadius}
      />
      <ExportButton onExport={exportSTL} isGenerating={isGenerating} objectType={objectType} />
      <GeneratingIndicator isGenerating={isGenerating} />
    </div>
  );
}
