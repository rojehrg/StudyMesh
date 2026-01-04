'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, createContext, useContext, useCallback, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { EVENTS, type EventName } from '@/lib/analytics/events';

// Initialize PostHog
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // We capture manually for SPA
    capture_pageleave: true,
    autocapture: true,
    persistence: 'localStorage',
  });
}

// Page view tracker component
function PostHogPageView(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url = url + '?' + searchParams.toString();
      }
      posthog.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

// Analytics context for easy access
interface AnalyticsContextType {
  track: (event: EventName, properties?: Record<string, any>) => void;
  identify: (userId: string, properties?: Record<string, any>) => void;
  reset: () => void;
  isConfigured: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  track: () => {},
  identify: () => {},
  reset: () => {},
  isConfigured: false,
});

export function useAnalytics() {
  return useContext(AnalyticsContext);
}

// Re-export events for convenience
export { EVENTS };

// Provider component
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const isConfigured = !!process.env.NEXT_PUBLIC_POSTHOG_KEY;

  const track = useCallback((event: EventName, properties?: Record<string, any>) => {
    if (isConfigured) {
      posthog.capture(event, properties);
    }
  }, [isConfigured]);

  const identify = useCallback((userId: string, properties?: Record<string, any>) => {
    if (isConfigured) {
      posthog.identify(userId, properties);
    }
  }, [isConfigured]);

  const reset = useCallback(() => {
    if (isConfigured) {
      posthog.reset();
    }
  }, [isConfigured]);

  const contextValue: AnalyticsContextType = {
    track,
    identify,
    reset,
    isConfigured,
  };

  if (!isConfigured) {
    return (
      <AnalyticsContext.Provider value={contextValue}>
        {children}
      </AnalyticsContext.Provider>
    );
  }

  return (
    <PHProvider client={posthog}>
      <AnalyticsContext.Provider value={contextValue}>
        <Suspense fallback={null}>
          <PostHogPageView />
        </Suspense>
        {children}
      </AnalyticsContext.Provider>
    </PHProvider>
  );
}
