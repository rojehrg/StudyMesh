/**
 * Centralized API Utilities
 *
 * Provides standardized error handling, response formatting,
 * and authentication helpers for API routes.
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodSchema, ZodIssue } from "zod";
import * as Sentry from "@sentry/nextjs";
import { getUserOrgContext, type UserOrgContext } from "@/lib/rbac";
import { createLogger } from "@/lib/logger";

const log = createLogger({ service: "api" });

// ============================================
// ERROR TYPES
// ============================================

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "BAD_REQUEST"
  | "SERVICE_UNAVAILABLE";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

// HTTP status codes for error types
const ERROR_STATUS_CODES: Record<ApiErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  BAD_REQUEST: 400,
  SERVICE_UNAVAILABLE: 503,
};

// User-friendly error messages
const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  UNAUTHORIZED: "Authentication required",
  FORBIDDEN: "You don't have permission to perform this action",
  NOT_FOUND: "Resource not found",
  VALIDATION_ERROR: "Invalid input provided",
  CONFLICT: "Resource already exists",
  RATE_LIMITED: "Too many requests. Please try again later.",
  INTERNAL_ERROR: "An unexpected error occurred",
  BAD_REQUEST: "Invalid request",
  SERVICE_UNAVAILABLE: "Service temporarily unavailable",
};

// ============================================
// RESPONSE HELPERS
// ============================================

/**
 * Create a successful JSON response
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Create an error JSON response
 */
export function apiError(
  code: ApiErrorCode,
  customMessage?: string,
  details?: Record<string, unknown>
): NextResponse {
  const status = ERROR_STATUS_CODES[code];
  const message = customMessage || ERROR_MESSAGES[code];

  // Log errors (but not validation errors which are expected)
  if (code !== "VALIDATION_ERROR" && code !== "UNAUTHORIZED") {
    log.error("API error", { code, message, details });
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

/**
 * Create a validation error response from Zod errors
 */
export function apiValidationError(error: ZodError): NextResponse {
  const fieldErrors = error.issues.map((e: ZodIssue) => ({
    field: e.path.join("."),
    message: e.message,
  }));

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input provided",
        details: { fields: fieldErrors },
      },
    },
    { status: 422 }
  );
}

// ============================================
// REQUEST VALIDATION
// ============================================

/**
 * Parse and validate request JSON body against a Zod schema
 */
export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const json = await request.json();
    const result = schema.safeParse(json);

    if (!result.success) {
      return { data: null, error: apiValidationError(result.error) };
    }

    return { data: result.data, error: null };
  } catch (err) {
    // JSON parsing error
    return {
      data: null,
      error: apiError("BAD_REQUEST", "Invalid JSON in request body"),
    };
  }
}

/**
 * Parse and validate URL search params against a Zod schema
 */
export function parseSearchParams<T>(
  request: Request,
  schema: ZodSchema<T>
): { data: T; error: null } | { data: null; error: NextResponse } {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  const result = schema.safeParse(params);

  if (!result.success) {
    return { data: null, error: apiValidationError(result.error) };
  }

  return { data: result.data, error: null };
}

// ============================================
// AUTHENTICATION HELPERS
// ============================================

/**
 * Require authenticated user context for API routes
 * Returns the context or an error response
 */
export async function requireAuth(): Promise<
  { context: UserOrgContext; error: null } | { context: null; error: NextResponse }
> {
  const context = await getUserOrgContext();

  if (!context) {
    return { context: null, error: apiError("UNAUTHORIZED") };
  }

  return { context, error: null };
}

/**
 * Require authenticated user with specific organization
 */
export async function requireOrgAuth(): Promise<
  { context: UserOrgContext & { organizationId: string }; error: null } | { context: null; error: NextResponse }
> {
  const context = await getUserOrgContext();

  if (!context) {
    return { context: null, error: apiError("UNAUTHORIZED") };
  }

  if (!context.organizationId) {
    return {
      context: null,
      error: apiError("FORBIDDEN", "User must belong to an organization"),
    };
  }

  return {
    context: context as UserOrgContext & { organizationId: string },
    error: null,
  };
}

// ============================================
// ERROR WRAPPER
// ============================================

type ApiHandler<T = unknown> = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse<T>>;

/**
 * Wrap an API handler with centralized error handling
 *
 * Catches all errors and returns appropriate API responses.
 * Reports errors to Sentry in production.
 *
 * Usage:
 * ```ts
 * export const GET = withErrorHandling(async (request) => {
 *   const { context, error } = await requireAuth();
 *   if (error) return error;
 *
 *   // Your logic here
 *   return apiSuccess({ data: "hello" });
 * });
 * ```
 */
export function withErrorHandling<T>(handler: ApiHandler<T>): ApiHandler<T> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      // Log the error
      log.error("Unhandled API error", {
        error: error instanceof Error ? error.message : "Unknown error",
        path: request.url,
        method: request.method,
      });

      // Report to Sentry in production
      if (process.env.NODE_ENV === "production" && error instanceof Error) {
        Sentry.captureException(error, {
          extra: {
            path: request.url,
            method: request.method,
          },
        });
      }

      // Check for specific error types
      if (error instanceof ZodError) {
        return apiValidationError(error) as NextResponse<T>;
      }

      // Return generic internal error
      return apiError("INTERNAL_ERROR") as NextResponse<T>;
    }
  };
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Standard API success response type
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Standard API error response type
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

/**
 * Union type for API responses
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
