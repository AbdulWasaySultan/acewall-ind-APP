import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import Toast from "react-native-simple-toast";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Course, StudentCourseGradebook, getStudentCourseGradebook } from "../../services/student";
import GradebookTable from "./GradebookTable";
import SimpleIcon from "../SimpleIcon";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CourseGradebookModalProps {
  visible: boolean;
  studentId: string | null;
  course: Course | null;
  onClose: () => void;
}

const CourseGradebookModal: React.FC<CourseGradebookModalProps> = ({
  visible,
  studentId,
  course,
  onClose,
}) => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [gradebook, setGradebook] = useState<StudentCourseGradebook | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleViewAnalytics = () => {
    if (!studentId || !course?._id) return;
    onClose();
    navigation.navigate("TeacherStudentAnalytics", {
      courseId: course._id,
      studentId,
    });
  };

  useEffect(() => {
    if (!visible || !studentId || !course?._id) {
      return;
    }

    let cancelled = false;

    const fetchGradebook = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      setGradebook(null);
      try {
        const data = await getStudentCourseGradebook(studentId, course._id);
        if (cancelled) return;
        if (data) {
          setGradebook(data);
        } else {
          setNotFound(true);
        }
      } catch (e: any) {
        console.error("Error fetching gradebook:", e);
        if (!cancelled) {
          const message = e?.message || "Failed to load gradebook. Please try again.";
          setError(message);
          Toast.show(message, Toast.LONG);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchGradebook();

    return () => {
      cancelled = true;
    };
  }, [visible, studentId, course?._id]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalTopBar, { top: insets.top + 8 }]}>
          {studentId && course?._id && (
            <Pressable
              style={styles.analyticsButton}
              onPress={handleViewAnalytics}
            >
              <Text style={styles.analyticsButtonText}>Analytics</Text>
            </Pressable>
          )}
          <Pressable style={styles.modalCloseButton} onPress={onClose}>
            <SimpleIcon name="close" size={28} color="#333" />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 12 }}>Loading gradebook...</Text>
          </View>
        ) : error ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : gradebook ? (
          <ScrollView
            style={styles.modalList}
            contentContainerStyle={[
              styles.modalListContent,
              { paddingTop: insets.top + 52 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
          >
            <View style={styles.gradesHeader}>
              <Text style={styles.gradesCourseName}>{gradebook.courseName}</Text>
              {typeof gradebook.course?.thumbnail?.url === "string" &&
                gradebook.course.thumbnail.url && (
                  <Image
                    source={{ uri: gradebook.course.thumbnail.url }}
                    style={styles.gradesThumbnail}
                  />
                )}
              <Text style={styles.gradesDescription}>
                {gradebook.course?.courseDescription || ""}
              </Text>
            </View>

            <GradebookTable gradebook={gradebook} />
          </ScrollView>
        ) : notFound ? (
          <View style={styles.modalList}>
            <View style={styles.gradesHeader}>
              <Text style={styles.gradesCourseName}>{course?.courseTitle}</Text>
              {typeof course?.thumbnail?.url === "string" && course.thumbnail.url && (
                <Image source={{ uri: course.thumbnail.url }} style={styles.gradesThumbnail} />
              )}
            </View>
            <View style={styles.loadingContainer}>
              <Text style={styles.noDataText}>
                No graded assessments yet for this student in this course.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <Text>No gradebook data available.</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, height: SCREEN_HEIGHT, backgroundColor: "#fff" },
  modalTopBar: {
    position: "absolute",
    right: 12,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalCloseButton: { padding: 8 },
  analyticsButton: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  analyticsButtonText: { fontSize: 12, fontWeight: "700", color: "#2563eb" },
  modalList: { flex: 1, height: SCREEN_HEIGHT },
  modalListContent: { paddingBottom: 40, paddingHorizontal: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#b91c1c", fontSize: 15, textAlign: "center", paddingHorizontal: 24 },
  noDataText: { color: "#6b7280", fontSize: 15, textAlign: "center", paddingHorizontal: 24 },
  gradesHeader: { paddingHorizontal: 4, marginBottom: 16 },
  gradesCourseName: { fontSize: 24, fontWeight: "bold", marginBottom: 8, color: "#232b3b" },
  gradesThumbnail: { width: 300, height: 180, borderRadius: 8, marginBottom: 8, alignSelf: "center" },
  gradesDescription: { color: "#232b3b", fontSize: 16, marginBottom: 16 },
});

export default React.memo(CourseGradebookModal);
