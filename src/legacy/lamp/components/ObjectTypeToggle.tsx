'use client';

import React from 'react';
import { useDesignStore } from '@/store/designStore';
import type { ObjectType } from '@/types/design';

/** Vase/Lamp segmented control — prominent capsule with solid active state */
export const ObjectTypeToggle = React.memo(function ObjectTypeToggle() {
  const objectType = useDesignStore((s) => s.objectType);
  const setObjectType = useDesignStore((s) => s.setObjectType);

  const items: { type: ObjectType; label: string }[] = [
    { type: 'vase', label: 'Vase' },
    { type: 'lamp', label: 'Lamp' },
  ];

  return (
    <div className="flex bg-bg-tertiary rounded-lg p-1 gap-1">
      {items.map(({ type, label }) => {
        const active = objectType === type;
        return (
          <button
            key={type}
            onClick={() => setObjectType(type)}
            className={`flex-1 py-2.5 text-sm font-sans font-medium rounded-md transition-all ${
              active
                ? 'bg-accent-primary text-bg-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50'
            }`}
            data-testid={`object-type-${type}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
});
