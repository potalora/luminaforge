'use client';

import React from 'react';

interface DisplayPlateProps {
  radius: number;
}

/** Flat display plate beneath the vase — warm dark material */
export const DisplayPlate = React.memo(function DisplayPlate({
  radius,
}: DisplayPlateProps) {
  return (
    <mesh position={[0, -1.5, 0]} receiveShadow>
      <cylinderGeometry args={[radius, radius, 3, 64]} />
      <meshStandardMaterial
        color="#2A2420"
        roughness={0.9}
        metalness={0.08}
      />
    </mesh>
  );
});
