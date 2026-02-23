'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Comlink from 'comlink';
import type { GeometryResult, GeometryWorkerAPI, LampExportPart } from '@/types/geometry';
import { useDesignStore } from '@/store/designStore';

const DEBOUNCE_MS = 150;

export function useGeometryWorker(): {
  geometry: GeometryResult | null;
  isGenerating: boolean;
  error: string | null;
  exportSTL: (lampPart?: LampExportPart) => Promise<void>;
} {
  const [geometry, setGeometry] = useState<GeometryResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const apiRef = useRef<Comlink.Remote<GeometryWorkerAPI> | null>(null);
  const generationIdRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize worker once
  useEffect(() => {
    const worker = new Worker(
      new URL('../generators/worker.ts', import.meta.url)
    );
    workerRef.current = worker;
    apiRef.current = Comlink.wrap<GeometryWorkerAPI>(worker);

    return () => {
      worker.terminate();
      workerRef.current = null;
      apiRef.current = null;
    };
  }, []);

  // Subscribe to param changes and trigger debounced generation
  const objectType = useDesignStore((s) => s.objectType);
  const vaseParams = useDesignStore((s) => s.params);
  const lampParams = useDesignStore((s) => s.lampParams);

  useEffect(() => {
    setIsGenerating(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const api = apiRef.current;
      if (!api) return;

      const thisGeneration = ++generationIdRef.current;

      try {
        let result: GeometryResult;
        if (objectType === 'lamp') {
          result = await api.generateLamp(lampParams);
        } else {
          result = await api.generateVase(vaseParams);
        }

        // Discard stale results
        if (thisGeneration !== generationIdRef.current) return;

        setGeometry(result);
        setError(null);
      } catch (err) {
        // Discard stale errors
        if (thisGeneration !== generationIdRef.current) return;

        setError(err instanceof Error ? err.message : String(err));
        // Keep previous geometry on error — viewport doesn't go blank
      } finally {
        if (thisGeneration === generationIdRef.current) {
          setIsGenerating(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [objectType, vaseParams, lampParams]);

  const exportSTL = useCallback(async (lampPart?: LampExportPart) => {
    const api = apiRef.current;
    if (!api) return;

    try {
      setIsGenerating(true);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

      let stlBuffer: ArrayBuffer;
      let filename: string;

      if (objectType === 'lamp') {
        const part = lampPart ?? 'combined';
        stlBuffer = await api.exportLampSTL(lampParams, part);
        const partSuffix = part === 'combined' ? '' : `-${part}`;
        filename = `luminaforge-lamp${partSuffix}-${timestamp}.stl`;
      } else {
        stlBuffer = await api.exportSTL(vaseParams);
        filename = `luminaforge-vase-${timestamp}.stl`;
      }

      const blob = new Blob([stlBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGenerating(false);
    }
  }, [objectType, vaseParams, lampParams]);

  return { geometry, isGenerating, error, exportSTL };
}
