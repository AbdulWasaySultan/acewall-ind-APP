import { getApiInstance } from "./apiInstance";

export interface AppNotification {
  _id: string;
  recipient: string;
  sender?: string;
  message: string;
  type: "live-class" | "assignment" | "general" | "announcement" | "referral" | string;
  link?: string;
  isRead: boolean;
  isEnded?: boolean;
  createdAt: string;
}

export const getNotifications = async (): Promise<AppNotification[]> => {
  try {
    const api = await getApiInstance();
    const response = await api.get("/api/notifications/get");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || "Failed to fetch notifications");
    } else if (error.request) {
      throw new Error("No response from server. Please check your internet connection.");
    } else {
      throw new Error("Error setting up the request");
    }
  }
};

export const markNotificationRead = async (notificationId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(`/api/notifications/${notificationId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || "Failed to mark notification as read");
    } else if (error.request) {
      throw new Error("No response from server. Please check your internet connection.");
    } else {
      throw new Error("Error setting up the request");
    }
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const api = await getApiInstance();
    const response = await api.put("/api/notifications/mark-all");
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || "Failed to mark notifications as read");
    } else if (error.request) {
      throw new Error("No response from server. Please check your internet connection.");
    } else {
      throw new Error("Error setting up the request");
    }
  }
};
