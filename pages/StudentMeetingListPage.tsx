import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { zoomService, ZoomMeeting } from "../services/zoomMeeting";
import { openZoomMeeting } from "../utils/linking";
import SimpleIcon from "../components/SimpleIcon";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, "StudentMeetingsByCourse">;

const statusColors: Record<string, { accent: string; badgeBg: string; badgeText: string }> = {
  active: { accent: "#16A34A", badgeBg: "#DCFCE7", badgeText: "#166534" },
  ended: { accent: "#9CA3AF", badgeBg: "#F3F4F6", badgeText: "#4B5563" },
  scheduled: { accent: "#2563EB", badgeBg: "#DBEAFE", badgeText: "#1D4ED8" },
};

const StudentMeetingListPage = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { courseId, courseTitle } = route.params;

  const [meetings, setMeetings] = useState<ZoomMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    try {
      setError(null);
      const res = await zoomService.getCourseMeetings(courseId);
      setMeetings(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load meetings.");
      setMeetings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseId]);

  useFocusEffect(
    useCallback(() => {
      fetchMeetings();
    }, [fetchMeetings])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMeetings();
  }, [fetchMeetings]);

  const handleJoin = async (meetingId: string) => {
    setJoiningId(meetingId);
    try {
      const { url } = await zoomService.joinMeeting(meetingId);
      if (url) {
        await openZoomMeeting(url);
      }
    } catch (err) {
      console.error("Failed to join meeting:", err);
    } finally {
      setJoiningId(null);
    }
  };

  const renderDateTime = (scheduledAt: string) => {
    const date = new Date(scheduledAt);
    if (isNaN(date.getTime())) {
      return <Text style={styles.invalidDate}>Invalid Date</Text>;
    }
    return (
      <Text style={styles.metaText}>
        {date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        {"  ·  "}
        {date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <SimpleIcon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {courseTitle || "Course Meetings"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator size="large" color="#10B144" />
          </View>
        ) : error ? (
          <View style={styles.stateWrap}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : meetings.length === 0 ? (
          <View style={styles.stateWrap}>
            <Text style={styles.emptyTitle}>No meetings scheduled</Text>
            <Text style={styles.emptySubtitle}>
              The instructor hasn't scheduled any live sessions for this
              course yet.
            </Text>
          </View>
        ) : (
          meetings.map((m) => {
            const colors = statusColors[m.status || "scheduled"] || statusColors.scheduled;
            const isEnded = m.status === "ended";
            const isActive = m.status === "active";
            return (
              <View
                key={m._id}
                style={[styles.card, { borderLeftColor: colors.accent }]}
              >
                <View style={styles.cardTopRow}>
                  <Text style={styles.topic} numberOfLines={2}>
                    {m.topic}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: colors.badgeBg }]}>
                    <Text style={[styles.badgeText, { color: colors.badgeText }]}>
                      {(m.status || "scheduled").toUpperCase()}
                    </Text>
                  </View>
                </View>
                {renderDateTime(m.scheduledAt)}
                <Text style={styles.durationPill}>
                  {m.duration} Minutes Session
                </Text>
                {isEnded ? (
                  <View style={styles.endedButton}>
                    <Text style={styles.endedButtonText}>Session Ended</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.joinButton,
                      { backgroundColor: isActive ? "#16A34A" : "#2563EB" },
                    ]}
                    onPress={() => handleJoin(m._id)}
                    disabled={joiningId === m._id}
                  >
                    <Text style={styles.joinButtonText}>
                      {joiningId === m._id
                        ? "Joining..."
                        : isActive
                        ? "Join Now"
                        : "Join Session"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    minHeight: 56,
    backgroundColor: "#10B144",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 44 : 16,
    paddingBottom: 12,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", flex: 1 },
  backButton: { padding: 4, marginRight: 12 },
  container: { flex: 1, padding: 16 },
  stateWrap: { alignItems: "center", padding: 40 },
  errorText: { color: "#DC2626", textAlign: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#374151" },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  topic: { fontSize: 16, fontWeight: "700", color: "#111827", flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  metaText: { fontSize: 13, color: "#6B7280", marginBottom: 4 },
  invalidDate: { fontSize: 13, color: "#DC2626", marginBottom: 4 },
  durationPill: {
    fontSize: 12,
    color: "#374151",
    backgroundColor: "#F3F4F6",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 10,
  },
  joinButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  joinButtonText: { color: "#fff", fontWeight: "700" },
  endedButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#E5E7EB",
  },
  endedButtonText: { color: "#6B7280", fontWeight: "700" },
});

export default StudentMeetingListPage;
