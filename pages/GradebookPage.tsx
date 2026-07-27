import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import SimpleIcon from "../components/SimpleIcon";
import { getOverallGradeReport } from "../services/gradebook";

// Percentage color tiers - matches web's Gradebook.jsx AssessmentTable exactly
const getPercentColor = (pct: number) => {
  if (pct >= 90) return "#16a34a"; // green
  if (pct >= 80) return "#2563eb"; // blue
  if (pct >= 70) return "#ca8a04"; // yellow
  if (pct >= 60) return "#ea580c"; // orange
  return "#dc2626"; // red
};

const getLetterGradeStyle = (letterGrade?: string) => {
  const grade = (letterGrade || "").charAt(0);
  switch (grade) {
    case "A":
      return { bg: "#dcfce7", text: "#166534" };
    case "B":
      return { bg: "#dbeafe", text: "#1e40af" };
    case "C":
      return { bg: "#fef9c3", text: "#854d0e" };
    case "D":
      return { bg: "#ffedd5", text: "#9a3412" };
    default:
      return { bg: "#fee2e2", text: "#991b1b" };
  }
};

const GradebookPage = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    new Set()
  );
  const [expandedSemesters, setExpandedSemesters] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getOverallGradeReport();
        setData(res);
      } catch (err: any) {
        setError(err.message || "Failed to fetch grade report");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const toggleSemester = (semId: string) =>
    setExpandedSemesters((prev) => ({ ...prev, [semId]: !prev[semId] }));

  // ─── Assessment list: each field (Assessment/Category/Score/Max
  // Points/Percentage) as its own labeled row, value against it - not a
  // column-header table. Label has a fixed width and the value sits to its
  // right and wraps (instead of overlapping) when long.
  const renderAssessmentTable = (assessments: any[]) => {
    if (!assessments || assessments.length === 0) {
      return <Text style={styles.noAssessments}>No assessments available</Text>;
    }
    return (
      <View>
        {assessments.map((a: any, idx: number) => {
          const max = Number(a.maxPoints ?? 0);
          const pts = Number(a.studentPoints ?? 0);
          const pct = max > 0 ? (pts / max) * 100 : 0;
          return (
            <View key={a.assessmentId || idx} style={styles.assessmentCard}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Assessment</Text>
                <Text style={styles.fieldValueStrong}>
                  {a.assessmentTitle || "Assessment"}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Category</Text>
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryChipText} numberOfLines={1}>
                    {a.category || "—"}
                  </Text>
                </View>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Score</Text>
                <Text style={styles.fieldValue}>
                  {isNaN(pts) ? "0" : String(pts)}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Max Points</Text>
                <Text style={styles.fieldValue}>
                  {isNaN(max) ? "0" : String(max)}
                </Text>
              </View>
              <View style={[styles.fieldRow, styles.fieldRowLast]}>
                <Text style={styles.fieldLabel}>Percentage</Text>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={[
                      styles.fieldValueStrong,
                      { color: getPercentColor(pct) },
                    ]}
                  >
                    {pct.toFixed(1)}%
                  </Text>
                  {a.isGraded === false && (
                    <Text style={styles.manualCheckText}>Manual check</Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // ─── Quarter-level grade summary: GPA + Letter badge, or Points + Remark ───
  // (fallback text is "Pending" for both fields - matches web's per-quarter display)
  const renderQuarterGradeSummary = (
    gradingSystem: string,
    quarter: { gpa?: number; letterGrade?: string },
    standardGrade?: { points?: number; remarks?: string }
  ) => {
    if (gradingSystem === "normalGrading") {
      const letterStyle = getLetterGradeStyle(quarter.letterGrade);
      return (
        <View style={styles.gradeSummaryRow}>
          <Text style={styles.gradeSummaryText}>
            GPA:{" "}
            <Text style={styles.gradeSummaryValue}>{quarter.gpa ?? "—"}</Text>
          </Text>
          <View
            style={[styles.letterBadge, { backgroundColor: letterStyle.bg }]}
          >
            <Text style={[styles.letterBadgeText, { color: letterStyle.text }]}>
              {quarter.letterGrade || "—"}
            </Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.gradeSummaryRow}>
        <Text style={styles.gradeSummaryText}>
          Points:{" "}
          <Text style={styles.gradeSummaryValue}>
            {standardGrade?.points ?? "Pending"}
          </Text>
        </Text>
        <Text style={styles.gradeSummaryText}>
          Remark:{" "}
          <Text style={styles.gradeSummaryValue}>
            {standardGrade?.remarks ?? "Pending"}
          </Text>
        </Text>
      </View>
    );
  };

  // ─── Course-level grade summary (for courses with no semester/quarter
  // structure): plain "Letter Grade" text (no GPA/badge), or Remarks + Points
  // with "N/A"/"—" fallbacks - matches web's Case 2 exactly, distinct from
  // the quarter-level summary above.
  const renderCourseGradeSummary = (
    gradingSystem: string,
    course: { letterGrade?: string },
    standardGrade?: { points?: number; remarks?: string }
  ) => {
    if (gradingSystem === "normalGrading") {
      return (
        <View style={styles.gradeSummaryRow}>
          <Text style={styles.gradeSummaryText}>
            Letter Grade:{" "}
            <Text style={styles.gradeSummaryValue}>
              {course.letterGrade || "—"}
            </Text>
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.gradeSummaryRow}>
        <Text style={styles.gradeSummaryText}>
          Remarks:{" "}
          <Text style={styles.gradeSummaryValue}>
            {standardGrade?.remarks || "N/A"}
          </Text>
        </Text>
        <Text style={styles.gradeSummaryText}>
          Points:{" "}
          <Text style={styles.gradeSummaryValue}>
            {standardGrade?.points ?? "—"}
          </Text>
        </Text>
      </View>
    );
  };

  const renderQuarterCard = (quarter: any, gradingSystem: string) => (
    <View key={quarter.quarterId} style={styles.quarterCard}>
      <View style={styles.quarterHeader}>
        <Text style={styles.quarterTitle} numberOfLines={1}>
          {quarter.quarterTitle || "Quarter"}
        </Text>
        <Text style={styles.quarterGradeText}>
          Grade:{" "}
          <Text style={styles.quarterGradeValue}>{quarter.grade ?? 0}%</Text>
        </Text>
      </View>
      {renderQuarterGradeSummary(gradingSystem, quarter, quarter.standardGrade)}
      <View style={styles.quarterTableWrap}>
        {renderAssessmentTable(quarter.assessments)}
      </View>
    </View>
  );

  const renderSemester = (semester: any, sIdx: number) => {
    const semId = semester?.semesterId || semester?._id || `sem-${sIdx}`;
    const quartersCount = Array.isArray(semester.quarters)
      ? semester.quarters.length
      : 0;
    const isOpen = !!expandedSemesters[semId];
    return (
      <View key={semId} style={styles.semesterBlock}>
        <View style={styles.semesterSection}>
          <Text style={styles.semesterTitle} numberOfLines={1}>
            {semester.semesterTitle || "Semester"}
          </Text>
          <TouchableOpacity
            onPress={() => toggleSemester(semId)}
            style={styles.quarterToggle}
          >
            <Text style={styles.quarterToggleText}>
              {isOpen ? "▾" : "▸"} {quartersCount} Quarter
              {quartersCount === 1 ? "" : "s"}
            </Text>
          </TouchableOpacity>
        </View>

        {isOpen &&
          (quartersCount > 0 ? (
            semester.quarters.map((qtr: any) =>
              renderQuarterCard(qtr, semester.gradingSystem)
            )
          ) : (
            <Text style={styles.noDataText}>No quarters available</Text>
          ))}
      </View>
    );
  };

  const renderCourseDetails = (course: any) => {
    const hasSemesters =
      Array.isArray(course.semesters) && course.semesters.length > 0;
    const hasCourseItems =
      Array.isArray(course.courseItems) && course.courseItems.length > 0;

    if (hasSemesters) {
      return (
        <View style={styles.courseDetails}>
          {course.semesters.map((sem: any, idx: number) =>
            renderSemester(
              // attach gradingSystem so nested renderQuarterCard can read it
              { ...sem, gradingSystem: course.gradingSystem },
              idx
            )
          )}
        </View>
      );
    }

    if (hasCourseItems) {
      return (
        <View style={styles.courseDetails}>
          {renderCourseGradeSummary(
            course.gradingSystem,
            course,
            course.standardGrade
          )}
          <View style={styles.quarterTableWrap}>
            {renderAssessmentTable(course.courseItems)}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.courseDetails}>
        <Text style={styles.noDataText}>
          No assessments available for this course
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.performanceCard}>
          <Text style={styles.performanceTitle}>
            Overall Academic Performance
          </Text>
          <View style={styles.performanceRow}>
            <Text style={styles.gpaLabel}>Overall GPA</Text>
            <Text style={styles.gpaValue}>
              {data?.overallGPA != null
                ? Number(data.overallGPA).toFixed(2)
                : "0.00"}
            </Text>
            <Text style={styles.coursesCount}>
              {Array.isArray(data?.courses)
                ? `${data.courses.length} Courses`
                : "0 Courses"}
            </Text>
          </View>
        </View>

        <View style={styles.courseDetailsCard}>
          <View style={styles.courseDetailsHeader}>
            <Text style={styles.courseDetailsTitle}>Course Details</Text>
            {/* <Text style={styles.pageInfo}>
              Page {data?.currentPage ?? 1} of {data?.totalPages ?? 1}
            </Text> */}
          </View>

          {/* Column header row - Course | Structure | Total % | Action */}
          {!loading && !error && data?.courses?.length > 0 && (
            <View style={styles.courseTableHeaderRow}>
              <Text style={[styles.courseTableHeaderCell, { flex: 1.6 }]}>
                Course
              </Text>
              <Text style={[styles.courseTableHeaderCell, { flex: 1.2 }]}>
                Structure
              </Text>
              <Text
                style={[
                  styles.courseTableHeaderCell,
                  styles.tableCellCenter,
                  { flex: 1.1 },
                ]}
              >
                Total %
              </Text>
              <Text
                style={[
                  styles.courseTableHeaderCell,
                  styles.tableCellCenter,
                  { flex: 1.3 },
                ]}
              >
                Action
              </Text>
            </View>
          )}

          {loading ? (
            <ActivityIndicator color="#10B144" style={{ marginVertical: 32 }} />
          ) : error ? (
            <Text style={styles.noDataText}>{error}</Text>
          ) : data && data.courses && data.courses.length > 0 ? (
            data.courses.map((course: any) => {
              const courseId = course.courseId || course._id;
              const isExpanded = expandedCourses.has(courseId);
              const structureSummary =
                course.semesters?.length > 0
                  ? `${course.semesters.length} semester${
                      course.semesters.length !== 1 ? "s" : ""
                    }`
                  : course.courseItems?.length > 0
                  ? `${course.courseItems.length} item${
                      course.courseItems.length !== 1 ? "s" : ""
                    }`
                  : "No data";

              return (
                <View key={courseId} style={styles.courseItem}>
                  <View style={styles.courseRow}>
                    <Text
                      style={[styles.courseName, { flex: 1.6 }]}
                      numberOfLines={2}
                    >
                      {course.courseName || "Untitled Course"}
                    </Text>
                    <Text style={[styles.courseCell, { flex: 1.2 }]}>
                      {structureSummary}
                    </Text>
                    <Text
                      style={[
                        styles.courseCell,
                        styles.tableCellCenter,
                        { flex: 1.1, fontWeight: "700", color: "#10B144" },
                      ]}
                    >
                      {course.coursePercentage ?? 0}%
                    </Text>
                    <View style={styles.actionButtonsWrap}>
                      <TouchableOpacity
                        style={styles.analyticsButton}
                        onPress={() =>
                          navigation.navigate("CourseAnalytics", { courseId })
                        }
                      >
                        <SimpleIcon name="star" size={12} color="#2563eb" />
                        <Text style={styles.analyticsButtonText}>
                          Analytics
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => toggleCourse(courseId)}
                      >
                        <Text style={styles.actionText}>
                          {isExpanded ? "▴ Hide" : "▾ Show"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {isExpanded && renderCourseDetails(course)}
                </View>
              );
            })
          ) : (
            <Text style={styles.noDataText}>
              You haven't performed any assessment
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 16,
  },
  performanceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  performanceTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#10B144",
    marginBottom: 12,
    textAlign: "left",
  },
  performanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  gpaLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
  gpaValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#10B144",
    marginLeft: 8,
  },

  coursesCount: {
    fontSize: 16,
    color: "#7b8794",
    marginLeft: "auto",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  courseDetailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  courseDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  courseDetailsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  pageInfo: {
    fontSize: 13,
    color: "#7b8794",
  },
  courseTableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
    marginBottom: 6,
  },
  courseTableHeaderCell: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  courseItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 12,
  },
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  courseName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    paddingRight: 6,
  },
  courseCell: {
    fontSize: 13,
    color: "#374151",
  },
  actionButtonsWrap: {
    flex: 1.3,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },
  actionButton: {
    backgroundColor: "#ecfdf3",
    borderWidth: 1,
    borderColor: "#10B144",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionText: {
    fontSize: 12,
    color: "#10B144",
    fontWeight: "700",
  },
  analyticsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#2563eb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  analyticsButtonText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "700",
  },
  courseDetails: {
    marginTop: 14,
    paddingTop: 4,
  },
  semesterBlock: {
    marginBottom: 14,
  },
  semesterSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  semesterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flexShrink: 1,
    marginRight: 8,
  },
  quarterToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quarterToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  quarterCard: {
    backgroundColor: "#fafbfc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 14,
    marginBottom: 12,
  },
  quarterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  quarterTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    flexShrink: 1,
    marginRight: 8,
  },
  quarterGradeText: {
    fontSize: 13,
    color: "#374151",
  },
  quarterGradeValue: {
    color: "#16a34a",
    fontWeight: "700",
  },
  gradeSummaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 14,
    marginBottom: 10,
  },
  gradeSummaryText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  gradeSummaryValue: {
    color: "#2563eb",
    fontWeight: "700",
  },
  letterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  letterBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  quarterTableWrap: {
    marginTop: 4,
  },
  tableCellCenter: {
    textAlign: "center",
  },
  assessmentCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  fieldRowLast: {
    borderBottomWidth: 0,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    width: 92,
    paddingTop: 1,
  },
  fieldValue: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    textAlign: "right",
  },
  fieldValueStrong: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
    textAlign: "right",
  },
  categoryChip: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryChipText: {
    fontSize: 11,
    color: "#374151",
    fontWeight: "600",
  },
  manualCheckText: {
    fontSize: 9,
    color: "#ca8a04",
    marginTop: 2,
    textAlign: "center",
  },
  noAssessments: {
    textAlign: "center",
    color: "#7b8794",
    fontSize: 13,
    paddingVertical: 16,
  },
  noDataText: {
    color: "#6b7280",
    textAlign: "center",
    fontSize: 14,
    paddingVertical: 20,
  },
});

export default GradebookPage;
