'use client';

import { useGeometryWorker } from '@/hooks/useGeometryWorker';
import { ViewportCanvas } from './ViewportCanvas';
import { ExportButton } from '@/components/ui/ExportButton';
import { GeneratingIndicator } from '@/components/ui/GeneratingIndicator';

/** Owns the geometry lifecycle. Passes geometry to canvas + export to button. */
export function ViewportContainer() {
  const { geometry, isGenerating, exportSTL } = useGeometryWorker();

  return (
    <div className="relative flex-1 min-h-0">
      <ViewportCanvas geometry={geometry} />
      <ExportButton onExport={exportSTL} isGenerating={isGenerating} />
      <GeneratingIndicator isGenerating={isGenerating} />
    </div>
  );
}
