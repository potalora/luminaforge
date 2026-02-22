'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { GeometryResult } from '@/types/geometry';

interface ModelRendererProps {
  geometry: GeometryResult | null;
}

/** Renders GeometryResult as a Three.js mesh with MeshStandardMaterial */
export const ModelRenderer = React.memo(function ModelRenderer({
  geometry,
}: ModelRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const prevGeomRef = useRef<THREE.BufferGeometry | null>(null);

  const bufferGeometry = useMemo(() => {
    if (!geometry) return null;

    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      'position',
      new THREE.BufferAttribute(geometry.positions, 3)
    );
    geom.setAttribute(
      'normal',
      new THREE.BufferAttribute(geometry.normals, 3)
    );
    geom.setIndex(new THREE.BufferAttribute(geometry.indices, 1));
    return geom;
  }, [geometry]);

  // Dispose previous geometry when replaced
  useEffect(() => {
    const prev = prevGeomRef.current;
    if (prev && prev !== bufferGeometry) {
      prev.dispose();
    }
    prevGeomRef.current = bufferGeometry;
  }, [bufferGeometry]);

  // Dispose on unmount
  useEffect(() => {
    return () => {
      prevGeomRef.current?.dispose();
    };
  }, []);

  if (!bufferGeometry) return null;

  return (
    <mesh ref={meshRef} geometry={bufferGeometry} castShadow receiveShadow>
      <meshStandardMaterial
        color="#D4C4A8"
        roughness={0.7}
        metalness={0.05}
        flatShading
      />
    </mesh>
  );
});
