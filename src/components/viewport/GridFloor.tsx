'use client';

import React from 'react';
import { Grid } from '@react-three/drei';
import { useViewportStore } from '@/store/viewportStore';

/** Subtle dark grid on the floor plane */
export const GridFloor = React.memo(function GridFloor() {
  const showGrid = useViewportStore((s) => s.showGrid);

  if (!showGrid) return null;

  return (
    <Grid
      position={[0, -0.1, 0]}
      args={[500, 500]}
      cellSize={10}
      cellThickness={0.5}
      cellColor="#1A1A1E"
      sectionSize={50}
      sectionThickness={0.8}
      sectionColor="#222226"
      fadeDistance={400}
      fadeStrength={1}
      infiniteGrid
    />
  );
});
