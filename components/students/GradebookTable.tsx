import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { StudentCourseGradebook } from "../../services/student";
import { Assessment, Quarter, Semester } from "../../types/course";

// Percentage color tiers / letter grade styling - mirrors GradebookPage.tsx
// exactly so this modal and the student's own Gradebook page look consistent.
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

const AssessmentTable: React.FC<{ assessments?: Assessment[] }> = ({ assessments }) => {
  if (!assessments || assessments.length === 0) {
    return <Text style={styles.noAssessments}>No assessments available</Text>;
  }
  return (
    <View>
      {assessments.map((a, idx) => {
        const max = Number(a.maxPoints ?? 0);
        const pts = Number(a.studentPoints ?? 0);
        const pct = max > 0 ? (pts / max) * 100 : 0;
        return (
          <View key={a.assessmentId || idx} style={styles.assessmentCard}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Assessment</Text>
              <Text style={styles.fieldValueStrong}>{a.assessmentTitle || "Assessment"}</Text>
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
              <Text style={styles.fieldValue}>{Number.isFinite(pts) ? String(pts) : "0"}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Max Points</Text>
              <Text style={styles.fieldValue}>{Number.isFinite(max) ? String(max) : "0"}</Text>
            </View>
            <View style={[styles.fieldRow, styles.fieldRowLast]}>
              <Text style={styles.fieldLabel}>Percentage</Text>
              <Text style={[styles.fieldValueStrong, { color: getPercentColor(pct) }]}>
                {pct.toFixed(1)}%
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const MemoAssessmentTable = React.memo(AssessmentTable);

// Quarter-level grade summary: GPA + Letter badge, or Points + Remark
// ("Pending" fallback for both) - matches web/GradebookPage's per-quarter case.
const QuarterGradeSummary: React.FC<{ gradingSystem: string; quarter: Quarter }> = ({
  gradingSystem,
  quarter,
}) => {
  if (gradingSystem === "normalGrading") {
    const letterStyle = getLetterGradeStyle(quarter.letterGrade);
    return (
      <View style={styles.gradeSummaryRow}>
        <Text style={styles.gradeSummaryText}>
          GPA: <Text style={styles.gradeSummaryValue}>{quarter.gpa ?? "—"}</Text>
        </Text>
        <View style={[styles.letterBadge, { backgroundColor: letterStyle.bg }]}>
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
        Points: <Text style={styles.gradeSummaryValue}>{quarter.standardGrade?.points ?? "Pending"}</Text>
      </Text>
      <Text style={styles.gradeSummaryText}>
        Remark: <Text style={styles.gradeSummaryValue}>{quarter.standardGrade?.remarks ?? "Pending"}</Text>
      </Text>
    </View>
  );
};

// Course-level grade summary (no semester/quarter structure): plain
// "Letter Grade" text, or Remarks + Points with "N/A"/"—" fallbacks -
// distinct from the quarter-level summary, matching GradebookPage exactly.
const CourseGradeSummary: React.FC<{
  gradingSystem: string;
  letterGrade?: string;
  standardGrade?: { points?: number; remarks?: string };
}> = ({ gradingSystem, letterGrade, standardGrade }) => {
  if (gradingSystem === "normalGrading") {
    return (
      <View style={styles.gradeSummaryRow}>
        <Text style={styles.gradeSummaryText}>
          Letter Grade: <Text style={styles.gradeSummaryValue}>{letterGrade || "—"}</Text>
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.gradeSummaryRow}>
      <Text style={styles.gradeSummaryText}>
        Remarks: <Text style={styles.gradeSummaryValue}>{standardGrade?.remarks || "N/A"}</Text>
      </Text>
      <Text style={styles.gradeSummaryText}>
        Points: <Text style={styles.gradeSummaryValue}>{standardGrade?.points ?? "—"}</Text>
      </Text>
    </View>
  );
};

const QuarterCard: React.FC<{ quarter: Quarter; gradingSystem: string }> = ({
  quarter,
  gradingSystem,
}) => (
  <View style={styles.quarterCard}>
    <View style={styles.quarterHeader}>
      <Text style={styles.quarterTitle} numberOfLines={1}>
        {quarter.quarterTitle || "Quarter"}
      </Text>
      <Text style={styles.quarterGradeText}>
        Grade: <Text style={styles.quarterGradeValue}>{quarter.grade ?? 0}%</Text>
      </Text>
    </View>
    <QuarterGradeSummary gradingSystem={gradingSystem} quarter={quarter} />
    <View style={styles.quarterTableWrap}>
      <MemoAssessmentTable assessments={quarter.assessments} />
    </View>
  </View>
);

const MemoQuarterCard = React.memo(QuarterCard);

interface SemesterBlockProps {
  semester: Semester;
  gradingSystem: string;
  isOpen: boolean;
  onToggle: () => void;
}

const SemesterBlock: React.FC<SemesterBlockProps> = ({
  semester,
  gradingSystem,
  isOpen,
  onToggle,
}) => {
  const quartersCount = Array.isArray(semester.quarters) ? semester.quarters.length : 0;
  return (
    <View style={styles.semesterBlock}>
      <View style={styles.semesterSection}>
        <Text style={styles.semesterTitle} numberOfLines={1}>
          {semester.semesterTitle || "Semester"}
        </Text>
        <TouchableOpacity onPress={onToggle} style={styles.quarterToggle}>
          <Text style={styles.quarterToggleText}>
            {isOpen ? "▾" : "▸"} {quartersCount} Quarter{quartersCount === 1 ? "" : "s"}
          </Text>
        </TouchableOpacity>
      </View>

      {isOpen &&
        (quartersCount > 0 ? (
          semester.quarters.map((qtr) => (
            <MemoQuarterCard key={qtr.quarterId} quarter={qtr} gradingSystem={gradingSystem} />
          ))
        ) : (
          <Text style={styles.noDataText}>No quarters available</Text>
        ))}
    </View>
  );
};

const MemoSemesterBlock = React.memo(SemesterBlock);

interface GradebookTableProps {
  gradebook: StudentCourseGradebook;
}

const GradebookTable: React.FC<GradebookTableProps> = ({ gradebook }) => {
  const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({});

  const toggleSemester = useCallback((semId: string) => {
    setExpandedSemesters((prev) => ({ ...prev, [semId]: !prev[semId] }));
  }, []);

  const hasSemesters = Array.isArray(gradebook.semesters) && gradebook.semesters.length > 0;
  const hasChapters = Array.isArray(gradebook.chapters) && gradebook.chapters.length > 0;

  return (
    <View style={styles.gradebookCard}>
      <View style={styles.finalGradeRow}>
        {gradebook.gradingSystem === "normalGrading" ? (
          <>
            <Text style={styles.finalGradeText}>
              Overall: <Text style={styles.finalGradeValue}>{gradebook.finalGrade ?? 0}%</Text>
            </Text>
            <Text style={styles.finalGradeText}>
              GPA: <Text style={styles.finalGradeValue}>{gradebook.gpa ?? "—"}</Text>
            </Text>
            <View
              style={[
                styles.letterBadge,
                { backgroundColor: getLetterGradeStyle(gradebook.letterGrade).bg },
              ]}
            >
              <Text
                style={[
                  styles.letterBadgeText,
                  { color: getLetterGradeStyle(gradebook.letterGrade).text },
                ]}
              >
                {gradebook.letterGrade || "—"}
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.finalGradeText}>
              Points:{" "}
              <Text style={styles.finalGradeValue}>{gradebook.standardGrade?.points ?? "Pending"}</Text>
            </Text>
            <Text style={styles.finalGradeText}>
              Remark:{" "}
              <Text style={styles.finalGradeValue}>{gradebook.standardGrade?.remarks ?? "Pending"}</Text>
            </Text>
          </>
        )}
      </View>

      {hasSemesters ? (
        gradebook.semesters!.map((sem) => (
          <MemoSemesterBlock
            key={sem.semesterId}
            semester={sem}
            gradingSystem={gradebook.gradingSystem}
            isOpen={!!expandedSemesters[sem.semesterId]}
            onToggle={() => toggleSemester(sem.semesterId)}
          />
        ))
      ) : hasChapters ? (
        <>
          <CourseGradeSummary
            gradingSystem={gradebook.gradingSystem}
            letterGrade={gradebook.letterGrade}
            standardGrade={gradebook.standardGrade}
          />
          <View style={styles.quarterTableWrap}>
            <MemoAssessmentTable assessments={gradebook.chapters} />
          </View>
        </>
      ) : (
        <Text style={styles.noDataText}>No assessments found for this course.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  finalGradeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 14,
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  finalGradeText: { fontSize: 14, color: "#374151", fontWeight: "600" },
  finalGradeValue: { color: "#10B144", fontWeight: "700" },

  semesterBlock: { marginBottom: 14 },
  semesterSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  semesterTitle: { fontSize: 16, fontWeight: "bold", color: "#111827", flexShrink: 1, marginRight: 8 },
  quarterToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quarterToggleText: { fontSize: 13, fontWeight: "600", color: "#111827" },
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
  quarterTitle: { fontSize: 15, fontWeight: "700", color: "#111827", flexShrink: 1, marginRight: 8 },
  quarterGradeText: { fontSize: 13, color: "#374151" },
  quarterGradeValue: { color: "#16a34a", fontWeight: "700" },
  gradeSummaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 14,
    marginBottom: 10,
  },
  gradeSummaryText: { fontSize: 13, color: "#374151", fontWeight: "500" },
  gradeSummaryValue: { color: "#2563eb", fontWeight: "700" },
  letterBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  letterBadgeText: { fontSize: 12, fontWeight: "700" },
  quarterTableWrap: { marginTop: 4 },

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
  fieldRowLast: { borderBottomWidth: 0 },
  fieldLabel: { fontSize: 12, color: "#6b7280", fontWeight: "600", width: 92, paddingTop: 1 },
  fieldValue: { flex: 1, fontSize: 14, color: "#111827", fontWeight: "500", textAlign: "right" },
  fieldValueStrong: { flex: 1, fontSize: 14, color: "#111827", fontWeight: "700", textAlign: "right" },
  categoryChip: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryChipText: { fontSize: 11, color: "#374151", fontWeight: "600" },
  noAssessments: { textAlign: "center", color: "#7b8794", fontSize: 13, paddingVertical: 16 },
  noDataText: { color: "#6b7280", textAlign: "center", fontSize: 14, paddingVertical: 20 },
});

export default React.memo(GradebookTable);
