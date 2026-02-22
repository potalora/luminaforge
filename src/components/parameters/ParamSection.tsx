'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ParamSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/** Collapsible section wrapper with chevron toggle and accent bar */
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
        <span className="text-[10px] font-sans font-light text-text-secondary tracking-[0.2em] uppercase">
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
        <div
          className="flex flex-col gap-4 pb-4 pl-3 border-l-2 border-[var(--accent-primary)]/20"
          data-testid={`section-${title.toLowerCase()}-content`}
        >
          {children}
        </div>
      )}
    </div>
  );
});
