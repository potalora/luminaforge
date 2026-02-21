export interface GeometryResult {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
}

export interface GeometryWorkerAPI {
  generateVase(params: import('./design').VaseParams): Promise<GeometryResult>;
  exportSTL(params: import('./design').VaseParams): Promise<ArrayBuffer>;
}
