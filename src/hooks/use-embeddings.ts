"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseEmbeddingsReturn {
  ready: boolean;
  loading: boolean;
  generating: boolean;
  embed: (text: string) => Promise<number[]>;
  error: Error | null;
}

/**
 * React hook for generating embeddings client-side using Web Worker
 * This isolates the transformers.js code from React to avoid hook conflicts
 */
export function useEmbeddings(): UseEmbeddingsReturn {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const callbacksRef = useRef<Map<string, { resolve: (value: number[]) => void; reject: (error: Error) => void }>>(new Map());

  // Initialize worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setLoading(true);

    // Create worker
    workerRef.current = new Worker(
      new URL('../lib/embeddings/worker.ts', import.meta.url),
      { type: 'module' }
    );

    // Handle messages from worker
    workerRef.current.onmessage = (event) => {
      const { type, id, embedding, error: errorMsg, progress } = event.data;

      if (type === 'ready') {
        setReady(true);
        setLoading(false);
      }

      if (type === 'progress' && progress?.status === 'progress') {
        // Model loading progress
        console.log(`Loading model: ${Math.round(progress.progress || 0)}%`);
      }

      if (type === 'result') {
        const callback = callbacksRef.current.get(id);
        if (callback) {
          callback.resolve(embedding);
          callbacksRef.current.delete(id);
        }
        setGenerating(false);
      }

      if (type === 'error') {
        const callback = callbacksRef.current.get(id);
        if (callback) {
          callback.reject(new Error(errorMsg));
          callbacksRef.current.delete(id);
        }
        setError(new Error(errorMsg));
        setGenerating(false);
        setLoading(false);
      }
    };

    // Preload the model
    workerRef.current.postMessage({ type: 'preload', id: 'preload' });

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const embed = useCallback(async (text: string): Promise<number[]> => {
    if (typeof window === 'undefined') {
      throw new Error('Embeddings can only be generated in the browser');
    }

    if (!workerRef.current) {
      throw new Error('Worker not initialized');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    setGenerating(true);
    setError(null);

    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(7);
      callbacksRef.current.set(id, { resolve, reject });
      workerRef.current!.postMessage({ type: 'generate', text, id });
    });
  }, []);

  return {
    ready,
    loading,
    generating,
    embed,
    error,
  };
}
