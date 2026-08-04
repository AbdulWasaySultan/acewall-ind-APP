import axios from "axios";

/**
 * Turns an API error into something a user should actually see.
 *
 * `error.message` on an Axios error is NOT a user-facing message — it's a
 * generic string like "Request failed with status code 401" or "Network
 * Error", the same text for every failure of that kind regardless of what
 * actually went wrong. Code across this app used to do
 * `Toast.show(error.message || "Some friendly fallback")`, which never
 * worked as intended: `error.message` is always truthy for an HTTP error
 * response, so the friendly fallback never got a chance to run and users
 * saw the raw status-code string instead.
 *
 * This prefers the backend's own `data.message` (a real sentence meant for
 * display) when present, falls back to a network-specific message when the
 * request never got a response at all, and only then falls back to the
 * caller-supplied generic message — never to `error.message` itself.
 */
export const getFriendlyErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (axios.isAxiosError(error)) {
    const backendMessage = error.response?.data?.message;
    if (typeof backendMessage === "string" && backendMessage.trim()) {
      return backendMessage;
    }
    if (!error.response) {
      return "Network error. Please check your connection and try again.";
    }
    return fallback;
  }
  // Several service functions (see utils/apiError.ts's parseApiError, and
  // older ad-hoc handleApiError copies) already catch the raw AxiosError
  // and re-throw a plain Error carrying the extracted backend/network
  // message. axios.isAxiosError() is false for that plain Error, so without
  // this branch its message was silently discarded in favor of `fallback`
  // — the exact text those services went out of their way to produce.
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};
