import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import {
  getAllAssessmentsByTeacher,
  getAssessmentSubmissionsForTeacher,
  getSubmissionDetails,
  submitGrades,
} from "../services/course";
import SubmissionsModal from "../components/assessment/Submissionsmodal";
import SubmissionDetailModal from "../components/assessment/Submissiondetailmodal";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
const AssessmentsPage = () => {
  const [rawAssessments, setRawAssessments] = useState<any[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Dropdown state ──────────────────────────────────────────────────────────
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState<string | null>(null);
  const [categoryItems, setCategoryItems] = useState<
    { label: string; value: string }[]
  >([]);
  const [courseOpen, setCourseOpen] = useState(false);
  const [courseValue, setCourseValue] = useState<string | null>(null);
  const [courseItems, setCourseItems] = useState<
    { label: string; value: string }[]
  >([]);
  const [datesOpen, setDatesOpen] = useState(false);
  const [datesValue, setDatesValue] = useState<string | null>(null);
  const [datesItems, setDatesItems] = useState([
    { label: "All Dates", value: "all" },
  ]);

  // ── Submissions modal state ─────────────────────────────────────────────────
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [statusValue, setStatusValue] = useState<string>("all");
  const [modalStatusOpen, setModalStatusOpen] = useState(false);
  const [gradingValue, setGradingValue] = useState<string | null>(null);
  const [modalGradingOpen, setModalGradingOpen] = useState(false);

  // ── Detail modal state ──────────────────────────────────────────────────────
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

  // ── Dropdown interlock ──────────────────────────────────────────────────────
  useEffect(() => {
    if (categoryOpen) {
      setCourseOpen(false);
      setDatesOpen(false);
    }
  }, [categoryOpen]);
  useEffect(() => {
    if (courseOpen) {
      setCategoryOpen(false);
      setDatesOpen(false);
    }
  }, [courseOpen]);
  useEffect(() => {
    if (datesOpen) {
      setCategoryOpen(false);
      setCourseOpen(false);
    }
  }, [datesOpen]);

  // const handleInstantReminder = async () => {
  //   if (!assessment?._id) return;
  //   try {
  //     setLoadingReminder(true);
  //     const res = await axiosInstance.post(
  //       `/assessment/${assessment._id}/send-reminder`,
  //     );
  //     setStatusMessage({
  //       type: "success",
  //       text: res.data.message || "Reminders sent!",
  //     });
  //     setTimeout(() => setStatusMessage(null), 4000);
  //   } catch (err) {
  //     setStatusMessage({
  //       type: "error",
  //       text: err?.response?.data?.message || "Failed to send.",
  //     });
  //   } finally {
  //     setLoadingReminder(false);
  //   }
  // };
  useEffect(() => {
    console.log("hi this is assessment page screen!");
  }, []);

  // ── Fetch initial data ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllAssessmentsByTeacher();
        setRawAssessments(data);

        const uniqueCategories = Array.from(
          new Map(
            data.map((a: any) => [
              a.category._id,
              { label: a.category.name, value: a.category._id },
            ])
          ).values()
        ) as { label: string; value: string }[];
        setCategoryItems([
          { label: "All Topics", value: "all" },
          ...uniqueCategories,
        ]);

        const uniqueCourses = Array.from(
          new Map(
            data.map((a: any) => [
              a.course._id,
              { label: a.course.courseTitle, value: a.course._id },
            ])
          ).values()
        ) as { label: string; value: string }[];
        setCourseItems([
          { label: "All Courses", value: "all" },
          ...uniqueCourses,
        ]);

        const formattedDates = Array.from(
          new Map(
            data.map((a: any) => [
              formatDate(a.createdAt),
              { label: formatDate(a.createdAt), value: a.createdAt },
            ])
          ).values()
        ).sort(
          (a: any, b: any) =>
            new Date(b.value).getTime() - new Date(a.value).getTime()
        );
        setDatesItems([
          { label: "All Dates", value: "all" },
          ...(formattedDates as any),
        ]);
      } catch (err: any) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // ── Filter assessments ──────────────────────────────────────────────────────
  useEffect(() => {
    setFilteredAssessments(
      rawAssessments.filter((a: any) => {
        const matchesCategory =
          !categoryValue || categoryValue === "all"
            ? true
            : a.category._id === categoryValue;
        const matchesCourse =
          !courseValue || courseValue === "all"
            ? true
            : a.course._id === courseValue;
        const matchesDate =
          !datesValue || datesValue === "all"
            ? true
            : a.createdAt === datesValue;
        return matchesCategory && matchesCourse && matchesDate;
      })
    );
  }, [categoryValue, courseValue, datesValue, rawAssessments]);

  // ── Open submissions modal ──────────────────────────────────────────────────
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

  // ── Filtered submissions ────────────────────────────────────────────────────
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

  // ── Open detail modal ───────────────────────────────────────────────────────
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

  // ── Grade change ────────────────────────────────────────────────────────────
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

  // ── Submit grades ───────────────────────────────────────────────────────────
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
        Alert.alert(
          "Validation Error",
          "Please enter at least one grade before submitting."
        );
        return;
      }
      await submitGrades(selectedSubmission._id, grades);
      const updated = await getSubmissionDetails(selectedSubmission._id);
      setSubmissionDetails(updated.submission);
      setGradesSubmitted(true);
    } catch {
      Alert.alert("Error", "Failed to submit grades. Please try again.");
    } finally {
      setSubmittingGrades(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ScrollView style={styles.container}>
      {/* Filters */}
      <View style={styles.dropdownContainer}>
        {[
          {
            open: categoryOpen,
            value: categoryValue,
            items: categoryItems,
            setOpen: setCategoryOpen,
            setValue: setCategoryValue,
            placeholder: "Select Category",
            zIndex: 3000,
          },
          {
            open: courseOpen,
            value: courseValue,
            items: courseItems,
            setOpen: setCourseOpen,
            setValue: setCourseValue,
            placeholder: "Select Course",
            zIndex: 2000,
          },
          {
            open: datesOpen,
            value: datesValue,
            items: datesItems,
            setOpen: setDatesOpen,
            setValue: setDatesValue,
            placeholder: "All Dates",
            zIndex: 1000,
          },
        ].map((d, i) => (
          <View key={i} style={styles.dropdownWrapper}>
            <DropDownPicker
              open={d.open}
              value={d.value}
              items={d.items}
              setOpen={d.setOpen}
              setValue={d.setValue}
              setItems={() => {}}
              placeholder={d.placeholder}
              style={styles.dropdownPicker}
              containerStyle={styles.dropdownContainerStyle}
              zIndex={d.zIndex}
              zIndexInverse={0}
            />
          </View>
        ))}
      </View>

      {/* Assessment Cards */}
      <View style={styles.cardsContainer}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007bff"
            style={{ marginTop: 50 }}
          />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
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
                <Text style={styles.cardTitle}>{assessment.title}</Text>
                <View style={styles.tagRow}>
                  <Text style={styles.cardTag}>{assessment.category.name}</Text>
                </View>
                <View style={styles.courseRow}>
                  <View style={styles.plusCircle}>
                    <Text style={styles.plus}>+</Text>
                  </View>
                  <Text style={styles.courseTitle}>
                    {assessment.course.courseTitle}
                  </Text>
                </View>
                <Text style={styles.cardDesc}>{assessment.description}</Text>
                <Text style={styles.cardDate}>
                  Due: {formatDate(assessment.dueDate?.date)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* ── Submissions Modal ── */}
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

      {/* ── Submission Detail Modal ── */}
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
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  dropdownContainer: { marginBottom: 16 },
  dropdownWrapper: { marginBottom: 10 },
  dropdownPicker: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderRadius: 8,
  },
  dropdownContainerStyle: { height: 50, marginBottom: 10 },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },
  errorText: { fontSize: 16, color: "red", textAlign: "center", marginTop: 50 },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
