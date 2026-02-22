'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import type { GeometryResult } from '@/types/geometry';
import { SceneLighting } from './SceneLighting';
import { ModelRenderer } from './ModelRenderer';
import { CameraControls } from './CameraControls';
import { GridFloor } from './GridFloor';
import { DisplayPlate } from './DisplayPlate';

interface ViewportCanvasProps {
  geometry: GeometryResult | null;
  vaseHeight?: number;
  plateRadius?: number;
}

/** R3F Canvas with camera, lighting, model, controls, grid, and plate */
export const ViewportCanvas = React.memo(function ViewportCanvas({
  geometry,
  vaseHeight = 150,
  plateRadius = 55,
}: ViewportCanvasProps) {
  const targetY = vaseHeight / 2;

  return (
    <Canvas
      camera={{ position: [220, 180, 220], fov: 35, near: 1, far: 2000 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#0D0D0F' }}
    >
      <SceneLighting />
      <ModelRenderer geometry={geometry} />
      <CameraControls targetY={targetY} />
      <GridFloor />
      <DisplayPlate radius={plateRadius} />
    </Canvas>
  );
});
