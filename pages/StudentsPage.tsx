import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Toast from "react-native-simple-toast";
import { getAllStudentsWithCourses, Student, Course } from "../services/student";
import StudentCard from "../components/students/StudentCard";
import StudentProfileModal from "../components/students/StudentProfileModal";
import CourseGradebookModal from "../components/students/CourseGradebookModal";

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilterOpen, setCourseFilterOpen] = useState(false);
  const [courseFilterValue, setCourseFilterValue] = useState<string | null>(null);
  const [courseFilterItems, setCourseFilterItems] = useState<
    { label: string; value: string }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");

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
      setStudents(studentsData);
      const allCourses = studentsData.flatMap((s) => s.courses ?? []);
      const uniqueCourses = Array.from(
        new Map(allCourses.map((c) => [c._id, c])).values()
      );
      const courseItems = [
        { label: "All Courses", value: "all" },
        ...uniqueCourses.map((c) => ({ label: c.courseTitle, value: c._id })),
      ];
      setCourseFilterItems(courseItems);
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

  const filteredStudents = students.filter((s) => {
    if (
      courseFilterValue &&
      courseFilterValue !== "all" &&
      !s.courses?.some((c) => c._id === courseFilterValue)
    ) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const fullName = `${s.firstName} ${s.middleName || ""} ${s.lastName}`.toLowerCase();
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

  const closeProfileModal = useCallback(() => setProfileModalVisible(false), []);
  const closeGradebookModal = useCallback(() => setGradebookModalVisible(false), []);

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Students ({filteredStudents.length})</Text>

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
            <StudentCard student={student} onViewProfile={handleViewProfile} />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No students found.</Text>}
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
  );
};

const styles = StyleSheet.create({
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
