export interface GeometryResult {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
}

export type LampExportPart = 'combined' | 'base' | 'shade';

export interface GeometryWorkerAPI {
  generateVase(params: import('./design').VaseParams): Promise<GeometryResult>;
  exportSTL(params: import('./design').VaseParams): Promise<ArrayBuffer>;
  generateLamp(params: import('./design').LampParams): Promise<GeometryResult>;
  exportLampSTL(params: import('./design').LampParams, part: LampExportPart): Promise<ArrayBuffer>;
}
