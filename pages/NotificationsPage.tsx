import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import SimpleIcon from "../components/SimpleIcon";
import { useNotifications } from "../contexts/NotificationContext";
import {
  getNotificationIcon,
  getNotificationActionText,
} from "../utils/notificationIcon";
import { resolveNotificationTarget } from "../utils/notificationLink";
import { AppNotification } from "../services/notification";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Equivalent of web's NotificationsPage.jsx (the full "Notification Center").
const NotificationsPage = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    notifications,
    loading,
    refetch,
    markRead,
    markAllRead,
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handlePress = async (notification: AppNotification) => {
    if (notification.isEnded) return;
    if (!notification.isRead) {
      await markRead(notification._id);
    }
    const target = resolveNotificationTarget(notification);
    if (target) {
      (navigation as any).navigate(target.screen, target.params);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notification Center</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark All as Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && notifications.length === 0 ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="large" color="#10B144" />
          <Text style={styles.stateText}>Loading alerts...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.stateWrap}>
              <SimpleIcon name="bell" size={40} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>You're all caught up!</Text>
            </View>
          }
          renderItem={({ item }) => {
            const icon = getNotificationIcon(item);
            const actionText = getNotificationActionText(item);
            return (
              <TouchableOpacity
                style={[styles.card, !item.isRead && styles.cardUnread]}
                onPress={() => handlePress(item)}
                disabled={item.isEnded}
                activeOpacity={item.isEnded ? 1 : 0.7}
              >
                <View style={styles.cardTop}>
                  <SimpleIcon
                    name={icon.name}
                    size={22}
                    color={icon.color}
                    style={styles.cardIcon}
                  />
                  <View style={styles.cardTextWrap}>
                    <Text
                      style={[
                        styles.cardMessage,
                        !item.isRead && styles.cardMessageUnread,
                      ]}
                    >
                      {item.message}
                    </Text>
                    <View style={styles.cardMetaRow}>
                      <SimpleIcon name="calendar" size={12} color="#9CA3AF" />
                      <Text style={styles.cardDate}>
                        {new Date(item.createdAt).toLocaleDateString("en-US")}
                      </Text>
                    </View>
                  </View>
                </View>

                {item.isEnded ? (
                  <View style={styles.endedBadge}>
                    <Text style={styles.endedBadgeText}>Meeting Ended</Text>
                  </View>
                ) : (
                  <View style={styles.actionRow}>
                    <Text style={styles.actionText}>{actionText} →</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  markAllText: { fontSize: 13, fontWeight: "700", color: "#10B144" },
  stateWrap: { alignItems: "center", padding: 48 },
  stateText: { color: "#6B7280", marginTop: 8, fontSize: 13 },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: "#6B7280", marginTop: 10 },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 14,
    marginBottom: 10,
  },
  cardUnread: {
    backgroundColor: "#EFF6FF20",
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start" },
  cardIcon: { marginRight: 10, marginTop: 2 },
  cardTextWrap: { flex: 1 },
  cardMessage: { fontSize: 14, color: "#374151" },
  cardMessageUnread: { fontWeight: "700", fontSize: 15, color: "#111827" },
  cardMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 4 },
  cardDate: { fontSize: 11, color: "#9CA3AF" },
  actionRow: { marginTop: 10, alignItems: "flex-end" },
  actionText: { fontSize: 12, fontWeight: "700", color: "#10B144" },
  endedBadge: {
    marginTop: 10,
    alignSelf: "flex-end",
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  endedBadgeText: { fontSize: 11, fontWeight: "700", color: "#9CA3AF" },
});

export default NotificationsPage;
