/**
 * Embedding Service using Transformers.js
 *
 * Runs entirely in the browser - no API costs.
 * Model: all-MiniLM-L6-v2 (~23MB, cached in IndexedDB)
 * Dimensions: 384
 */

import { pipeline, env } from '@xenova/transformers';

// Configure for browser usage
env.allowLocalModels = false;
env.useBrowserCache = true;

// Pipeline type for feature extraction
type FeatureExtractionPipeline = Awaited<ReturnType<typeof pipeline<'feature-extraction'>>>;

// Singleton embedder instance
let embedder: FeatureExtractionPipeline | null = null;
let isLoading = false;
let loadPromise: Promise<FeatureExtractionPipeline> | null = null;

/**
 * Get or initialize the embedding model
 * Model downloads once and is cached in IndexedDB
 */
export async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (embedder) {
    return embedder;
  }

  if (loadPromise) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    progress_callback: (progress: { status: string; progress?: number }) => {
      if (progress.status === 'progress' && progress.progress) {
        console.log(`Loading embedding model: ${Math.round(progress.progress)}%`);
      }
    },
  });

  try {
    embedder = await loadPromise;
    isLoading = false;
    return embedder;
  } catch (error) {
    loadPromise = null;
    isLoading = false;
    throw error;
  }
}

/**
 * Generate an embedding for the given text
 * Returns a 384-dimensional vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  const model = await getEmbedder();

  // Generate embedding with mean pooling and normalization
  const output = await model(text, {
    pooling: 'mean',
    normalize: true,
  });

  // Convert Float32Array to regular array
  return Array.from(output.data as Float32Array);
}

/**
 * Check if the model is currently loading
 */
export function isModelLoading(): boolean {
  return isLoading;
}

/**
 * Check if the model is ready
 */
export function isModelReady(): boolean {
  return embedder !== null;
}

/**
 * Preload the model (call early to reduce latency)
 */
export async function preloadModel(): Promise<void> {
  await getEmbedder();
}
