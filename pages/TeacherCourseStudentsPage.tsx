import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getStudentsByCourse, createConversation } from "../services/message";
import SimpleIcon from "../components/SimpleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getFriendlyErrorMessage } from "../utils/errorMessage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, "TeacherMessagesByCourse">;

const getInitials = (firstName?: string, lastName?: string) => {
  const a = (firstName || "").charAt(0);
  const b = (lastName || "").charAt(0);
  return (a + b).toUpperCase() || "?";
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const TeacherCourseStudentsPage = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const route = useRoute<ScreenRouteProp>();
  const { courseId, courseTitle } = route.params;

  const [students, setStudents] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setError(null);
      const res = await getStudentsByCourse(courseId);
      setStudents(Array.isArray(res?.students) ? res.students : []);
      setTotalStudents(res?.totalStudents ?? res?.students?.length ?? 0);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, "Failed to load students."));
      setStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseId]);

  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [fetchStudents])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStudents();
  }, [fetchStudents]);

  const handleOpenConversation = async (student: any) => {
    setConnectingId(student._id);
    try {
      const res = await createConversation(student._id);
      const conversationId = res?.conversation?._id;
      const otherMemberName =
        [student.firstName, student.lastName].filter(Boolean).join(" ") ||
        "Student";
      // Go straight to the actual chat thread — MessagesPage is just the
      // inbox list, not the chat UI itself.
      navigation.navigate("Chat", { conversationId, otherMemberName });
    } catch (err: any) {
      console.error("Failed to start conversation:", err);
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <SimpleIcon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {courseTitle || "Course Students"}
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
        {!loading && !error && (
          <>
            <Text style={styles.sectionTitle}>
              Students ({totalStudents})
            </Text>
            <Text style={styles.subHeader}>
              {totalStudents} {totalStudents === 1 ? "Student" : "Students"}{" "}
              Enrolled
            </Text>
          </>
        )}

        {loading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator size="large" color="#10B144" />
          </View>
        ) : error ? (
          <View style={styles.stateWrap}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchStudents}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : students.length === 0 ? (
          <View style={styles.stateWrap}>
            <Text style={styles.emptyTitle}>No students yet</Text>
            <Text style={styles.emptySubtitle}>
              Students will appear here once they enroll.
            </Text>
          </View>
        ) : (
          students.map((student) => (
            <TouchableOpacity
              key={student._id}
              style={styles.row}
              onPress={() => handleOpenConversation(student)}
              disabled={connectingId === student._id}
            >
              {student.profileImg?.url ? (
                <Image
                  source={{ uri: student.profileImg.url }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {getInitials(student.firstName, student.lastName)}
                  </Text>
                </View>
              )}
              <View style={styles.rowInfo}>
                <Text style={styles.studentName} numberOfLines={1}>
                  {[student.firstName, student.lastName]
                    .filter(Boolean)
                    .join(" ") || "Unnamed Student"}
                </Text>
                {student.email ? (
                  <Text style={styles.studentEmail} numberOfLines={1}>
                    {student.email}
                  </Text>
                ) : null}
                {student.progress !== undefined ? (
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(100, Math.max(0, student.progress))}%` },
                      ]}
                    />
                  </View>
                ) : null}
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.enrolledLabel}>Enrolled</Text>
                <Text style={styles.enrolledDate}>
                  {formatDate(student.enrolledAt || student.createdAt)}
                </Text>
              </View>
              {connectingId === student._id && (
                <ActivityIndicator
                  size="small"
                  color="#10B144"
                  style={{ marginLeft: 8 }}
                />
              )}
            </TouchableOpacity>
          ))
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
    paddingBottom: 12,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", flex: 1 },
  backButton: { padding: 4, marginRight: 12 },
  container: { flex: 1, padding: 16 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subHeader: { fontSize: 13, color: "#6B7280", marginBottom: 12 },
  stateWrap: { alignItems: "center", padding: 40 },
  errorText: { color: "#DC2626", textAlign: "center", marginBottom: 12 },
  retryButton: {
    backgroundColor: "#10B144",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: { color: "#fff", fontWeight: "600" },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#374151" },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#166534", fontWeight: "700" },
  rowInfo: { flex: 1, marginRight: 8 },
  studentName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  studentEmail: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  progressTrack: {
    height: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    marginTop: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: "#10B144",
    borderRadius: 999,
  },
  rowRight: { alignItems: "flex-end" },
  enrolledLabel: { fontSize: 10, color: "#9CA3AF" },
  enrolledDate: { fontSize: 12, color: "#374151", fontWeight: "600" },
});

export default TeacherCourseStudentsPage;
