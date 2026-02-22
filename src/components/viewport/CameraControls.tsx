'use client';

import React from 'react';
import { OrbitControls } from '@react-three/drei';
import { useViewportStore } from '@/store/viewportStore';

/** OrbitControls with damping and clamped polar angle */
export const CameraControls = React.memo(function CameraControls() {
  const autoRotate = useViewportStore((s) => s.autoRotate);

  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minPolarAngle={Math.PI * 0.1}
      maxPolarAngle={Math.PI * 0.85}
      minDistance={50}
      maxDistance={600}
      autoRotate={autoRotate}
      autoRotateSpeed={1.5}
    />
  );
});
