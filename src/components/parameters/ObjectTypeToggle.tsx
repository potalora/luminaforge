'use client';

import React from 'react';
import { useDesignStore } from '@/store/designStore';

/** Vase/Lamp segmented control. Lamp is disabled with "Coming soon" */
export const ObjectTypeToggle = React.memo(function ObjectTypeToggle() {
  const objectType = useDesignStore((s) => s.objectType);

  return (
    <div className="flex bg-bg-tertiary rounded-sm overflow-hidden">
      <button
        className={`flex-1 text-sm font-sans py-2 transition-colors ${
          objectType === 'vase'
            ? 'bg-accent-primary/15 text-accent-primary'
            : 'text-text-secondary hover:text-text-primary'
        }`}
        data-testid="object-type-vase"
      >
        Vase
      </button>
      <button
        disabled
        title="Coming soon"
        className="flex-1 text-sm font-sans py-2 text-text-tertiary cursor-not-allowed"
        data-testid="object-type-lamp"
      >
        Lamp
      </button>
    </div>
  );
});
