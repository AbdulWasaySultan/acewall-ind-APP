import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
import { useNavigation, NavigationProp } from "@react-navigation/native";
import Toast from "react-native-simple-toast";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { Student, Course } from "../../services/student";
import { createConversation } from "../../services/conversation";
import CourseCard from "./CourseCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SimpleIcon from "../SimpleIcon";

interface StudentProfileModalProps {
  visible: boolean;
  student: Student | null;
  onClose: () => void;
  onSelectCourse: (course: Course) => void;
}

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  visible,
  student,
  onClose,
  onSelectCourse,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [messageLoading, setMessageLoading] = useState(false);

  const handleMessageStudent = useCallback(
    async (studentId: string, studentName: string) => {
      try {
        setMessageLoading(true);
        const res = await createConversation(studentId);
        onClose();
        // StudentProfileModal is rendered from StudentsPage, which is a
        // root-level Stack screen (StudentsByCourse), not nested inside the
        // Drawer — "Messages" only exists as a Drawer screen name, so it
        // isn't reachable from here. Go straight to the actual chat thread
        // instead, matching TeacherCourseStudentsPage's flow.
        navigation.navigate("Chat", {
          conversationId: res?.conversation?._id,
          otherMemberName: studentName,
        });
      } catch (error: any) {
        console.error("Error creating conversation:", error);
        Toast.show(
          error?.response?.data?.message || "Failed to start conversation. Please try again.",
          Toast.LONG
        );
      } finally {
        setMessageLoading(false);
      }
    },
    [navigation, onClose]
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <Pressable
          style={[styles.modalCloseButton, { top: insets.top + 8 }]}
          onPress={onClose}
        >
          <SimpleIcon name="close" size={28} color="#333" />
        </Pressable>

        {student && (
          <ScrollView
            style={styles.modalList}
            contentContainerStyle={[
              styles.modalListContent,
              { paddingTop: insets.top + 52 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarLarge}>
                {student.profileImg?.url ? (
                  <Image source={{ uri: student.profileImg.url }} style={styles.avatarLargeImage} />
                ) : (
                  <Text style={styles.avatarLargeEmoji}>👤</Text>
                )}
              </View>
              <Text style={styles.profileName}>
                {student.firstName} {student.middleName} {student.lastName}
              </Text>
              <Text style={styles.profileEmail}>✉️ {student.email}</Text>
              <Text style={styles.profileJoined}>
                📅 Joined:{" "}
                {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "—"}
              </Text>
            </View>

            <Pressable
              style={[styles.messageButton, messageLoading && styles.messageButtonDisabled]}
              onPress={() =>
                handleMessageStudent(
                  student._id,
                  [student.firstName, student.lastName]
                    .filter(Boolean)
                    .join(" ") || "Student"
                )
              }
              disabled={messageLoading}
            >
              <Text style={styles.messageButtonText}>
                {messageLoading ? "Creating..." : "Message"}
              </Text>
            </Pressable>

            <View style={styles.enrolledCard}>
              <Text style={styles.enrolledEmoji}>🏫</Text>
              <Text style={styles.enrolledLabel}>Enrolled Courses</Text>
              <Text style={styles.enrolledCount}>{student.courses?.length ?? 0}</Text>
            </View>

            <Text style={styles.sectionTitle}>View Grade Book of Enrolled Courses</Text>

            {(student.courses ?? []).map((course) => (
              <CourseCard key={course._id} course={course} onPress={onSelectCourse} />
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, height: SCREEN_HEIGHT, backgroundColor: "#fff" },
  modalCloseButton: { position: "absolute", top: 16, right: 20, zIndex: 100, padding: 8 },
  modalList: { flex: 1, height: SCREEN_HEIGHT },
  modalListContent: { paddingBottom: 40, paddingHorizontal: 16 },

  profileHeader: { alignItems: "center", marginBottom: 16 },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  avatarLargeImage: { width: 100, height: 100 },
  avatarLargeEmoji: { fontSize: 50, color: "#666" },
  profileName: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  profileEmail: { color: "#666", fontSize: 16, marginBottom: 2 },
  profileJoined: { color: "#666", fontSize: 16 },
  messageButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "90%",
    marginBottom: 24,
    alignSelf: "center",
  },
  messageButtonDisabled: { opacity: 0.6 },
  messageButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  enrolledCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    paddingVertical: 32,
    marginBottom: 24,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  enrolledEmoji: { fontSize: 40, marginBottom: 8 },
  enrolledLabel: { color: "#888", fontSize: 18, marginBottom: 4 },
  enrolledCount: { fontSize: 32, fontWeight: "bold" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#232b3b",
    width: "90%",
    alignSelf: "center",
  },
});

export default React.memo(StudentProfileModal);
