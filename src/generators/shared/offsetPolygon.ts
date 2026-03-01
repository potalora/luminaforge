/**
 * Offset a closed polygon inward along vertex normals by `offset` distance.
 * Uses averaged edge normals (miter) at each vertex, with miter distance
 * capped to prevent spikes at sharp corners. Points are clamped to
 * `minRadius` from the origin to prevent wall collapse.
 *
 * Assumes counter-clockwise winding (which all cross-section generators produce).
 */
export function offsetPolygonInward(
  points: [number, number][],
  offset: number,
  minRadius: number
): [number, number][] {
  const n = points.length;
  const result: [number, number][] = [];

  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];

    // Edge vectors
    const dx1 = curr[0] - prev[0];
    const dy1 = curr[1] - prev[1];
    const dx2 = next[0] - curr[0];
    const dy2 = next[1] - curr[1];
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    if (len1 < 1e-10 || len2 < 1e-10) {
      result.push(curr);
      continue;
    }

    // Inward normals for CCW polygon: rotate edge 90° CCW → (-dy, dx)
    const n1x = -dy1 / len1;
    const n1y = dx1 / len1;
    const n2x = -dy2 / len2;
    const n2y = dx2 / len2;

    // Average normal direction
    let nx = n1x + n2x;
    let ny = n1y + n2y;
    const nlen = Math.sqrt(nx * nx + ny * ny);

    if (nlen < 1e-10) {
      // Edges are parallel — use either normal
      nx = n1x;
      ny = n1y;
    } else {
      nx /= nlen;
      ny /= nlen;
    }

    // Miter distance: offset / cos(half-angle between edges)
    // Capped to 2× offset to prevent spikes at sharp corners
    const cosHalf = n1x * nx + n1y * ny;
    const miterOffset = cosHalf > 0.25 ? offset / cosHalf : offset * 2;

    let newX = curr[0] + nx * miterOffset;
    let newY = curr[1] + ny * miterOffset;

    // Clamp minimum radius to prevent collapse
    const r = Math.sqrt(newX * newX + newY * newY);
    if (r < minRadius) {
      const scale = minRadius / r;
      newX *= scale;
      newY *= scale;
    }

    result.push([newX, newY]);
  }

  return result;
}
