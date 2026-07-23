// components/modals/GradebookModal.tsx
import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import SimpleIcon from "../SimpleIcon";
import { Student, Semester, Quarter, Assessment } from "../../types/course";

interface GradebookModalProps {
  visible: boolean;
  onClose: () => void;
  gradebookLoading: boolean;
  gradebookData: any;
  gradebookError: string | null;
  expandedStudents: Set<string>;
  expandedSemesters: Set<string>;
  expandedQuarters: Set<string>;
  onToggleStudent: (studentId: string) => void;
  onToggleSemester: (semesterId: string) => void;
  onToggleQuarter: (quarterId: string) => void;
}

// Percentage color tiers / letter grade styling - mirrors GradebookPage.tsx
// and the Students section's GradebookTable for visual consistency.
const getPercentColor = (pct: number) => {
  if (pct >= 90) return "#16a34a";
  if (pct >= 80) return "#2563eb";
  if (pct >= 70) return "#ca8a04";
  if (pct >= 60) return "#ea580c";
  return "#dc2626";
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

// Key-value field row: label fixed-width on the left, value on the right,
// wrapping (not overlapping/truncating) when long - the "Students section"
// pattern this modal is being aligned to.
const FieldRow: React.FC<{
  label: string;
  value: React.ReactNode;
  last?: boolean;
}> = ({ label, value, last }) => (
  <View style={[styles.fieldRow, last && styles.fieldRowLast]}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.fieldValueWrap}>
      {typeof value === "string" || typeof value === "number" ? (
        <Text style={styles.fieldValue}>{value}</Text>
      ) : (
        value
      )}
    </View>
  </View>
);

const AssessmentTable: React.FC<{ assessments?: Assessment[] }> = ({ assessments }) => {
  if (!assessments || assessments.length === 0) {
    return <Text style={styles.noDataText}>No assessments found.</Text>;
  }
  return (
    <View>
      {assessments.map((assessment) => {
        const max = Number(assessment.maxPoints ?? 0);
        const pts = Number(assessment.studentPoints ?? 0);
        const pct = max > 0 ? (pts / max) * 100 : 0;
        return (
          <View key={assessment.assessmentId} style={styles.assessmentCard}>
            <FieldRow label="Assessment" value={assessment.assessmentTitle || "Untitled"} />
            <FieldRow
              label="Category"
              value={
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryChipText} numberOfLines={1}>
                    {assessment.category || "—"}
                  </Text>
                </View>
              }
            />
            <FieldRow label="Score" value={Number.isFinite(pts) ? String(pts) : "0"} />
            <FieldRow label="Max Points" value={Number.isFinite(max) ? String(max) : "0"} />
            <FieldRow
              label="Percentage"
              last
              value={
                <Text style={[styles.fieldValueStrong, { color: getPercentColor(pct) }]}>
                  {pct.toFixed(1)}%
                </Text>
              }
            />
          </View>
        );
      })}
    </View>
  );
};

const MemoAssessmentTable = React.memo(AssessmentTable);

