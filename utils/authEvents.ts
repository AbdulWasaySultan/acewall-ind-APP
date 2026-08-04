// Minimal pub-sub so services outside the React tree (e.g. apiInstance.ts's
// response interceptor) can signal "the current session is no longer valid"
// without importing AuthContext directly (which would create an import
// cycle and doesn't work from plain axios interceptor code anyway).
// AuthContext subscribes to this once and calls its own logout() in
// response, which flips isAuthenticated and lets the navigator swap back to
// the login stack on its own.

type UnauthorizedListener = () => void;

const listeners = new Set<UnauthorizedListener>();

export const onUnauthorized = (listener: UnauthorizedListener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const emitUnauthorized = () => {
  listeners.forEach((listener) => listener());
};
