import * as Sentry from "@sentry/nextjs";
import { toast } from "sonner";

// Error types
export type ErrorCode =
  | "AUTH_ERROR"
  | "NETWORK_ERROR"
  | "NOT_FOUND"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

// User-friendly error messages
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  AUTH_ERROR: "Please sign in to continue",
  NETWORK_ERROR: "Unable to connect. Please check your internet connection and try again.",
  NOT_FOUND: "The requested resource was not found",
  PERMISSION_DENIED: "You don't have permission to perform this action",
  VALIDATION_ERROR: "Please check your input and try again",
  SERVER_ERROR: "Something went wrong on our end. Please try again later.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
};

// Map common error patterns to error codes
export function getErrorCode(error: unknown): ErrorCode {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Auth errors
    if (
      message.includes("unauthorized") ||
      message.includes("unauthenticated") ||
      message.includes("auth") ||
      message.includes("jwt") ||
      message.includes("token")
    ) {
      return "AUTH_ERROR";
    }

    // Network errors
    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("timeout") ||
      message.includes("connection")
    ) {
      return "NETWORK_ERROR";
    }

    // Not found
    if (
      message.includes("not found") ||
      message.includes("404") ||
      message.includes("does not exist")
    ) {
      return "NOT_FOUND";
    }

    // Permission errors
    if (
      message.includes("permission") ||
      message.includes("forbidden") ||
      message.includes("403")
    ) {
      return "PERMISSION_DENIED";
    }

    // Validation errors
    if (
      message.includes("validation") ||
      message.includes("invalid") ||
      message.includes("required")
    ) {
      return "VALIDATION_ERROR";
    }

    // Server errors
    if (message.includes("500") || message.includes("server error")) {
      return "SERVER_ERROR";
    }
  }

  return "UNKNOWN_ERROR";
}

// Get user-friendly message
export function getUserMessage(error: unknown): string {
  const code = getErrorCode(error);
  return ERROR_MESSAGES[code];
}

// Handle error with logging and user feedback
interface HandleErrorOptions {
  showToast?: boolean;
  toastTitle?: string;
  context?: Record<string, unknown>;
  silent?: boolean;
}

export function handleError(
  error: unknown,
  options: HandleErrorOptions = {}
): void {
  const {
    showToast = true,
    toastTitle = "Error",
    context = {},
    silent = false,
  } = options;

  const errorCode = getErrorCode(error);
  const userMessage = getUserMessage(error);

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", error);
    console.error("Code:", errorCode);
    console.error("Context:", context);
  }

  // Report to Sentry in production
  if (process.env.NODE_ENV === "production" && error instanceof Error) {
    Sentry.captureException(error, {
      extra: {
        errorCode,
        ...context,
      },
      tags: {
        errorCode,
      },
    });
  }

  // Show toast notification
  if (showToast && !silent) {
    toast.error(toastTitle, {
      description: userMessage,
    });
  }
}

// Async error wrapper
export async function tryCatch<T>(
  fn: () => Promise<T>,
  options: HandleErrorOptions = {}
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, options);
    return null;
  }
}

// Supabase-specific error handling
export function handleSupabaseError(
  error: { message?: string; code?: string } | null,
  options: HandleErrorOptions = {}
): boolean {
  if (!error) return false;

  const errorObj = new Error(error.message || "Database error");

  // Add Supabase-specific context
  handleError(errorObj, {
    ...options,
    context: {
      ...options.context,
      supabaseCode: error.code,
    },
  });

  return true;
}

// Create error with code
export class AppError extends Error {
  code: ErrorCode;
  context?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode = "UNKNOWN_ERROR",
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.context = context;
  }
}
