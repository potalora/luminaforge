// Minimal type declarations for @jscad/modeling
// The published types are incomplete — this fills the gaps

declare module '@jscad/modeling' {
  export const primitives: {
    circle: (options: { radius: number; segments?: number }) => Geom2;
    cylinder: (options: {
      radius?: number;
      height?: number;
      segments?: number;
      center?: [number, number, number];
    }) => Geom3;
    sphere: (options: { radius?: number; segments?: number }) => Geom3;
    cuboid: (options: {
      size?: [number, number, number];
      center?: [number, number, number];
    }) => Geom3;
  };

  export const transforms: {
    translate: (offset: [number, number, number], ...geometries: Geom3[]) => Geom3;
    rotate: (angles: [number, number, number], ...geometries: Geom3[]) => Geom3;
    rotateX: (angle: number, ...geometries: Geom3[]) => Geom3;
    rotateY: (angle: number, ...geometries: Geom3[]) => Geom3;
    rotateZ: (angle: number, ...geometries: Geom3[]) => Geom3;
    scale: (factors: [number, number, number], ...geometries: Geom3[]) => Geom3;
    center: (options: { axes: [boolean, boolean, boolean] }, ...geometries: Geom3[]) => Geom3;
  };

  export const booleans: {
    union: (...geometries: Geom3[]) => Geom3;
    subtract: (...geometries: Geom3[]) => Geom3;
    intersect: (...geometries: Geom3[]) => Geom3;
  };

  export interface Slice {
    vertices: Vec3[];
  }

  export const extrusions: {
    extrudeLinear: (
      options: {
        height?: number;
        twistAngle?: number;
        twistSteps?: number;
      },
      geometry: Geom2
    ) => Geom3;
    extrudeRotate: (
      options: { segments?: number; angle?: number },
      geometry: Geom2
    ) => Geom3;
    extrudeFromSlices: (
      options: {
        numberOfSlices: number;
        capStart?: boolean;
        capEnd?: boolean;
        callback: (progress: number, index: number, base: Slice) => Slice;
      },
      baseSlice: Slice
    ) => Geom3;
    slice: {
      fromPoints: (points: Vec3[]) => Slice;
    };
  };

  export const geometries: {
    geom2: {
      fromPoints: (points: [number, number][]) => Geom2;
      toPoints: (geometry: Geom2) => [number, number][];
    };
    geom3: {
      toPolygons: (geometry: Geom3) => Polygon[];
    };
    poly3: {
      toVertices: (polygon: Polygon) => Vec3[];
    };
  };

  export const maths: {
    vec3: {
      subtract: (out: Vec3, a: Vec3, b: Vec3) => Vec3;
      cross: (out: Vec3, a: Vec3, b: Vec3) => Vec3;
      normalize: (out: Vec3, a: Vec3) => Vec3;
      create: () => Vec3;
    };
  };

  export type Vec3 = [number, number, number];
  export interface Geom2 {
    sides: any[];
    transforms: any;
  }
  export interface Geom3 {
    polygons: Polygon[];
    transforms: any;
  }
  export interface Polygon {
    vertices: Vec3[];
  }
}

declare module '@jscad/stl-serializer' {
  import type { Geom3 } from '@jscad/modeling';
  export function serialize(
    options: { binary?: boolean },
    ...geometries: Geom3[]
  ): ArrayBuffer[];
}
