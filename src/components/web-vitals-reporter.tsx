"use client";

import { useEffect } from "react";

/**
 * Web Vitals Reporter Component
 * Initializes Web Vitals measurement on the client side
 * Uses dynamic import to avoid blocking the main bundle
 */
export function WebVitalsReporter() {
  useEffect(() => {
    // Dynamically import and initialize Web Vitals
    // This prevents the web-vitals library from blocking initial page load
    const initVitals = async () => {
      try {
        const { initWebVitals } = await import("@/lib/web-vitals");
        await initWebVitals();
      } catch (error) {
        // Silently fail - Web Vitals is non-critical
        if (process.env.NODE_ENV === "development") {
          console.warn("Failed to initialize Web Vitals:", error);
        }
      }
    };

    // Use requestIdleCallback to further reduce impact on page load
    if ("requestIdleCallback" in window) {
      (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(initVitals, { timeout: 5000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(initVitals, 2000);
    }
  }, []);

  // This component renders nothing - it only initializes measurement
  return null;
}
