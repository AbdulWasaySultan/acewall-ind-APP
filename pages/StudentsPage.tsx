import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import Toast from "react-native-simple-toast";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  getAllStudentsWithCourses,
  Student,
  Course,
} from "../services/student";
import StudentCard from "../components/students/StudentCard";
import StudentProfileModal from "../components/students/StudentProfileModal";
import CourseGradebookModal from "../components/students/CourseGradebookModal";
import { DropdownFilter } from "../components/filters/DropDown";
import SimpleIcon from "../components/SimpleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, "StudentsByCourse">;

const StudentsPage = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const route = useRoute<ScreenRouteProp>();
  const { courseId, courseTitle } = route.params;

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // "Select student by name" — an additional filter alongside search, same
  // duplicated-by-design pattern as the course pickers (search box + a
  // dedicated select for the same thing).
  const [studentFilterOpen, setStudentFilterOpen] = useState(false);
  const [studentFilterValue, setStudentFilterValue] = useState<string | null>(
    "all"
  );

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [gradebookModalVisible, setGradebookModalVisible] = useState(false);
  const [gradebookCourse, setGradebookCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const studentsData = await getAllStudentsWithCourses();
      // Course is fixed via route params (picked on the screen before this
      // one) — scope down to just students enrolled in that course.
      setStudents(
        studentsData.filter((s) => s.courses?.some((c) => c._id === courseId))
      );
    } catch (err: any) {
      console.error("Error fetching students:", err);
      Toast.show(
        err?.message || "Failed to load students. Please try again.",
        Toast.LONG
      );
    } finally {
      setLoading(false);
    }
  };

  const studentFilterItems = useMemo(
    () => [
      { label: "All Students", value: "all" },
      ...students.map((s) => ({
        label: `${s.firstName} ${s.middleName || ""} ${s.lastName}`
          .replace(/\s+/g, " ")
          .trim(),
        value: s._id,
      })),
    ],
    [students]
  );

  const filteredStudents = students.filter((s) => {
    if (
      studentFilterValue &&
      studentFilterValue !== "all" &&
      s._id !== studentFilterValue
    ) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const fullName = `${s.firstName} ${s.middleName || ""} ${
        s.lastName
      }`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase().trim());
    }
    return true;
  });

  const clearSearch = () => setSearchQuery("");

  const handleViewProfile = useCallback((student: Student) => {
    setSelectedStudent(student);
    setProfileModalVisible(true);
  }, []);

  const handleSelectCourse = useCallback((course: Course) => {
    setProfileModalVisible(false);
    setGradebookCourse(course);
    setGradebookModalVisible(true);
  }, []);

  const closeProfileModal = useCallback(
    () => setProfileModalVisible(false),
    []
  );
  const closeGradebookModal = useCallback(
    () => setGradebookModalVisible(false),
    []
  );

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

      <View style={styles.container}>
        <Text style={styles.pageTitle}>
          Students ({filteredStudents.length})
        </Text>

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

        <View
          style={{ marginBottom: 16, zIndex: studentFilterOpen ? 1000 : 0 }}
        >
          <DropdownFilter
            open={studentFilterOpen}
            value={studentFilterValue}
            items={studentFilterItems}
            setOpen={setStudentFilterOpen}
            setValue={setStudentFilterValue}
            placeholder="Select student by name"
            zIndex={1000}
            zIndexInverse={1000}
            style={{ borderColor: "#fff" }}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={filteredStudents}
            keyExtractor={(student) => student._id}
            contentContainerStyle={styles.studentListContent}
            renderItem={({ item: student }) => (
              <StudentCard
                student={student}
                onViewProfile={handleViewProfile}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No students found.</Text>
            }
          />
        )}

        <StudentProfileModal
          visible={profileModalVisible}
          student={selectedStudent}
          onClose={closeProfileModal}
          onSelectCourse={handleSelectCourse}
        />

        <CourseGradebookModal
          visible={gradebookModalVisible}
          studentId={selectedStudent?._id ?? null}
          course={gradebookCourse}
          onClose={closeGradebookModal}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
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
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  pageTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
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
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 16 },
  clearButton: { padding: 4 },
  clearButtonText: { fontSize: 18, color: "#666" },
  studentListContent: { paddingBottom: 40 },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40 },
});

export default StudentsPage;
