'use client';

import { useGeometryWorker } from '@/hooks/useGeometryWorker';
import { useDesignStore } from '@/store/designStore';
import { ViewportCanvas } from './ViewportCanvas';
import { ExportButton } from '@/components/ui/ExportButton';
import { GeneratingIndicator } from '@/components/ui/GeneratingIndicator';

/** Owns the geometry lifecycle. Passes geometry to canvas + export to button. */
export function ViewportContainer() {
  const { geometry, isGenerating, exportSTL } = useGeometryWorker();
  const vaseHeight = useDesignStore((s) => s.params.height);
  const vaseDiameter = useDesignStore((s) => s.params.diameter);
  const vaseRidgeDepth = useDesignStore((s) => s.params.ridgeDepth);

  const displayHeight = vaseHeight;
  const plateRadius = vaseDiameter / 2 + vaseRidgeDepth + 8;

  return (
    <div className="relative flex-1 min-h-0">
      <ViewportCanvas
        geometry={geometry}
        vaseHeight={displayHeight}
        plateRadius={plateRadius}
      />
      <ExportButton onExport={exportSTL} isGenerating={isGenerating} />
      <GeneratingIndicator isGenerating={isGenerating} />
    </div>
  );
}
