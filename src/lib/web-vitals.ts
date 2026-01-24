/**
 * Web Vitals measurement and reporting
 * Measures Core Web Vitals: CLS, FID, FCP, LCP, TTFB
 * Reports to PostHog analytics
 */

import type { Metric } from 'web-vitals';

/**
 * Web Vitals metric names for type safety
 * Note: FID is deprecated in favor of INP in web-vitals v4+
 */
export type WebVitalsMetricName = 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'INP';

/**
 * Processed metric data for reporting
 */
export interface WebVitalsMetricData {
  name: WebVitalsMetricName;
  value: number;
  delta: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
}

/**
 * Thresholds for Web Vitals ratings (in milliseconds, except CLS)
 * Based on Google's Core Web Vitals thresholds
 */
const THRESHOLDS: Record<WebVitalsMetricName, { good: number; poor: number }> = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

/**
 * Get rating for a metric value
 */
function getRating(name: WebVitalsMetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Process a raw metric into a standardized format
 */
function processMetric(metric: Metric): WebVitalsMetricData {
  const name = metric.name as WebVitalsMetricName;
  return {
    name,
    value: Math.round(name === 'CLS' ? metric.value * 1000 : metric.value),
    delta: Math.round(name === 'CLS' ? metric.delta * 1000 : metric.delta),
    id: metric.id,
    rating: metric.rating || getRating(name, metric.value),
    navigationType: metric.navigationType || 'unknown',
  };
}

/**
 * Report metric to PostHog
 */
function reportToPostHog(data: WebVitalsMetricData): void {
  if (typeof window === 'undefined') return;

  // Check if PostHog is available
  const posthog = (window as typeof window & { posthog?: { capture: (event: string, properties: Record<string, unknown>) => void } }).posthog;
  if (!posthog?.capture) return;

  posthog.capture('web_vitals', {
    metric_name: data.name,
    metric_value: data.value,
    metric_delta: data.delta,
    metric_id: data.id,
    metric_rating: data.rating,
    navigation_type: data.navigationType,
    page_url: window.location.pathname,
    // Include threshold context
    is_good: data.rating === 'good',
    is_poor: data.rating === 'poor',
  });
}

/**
 * Report metric to custom analytics endpoint
 */
async function reportToEndpoint(data: WebVitalsMetricData, endpoint: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const body = JSON.stringify({
      ...data,
      page: window.location.pathname,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    });

    // Use sendBeacon for reliability during page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, body);
    } else {
      await fetch(endpoint, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      });
    }
  } catch (error) {
    // Silently fail - don't impact user experience
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to report Web Vitals:', error);
    }
  }
}

/**
 * Combined metric handler
 */
function createMetricHandler(options: { endpoint?: string } = {}) {
  return (metric: Metric) => {
    const data = processMetric(metric);

    // Report to PostHog
    reportToPostHog(data);

    // Report to custom endpoint if provided
    if (options.endpoint) {
      reportToEndpoint(data, options.endpoint);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${data.name}: ${data.value} (${data.rating})`);
    }
  };
}

/**
 * Initialize Web Vitals measurement and reporting
 * Call this function once in your app's entry point
 *
 * @example
 * ```typescript
 * // In layout.tsx or _app.tsx
 * import { initWebVitals } from '@/lib/web-vitals';
 *
 * // Initialize with default PostHog reporting
 * initWebVitals();
 *
 * // Or with custom endpoint
 * initWebVitals({ endpoint: '/api/vitals' });
 * ```
 */
export async function initWebVitals(options: { endpoint?: string } = {}): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Dynamically import web-vitals to reduce bundle size
    // Note: FID is deprecated in web-vitals v4+, replaced by INP
    const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');

    const handler = createMetricHandler(options);

    // Register all metric handlers
    onCLS(handler);
    onFCP(handler);
    onLCP(handler);
    onTTFB(handler);
    onINP(handler);
  } catch (error) {
    // Silently fail if web-vitals fails to load
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to initialize Web Vitals:', error);
    }
  }
}

/**
 * Get Web Vitals summary for current page
 * Useful for debugging or displaying performance info
 */
export function getWebVitalsSummary(): Promise<Record<WebVitalsMetricName, number | null>> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({
        CLS: null,
        FCP: null,
        LCP: null,
        TTFB: null,
        INP: null,
      });
      return;
    }

    const metrics: Record<WebVitalsMetricName, number | null> = {
      CLS: null,
      FCP: null,
      LCP: null,
      TTFB: null,
      INP: null,
    };

    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      const handlers = { onCLS, onFCP, onLCP, onTTFB, onINP };
      let collected = 0;
      const total = 5;

      Object.entries(handlers).forEach(([, handler]) => {
        handler((metric) => {
          metrics[metric.name as WebVitalsMetricName] = metric.value;
          collected++;
          if (collected === total) {
            resolve(metrics);
          }
        });
      });

      // Resolve after timeout if not all metrics collected
      setTimeout(() => resolve(metrics), 10000);
    }).catch(() => resolve(metrics));
  });
}
