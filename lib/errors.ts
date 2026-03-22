/**
 * Centralized error utilities.
 *
 * - getUserFriendlyError: always returns a safe, human-readable string
 * - reportError: single place to log errors; swap body for Sentry / LogRocket later
 */

/**
 * Returns a safe user-facing message.
 * Never exposes raw backend/internal error text.
 */
export function getUserFriendlyError(err: unknown, fallback: string): string {
  return fallback
}

/**
 * Logs errors for debugging. Structured so it can be replaced with
 * Sentry.captureException / LogRocket.captureException / App Insights etc.
 */
export function reportError(
  err: unknown,
  context?: Record<string, unknown>
): void {
  console.error("[App Error]", context ?? {}, err)
}