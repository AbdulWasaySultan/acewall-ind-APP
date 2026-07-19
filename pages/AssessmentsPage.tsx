import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  getAllAssessmentsByTeacher,
  getAssessmentSubmissionsForTeacher,
  getSubmissionDetails,
  submitGrades,
  getAllCourses,
} from "../services/course";
import SubmissionsModal from "../components/assessment/Submissionsmodal";
import SubmissionDetailModal from "../components/assessment/Submissiondetailmodal";
import CourseSelector from "../components/filters/CourseSelector";
import SearchFilter from "../components/filters/SearchFilter";
import { FilterBar, DropdownFilter } from "../components/filters/FilterBar"; // ✅ fixed import

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const AssessmentsPage = () => {
  const [rawAssessments, setRawAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState<string | null>(null);
  const [categoryItems, setCategoryItems] = useState<
    { label: string; value: string }[]
  >([]);

  const [datesOpen, setDatesOpen] = useState(false);
  const [datesValue, setDatesValue] = useState<string | null>(null);
  const [datesItems, setDatesItems] = useState([
    { label: "All Dates", value: "all" },
  ]);

  const [courseOpen, setCourseOpen] = useState(false);
  const anyDropdownOpen = courseOpen || categoryOpen || datesOpen;

  const dropdownSpacerHeight = useMemo(() => {
    if (!anyDropdownOpen) return 0;
    let itemCount = 0;
    if (courseOpen) {
      itemCount = courses.length + 1;
    } else if (categoryOpen) {
      itemCount = categoryItems.length;
    } else if (datesOpen) {
      itemCount = datesItems.length;
    }
    return itemCount * 25;
  }, [
    anyDropdownOpen,
    courseOpen,
    categoryOpen,
    datesOpen,
    courses,
    categoryItems,
    datesItems,
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [statusValue, setStatusValue] = useState<string>("all");
  const [modalStatusOpen, setModalStatusOpen] = useState(false);
  const [gradingValue, setGradingValue] = useState<string | null>(null);
  const [modalGradingOpen, setModalGradingOpen] = useState(false);

  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [submissionDetails, setSubmissionDetails] = useState<any>(null);
  const [submissionDetailsLoading, setSubmissionDetailsLoading] =
    useState(false);
  const [submissionDetailsError, setSubmissionDetailsError] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "needs_grading" | "graded"
  >("all");
  const [answerGrades, setAnswerGrades] = useState<{ [id: string]: string }>(
    {}
  );
  const [gradesSubmitted, setGradesSubmitted] = useState(false);
  const [submittingGrades, setSubmittingGrades] = useState(false);

  useEffect(() => {
    if (categoryOpen) setDatesOpen(false);
  }, [categoryOpen]);
  useEffect(() => {
    if (datesOpen) setCategoryOpen(false);
  }, [datesOpen]);

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const res = await getAllCourses();
      if (res && Array.isArray(res.courses)) {
        setCourses(res.courses);
      }
    } catch (err: any) {
      console.error("Error fetching courses:", err);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleCourseChange = async (courseId: string | null) => {
    setSelectedCourse(courseId);
    setCategoryValue(null);
    setDatesValue(null);
    setSearchQuery("");
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAllAssessmentsByTeacher();
        console.log("📦 Full API response:", response);

        let assessments = Array.isArray(response)
          ? response
          : response?.assessments || [];
        if (!Array.isArray(assessments)) assessments = [];

        console.log(`✅ Found ${assessments.length} assessments`);

        const missingCategory = assessments.filter((a) => !a.category);
        if (missingCategory.length > 0) {
          console.warn(
            "⚠️ Assessments without category:",
            missingCategory.map((a) => a._id)
          );
        }

        setRawAssessments(assessments);

        const categoryMap = new Map();
        assessments.forEach((a: any) => {
          if (a.category && a.category._id) {
            categoryMap.set(a.category._id, {
              label: a.category.name || "Unnamed",
              value: a.category._id,
            });
          }
        });
        const uniqueCategories = Array.from(categoryMap.values()) as {
          label: string;
          value: string;
        }[];
        setCategoryItems([
          { label: "All Topics", value: "all" },
          ...uniqueCategories,
        ]);
        console.log("📂 Categories:", uniqueCategories.length);

        const dateMap = new Map();
        assessments.forEach((a: any) => {
          if (a.createdAt) {
            const formatted = formatDate(a.createdAt);
            if (!dateMap.has(formatted)) {
              dateMap.set(formatted, { label: formatted, value: a.createdAt });
            }
          }
        });
        const formattedDates = Array.from(dateMap.values()).sort(
          (a, b) => new Date(b.value).getTime() - new Date(a.value).getTime()
        );
        setDatesItems([
          { label: "All Dates", value: "all" },
          ...formattedDates,
        ]);

        console.log("📅 Dates:", formattedDates.length);
      } catch (err: any) {
        console.error("❌ Fetch error:", err);
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    fetchCourses();
  }, []);

  const filteredAssessments = useMemo(() => {
    let result = rawAssessments;
    if (selectedCourse && selectedCourse !== "all") {
      result = result.filter((a) => a.course?._id === selectedCourse);
    }

    return result.filter((a) => {
      const matchesCategory =
        !categoryValue || categoryValue === "all"
          ? true
          : a.category?._id === categoryValue;
      const matchesDate =
        !datesValue || datesValue === "all" ? true : a.createdAt === datesValue;
      const matchesSearch =
        searchQuery.trim() === "" ||
        a.title?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesDate && matchesSearch;
    });
  }, [rawAssessments, selectedCourse, categoryValue, datesValue, searchQuery]);

  const handleAssessmentPress = async (assessment: any) => {
    setSelectedAssessment(assessment);
    setModalVisible(true);
    setSubmissions([]);
    setSubmissionsLoading(true);
    setSubmissionsError(null);
    setStatusValue("all");
    setGradingValue("all");
    try {
      const res = await getAssessmentSubmissionsForTeacher(assessment._id);
      setSubmissions(Array.isArray(res.submissions) ? res.submissions : []);
    } catch {
      setSubmissionsError("Failed to load submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub: any) => {
    let matchesStatus = true;
    if (statusValue === "after_due" && selectedAssessment) {
      matchesStatus =
        new Date(sub.submissionDate || sub.createdAt) >
        new Date(selectedAssessment.dueDate?.date);
    } else if (statusValue === "before_due" && selectedAssessment) {
      matchesStatus =
        new Date(sub.submissionDate || sub.createdAt) <=
        new Date(selectedAssessment.dueDate?.date);
    }
    let matchesGrading = true;
    if (gradingValue === "graded") matchesGrading = sub.graded === true;
    if (gradingValue === "not_graded") matchesGrading = sub.graded === false;
    return matchesStatus && matchesGrading;
  });

  const handleSubmissionPress = async (submission: any) => {
    setModalVisible(false);
    setSelectedSubmission(submission);
    setDetailVisible(true);
    setSubmissionDetails(null);
    setSubmissionDetailsLoading(true);
    setSubmissionDetailsError(null);
    setActiveTab("all");
    setAnswerGrades({});
    setGradesSubmitted(false);
    try {
      const details = await getSubmissionDetails(submission._id);
      setSubmissionDetails(details.submission);
      if (details.submission.graded) setGradesSubmitted(true);
    } catch {
      setSubmissionDetailsError("Failed to load submission details");
    } finally {
      setSubmissionDetailsLoading(false);
    }
  };

  const handleGradeChange = (
    answerId: string,
    value: string,
    maxPoints: number
  ) => {
    const num = parseFloat(value);
    if (value === "" || isNaN(num) || num < 0) {
      setAnswerGrades({ ...answerGrades, [answerId]: "" });
      return;
    }
    setAnswerGrades({
      ...answerGrades,
      [answerId]: Math.min(num, maxPoints).toString(),
    });
  };

  const handleSubmitGrades = async () => {
    if (!submissionDetails || !selectedSubmission) return;
    setSubmittingGrades(true);
    try {
      const grades: {
        [id: string]: { awardedPoints: number; maxPoints: number };
      } = {};
      Object.entries(answerGrades).forEach(([answerId, points]) => {
        const answer = submissionDetails.answers?.find(
          (a: any) => a.questionId === answerId
        );
        if (answer) {
          const awardedPoints = parseFloat(points) || 0;
          const maxPoints = answer.questionDetails?.points || 0;
          if (awardedPoints >= 0 && awardedPoints <= maxPoints) {
            grades[answerId] = { awardedPoints, maxPoints };
          }
        }
      });
      if (Object.keys(grades).length === 0) {
        Alert.alert("Validation Error", "Please enter at least one grade.");
        return;
      }
      await submitGrades(selectedSubmission._id, grades);
      const updated = await getSubmissionDetails(selectedSubmission._id);
      setSubmissionDetails(updated.submission);
      setGradesSubmitted(true);
    } catch {
      Alert.alert("Error", "Failed to submit grades.");
    } finally {
      setSubmittingGrades(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.filterWrapper}>
        <FilterBar
          resultsCount={filteredAssessments.length}
          resultsLabel="assessments"
        >
          <CourseSelector
            courses={courses}
            selectedCourse={selectedCourse}
            onCourseChange={handleCourseChange}
            loading={coursesLoading}
            onOpenChange={setCourseOpen}
          />
        </FilterBar>

        {selectedCourse && (
          <FilterBar>
            <SearchFilter
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title"
            />
            <View style={styles.dropdownContainer}>
              <DropdownFilter
                open={categoryOpen}
                value={categoryValue}
                items={categoryItems}
                setOpen={setCategoryOpen}
                setValue={setCategoryValue}
                placeholder="Select Category"
                zIndex={1000}
                zIndexInverse={1000}
                dropDownContainerStyle={styles.dropDownContainerStyle} // ✅ added
              />
              <DropdownFilter
                open={datesOpen}
                value={datesValue}
                items={datesItems}
                setOpen={setDatesOpen}
                setValue={setDatesValue}
                placeholder="All Dates"
                zIndex={2000}
                zIndexInverse={1000}
                dropDownContainerStyle={styles.dropDownContainerStyle} // ✅ added
              />
            </View>
          </FilterBar>
        )}
      </View>

      {anyDropdownOpen && <View style={{ height: dropdownSpacerHeight }} />}

      <View style={styles.cardsContainer}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007bff"
            style={{ marginTop: 50 }}
          />
        ) : error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : filteredAssessments.length === 0 ? (
          <Text style={styles.emptyText}>No assessments available.</Text>
        ) : (
          filteredAssessments.map((assessment: any) => (
            <TouchableOpacity
              key={assessment._id}
              style={{ width: "100%" }}
              onPress={() => handleAssessmentPress(assessment)}
            >
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {assessment.title || "Untitled"}
                </Text>
                <View style={styles.tagRow}>
                  <Text style={styles.cardTag}>
                    {assessment.category?.name || "Uncategorized"}
                  </Text>
                </View>
                <View style={styles.courseRow}>
                  <View style={styles.plusCircle}>
                    <Text style={styles.plus}>+</Text>
                  </View>
                  <Text style={styles.courseTitle}>
                    {assessment.course?.courseTitle || "No course"}
                  </Text>
                </View>
                <Text style={styles.cardDesc}>
                  {assessment.description || ""}
                </Text>
                <Text style={styles.cardDate}>
                  Due:{" "}
                  {assessment.dueDate?.date
                    ? formatDate(assessment.dueDate.date)
                    : "No due date"}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <SubmissionsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedAssessment={selectedAssessment}
        filteredSubmissions={filteredSubmissions}
        submissionsLoading={submissionsLoading}
        submissionsError={submissionsError}
        statusValue={statusValue}
        setStatusValue={setStatusValue}
        modalStatusOpen={modalStatusOpen}
        setModalStatusOpen={setModalStatusOpen}
        gradingValue={gradingValue}
        setGradingValue={setGradingValue}
        modalGradingOpen={modalGradingOpen}
        setModalGradingOpen={setModalGradingOpen}
        onSubmissionPress={handleSubmissionPress}
        formatDate={formatDate}
        formatDateTime={formatDateTime}
      />

      <SubmissionDetailModal
        visible={detailVisible}
        onClose={() => {
          setDetailVisible(false);
          setModalVisible(true);
        }}
        submissionDetails={submissionDetails}
        submissionDetailsLoading={submissionDetailsLoading}
        submissionDetailsError={submissionDetailsError}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        answerGrades={answerGrades}
        gradesSubmitted={gradesSubmitted}
        submittingGrades={submittingGrades}
        onGradeChange={handleGradeChange}
        onSubmitGrades={handleSubmitGrades}
        formatDateTime={formatDateTime}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filterWrapper: { flex: 1, backgroundColor: "cyan" },
  dropdownContainer: {
    backgroundColor: "#000",
    // You can add more styling if needed
  },
  dropDownContainerStyle: {
    zIndex: 9999,
    elevation: 9999,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },
  errorText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    width: "100%",
    shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // elevation: 0,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  tagRow: { flexDirection: "row", marginBottom: 10 },
  cardTag: {
    backgroundColor: "#e6ffe6",
    color: "#00a000",
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    fontSize: 12,
    fontWeight: "bold",
  },
  courseRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  plusCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e6ffe6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  plus: { color: "#00a000", fontSize: 16, fontWeight: "bold" },
  courseTitle: { fontSize: 16, color: "#555", fontWeight: "600" },
  cardDesc: { fontSize: 16, color: "#444", marginBottom: 10 },
  cardDate: { fontSize: 13, color: "#777", fontStyle: "italic" },
});

export default AssessmentsPage;
