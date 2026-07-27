import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Video,
  Calendar,
  Clock,
  Trash2,
  PlayCircle,
  StopCircle,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react-native";
import { zoomService, ZoomMeeting } from "../services/zoomMeeting";
import { openZoomMeeting } from "../utils/linking";
import { useNavigation } from "@react-navigation/native";
import SimpleIcon from "../components/SimpleIcon";

interface Props {
  route: { params: { courseId: string } };
}

// Native Date Helpers
const formatDateForInput = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day}/${year} ${hours}:${minutes}`;
};

const parseDateFromInput = (formattedString: string): Date => {
  if (!formattedString) return new Date();
  const [datePart, timePart] = formattedString.split(" ");
  if (!datePart) return new Date();

  const [month, day, year] = datePart.split("/").map(Number);
  let hours = 0;
  let minutes = 0;

  if (timePart) {
    [hours, minutes] = timePart.split(":").map(Number);
  }

  const parsedDate = new Date(year, month - 1, day, hours, minutes);
  return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};

const formatDateForDisplay = (dateString: string) => {
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) {
    return { dateStr: "Invalid Date", timeStr: "" };
  }
  const dateStr = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeStr = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dateStr, timeStr };
};

export const ScheduleMeetingPage: React.FC<Props> = ({ route }) => {
  const { courseId } = route.params;
  const navigation = useNavigation();

  // Form State
  const [topic, setTopic] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("60");

  // Date Picker States
  const [selectedDateObj, setSelectedDateObj] = useState<Date>(new Date());
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Data State
  const [meetings, setMeetings] = useState<ZoomMeeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch Meetings
  const fetchMeetings = useCallback(async () => {
    setFetching(true);
    try {
      const res = await zoomService.getCourseMeetings(courseId);
      setMeetings(res || []);
    } catch (err: any) {
      // console.error("Error fetching course meetings", err);
      console.log("Error fetching course meetings", err);
      Toast.show({
        type: "error",
        text1: "Error Fetching Meetings",
        text2: "No meeting found for this course.",
        visibilityTime: 4000,
      });
    } finally {
      setFetching(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Duration Handlers
  const handleIncreaseDuration = () => {
    const current = parseInt(duration, 10) || 0;
    setDuration(String(current + 1));
  };

  const handleDecreaseDuration = () => {
    const current = parseInt(duration, 10) || 0;
    if (current > 1) {
      setDuration(String(current - 1));
    }
  };

  // Date/Time Selection Handlers
  const openDatePicker = () => {
    setSelectedDateObj(
      scheduledAt ? parseDateFromInput(scheduledAt) : new Date()
    );
    setPickerMode("date");
    setShowDatePicker(true);
  };

  const handlePickerChange = (event: any, date?: Date) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    if (date) {
      const currentDate = date;
      if (Platform.OS === "android") {
        setShowDatePicker(false);
        if (pickerMode === "date") {
          setSelectedDateObj(currentDate);
          // Chain to time picker for Android
          setPickerMode("time");
          setTimeout(() => setShowDatePicker(true), 100);
        } else {
          // Time selected
          setScheduledAt(formatDateForInput(currentDate));
        }
      } else {
        // iOS
        setSelectedDateObj(currentDate);
        setScheduledAt(formatDateForInput(currentDate));
      }
    }
  };

  // Schedule Meeting
  const handleSchedule = async () => {
    if (!topic || !scheduledAt || !duration) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const parsedDate = parseDateFromInput(scheduledAt);
      const isoDate = parsedDate.toISOString();

      await zoomService.scheduleMeeting({
        courseId,
        topic,
        scheduledAt: isoDate,
        duration: parseInt(duration, 10),
      });

      setTopic("");
      setScheduledAt("");
      setDuration("60");
      fetchMeetings();
      Alert.alert("Success", "Zoom meeting scheduled!");
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || err.message || "Failed to schedule.";
      Alert.alert("Error", errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Delete Meeting
  const handleDelete = (meetingId: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this scheduled meeting?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await zoomService.deleteMeeting(meetingId);
              Alert.alert("Success", "Meeting deleted successfully");
              fetchMeetings();
            } catch (err: any) {
              const errMsg = err.response?.data?.message || "Failed to delete.";
              Alert.alert("Error", errMsg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Start Meeting
  const handleStart = async (meetingId: string) => {
    try {
      setLoading(true);
      const res = await zoomService.joinMeeting(meetingId);
      if (res.url) {
        await openZoomMeeting(res.url);
      } else {
        Alert.alert("Error", "Failed to get meeting URL");
      }
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || "Failed to start meeting via Zoom.";
      Alert.alert("Error", errMsg);

      if (err.response?.data?.status === "ended") {
        fetchMeetings();
      }
    } finally {
      setLoading(false);
    }
  };

  // End Meeting
  const handleEnd = (meetingId: string) => {
    Alert.alert(
      "Confirm End",
      "Are you sure you want to end this meeting? Students will be disconnected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Meeting",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await zoomService.endMeeting(meetingId);
              Alert.alert("Success", "Meeting ended successfully");
              fetchMeetings();
            } catch (err: any) {
              const errMsg =
                err.response?.data?.message || "Failed to end meeting.";
              Alert.alert("Error", errMsg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderDateTime = (dateString: string) => {
    const { dateStr, timeStr } = formatDateForDisplay(dateString);

    if (dateStr === "Invalid Date") {
      return <Text style={styles.errorText}>Invalid Date</Text>;
    }

    return (
      <View style={styles.dateTimeRow}>
        <View style={styles.iconTextInline}>
          <Calendar size={14} color="#64748b" />
          <Text style={styles.metaText}>{dateStr}</Text>
        </View>
        <View style={styles.iconTextInline}>
          <Clock size={14} color="#64748b" />
          <Text style={styles.metaText}>{timeStr}</Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <SimpleIcon name="arrow-back" size={34} color="#10B144" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.mainContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Schedule Form Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Video size={22} color="#2563eb" />
            <Text style={styles.cardTitle}>Schedule Zoom Class</Text>
          </View>

          <View style={styles.cardContent}>
            {/* Topic */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Meeting Topic</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Introduction to Database"
                placeholderTextColor="#94a3b8"
                value={topic}
                onChangeText={setTopic}
              />
            </View>

            {/* Date & Time Picker */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Date & Time</Text>
              <TouchableOpacity
                style={styles.datePickerBtn}
                onPress={openDatePicker}
              >
                <Text
                  style={
                    scheduledAt
                      ? styles.datePickerText
                      : styles.datePickerPlaceholder
                  }
                >
                  {scheduledAt || "mm/dd/yyyy, --:-- --"}
                </Text>
                <Calendar size={18} color="#64748b" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDateObj}
                  mode={pickerMode}
                  display="default"
                  onChange={handlePickerChange}
                />
              )}
            </View>

            {/* Duration Stepper */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Duration (minutes)</Text>
              <View style={styles.stepperContainer}>
                <TextInput
                  style={styles.stepperInput}
                  placeholder="60"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={duration}
                  onChangeText={setDuration}
                />

                {/* Buttons grouped together on the right */}
                <View style={styles.stepperButtonGroup}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={handleDecreaseDuration}
                  >
                    <Minus size={16} color="#334155" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.stepperBtn, styles.stepperBtnRight]}
                    onPress={handleIncreaseDuration}
                  >
                    <Plus size={16} color="#334155" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleSchedule}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <View style={styles.buttonInner}>
                  <Calendar color="#fff" size={18} style={styles.btnIcon} />
                  <Text style={styles.submitButtonText}>
                    Schedule Zoom Meeting
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Scheduled Meetings List */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Course Scheduled Meetings</Text>

          {fetching ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : meetings.length > 0 ? (
            meetings.map((m) => (
              <View key={m._id} style={styles.meetingItemCard}>
                <View style={styles.meetingDetails}>
                  <Text style={styles.meetingTopic}>{m.topic}</Text>
                  <View style={styles.metaContainer}>
                    {renderDateTime(m.scheduledAt)}
                    <Text style={styles.metaText}>
                      Duration: {m.duration} mins
                    </Text>
                  </View>
                </View>

                {/* Status Badge & Actions */}
                <View style={styles.actionsContainer}>
                  <View
                    style={[
                      styles.badge,
                      m.status === "active"
                        ? styles.badgeActive
                        : m.status === "ended"
                        ? styles.badgeEnded
                        : styles.badgeScheduled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        m.status === "active"
                          ? styles.badgeTextActive
                          : m.status === "ended"
                          ? styles.badgeTextEnded
                          : styles.badgeTextScheduled,
                      ]}
                    >
                      {m.status || "Scheduled"}
                    </Text>
                  </View>

                  <View style={styles.buttonRow}>
                    {m.status === "ended" ? (
                      <View style={styles.endedBox}>
                        <AlertCircle size={16} color="#94a3b8" />
                        <Text style={styles.endedText}>Meeting Ended</Text>
                      </View>
                    ) : m.status === "active" ? (
                      <>
                        <TouchableOpacity
                          style={[styles.outlineBtn, styles.btnGreen]}
                          onPress={() => handleStart(m._id)}
                          disabled={loading}
                        >
                          <PlayCircle size={16} color="#16a34a" />
                          <Text
                            style={[
                              styles.outlineBtnText,
                              { color: "#16a34a" },
                            ]}
                          >
                            Rejoin Class
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.outlineBtn, styles.btnOrange]}
                          onPress={() => handleEnd(m._id)}
                          disabled={loading}
                        >
                          <StopCircle size={16} color="#ea580c" />
                          <Text
                            style={[
                              styles.outlineBtnText,
                              { color: "#ea580c" },
                            ]}
                          >
                            End Meeting
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={[styles.outlineBtn, styles.btnGreen]}
                        onPress={() => handleStart(m._id)}
                        disabled={loading}
                      >
                        <PlayCircle size={16} color="#16a34a" />
                        <Text
                          style={[styles.outlineBtnText, { color: "#16a34a" }]}
                        >
                          Start Class
                        </Text>
                      </TouchableOpacity>
                    )}

                    {(m.status === "scheduled" ||
                      m.status === "ended" ||
                      !m.status) && (
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(m._id)}
                        disabled={loading}
                      >
                        <Trash2 size={18} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              No meetings scheduled for this course.
            </Text>
          )}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 30,
    marginHorizontal: 20,
  },
  backButton: { padding: 4 },

  mainContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 20,
  },
  card: {
    borderTopWidth: 4,
    borderTopColor: "#10B144",
    borderLeftWidth: 1,
    borderLeftColor: "#0d8f37",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    width: "90%",
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardContent: {
    padding: 16,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  datePickerBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  datePickerText: {
    fontSize: 14,
    color: "#0f172a",
  },
  datePickerPlaceholder: {
    fontSize: 14,
    color: "#94a3b8",
  },
  /* Stepper Styles */
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  stepperInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  stepperButtonGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
  },
  stepperBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnRight: {
    borderLeftWidth: 1,
    borderLeftColor: "#e2e8f0",
  },
  submitButton: {
    backgroundColor: "#10B144",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnIcon: {
    marginRight: 6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  listSection: {
    marginTop: 8,
    width: "90%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  loaderContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  meetingItemCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
  },
  meetingDetails: {
    marginBottom: 10,
  },
  meetingTopic: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  metaContainer: {
    gap: 4,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 2,
  },
  iconTextInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#64748b",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
  },
  actionsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
    gap: 8,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  badgeScheduled: { backgroundColor: "#eff6ff" },
  badgeActive: { backgroundColor: "#dcfce7" },
  badgeEnded: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  badgeText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  badgeTextScheduled: { color: "#2563eb" },
  badgeTextActive: { color: "#15803d" },
  badgeTextEnded: { color: "#ef4444" },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  btnGreen: { borderColor: "#16a34a" },
  btnOrange: { borderColor: "#ea580c" },
  outlineBtnText: { fontSize: 13, fontWeight: "600" },
  endedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  endedText: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  deleteBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#fef2f2",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
    paddingVertical: 20,
  },
});
