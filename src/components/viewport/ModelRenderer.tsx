'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { GeometryResult } from '@/types/geometry';
import { useDesignStore } from '@/store/designStore';

interface ModelRendererProps {
  geometry: GeometryResult | null;
}

/** Renders GeometryResult as a Three.js mesh with appropriate material per object type */
export const ModelRenderer = React.memo(function ModelRenderer({
  geometry,
}: ModelRendererProps) {
  const objectType = useDesignStore((s) => s.objectType);
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
    geom.computeVertexNormals();
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
    <mesh ref={meshRef} geometry={bufferGeometry} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      {objectType === 'lamp' ? (
        <meshPhysicalMaterial
          color="#D4A574"
          roughness={0.3}
          transmission={0.4}
          thickness={2}
          ior={1.5}
        />
      ) : (
        <meshStandardMaterial
          color="#C4784A"
          roughness={0.65}
          metalness={0.03}
        />
      )}
    </mesh>
  );
});
