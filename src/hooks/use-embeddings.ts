"use client";

import { useState, useCallback } from 'react';

interface UseEmbeddingsReturn {
  ready: boolean;
  loading: boolean;
  generating: boolean;
  embed: (text: string) => Promise<number[]>;
  error: Error | null;
}

/**
 * React hook for generating embeddings via Hugging Face API
 * Uses server-side API route to avoid bundling issues
 */
export function useEmbeddings(): UseEmbeddingsReturn {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const embed = useCallback(async (text: string): Promise<number[]> => {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate embedding');
      }

      const { embedding } = await response.json();
      return embedding;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setGenerating(false);
    }
  }, []);

  return {
    ready: true, // Always ready since we use server-side API
    loading: false, // No model to load
    generating,
    embed,
    error,
  };
}
