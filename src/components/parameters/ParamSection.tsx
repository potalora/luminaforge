'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ParamSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/** Collapsible section wrapper with chevron toggle */
export const ParamSection = React.memo(function ParamSection({
  title,
  defaultOpen = true,
  children,
}: ParamSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between py-2 group"
        data-testid={`section-${title.toLowerCase()}`}
        aria-expanded={isOpen}
      >
        <span className="text-xs font-sans text-text-tertiary tracking-widest uppercase">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={`text-text-tertiary transition-transform duration-200 ${
            isOpen ? '' : '-rotate-90'
          }`}
        />
      </button>
      {isOpen && (
        <div className="flex flex-col gap-4 pb-4" data-testid={`section-${title.toLowerCase()}-content`}>
          {children}
        </div>
      )}
    </div>
  );
});
