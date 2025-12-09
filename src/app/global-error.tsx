"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-6">
              We've been notified about this issue and are working to fix it.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => reset()} variant="default">
                Try again
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="outline">
                Go home
              </Button>
            </div>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-4">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
