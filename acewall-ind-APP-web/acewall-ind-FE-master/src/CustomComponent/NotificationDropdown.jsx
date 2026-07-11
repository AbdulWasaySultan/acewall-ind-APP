import React, { useState, useEffect } from "react";
import { Bell, Video, BookOpen, MessageSquare, Calendar, Info, Check, Trash2 } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const getNotificationIcon = (n) => {
  const type = (n.type || "").toLowerCase();
  const msg = (n.message || "").toLowerCase();

  if (type.includes("live") || type.includes("meeting") || msg.includes("meeting") || msg.includes("live")) {
    return { Icon: Video, bg: "bg-green-100", text: "text-green-600" };
  } else if (type.includes("lesson") || type.includes("course") || msg.includes("lesson") || msg.includes("course") || type.includes("material")) {
    return { Icon: BookOpen, bg: "bg-blue-100", text: "text-blue-600" };
  } else if (type.includes("message") || msg.includes("message") || type.includes("chat")) {
    return { Icon: MessageSquare, bg: "bg-purple-100", text: "text-purple-600" };
  } else if (type.includes("event") || msg.includes("event") || msg.includes("schedule")) {
    return { Icon: Calendar, bg: "bg-orange-100", text: "text-orange-600" };
  } else {
    return { Icon: Info, bg: "bg-gray-100", text: "text-gray-600" };
  }
};

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/notifications/get");
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (notif) => {
    try {
      // If your backend is router.put("/:id", ...), this is correct:
      await axiosInstance.put(`/notifications/${notif._id}`);

      setIsOpen(false);

      // This will now navigate to /student/mycourses/live-meeting/ID
      navigate(notif.link);

      fetchNotifications();
    } catch (err) {
      console.error("Check the Network tab to see the failed URL:", err);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell size={22} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Notifications</h3>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                {unreadCount} New
              </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 italic">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 border-b hover:bg-blue-50 cursor-pointer transition-colors flex items-start gap-3 ${
                      !n.isRead ? "bg-blue-50/30" : "bg-white"
                    }`}
                  >
                    {(() => {
                      const { Icon, bg, text } = getNotificationIcon(n);
                      return (
                        <div className={`p-2 rounded-full ${bg}`}>
                          <Icon size={16} className={text} />
                        </div>
                      );
                    })()}
                    <div className="flex-1">
                      <p
                        className={`text-sm ${
                          !n.isRead
                            ? "font-semibold text-gray-900"
                            : "text-gray-600"
                        }`}
                      >
                        {n.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => {
                navigate("/notifications");
                setIsOpen(false);
              }}
              className="w-full p-3 text-center text-sm font-semibold text-blue-600 hover:bg-gray-50 transition-colors border-t"
            >
              View All Notifications
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