const GradebookModal: React.FC<GradebookModalProps> = ({
  visible,
  onClose,
  gradebookLoading,
  gradebookData,
  gradebookError,
  expandedStudents,
  expandedSemesters,
  expandedQuarters,
  onToggleStudent,
  onToggleSemester,
  onToggleQuarter,
}) => {
  const courseType: "semester-based" | "chapter-based" =
    gradebookData?.courseType || "semester-based";
  const gradingSystem: "normalGrading" | "StandardGrading" =
    gradebookData?.gradingSystem || "normalGrading";
  const isNormalGrading = gradingSystem === "normalGrading";

  const hasGradeData = (student: Student) =>
    courseType === "semester-based"
      ? (student.semesters?.length || 0) > 0
      : (student.chapters?.length || 0) > 0;

  return (
    <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gradebook</Text>
          <TouchableOpacity onPress={onClose}>
            <SimpleIcon name="close" size={32} color="#333" />
          </TouchableOpacity>
        </View>
        {gradebookLoading ? (
          <ActivityIndicator size="large" color="#10B144" style={styles.loader} />
        ) : gradebookError ? (
          <Text style={styles.errorText}>{gradebookError}</Text>
        ) : gradebookData ? (
          <ScrollView contentContainerStyle={styles.contentContainer}>
            {gradebookData.gradebook?.length > 0 ? (
              gradebookData.gradebook.map((student: Student) => {
                const gradeAvailable = hasGradeData(student);
                const finalPercent = isNormalGrading
                  ? student.finalGrade
                  : student.standardGrade?.finalGrade;
                const letterStyle = getLetterGradeStyle(student.letterGrade);

                return (
                  <View key={student.studentId} style={styles.studentCard}>
                    <TouchableOpacity
                      onPress={() => onToggleStudent(student.studentId)}
                      style={styles.studentHeader}
                    >
                      <Text style={styles.expandIcon}>
                        {expandedStudents.has(student.studentId) ? "▼" : "▶"}
                      </Text>
                      <Text style={styles.studentName} numberOfLines={2}>
                        {student.studentName || "Unknown Student"}
                      </Text>
                    </TouchableOpacity>

                    <FieldRow
                      label="Final Grade"
                      value={gradeAvailable && finalPercent != null ? `${finalPercent}%` : "---"}
                    />
                    {isNormalGrading ? (
                      <>
                        <FieldRow
                          label="Letter Grade"
                          value={
                            <View style={[styles.letterGradeBadge, { backgroundColor: letterStyle.bg }]}>
                              <Text style={[styles.letterGradeText, { color: letterStyle.text }]}>
                                {gradeAvailable ? student.letterGrade || "—" : "---"}
                              </Text>
                            </View>
                          }
                        />
                        <FieldRow
                          label="GPA"
                          last
                          value={gradeAvailable ? student.gpa ?? "—" : "---"}
                        />
                      </>
                    ) : (
                      <>
                        <FieldRow
                          label="Points"
                          value={gradeAvailable ? student.standardGrade?.points ?? "—" : "---"}
                        />
                        <FieldRow
                          label="Remarks"
                          last
                          value={gradeAvailable ? student.standardGrade?.remarks ?? "—" : "---"}
                        />
                      </>
                    )}

                    {expandedStudents.has(student.studentId) && (
                      <View style={styles.expandedContent}>
                        <Text style={styles.performanceTitle}>Academic Performance Breakdown</Text>

                        {courseType === "semester-based" ? (
                          student.semesters && student.semesters.length > 0 ? (
                            student.semesters.map((semester: Semester) => (
                              <View key={semester.semesterId} style={styles.semesterItem}>
                                <TouchableOpacity
                                  onPress={() => onToggleSemester(semester.semesterId)}
                                  style={styles.semesterButton}
                                >
                                  <Text style={styles.expandIcon}>
                                    {expandedSemesters.has(semester.semesterId) ? "▼" : "▶"}
                                  </Text>
                                  <Text style={styles.semesterTitle} numberOfLines={1}>
                                    {semester.semesterTitle}
                                  </Text>
                                </TouchableOpacity>

                                {isNormalGrading ? (
                                  <FieldRow
                                    label="Grade"
                                    last
                                    value={
                                      <View style={styles.gradeSummaryRow}>
                                        <Text style={styles.fieldValue}>{semester.grade ?? 0}%</Text>
                                        <View
                                          style={[
                                            styles.letterGradeBadge,
                                            { backgroundColor: getLetterGradeStyle(semester.letterGrade).bg },
                                          ]}
                                        >
                                          <Text
                                            style={[
                                              styles.letterGradeText,
                                              { color: getLetterGradeStyle(semester.letterGrade).text },
                                            ]}
                                          >
                                            {semester.letterGrade || "—"}
                                          </Text>
                                        </View>
                                      </View>
                                    }
                                  />
                                ) : (
                                  <FieldRow
                                    label="Grade"
                                    last
                                    value={`${semester.standardGrade?.grade ?? 0}% · Pts: ${
                                      semester.standardGrade?.points ?? "—"
                                    }`}
                                  />
                                )}

                                {expandedSemesters.has(semester.semesterId) && (
                                  <View style={styles.semesterExpanded}>
                                    {semester.quarters?.length > 0 ? (
                                      semester.quarters.map((quarter: Quarter) => (
                                        <View key={quarter.quarterId} style={styles.quarterItem}>
                                          <TouchableOpacity
                                            onPress={() => onToggleQuarter(quarter.quarterId)}
                                            style={styles.quarterButton}
                                          >
                                            <Text style={styles.expandIcon}>
                                              {expandedQuarters.has(quarter.quarterId) ? "▼" : "▶"}
                                            </Text>
                                            <Text style={styles.quarterTitle} numberOfLines={1}>
                                              {quarter.quarterTitle}
                                            </Text>
                                          </TouchableOpacity>

                                          {isNormalGrading ? (
                                            <>
                                              <FieldRow
                                                label="Grade"
                                                value={
                                                  <View style={styles.gradeSummaryRow}>
                                                    <Text style={styles.fieldValue}>{quarter.grade ?? 0}%</Text>
                                                    <View
                                                      style={[
                                                        styles.letterGradeBadge,
                                                        {
                                                          backgroundColor: getLetterGradeStyle(quarter.letterGrade)
                                                            .bg,
                                                        },
                                                      ]}
                                                    >
                                                      <Text
                                                        style={[
                                                          styles.letterGradeText,
                                                          {
                                                            color: getLetterGradeStyle(quarter.letterGrade).text,
                                                          },
                                                        ]}
                                                      >
                                                        {quarter.letterGrade || "—"}
                                                      </Text>
                                                    </View>
                                                  </View>
                                                }
                                              />
                                              <FieldRow label="GPA" last value={quarter.gpa ?? "—"} />
                                            </>
                                          ) : (
                                            <>
                                              <FieldRow label="Grade" value={`${quarter.standardGrade?.grade ?? 0}%`} />
                                              <FieldRow
                                                label="Points"
                                                value={quarter.standardGrade?.points ?? "—"}
                                              />
                                              <FieldRow
                                                label="Remarks"
                                                last
                                                value={quarter.standardGrade?.remarks ?? "—"}
                                              />
                                            </>
                                          )}

                                          {expandedQuarters.has(quarter.quarterId) && (
                                            <View style={styles.quarterExpanded}>
                                              <MemoAssessmentTable assessments={quarter.assessments} />
                                            </View>
                                          )}
                                        </View>
                                      ))
                                    ) : (
                                      <Text style={styles.noDataText}>No quarters found.</Text>
                                    )}
                                  </View>
                                )}
                              </View>
                            ))
                          ) : (
                            <Text style={styles.noDataText}>No semesters found.</Text>
                          )
                        ) : (
                          <View style={styles.directAssessments}>
                            {gradeAvailable && (
                              <>
                                {isNormalGrading ? (
                                  <>
                                    <FieldRow label="Overall" value={`${student.finalGrade ?? 0}%`} />
                                    <FieldRow label="Letter" value={student.letterGrade || "—"} />
                                    <FieldRow label="GPA" last value={student.gpa ?? "—"} />
                                  </>
                                ) : (
                                  <>
                                    <FieldRow
                                      label="Overall"
                                      value={`${student.standardGrade?.finalGrade ?? 0}%`}
                                    />
                                    <FieldRow label="Points" value={student.standardGrade?.points ?? "—"} />
                                    <FieldRow
                                      label="Remarks"
                                      last
                                      value={student.standardGrade?.remarks || "—"}
                                    />
                                  </>
                                )}
                              </>
                            )}
                            <MemoAssessmentTable assessments={student.chapters || []} />
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No students found in this course.</Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <Text style={styles.noDataText}>No gradebook data found.</Text>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingTop: Platform.OS === "ios" ? 40 : 16,
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#1E293B" },
  loader: { marginVertical: 40 },
  errorText: { color: "red", textAlign: "center", marginVertical: 20 },
  contentContainer: { padding: 16 },

  studentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  expandIcon: { fontSize: 16, marginRight: 8, color: "#6b7280", fontWeight: "bold" },
  studentName: { flex: 1, fontSize: 16, fontWeight: "bold", color: "#1E293B", flexShrink: 1 },

  // Key-value field row: label fixed-width, value wraps to the right.
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  fieldRowLast: { borderBottomWidth: 0 },
  fieldLabel: { fontSize: 13, color: "#6b7280", fontWeight: "600", width: 100, paddingTop: 1 },
  fieldValueWrap: { flex: 1, alignItems: "flex-end" },
  fieldValue: { fontSize: 14, color: "#111827", fontWeight: "500", textAlign: "right", flexShrink: 1 },
  fieldValueStrong: { fontSize: 14, color: "#111827", fontWeight: "700", textAlign: "right", flexShrink: 1 },

  letterGradeBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  letterGradeText: { fontWeight: "bold", fontSize: 12 },
  gradeSummaryRow: { flexDirection: "row", alignItems: "center", gap: 8 },

  expandedContent: {
    paddingTop: 12,
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
    paddingLeft: 12,
  },
  performanceTitle: { color: "#6b7280", fontSize: 14, fontWeight: "600", marginBottom: 12 },

  semesterItem: { marginBottom: 12 },
  semesterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 4,
  },
  semesterTitle: { flex: 1, fontSize: 14, fontWeight: "600", color: "#374151", flexShrink: 1 },
  semesterExpanded: {
    marginTop: 8,
    marginLeft: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#d1d5db",
  },

  quarterItem: { marginBottom: 12 },
  quarterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 4,
  },
  quarterTitle: { flex: 1, fontSize: 13, fontWeight: "600", color: "#374151", flexShrink: 1 },
  quarterExpanded: {
    marginTop: 8,
    marginLeft: 12,
    paddingLeft: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  directAssessments: {
    marginTop: 4,
    paddingLeft: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  assessmentCard: {
    backgroundColor: "#fafbfc",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  categoryChip: {
    alignSelf: "flex-end",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryChipText: { fontSize: 11, color: "#374151", fontWeight: "600" },

  noDataText: { fontSize: 13, color: "#9ca3af", textAlign: "center", paddingVertical: 12 },
  emptyContainer: { paddingVertical: 20, alignItems: "center" },
  emptyText: { color: "#6b7280", fontSize: 14, textAlign: "center" },
});

export default GradebookModal;
