/**
 * Structured Logger for Attunly
 *
 * Provides consistent, JSON-formatted logging with request IDs,
 * service context, and structured metadata for debugging.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  service?: 'slack' | 'email' | 'api' | 'auth' | 'meetings' | 'notifications' | 'billing' | 'stripe-webhook' | 'billing-enforcement' | 'organizations-api' | 'pods-api' | 'analytics' | 'admin' | 'calendar' | 'lingo-translator';
  requestId?: string;
  userId?: string;
  action?: string;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service?: string;
  requestId?: string;
  userId?: string;
  action?: string;
  message: string;
  [key: string]: any;
}

function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

function formatLogEntry(level: LogLevel, message: string, context: LogContext = {}): LogEntry {
  const { service, requestId, userId, action, ...rest } = context;

  return {
    timestamp: new Date().toISOString(),
    level,
    ...(service && { service }),
    ...(requestId && { requestId }),
    ...(userId && { userId }),
    ...(action && { action }),
    message,
    ...rest
  };
}

function log(level: LogLevel, message: string, context: LogContext = {}): void {
  const entry = formatLogEntry(level, message, context);
  const json = JSON.stringify(entry);

  switch (level) {
    case 'error':
      console.error(json);
      break;
    case 'warn':
      console.warn(json);
      break;
    case 'debug':
      if (process.env.NODE_ENV === 'development') {
        console.log(json);
      }
      break;
    default:
      console.log(json);
  }
}

/**
 * Create a logger instance with preset context
 */
export function createLogger(baseContext: LogContext = {}) {
  const requestId = baseContext.requestId || generateRequestId();
  const ctx = { ...baseContext, requestId };

  return {
    requestId,

    debug: (message: string, extra: Record<string, any> = {}) =>
      log('debug', message, { ...ctx, ...extra }),

    info: (message: string, extra: Record<string, any> = {}) =>
      log('info', message, { ...ctx, ...extra }),

    warn: (message: string, extra: Record<string, any> = {}) =>
      log('warn', message, { ...ctx, ...extra }),

    error: (message: string, extra: Record<string, any> = {}) =>
      log('error', message, { ...ctx, ...extra }),

    /**
     * Create a child logger with additional context
     */
    child: (childContext: LogContext) =>
      createLogger({ ...ctx, ...childContext }),
  };
}

/**
 * Quick logging functions for simple cases
 */
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),

  /**
   * Create a service-specific logger
   */
  forService: (service: LogContext['service']) => createLogger({ service }),
};

export { generateRequestId };
export type { LogContext, LogLevel };
