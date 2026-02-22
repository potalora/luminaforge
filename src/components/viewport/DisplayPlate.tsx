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
    <mesh position={[0, -1, 0]} receiveShadow>
      <cylinderGeometry args={[radius, radius, 2, 64]} />
      <meshStandardMaterial
        color="#1A1714"
        roughness={0.9}
        metalness={0.02}
      />
    </mesh>
  );
});
