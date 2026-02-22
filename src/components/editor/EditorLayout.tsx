'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { ViewportContainer } from '@/components/viewport/ViewportContainer';
import { ParameterPanel } from '@/components/parameters/ParameterPanel';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/** Main editor composition: sidebar (parameter panel) + 3D viewport */
export function EditorLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary">
      {/* Desktop sidebar */}
      {isDesktop && (
        <aside className="w-[280px] flex-shrink-0 bg-bg-secondary border-r border-bg-tertiary overflow-y-auto">
          <ParameterPanel />
        </aside>
      )}

      {/* 3D Viewport — hero element, takes remaining space */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        <ViewportContainer />

        {/* Mobile: parameters toggle button */}
        {!isDesktop && (
          <button
            onClick={() => setMobileOpen(true)}
            className="absolute bottom-6 left-6 flex items-center gap-2
              bg-bg-elevated/90 backdrop-blur text-text-secondary
              font-sans text-sm px-4 py-2.5 rounded-lg
              shadow-lg hover:text-text-primary transition-colors z-10"
          >
            <Settings size={16} />
            Parameters
          </button>
        )}

        {/* Mobile: slide-up overlay */}
        {!isDesktop && mobileOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-20"
              onClick={() => setMobileOpen(false)}
            />
            {/* Panel */}
            <div className="fixed bottom-0 left-0 right-0 z-30
              bg-bg-secondary rounded-t-xl max-h-[70vh] overflow-y-auto
              shadow-lg border-t border-bg-tertiary">
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-bg-elevated" />
              </div>
              <ParameterPanel />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
