'use client';

import { useGeometryWorker } from '@/hooks/useGeometryWorker';
import { useDesignStore } from '@/store/designStore';
import { ViewportCanvas } from './ViewportCanvas';
import { ExportButton } from '@/components/ui/ExportButton';
import { GeneratingIndicator } from '@/components/ui/GeneratingIndicator';

/** Owns the geometry lifecycle. Passes geometry to canvas + export to button. */
export function ViewportContainer() {
  const { geometry, isGenerating, exportSTL } = useGeometryWorker();
  const height = useDesignStore((s) => s.params.height);
  const diameter = useDesignStore((s) => s.params.diameter);
  const ridgeDepth = useDesignStore((s) => s.params.ridgeDepth);

  const plateRadius = diameter / 2 + ridgeDepth + 8;

  return (
    <div className="relative flex-1 min-h-0">
      <ViewportCanvas
        geometry={geometry}
        vaseHeight={height}
        plateRadius={plateRadius}
      />
      <ExportButton onExport={exportSTL} isGenerating={isGenerating} />
      <GeneratingIndicator isGenerating={isGenerating} />
    </div>
  );
}
