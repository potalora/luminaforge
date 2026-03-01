import * as Comlink from 'comlink';
import { serialize } from '@jscad/stl-serializer';
import type { VaseParams } from '@/types/design';
import type { GeometryResult, GeometryWorkerAPI } from '@/types/geometry';
import { generateVase } from './vase/vaseGenerator';
import { convertGeom3ToGeometryResult } from './shared/geometryConverter';

function concatenateBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
  const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of buffers) {
    result.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }
  return result.buffer;
}

const api: GeometryWorkerAPI = {
  async generateVase(params: VaseParams): Promise<GeometryResult> {
    const geom = generateVase(params);
    const result = convertGeom3ToGeometryResult(geom);
    return Comlink.transfer(result, [
      result.positions.buffer,
      result.normals.buffer,
      result.indices.buffer,
    ]);
  },

  async exportSTL(params: VaseParams): Promise<ArrayBuffer> {
    const exportParams: VaseParams = {
      ...params,
      resolution: Math.max(params.resolution, 128),
    };
    const geom = generateVase(exportParams);
    const buffers = serialize({ binary: true }, geom);
    const combined = concatenateBuffers(buffers);
    return Comlink.transfer(combined, [combined]);
  },
};

Comlink.expose(api);
