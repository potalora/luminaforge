import { geometries } from '@jscad/modeling';
import type { Geom3, Vec3 } from '@jscad/modeling';
import type { GeometryResult } from '@/types/geometry';

/**
 * Convert a JSCAD Geom3 object to a GeometryResult suitable for Three.js BufferGeometry.
 *
 * Algorithm:
 * 1. Extract polygons from the Geom3
 * 2. Fan-triangulate each polygon (vertex 0, i, i+1 for i=1..n-2)
 * 3. Compute per-face normals via cross product, normalize
 * 4. Two-pass: count triangles first, allocate exact-size typed arrays, then fill
 * 5. Flat shading — indices are sequential [0, 1, 2, 3, 4, 5, ...]
 */
export function convertGeom3ToGeometryResult(geom: Geom3): GeometryResult {
  const polygons = geometries.geom3.toPolygons(geom);

  // Pass 1: count total triangles
  let triangleCount = 0;
  for (const poly of polygons) {
    const vertexCount = poly.vertices.length;
    if (vertexCount >= 3) {
      triangleCount += vertexCount - 2;
    }
  }

  // Allocate exact-size typed arrays
  const vertexCount = triangleCount * 3;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const indices = new Uint32Array(vertexCount);

  // Pass 2: fill arrays
  let vertexIndex = 0;

  for (const poly of polygons) {
    const verts = poly.vertices;
    if (verts.length < 3) continue;

    // Fan-triangulate: (v0, v1, v2), (v0, v2, v3), ...
    for (let i = 1; i < verts.length - 1; i++) {
      const v0 = verts[0];
      const v1 = verts[i];
      const v2 = verts[i + 1];

      // Compute face normal via cross product of edges
      const normal = computeFaceNormal(v0, v1, v2);

      // Write 3 vertices for this triangle
      writeVertex(positions, normals, vertexIndex, v0, normal);
      writeVertex(positions, normals, vertexIndex + 1, v1, normal);
      writeVertex(positions, normals, vertexIndex + 2, v2, normal);

      // Sequential indices (flat shading)
      indices[vertexIndex] = vertexIndex;
      indices[vertexIndex + 1] = vertexIndex + 1;
      indices[vertexIndex + 2] = vertexIndex + 2;

      vertexIndex += 3;
    }
  }

  return { positions, normals, indices };
}

function writeVertex(
  positions: Float32Array,
  normals: Float32Array,
  index: number,
  vertex: Vec3,
  normal: Vec3
): void {
  const offset = index * 3;
  positions[offset] = vertex[0];
  positions[offset + 1] = vertex[1];
  positions[offset + 2] = vertex[2];
  normals[offset] = normal[0];
  normals[offset + 1] = normal[1];
  normals[offset + 2] = normal[2];
}

/**
 * Compute a normalized face normal from three vertices.
 * Falls back to [0, 0, 1] for degenerate triangles (zero-area).
 */
function computeFaceNormal(v0: Vec3, v1: Vec3, v2: Vec3): Vec3 {
  // Edge vectors
  const e1x = v1[0] - v0[0];
  const e1y = v1[1] - v0[1];
  const e1z = v1[2] - v0[2];
  const e2x = v2[0] - v0[0];
  const e2y = v2[1] - v0[1];
  const e2z = v2[2] - v0[2];

  // Cross product
  const nx = e1y * e2z - e1z * e2y;
  const ny = e1z * e2x - e1x * e2z;
  const nz = e1x * e2y - e1y * e2x;

  const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

  if (len === 0) {
    // Degenerate triangle — fallback normal
    return [0, 0, 1];
  }

  return [nx / len, ny / len, nz / len];
}
