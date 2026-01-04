// Web Worker for generating embeddings
// This runs in a separate thread, avoiding React hook conflicts

import { pipeline, env } from '@xenova/transformers';

// Configure for browser usage
env.allowLocalModels = false;
env.useBrowserCache = true;

// Singleton pattern for the pipeline
class EmbeddingPipeline {
  static instance: any = null;

  static async getInstance(progress_callback?: (progress: any) => void) {
    if (this.instance === null) {
      this.instance = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { progress_callback });
    }
    return this.instance;
  }
}

// Handle messages from main thread
self.addEventListener('message', async (event) => {
  const { type, text, id } = event.data;

  if (type === 'generate') {
    try {
      // Get the pipeline (loads model on first call)
      const embedder = await EmbeddingPipeline.getInstance((progress) => {
        self.postMessage({ type: 'progress', progress, id });
      });

      // Generate embedding
      const output = await embedder(text, {
        pooling: 'mean',
        normalize: true,
      });

      // Send result back
      self.postMessage({
        type: 'result',
        embedding: Array.from(output.data as Float32Array),
        id,
      });
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        id,
      });
    }
  }

  if (type === 'preload') {
    try {
      await EmbeddingPipeline.getInstance((progress) => {
        self.postMessage({ type: 'progress', progress, id });
      });
      self.postMessage({ type: 'ready', id });
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : 'Failed to load model',
        id,
      });
    }
  }
});
