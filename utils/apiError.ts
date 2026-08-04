/**
 * Central service-layer error parser.
 *
 * Several service modules used to each define their own near-identical
 * `handleApiError` copy (rating.ts, message.ts, support.ts, student.ts —
 * same three branches, slightly different wording every time). This is the
 * one shared implementation: turn whatever axios threw into a single
 * `Error` carrying the best available message, for the caller to `throw`.
 *
 * Returns rather than throws so call sites stay explicit (`throw
 * parseApiError(...)`) instead of relying on an inferred `never` return
 * type to make control flow work.
 */
export const parseApiError = (error: any, defaultMessage: string): Error => {
  console.error(`${defaultMessage}:`, error);

  if (error?.response) {
    const message =
      error.response.data?.message || error.response.data?.error || defaultMessage;
    return new Error(message);
  }
  if (error?.request) {
    return new Error(
      "No response from server. Please check your internet connection."
    );
  }
  return new Error(error?.message ? `Error: ${error.message}` : defaultMessage);
};
