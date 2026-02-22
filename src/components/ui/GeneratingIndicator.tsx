'use client';

import React from 'react';

interface GeneratingIndicatorProps {
  isGenerating: boolean;
}

/** Subtle pulsing amber dot shown during geometry generation */
export const GeneratingIndicator = React.memo(function GeneratingIndicator({
  isGenerating,
}: GeneratingIndicatorProps) {
  if (!isGenerating) return null;

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
      <div
        className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"
        aria-label="Generating geometry"
      />
      <span className="text-xs text-text-secondary font-sans">
        Generating...
      </span>
    </div>
  );
});
