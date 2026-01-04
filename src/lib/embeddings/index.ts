/**
 * Embedding Service using Transformers.js
 *
 * Runs entirely in the browser - no API costs.
 * Model: all-MiniLM-L6-v2 (~23MB, cached in IndexedDB)
 * Dimensions: 384
 */

// Singleton embedder instance
let embedder: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

/**
 * Get or initialize the embedding model
 * Model downloads once and is cached in IndexedDB
 */
export async function getEmbedder(): Promise<any> {
  // Only run in browser
  if (typeof window === 'undefined') {
    throw new Error('Embeddings can only be generated in the browser');
  }

  if (embedder) {
    return embedder;
  }

  if (loadPromise) {
    return loadPromise;
  }

  isLoading = true;

  // Dynamic import to avoid SSR issues
  loadPromise = (async () => {
    const { pipeline, env } = await import('@xenova/transformers');

    // Configure for browser usage
    env.allowLocalModels = false;
    env.useBrowserCache = true;

    const model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      progress_callback: (progress: { status: string; progress?: number }) => {
        if (progress.status === 'progress' && progress.progress) {
          console.log(`Loading embedding model: ${Math.round(progress.progress)}%`);
        }
      },
    });

    return model;
  })();

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
  if (typeof window === 'undefined') {
    throw new Error('Embeddings can only be generated in the browser');
  }

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
  if (typeof window === 'undefined') {
    return; // Skip on server
  }
  await getEmbedder();
}
