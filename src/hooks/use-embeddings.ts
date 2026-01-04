"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  generateEmbedding,
  preloadModel,
  isModelReady,
  isModelLoading,
} from '@/lib/embeddings';

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

  // Check if already ready
  useEffect(() => {
    if (isModelReady()) {
      setReady(true);
      return;
    }

    if (isModelLoading()) {
      setLoading(true);
    }

    // Preload the model
    setLoading(true);
    preloadModel()
      .then(() => {
        setReady(true);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  const embed = useCallback(async (text: string): Promise<number[]> => {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    setGenerating(true);
    setError(null);

    try {
      const embedding = await generateEmbedding(text);
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
