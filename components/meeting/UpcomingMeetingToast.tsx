import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { openZoomMeeting } from "../../utils/linking";
import { zoomService } from "../../services/zoomMeeting";

interface Props {
  meetingId: string;
  topic: string;
  scheduledAt: string;
  isLive?: boolean;
}

export const UpcomingMeetingToast: React.FC<Props> = ({
  meetingId,
  topic,
  scheduledAt,
  isLive,
}) => {
  const handleJoin = async () => {
    try {
      const { url } = await zoomService.joinMeeting(meetingId);
      if (url) await openZoomMeeting(url);
    } catch (error) {
      console.error("Failed to join meeting:", error);
    }
  };

  return (
    <View style={[styles.toastContainer, isLive && styles.liveToastContainer]}>
      <View style={styles.textContainer}>
        <Text style={styles.statusText}>
          {isLive ? "🔴 Live Class in Progress" : "📅 Upcoming Meeting"}
        </Text>
        <Text style={styles.topicText} numberOfLines={1}>
          {topic}
        </Text>
        <Text style={styles.timeText}>
          {new Date(scheduledAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
      <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
        <Text style={styles.joinBtnText}>Join Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  liveToastContainer: {
    backgroundColor: "#f0fdf4",
    borderColor: "#22c55e",
  },
  textContainer: { flex: 1 },
  statusText: { fontSize: 12, fontWeight: "bold", color: "#1e40af" },
  topicText: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  timeText: { fontSize: 12, color: "#64748b" },
  joinBtn: {
    backgroundColor: "#10B144",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  joinBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
});