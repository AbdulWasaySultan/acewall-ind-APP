import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  AppNotification,
} from "../services/notification";
import { connectSocket } from "../utils/socket";
import { getStoredBaseUrl } from "../utils/storage";

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  refetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Matches web's NotificationDropdown.jsx polling interval exactly.
const POLL_INTERVAL_MS = 30000;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user, userRole } = useAuth();
  // Student-only feature — matches web exactly: the notification bell/page
  // only exists under /student/* routes there (teachers have no
  // notification UI at all, not even a filtered one).
  const isStudent = userRole === "student";
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const teardown = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    if (!isAuthenticated || !user?._id || !isStudent) {
      // Logged out (or previewing without a real user), or a teacher
      // account — tear down so a stale socket/timer from the previous
      // session/role never leaks into the next login, and don't fetch or
      // connect at all for a role that has no notification UI.
      teardown();
      setNotifications([]);
      return;
    }

    let cancelled = false;

    const setup = async () => {
      await fetchNotifications();
      if (cancelled) return;

      pollRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);

      // Live delivery while the app is foregrounded — additive on top of
      // polling, not a web-parity requirement (web never wired a listener
      // for this event despite the backend emitting it).
      const baseUrl = await getStoredBaseUrl();
      if (baseUrl && !cancelled) {
        const socket = connectSocket(user._id, baseUrl);
        socketRef.current = socket;

        socket.on("newNotification", (payload: any) => {
          if (payload?._id) {
            setNotifications((prev) => [payload, ...prev]);
          } else {
            // Bulk-notification payload (announcements/discussions/posts)
            // omits _id/isRead/createdAt — just refetch instead of trying
            // to splice a partial object into state.
            fetchNotifications();
          }
        });
        socket.on("connect_error", (err: any) => {
          console.error("Notification socket connection error:", err);
        });
      }
    };

    setup();

    return () => {
      cancelled = true;
      teardown();
    };
  }, [isAuthenticated, user?._id, isStudent, fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refetch: fetchNotifications,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return ctx;
};
