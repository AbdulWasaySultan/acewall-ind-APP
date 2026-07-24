// Matches web's NotificationDropdown.jsx / NotificationsPage.jsx
// getNotificationIcon: substring match on `type` then `message`, lowercased.
export interface NotificationLike {
  type?: string;
  message?: string;
}

export const getNotificationIcon = (
  notification: NotificationLike
): { name: string; color: string } => {
  const combined = `${notification.type || ""} ${notification.message || ""}`.toLowerCase();

  if (combined.includes("live") || combined.includes("meeting")) {
    return { name: "video", color: "#16A34A" };
  }
  if (
    combined.includes("lesson") ||
    combined.includes("course") ||
    combined.includes("material")
  ) {
    return { name: "book", color: "#2563EB" };
  }
  if (combined.includes("message") || combined.includes("chat")) {
    return { name: "chat", color: "#9333EA" };
  }
  if (combined.includes("event") || combined.includes("schedule")) {
    return { name: "calendar", color: "#EA580C" };
  }
  return { name: "info", color: "#6B7280" };
};

// Matches web's NotificationsPage.jsx actionText per type.
export const getNotificationActionText = (notification: NotificationLike): string => {
  const combined = `${notification.type || ""} ${notification.message || ""}`.toLowerCase();

  if (combined.includes("live") || combined.includes("meeting")) return "Join Meeting Now";
  if (
    combined.includes("lesson") ||
    combined.includes("course") ||
    combined.includes("material")
  ) {
    return "View Lesson";
  }
  if (combined.includes("message") || combined.includes("chat")) return "View Message";
  if (combined.includes("event") || combined.includes("schedule")) return "View Event";
  return "View Details";
};
