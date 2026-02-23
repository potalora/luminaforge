'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Download, ChevronUp } from 'lucide-react';
import type { LampExportPart } from '@/types/geometry';

interface ExportButtonProps {
  onExport: (lampPart?: LampExportPart) => Promise<void>;
  isGenerating: boolean;
  objectType?: 'vase' | 'lamp';
}

const LAMP_EXPORT_OPTIONS: { part: LampExportPart; label: string }[] = [
  { part: 'combined', label: 'Combined' },
  { part: 'base', label: 'Base Only' },
  { part: 'shade', label: 'Shade Only' },
];

/** Floating amber export button in bottom-right of viewport.
 *  Shows a dropdown with part options when objectType is 'lamp'. */
export const ExportButton = React.memo(function ExportButton({
  onExport,
  isGenerating,
  objectType = 'vase',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const disabled = isExporting || isGenerating;

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [dropdownOpen]);

  const handleExport = useCallback(async (lampPart?: LampExportPart) => {
    if (disabled) return;
    setDropdownOpen(false);
    setIsExporting(true);
    try {
      await onExport(lampPart);
    } finally {
      setIsExporting(false);
    }
  }, [onExport, disabled]);

  const handleVaseClick = useCallback(() => {
    handleExport();
  }, [handleExport]);

  const handleLampButtonClick = useCallback(() => {
    if (disabled) return;
    setDropdownOpen((prev) => !prev);
  }, [disabled]);

  // Vase mode: simple button (unchanged behavior)
  if (objectType !== 'lamp') {
    return (
      <button
        onClick={handleVaseClick}
        disabled={disabled}
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
  }

  // Lamp mode: button with dropdown
  return (
    <div ref={containerRef} className="absolute bottom-6 right-6 z-10">
      {/* Dropdown menu — positioned above the button */}
      {dropdownOpen && (
        <div
          className="absolute bottom-full right-0 mb-2 min-w-[160px]
            rounded-lg overflow-hidden
            border border-white/[0.06]
            shadow-xl"
          style={{ backgroundColor: 'var(--bg-elevated)' }}
        >
          {LAMP_EXPORT_OPTIONS.map(({ part, label }) => (
            <button
              key={part}
              onClick={() => handleExport(part)}
              className="w-full text-left px-4 py-2.5
                font-sans text-sm
                transition-colors duration-150
                first:rounded-t-lg last:rounded-b-lg"
              style={{
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(224, 138, 60, 0.15)';
                e.currentTarget.style.color = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Main button */}
      <button
        onClick={handleLampButtonClick}
        disabled={disabled}
        className="flex items-center gap-2
          bg-accent-primary hover:bg-accent-secondary
          text-bg-primary font-sans text-sm font-medium
          px-5 py-2.5 rounded-lg
          shadow-lg hover:shadow-glow
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download size={16} />
        {isExporting ? 'Exporting...' : 'Export STL'}
        <ChevronUp
          size={14}
          className="transition-transform duration-200"
          style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
    </div>
  );
});
