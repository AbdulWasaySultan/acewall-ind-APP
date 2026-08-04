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
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  getAllAssessmentsByTeacher,
  getAssessmentSubmissionsForTeacher,
  getSubmissionDetails,
  submitGrades,
  editAssessment,
  getAssessmentCategories,
} from "../services/course";
import SubmissionsModal from "../components/assessment/Submissionsmodal";
import SubmissionDetailModal from "../components/assessment/Submissiondetailmodal";
import EditAssessmentModal from "../components/modals/EditAssessmentModal";
import SearchFilterView from "../components/filters/SearchFilter";
import { FilterBar } from "../components/filters/FilterBar"; // ✅ fixed import
import { DropdownFilter } from "../components/filters/DropDown"; // ✅ fixed import
import SimpleIcon from "../components/SimpleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { validateEditedDate } from "../utils/dateValidation";
import { getFriendlyErrorMessage } from "../utils/errorMessage";


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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, "TeacherAssessmentsByCourse">;

const AssessmentsPage = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const route = useRoute<ScreenRouteProp>();
  const { courseId, courseTitle } = route.params;

  const [rawAssessments, setRawAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState<string | null>(null);
  const [categoryItems, setCategoryItems] = useState<
    { label: string; value: string }[]
  >([]);

  // Matches web's CourseAssessmentList.jsx exactly: static options (not
  // derived from data), filtered against the assessment's `type` field
  // (backend enum: "lesson-assessment" | "chapter-assessment" |
  // "final-assessment" — chapter/lesson ObjectId presence is NOT reliable
  // for this since a lesson-assessment also has `chapter` populated).
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeValue, setTypeValue] = useState<string | null>("all");
  const typeItems = [
    { label: "All Types", value: "all" },
    { label: "Chapter Assessment", value: "chapter-assessment" },
    { label: "Lesson Assessment", value: "lesson-assessment" },
  ];

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

  // ── Edit Assessment (from SubmissionsModal → AssessmentDetailsModal) ──────
  const [assessmentBeingEdited, setAssessmentBeingEdited] = useState<any>(null);
  const [showEditAssessmentModal, setShowEditAssessmentModal] = useState(false);
  const [editAssessmentTitle, setEditAssessmentTitle] = useState("");
  const [editAssessmentDescription, setEditAssessmentDescription] = useState("");
  const [editAssessmentCategory, setEditAssessmentCategory] = useState("");
  const [editAssessmentCategories, setEditAssessmentCategories] = useState<
    { id: string; title: string }[]
  >([]);
  const [showEditCategoryMenu, setShowEditCategoryMenu] = useState(false);
  const [editAssessmentDueDate, setEditAssessmentDueDate] =
    useState<Date | null>(null);
  const [tempEditDate, setTempEditDate] = useState<Date | null>(null);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [showEditTimePicker, setShowEditTimePicker] = useState(false);
  const [editAssessmentLoading, setEditAssessmentLoading] = useState(false);

  useEffect(() => {
    if (categoryOpen) setTypeOpen(false);
  }, [categoryOpen]);
  useEffect(() => {
    if (typeOpen) setCategoryOpen(false);
  }, [typeOpen]);

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

        const missingCategory = assessments.filter((a: any) => !a.category);
        if (missingCategory.length > 0) {
          console.warn(
            "⚠️ Assessments without category:",
            missingCategory.map((a: any) => a._id)
          );
        }

        setRawAssessments(assessments);

        // Scope filter options to just this course (matches web's
        // CourseAssessmentList.jsx, which derives categories from the
        // already course-filtered set).
        const courseAssessments = assessments.filter(
          (a: any) => a.course?._id === courseId
        );

        const categoryMap = new Map();
        courseAssessments.forEach((a: any) => {
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
      } catch (err: any) {
        console.error("❌ Fetch error:", err);
        setError(getFriendlyErrorMessage(err, "Failed to load data."));
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const filteredAssessments = useMemo(() => {
    const result = rawAssessments.filter((a) => a.course?._id === courseId);

    return result.filter((a) => {
      const matchesCategory =
        !categoryValue || categoryValue === "all"
          ? true
          : a.category?._id === categoryValue;
      // Matches web exactly: strict equality against the assessment's
      // `type` field (not chapter/lesson ObjectId presence).
      const matchesType =
        !typeValue || typeValue === "all" ? true : a.type === typeValue;
      const matchesSearch =
        searchQuery.trim() === "" ||
        a.title?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesType && matchesSearch;
    });
  }, [rawAssessments, courseId, categoryValue, typeValue, searchQuery]);

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

  const openEditAssessmentModal = async (assessment: any) => {
    setAssessmentBeingEdited(assessment);
    setEditAssessmentTitle(assessment.title || "");
    setEditAssessmentDescription(assessment.description || "");
    setEditAssessmentCategory(assessment.category?._id || "");
    if (assessment.dueDate?.date) {
      const due = new Date(assessment.dueDate.date);
      if (assessment.dueDate.time) {
        const [h, m] = assessment.dueDate.time.split(":");
        due.setHours(parseInt(h, 10), parseInt(m, 10));
      }
      setEditAssessmentDueDate(due);
    } else {
      setEditAssessmentDueDate(null);
    }
    try {
      const res = await getAssessmentCategories(
        assessment.course?._id || courseId
      );
      setEditAssessmentCategories(
        (res.categories || []).map((cat: any) => ({
          id: cat._id,
          title: cat.name,
        }))
      );
    } catch (error) {
      /* ignore — category picker just falls back to empty */
    }
    setShowEditAssessmentModal(true);
  };

  // Note: this endpoint's assessment objects don't include a `quarter`
  // field (see allAssessmentByTeacher's .select() on the backend), so
  // there's no quarter range to validate against from this screen — and,
  // matching web's EditAssessment.jsx, editing never floors at "today"
  // anyway (only quarter bounds constrain an edit, unlike creating new).
  const handleEditAssessment = async () => {
    if (!assessmentBeingEdited) return;
    if (
      !editAssessmentTitle.trim() ||
      !editAssessmentDescription.trim() ||
      !editAssessmentCategory ||
      !editAssessmentDueDate
    ) {
      Alert.alert("Validation", "All fields are required.");
      return;
    }
    const dueDateCheck = validateEditedDate(editAssessmentDueDate, null);
    if (!dueDateCheck.valid) {
      Alert.alert("Validation", dueDateCheck.reason || "Invalid due date");
      return;
    }
    setEditAssessmentLoading(true);
    try {
      const payload = {
        title: editAssessmentTitle.trim(),
        description: editAssessmentDescription.trim(),
        category: editAssessmentCategory,
        dueDate: editAssessmentDueDate.toISOString(),
      };
      await editAssessment(assessmentBeingEdited._id, payload);

      const categoryMeta = editAssessmentCategories.find(
        (c) => c.id === editAssessmentCategory
      );
      const updatedFields = {
        title: payload.title,
        description: payload.description,
        category: categoryMeta
          ? { _id: categoryMeta.id, name: categoryMeta.title }
          : assessmentBeingEdited.category,
        dueDate: {
          date: editAssessmentDueDate.toISOString().split("T")[0],
          time: `${String(editAssessmentDueDate.getHours()).padStart(
            2,
            "0"
          )}:${String(editAssessmentDueDate.getMinutes()).padStart(2, "0")}`,
        },
      };
      setRawAssessments((prev) =>
        prev.map((a) =>
          a._id === assessmentBeingEdited._id ? { ...a, ...updatedFields } : a
        )
      );
      setSelectedAssessment((prev: any) =>
        prev && prev._id === assessmentBeingEdited._id
          ? { ...prev, ...updatedFields }
          : prev
      );
      setShowEditAssessmentModal(false);
      Alert.alert("Success", "Assessment updated successfully.");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || err.message || "Failed to update assessment"
      );
    } finally {
      setEditAssessmentLoading(false);
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
    <View style={styles.screen}>
      {/* ── Course header — course itself is fixed via route params ── */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <SimpleIcon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {courseTitle || "Assessments for this Course"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

    <ScrollView
      style={styles.container}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {/* ── Search + Category + Dates ── */}
      <View style={{ zIndex: 2000 }}>
        <FilterBar
          resultsCount={filteredAssessments.length}
          resultsLabel="assessments"
          filtersRowStyle={{ flexDirection: "column", gap: 10 }}
        >
          <SearchFilterView
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title"
            style={styles.searchFilterContainer}
          />
          <DropdownFilter
            open={categoryOpen}
            value={categoryValue}
            items={categoryItems}
            setOpen={setCategoryOpen}
            setValue={setCategoryValue}
            placeholder="Select Category"
            zIndex={2000}
            zIndexInverse={1000}
            style={{}}
          />
          <DropdownFilter
            open={typeOpen}
            value={typeValue}
            items={typeItems}
            setOpen={setTypeOpen}
            setValue={setTypeValue}
            placeholder="All Types"
            zIndex={1000}
            zIndexInverse={2000}
          />
        </FilterBar>
      </View>

      {/* ── Assessment Cards — lowest zIndex so dropdowns render above ── */}
      <View style={[styles.cardsContainer, { zIndex: 1 }]}>
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
        onEdit={openEditAssessmentModal}
      />

      <EditAssessmentModal
        visible={showEditAssessmentModal}
        onClose={() => setShowEditAssessmentModal(false)}
        onBackToDetails={() => setShowEditAssessmentModal(false)}
        editAssessmentTitle={editAssessmentTitle}
        setEditAssessmentTitle={setEditAssessmentTitle}
        editAssessmentDescription={editAssessmentDescription}
        setEditAssessmentDescription={setEditAssessmentDescription}
        editAssessmentCategory={editAssessmentCategory}
        setEditAssessmentCategory={setEditAssessmentCategory}
        assessmentCategories={editAssessmentCategories}
        showEditCategoryMenu={showEditCategoryMenu}
        setShowEditCategoryMenu={setShowEditCategoryMenu}
        editAssessmentDueDate={editAssessmentDueDate}
        setEditAssessmentDueDate={setEditAssessmentDueDate}
        tempEditDate={tempEditDate}
        setTempEditDate={setTempEditDate}
        showEditDatePicker={showEditDatePicker}
        setShowEditDatePicker={setShowEditDatePicker}
        showEditTimePicker={showEditTimePicker}
        setShowEditTimePicker={setShowEditTimePicker}
        editAssessmentLoading={editAssessmentLoading}
        handleEditAssessment={handleEditAssessment}
        insets={insets}
        styles={styles}
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
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    minHeight: 56,
    backgroundColor: "#10B144",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: { padding: 4, marginRight: 12 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", flex: 1 },
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 16,
    paddingTop: 16,
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
    marginBottom: 12,
    width: "100%",
    shadowColor: "#000",
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
  searchFilterContainer: {
    // width: "50%",
    // backgroundColor: '#000'
  },

  // ---- Edit Assessment modal (shared with EditAssessmentModal component) ----
  assessmentDetailsHeader: {
    backgroundColor: "#10B144",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  assessmentDetailsBackButton: {
    width: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  assessmentDetailsHeaderTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  editAssessmentLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    marginTop: 16,
  },
  editAssessmentInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#000",
  },
  editAssessmentCategoryButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editAssessmentCategoryButtonText: { fontSize: 16, color: "#000" },
  editAssessmentSaveButton: {
    backgroundColor: "#10B144",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  editAssessmentSaveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  editCategoryDropdownMenu: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
    maxHeight: 180,
    marginTop: 6,
  },
  editCategoryDropdownItem: { paddingHorizontal: 12, paddingVertical: 10 },
  editCategoryDropdownItemActive: { backgroundColor: "#eef2ff" },
});

export default AssessmentsPage;

