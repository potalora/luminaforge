'use client';

import React from 'react';

/** 3-point lighting rig: warm key, cool fill, subtle rim + ambient */
export const SceneLighting = React.memo(function SceneLighting() {
  return (
    <>
      {/* Warm key light — upper right front */}
      <directionalLight
        position={[150, 200, 100]}
        intensity={1.2}
        color="#FFF0DD"
        castShadow
      />
      {/* Cool fill light — left side */}
      <directionalLight
        position={[-120, 80, -60]}
        intensity={0.4}
        color="#C8D8E8"
      />
      {/* Subtle rim light — behind */}
      <directionalLight
        position={[0, 100, -150]}
        intensity={0.3}
        color="#E0D8D0"
      />
      {/* Low ambient so shadows aren't pitch black */}
      <ambientLight intensity={0.15} color="#F0EDE8" />
    </>
  );
});
