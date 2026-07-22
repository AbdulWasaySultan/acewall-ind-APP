import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Modal,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  getAllStudentsWithCourses,
  Student,
  Course,
  getCourseGradebook,
  CourseGradebook,
} from "../services/student";
import { createConversation } from "../services/conversation";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const StudentsPage = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [courseFilterOpen, setCourseFilterOpen] = useState(false);
  const [courseFilterValue, setCourseFilterValue] = useState<string | null>(
    null
  );
  const [courseFilterItems, setCourseFilterItems] = useState<
    { label: string; value: string }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseGradesModalVisible, setCourseGradesModalVisible] =
    useState(false);
  const [courseGradebook, setCourseGradebook] =
    useState<CourseGradebook | null>(null);
  const [loadingGradebook, setLoadingGradebook] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [isCourseExpanded, setIsCourseExpanded] = useState(true);
  const [isAssessmentsExpanded, setIsAssessmentsExpanded] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const studentsData = await getAllStudentsWithCourses();
      setStudents(studentsData);
      const allCourses = studentsData.flatMap((s) => s.courses);
      const uniqueCourses = Array.from(
        new Map(allCourses.map((c) => [c._id, c])).values()
      );
      const courseItems = [
        { label: "All Courses", value: "all" },
        ...uniqueCourses.map((c) => ({
          label: c.courseTitle,
          value: c._id,
        })),
      ];

      setCourseFilterItems(courseItems);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  // ── Combined filter: course + name ──
  const filteredStudents = students.filter((s) => {
    if (
      courseFilterValue &&
      courseFilterValue !== "all" &&
      !s.courses.some((c) => c._id === courseFilterValue)
    ) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const fullName = `${s.firstName} ${s.middleName || ""} ${
        s.lastName
      }`.toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      return fullName.includes(query);
    }
    return true;
  });

  const handleMessageStudent = async (studentId: string) => {
    try {
      setMessageLoading(true);
      const response = await createConversation(studentId);
      console.log("Conversation created:", response);
      setModalVisible(false);
      navigation.navigate("Messages" as never);
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setMessageLoading(false);
    }
  };

  const clearSearch = () => setSearchQuery("");

  // ── Open Profile Modal ──
  const openProfileModal = useCallback((student: Student) => {
    setSelectedStudent(student);
    setModalVisible(true);
  }, []);

  // ── Open Grades Modal ──
  const openGradesModal = useCallback(() => {
    setCourseGradesModalVisible(true);
  }, []);

  // ── Profile Modal: Render Item ──
  const renderProfileItem = useCallback(
    ({ item }: { item: any }) => {
      if (!selectedStudent) return null;

      switch (item.type) {
        case "profile_header":
          return (
            <View style={styles.profileHeader}>
              <View style={styles.avatarLarge}>
                {selectedStudent.profileImg?.url ? (
                  <Image
                    source={{ uri: selectedStudent.profileImg.url }}
                    style={styles.avatarLargeImage}
                  />
                ) : (
                  <Text style={styles.avatarLargeEmoji}>👤</Text>
                )}
              </View>
              <Text style={styles.profileName}>
                {selectedStudent.firstName} {selectedStudent.middleName}{" "}
                {selectedStudent.lastName}
              </Text>
              <Text style={styles.profileEmail}>
                ✉️ {selectedStudent.email}
              </Text>
              <Text style={styles.profileJoined}>
                📅 Joined:{" "}
                {new Date(selectedStudent.createdAt).toLocaleDateString()}
              </Text>
            </View>
          );

        case "message_button":
          return (
            <Pressable
              style={[
                styles.messageButton,
                messageLoading && styles.messageButtonDisabled,
              ]}
              onPress={() => handleMessageStudent(selectedStudent._id)}
              disabled={messageLoading}
            >
              <Text style={styles.messageButtonText}>
                {messageLoading ? "Creating..." : "Message"}
              </Text>
            </Pressable>
          );

        case "enrolled_card":
          return (
            <View style={styles.enrolledCard}>
              <Text style={styles.enrolledEmoji}>🏫</Text>
              <Text style={styles.enrolledLabel}>Enrolled Courses</Text>
              <Text style={styles.enrolledCount}>
                {selectedStudent.courses.length}
              </Text>
            </View>
          );

        case "section_title":
          return (
            <Text style={styles.sectionTitle}>
              View Grade Book of Enrolled Courses
            </Text>
          );

        case "course_card": {
          const course = item.course;
          return (
            <Pressable
              style={styles.courseCard}
              onPress={async () => {
                setModalVisible(false);
                console.log("Course clicked:", course.courseTitle);
                openGradesModal();
                setLoadingGradebook(true);
                try {
                  const gradebook = await getCourseGradebook(
                    selectedStudent._id,
                    course._id
                  );
                  console.log("Gradebook response:", gradebook);
                  setCourseGradebook(gradebook);
                } catch (e) {
                  console.error("Error fetching gradebook:", e);
                  setCourseGradebook(null);
                } finally {
                  setLoadingGradebook(false);
                }
              }}
            >
              {typeof course.thumbnail?.url === "string" &&
              course.thumbnail.url ? (
                <Image
                  source={{ uri: course.thumbnail.url }}
                  style={styles.courseThumbnail}
                />
              ) : null}
              <Text style={styles.courseCardTitle}>{course.courseTitle}</Text>
            </Pressable>
          );
        }

        default:
          return null;
      }
    },
    [selectedStudent, messageLoading]
  );

  // ── Grades Modal: Render Item ──
  const renderGradesItem = useCallback(
    ({ item }: { item: any }) => {
      if (!courseGradebook) return null;

      switch (item.type) {
        case "course_header":
          return (
            <View style={styles.gradesHeader}>
              <Text style={styles.gradesCourseName}>
                {courseGradebook.courseName}
              </Text>
              {typeof courseGradebook.course.thumbnail?.url === "string" &&
                courseGradebook.course.thumbnail.url && (
                  <Image
                    source={{ uri: courseGradebook.course.thumbnail.url }}
                    style={styles.gradesThumbnail}
                  />
                )}
              <Text style={styles.gradesDescription}>
                {courseGradebook.course.courseDescription}
              </Text>
            </View>
          );

        case "gradebook_table":
          return (
            <View style={styles.gradebookCard}>
              {/* Table Header */}
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>
                  Course
                </Text>
                <Text
                  style={[
                    styles.tableHeaderText,
                    { flex: 1, textAlign: "center" },
                  ]}
                >
                  Average
                </Text>
                <Text
                  style={[
                    styles.tableHeaderText,
                    { flex: 1, textAlign: "right" },
                  ]}
                >
                  Grade
                </Text>
              </View>

              {/* Course Row (Collapsible) */}
              <Pressable
                onPress={() => setIsCourseExpanded(!isCourseExpanded)}
                style={styles.courseRow}
              >
                <View
                  style={{
                    flex: 1.5,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.collapseArrow}>
                    {isCourseExpanded ? "▾" : "▸"}
                  </Text>
                  <Text style={styles.courseRowName}>
                    {courseGradebook.courseName}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.courseRowAvg,
                    { flex: 1, textAlign: "center" },
                  ]}
                >
                  {courseGradebook.grade.toFixed(2)}%
                </Text>
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeBadgeText}>
                      {courseGradebook?.letterGrade}
                    </Text>
                  </View>
                </View>
              </Pressable>

              {isCourseExpanded && (
                <View style={{ paddingLeft: 16, marginTop: 8 }}>
                  <Pressable
                    onPress={() =>
                      setIsAssessmentsExpanded(!isAssessmentsExpanded)
                    }
                    style={styles.assessmentsRow}
                  >
                    <Text style={styles.collapseArrow}>
                      {isAssessmentsExpanded ? "▾" : "▸"}
                    </Text>
                    <Text style={styles.assessmentsTitle}>
                      Course Assessments
                    </Text>
                    <Text style={styles.assessmentsGrade}>
                      ({courseGradebook?.directAssessments?.grade?.toFixed(2)}%
                      - {courseGradebook?.directAssessments?.letterGrade})
                    </Text>
                  </Pressable>

                  {isAssessmentsExpanded && (
                    <View style={{ marginTop: 8 }}>
                      <Text style={styles.categoryName}>
                        {courseGradebook?.directAssessments?.assessments[0]
                          ?.categoryName || "Assessments"}
                      </Text>

                      <View style={styles.assessmentsTable}>
                        <View style={styles.assessmentsTableHeader}>
                          <Text
                            style={[styles.assessmentsHeaderText, { flex: 2 }]}
                          >
                            Assessment
                          </Text>
                          <Text
                            style={[
                              styles.assessmentsHeaderText,
                              { flex: 1.5 },
                            ]}
                          >
                            Category
                          </Text>
                          <Text
                            style={[
                              styles.assessmentsHeaderText,
                              { flex: 1, textAlign: "center" },
                            ]}
                          >
                            Score
                          </Text>
                          <Text
                            style={[
                              styles.assessmentsHeaderText,
                              { flex: 1.2, textAlign: "center" },
                            ]}
                          >
                            Max
                          </Text>
                          <Text
                            style={[
                              styles.assessmentsHeaderText,
                              { flex: 1.5, textAlign: "right" },
                            ]}
                          >
                            %
                          </Text>
                        </View>

                        {courseGradebook?.directAssessments?.assessments
                          .length > 0 &&
                          courseGradebook?.directAssessments?.assessments.map(
                            (assessmentItem: any) => (
                              <View
                                key={assessmentItem.assessmentId}
                                style={styles.assessmentRow}
                              >
                                <Text
                                  style={[
                                    styles.assessmentCell,
                                    { flex: 2, fontWeight: "600" },
                                  ]}
                                >
                                  {assessmentItem.assessmentTitle}
                                </Text>
                                <Text
                                  style={[styles.assessmentCell, { flex: 1.5 }]}
                                >
                                  {assessmentItem.categoryName}
                                </Text>
                                <Text
                                  style={[
                                    styles.assessmentCell,
                                    { flex: 1, textAlign: "center" },
                                  ]}
                                >
                                  {assessmentItem.studentPoints}
                                </Text>
                                <Text
                                  style={[
                                    styles.assessmentCell,
                                    { flex: 1.2, textAlign: "center" },
                                  ]}
                                >
                                  {assessmentItem.maxPoints}
                                </Text>
                                <View
                                  style={{ flex: 1.5, alignItems: "flex-end" }}
                                >
                                  <View style={styles.percentBadge}>
                                    <Text style={styles.percentBadgeText}>
                                      {(
                                        (assessmentItem.studentPoints /
                                          assessmentItem.maxPoints) *
                                        100
                                      ).toFixed(1)}
                                      %
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            )
                          )}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {courseGradebook.totalAssessments === 0 && (
                <View style={styles.noAssessments}>
                  <Text style={styles.noAssessmentsText}>
                    No assessments found for this course.
                  </Text>
                </View>
              )}
            </View>
          );

        default:
          return null;
      }
    },
    [courseGradebook, isCourseExpanded, isAssessmentsExpanded]
  );

  // ── Profile Modal Data ──
  const getProfileData = useCallback(() => {
    if (!selectedStudent) return [];
    return [
      { type: "profile_header", key: "profile_header" },
      { type: "message_button", key: "message_button" },
      { type: "enrolled_card", key: "enrolled_card" },
      { type: "section_title", key: "section_title" },
      ...selectedStudent.courses.map((course) => ({
        type: "course_card",
        course,
        key: `course_${course._id}`,
      })),
    ];
  }, [selectedStudent]);

  // ── Grades Modal Data ──
  const getGradesData = useCallback(() => {
    if (!courseGradebook) return [];
    return [
      { type: "course_header", key: "course_header" },
      { type: "gradebook_table", key: "gradebook_table" },
    ];
  }, [courseGradebook]);

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.pageTitle}>Students ({filteredStudents.length})</Text>

      {/* Course Filter Dropdown */}
      <View style={{ marginBottom: 16, zIndex: courseFilterOpen ? 1000 : 0 }}>
        <DropDownPicker
          open={courseFilterOpen}
          value={courseFilterValue}
          items={courseFilterItems}
          setOpen={setCourseFilterOpen}
          setValue={setCourseFilterValue}
          setItems={setCourseFilterItems}
          placeholder="Filter by course title"
          style={{ borderColor: "#ccc" }}
          dropDownContainerStyle={{ borderColor: "#ccc" }}
        />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by student name..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(student) => student._id}
          contentContainerStyle={styles.studentListContent}
          renderItem={({ item: student }) => (
            <View style={styles.studentCard}>
              <View style={styles.avatar}>
                {student.profileImg?.url ? (
                  <Image
                    source={{ uri: student.profileImg.url }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarEmoji}>👤</Text>
                )}
              </View>
              <Text style={styles.studentName}>
                {student.firstName} {student.middleName} {student.lastName}
              </Text>
              <Text style={styles.studentEmail}>{student.email}</Text>
              <View style={styles.joinedRow}>
                <Text style={styles.joinedLabel}>Joined</Text>
                <Text>{new Date(student.createdAt).toLocaleDateString()}</Text>
              </View>
              <Pressable
                style={styles.viewProfileButton}
                onPress={() => openProfileModal(student)}
              >
                <Text style={styles.viewProfileButtonText}>View Profile</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No students found.</Text>
          }
        />
      )}

      {/* ════════════════════════════════════════
          PROFILE MODAL - Fixed Structure
          ════════════════════════════════════════ */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
        onShow={() => {
          // Reset scroll when modal fully shown
          console.log("Profile modal shown");
        }}
      >
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <Pressable
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>×</Text>
          </Pressable>

          {selectedStudent && (
            <ScrollView
              style={styles.modalList}
              contentContainerStyle={styles.modalListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {getProfileData().map((item) => (
                <View key={item.key}>{renderProfileItem({ item })}</View>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* ════════════════════════════════════════
          GRADES MODAL - Fixed Structure
          ════════════════════════════════════════ */}
      <Modal
        visible={courseGradesModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setCourseGradesModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <Pressable
            style={styles.modalCloseButton}
            onPress={() => setCourseGradesModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>×</Text>
          </Pressable>

          {loadingGradebook ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 12 }}>Loading gradebook...</Text>
            </View>
          ) : courseGradebook ? (
            <ScrollView
              style={styles.modalList}
              contentContainerStyle={styles.modalListContent}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {getGradesData().map((item) => (
                <View key={item.key}>{renderGradesItem({ item })}</View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.loadingContainer}>
              <Text>No gradebook data available.</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // ── Main Page ──
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: "#666",
  },
  studentListContent: {
    paddingBottom: 40,
  },
  studentCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: 80,
    height: 80,
  },
  avatarEmoji: {
    fontSize: 40,
    color: "#666",
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  studentEmail: {
    color: "#666",
    marginBottom: 16,
  },
  joinedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  joinedLabel: {
    fontWeight: "bold",
  },
  viewProfileButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  viewProfileButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
  },

  // ── Modal Base ──
  modalContainer: {
    flex: 1,
    height: SCREEN_HEIGHT,
    backgroundColor: "#fff",
  },
  modalCloseButton: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 100,
    padding: 8,
  },
  modalCloseText: {
    fontSize: 32,
    color: "#333",
    fontWeight: "bold",
  },
  modalList: {
    flex: 1,
    height: SCREEN_HEIGHT,
  },
  modalListContent: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Profile Modal Items ──
  profileHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
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
  avatarLargeImage: {
    width: 100,
    height: 100,
  },
  avatarLargeEmoji: {
    fontSize: 50,
    color: "#666",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    color: "#666",
    fontSize: 16,
    marginBottom: 2,
  },
  profileJoined: {
    color: "#666",
    fontSize: 16,
  },
  messageButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "90%",
    marginBottom: 24,
    alignSelf: "center",
  },
  messageButtonDisabled: {
    opacity: 0.6,
  },
  messageButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
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
  enrolledEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  enrolledLabel: {
    color: "#888",
    fontSize: 18,
    marginBottom: 4,
  },
  enrolledCount: {
    fontSize: 32,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#232b3b",
    width: "90%",
    alignSelf: "center",
  },
  courseCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 24,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  courseThumbnail: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginBottom: 8,
  },
  courseCardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },

  // ── Grades Modal Items ──
  gradesHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  gradesCourseName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#232b3b",
  },
  gradesThumbnail: {
    width: 300,
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: "center",
  },
  gradesDescription: {
    color: "#232b3b",
    fontSize: 16,
    marginBottom: 16,
  },
  gradebookCard: {
    width: "95%",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 16,
    padding: 16,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tableHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 12,
    marginBottom: 12,
  },
  tableHeaderText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#6b7280",
  },
  courseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  collapseArrow: {
    fontSize: 18,
    color: "#6b7280",
    marginRight: 8,
  },
  courseRowName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  courseRowAvg: {
    fontSize: 15,
    color: "#374151",
  },
  gradeBadge: {
    backgroundColor: "#fee2e2",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  gradeBadgeText: {
    color: "#b91c1c",
    fontWeight: "500",
    fontSize: 12,
  },
  assessmentsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  assessmentsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  assessmentsGrade: {
    fontSize: 16,
    color: "#9ca3af",
    marginLeft: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    marginTop: 8,
  },
  assessmentsTable: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    overflow: "hidden",
  },
  assessmentsTableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  assessmentsHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  assessmentRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  assessmentCell: {
    fontSize: 14,
    color: "#374151",
  },
  percentBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  percentBadgeText: {
    fontSize: 12,
    color: "#b91c1c",
    fontWeight: "600",
  },
  noAssessments: {
    alignItems: "center",
    paddingVertical: 24,
    marginTop: 12,
  },
  noAssessmentsText: {
    color: "#9ca3af",
    fontSize: 14,
    fontStyle: "italic",
  },
});

export default StudentsPage;
