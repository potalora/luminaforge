'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import type { GeometryResult } from '@/types/geometry';
import { SceneLighting } from './SceneLighting';
import { ModelRenderer } from './ModelRenderer';
import { CameraControls } from './CameraControls';
import { GridFloor } from './GridFloor';

interface ViewportCanvasProps {
  geometry: GeometryResult | null;
}

/** R3F Canvas with camera, lighting, model, controls, and grid */
export const ViewportCanvas = React.memo(function ViewportCanvas({
  geometry,
}: ViewportCanvasProps) {
  return (
    <Canvas
      camera={{ position: [200, 150, 200], fov: 35, near: 1, far: 2000 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#0D0D0F' }}
    >
      <SceneLighting />
      <ModelRenderer geometry={geometry} />
      <CameraControls />
      <GridFloor />
    </Canvas>
  );
});
