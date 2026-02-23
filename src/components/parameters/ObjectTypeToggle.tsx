'use client';

import React from 'react';
import { useDesignStore } from '@/store/designStore';

/** Vase/Lamp segmented control */
export const ObjectTypeToggle = React.memo(function ObjectTypeToggle() {
  const objectType = useDesignStore((s) => s.objectType);
  const setObjectType = useDesignStore((s) => s.setObjectType);

  return (
    <div className="flex bg-bg-tertiary rounded-sm overflow-hidden">
      <button
        onClick={() => setObjectType('vase')}
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
        onClick={() => setObjectType('lamp')}
        className={`flex-1 text-sm font-sans py-2 transition-colors ${
          objectType === 'lamp'
            ? 'bg-accent-primary/15 text-accent-primary'
            : 'text-text-secondary hover:text-text-primary'
        }`}
        data-testid="object-type-lamp"
      >
        Lamp
      </button>
    </div>
  );
});
