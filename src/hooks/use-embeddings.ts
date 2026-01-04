"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseEmbeddingsReturn {
  /** Whether the model is ready to use */
  ready: boolean;
  /** Whether the model is currently loading */
  loading: boolean;
  /** Whether an embedding is being generated */
  generating: boolean;
  /** Generate an embedding for the given text */
  embed: (text: string) => Promise<number[]>;
  /** Any error that occurred */
  error: Error | null;
}

/**
 * React hook for generating embeddings client-side
 *
 * The model (~23MB) is downloaded once and cached in IndexedDB.
 * First load takes a few seconds, subsequent loads are instant.
 */
export function useEmbeddings(): UseEmbeddingsReturn {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const embeddingsModuleRef = useRef<typeof import('@/lib/embeddings') | null>(null);

  // Lazy load the embeddings module
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    let cancelled = false;

    const loadEmbeddings = async () => {
      setLoading(true);
      try {
        // Dynamic import to avoid SSR issues
        const embeddingsModule = await import('@/lib/embeddings');
        embeddingsModuleRef.current = embeddingsModule;

        if (cancelled) return;

        // Check if already ready
        if (embeddingsModule.isModelReady()) {
          setReady(true);
          setLoading(false);
          return;
        }

        // Preload the model
        await embeddingsModule.preloadModel();

        if (cancelled) return;

        setReady(true);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error('Failed to load embeddings'));
        setLoading(false);
      }
    };

    loadEmbeddings();

    return () => {
      cancelled = true;
    };
  }, []);

  const embed = useCallback(async (text: string): Promise<number[]> => {
    if (typeof window === 'undefined') {
      throw new Error('Embeddings can only be generated in the browser');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    setGenerating(true);
    setError(null);

    try {
      // Ensure module is loaded
      if (!embeddingsModuleRef.current) {
        embeddingsModuleRef.current = await import('@/lib/embeddings');
      }

      const embedding = await embeddingsModuleRef.current.generateEmbedding(text);
      return embedding;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate embedding');
      setError(error);
      throw error;
    } finally {
      setGenerating(false);
    }
  }, []);

  return {
    ready,
    loading,
    generating,
    embed,
    error,
  };
}
