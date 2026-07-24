import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import SimpleIcon from "./SimpleIcon";
import { useNotifications } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import { getNotificationIcon } from "../utils/notificationIcon";
import { resolveNotificationTarget } from "../utils/notificationLink";
import { AppNotification } from "../services/notification";

// Equivalent of web's NotificationDropdown.jsx — lives in the Drawer's
// global header (see AppNavigator.tsx screenOptions.headerRight).
const NotificationBell = () => {
  const navigation = useNavigation<any>();
  const { userRole } = useAuth();
  const { notifications, unreadCount, markRead, refetch } = useNotifications();
  const [open, setOpen] = useState(false);

  // Student-only feature, matching web (teachers have no notification UI
  // there at all — see TeacherTopNavDropDown.jsx, which has none).
  if (userRole !== "student") {
    return null;
  }

  const handlePressNotification = async (notification: AppNotification) => {
    setOpen(false);
    await markRead(notification._id);
    const target = resolveNotificationTarget(notification);
    if (target) {
      navigation.navigate(target.screen, target.params);
    }
    refetch();
  };

  return (
    <>
      <TouchableOpacity
        style={styles.bellButton}
        onPress={() => setOpen(true)}
        accessibilityLabel="Notifications"
      >
        <SimpleIcon name="bell" size={22} color="#fff" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>{unreadCount} New</Text>
                </View>
              )}
            </View>

            <FlatList
              data={notifications}
              keyExtractor={(item) => item._id}
              style={styles.list}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No notifications yet.</Text>
              }
              renderItem={({ item }) => {
                const icon = getNotificationIcon(item);
                return (
                  <TouchableOpacity
                    style={[styles.row, !item.isRead && styles.rowUnread]}
                    onPress={() => handlePressNotification(item)}
                  >
                    <SimpleIcon
                      name={icon.name}
                      size={20}
                      color={icon.color}
                      style={styles.rowIcon}
                    />
                    <View style={styles.rowTextWrap}>
                      <Text
                        style={[
                          styles.rowText,
                          !item.isRead && styles.rowTextUnread,
                        ]}
                        numberOfLines={2}
                      >
                        {item.message}
                      </Text>
                      <Text style={styles.rowTime}>
                        {new Date(item.createdAt).toLocaleString()}
                      </Text>
                    </View>
                    {!item.isRead && <View style={styles.dot} />}
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => {
                setOpen(false);
                navigation.navigate("Notifications");
              }}
            >
              <Text style={styles.footerButtonText}>View All Notifications</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bellButton: {
    marginRight: 12,
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    backgroundColor: "#DC2626",
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "flex-end",
  },
  panel: {
    marginTop: Platform.OS === "ios" ? 90 : 70,
    marginRight: 12,
    width: 320,
    maxWidth: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  panelTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  newBadge: {
    backgroundColor: "#DBEAFE",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newBadgeText: { fontSize: 11, fontWeight: "700", color: "#1D4ED8" },
  list: { maxHeight: 400 },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    paddingVertical: 24,
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  rowUnread: { backgroundColor: "#EFF6FF80" },
  rowIcon: { marginRight: 10, marginTop: 2 },
  rowTextWrap: { flex: 1 },
  rowText: { fontSize: 13, color: "#374151" },
  rowTextUnread: { fontWeight: "700", color: "#111827" },
  rowTime: { fontSize: 11, color: "#9CA3AF", marginTop: 4 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
    marginLeft: 6,
    marginTop: 6,
  },
  footerButton: {
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  footerButtonText: { fontSize: 13, fontWeight: "700", color: "#10B144" },
});

export default NotificationBell;
