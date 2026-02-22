'use client';

import React, { useState, useCallback } from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  onExport: () => Promise<void>;
  isGenerating: boolean;
}

/** Floating amber export button in bottom-right of viewport */
export const ExportButton = React.memo(function ExportButton({
  onExport,
  isGenerating,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleClick = useCallback(async () => {
    if (isExporting || isGenerating) return;
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  }, [onExport, isExporting, isGenerating]);

  return (
    <button
      onClick={handleClick}
      disabled={isExporting}
      className="absolute bottom-6 right-6 flex items-center gap-2
        bg-accent-primary hover:bg-accent-secondary
        text-bg-primary font-sans text-sm font-medium
        px-5 py-2.5 rounded-lg
        shadow-lg hover:shadow-glow
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        z-10"
    >
      <Download size={16} />
      {isExporting ? 'Exporting...' : 'Export STL'}
    </button>
  );
});
