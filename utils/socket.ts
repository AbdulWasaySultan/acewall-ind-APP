import { io, Socket } from "socket.io-client";

// Matches web's App.jsx socket setup exactly: userId passed as a connect-time
// query param, no separate "join"/"register" emit needed — the backend reads
// `socket.handshake.query.userId` and maps it to the socket id itself
// (see backend/src/lib/socket.io.js).
export const connectSocket = (userId: string, baseUrl: string): Socket => {
  // No forced `transports` — let socket.io-client negotiate the same way
  // web's client does (long-polling first, then upgrade to websocket if
  // available). Forcing websocket-only skips that negotiation and fails
  // outright on infrastructure that doesn't support a raw upgrade (proxies,
  // some hosting setups), which is what caused the "websocket error".
  return io(baseUrl, {
    query: { userId },
  });
};
