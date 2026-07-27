// SubmissionDetailModal.tsx
// Shows detailed view of a single student submission
// with tabs (All / Needs Grading / Graded) and manual grading input

import React from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Linking,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import SimpleIcon from "../SimpleIcon";

interface SubmissionDetailModalProps {
  visible: boolean;
  onClose: () => void;
  submissionDetails: any;
  submissionDetailsLoading: boolean;
  submissionDetailsError: string | null;
  activeTab: "all" | "needs_grading" | "graded";
  setActiveTab: (t: "all" | "needs_grading" | "graded") => void;
  answerGrades: { [id: string]: string };
  gradesSubmitted: boolean;
  submittingGrades: boolean;
  onGradeChange: (answerId: string, value: string, maxPoints: number) => void;
  onSubmitGrades: () => void;
  formatDateTime: (d: string) => string;
}

const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  visible,
  onClose,
  submissionDetails,
  submissionDetailsLoading,
  submissionDetailsError,
  activeTab,
  setActiveTab,
  answerGrades,
  gradesSubmitted,
  submittingGrades,
  onGradeChange,
  onSubmitGrades,
  formatDateTime,
}) => {
  const insets = useSafeAreaInsets();

  const getFilteredQuestions = () => {
    if (!submissionDetails?.answers) return [];
    switch (activeTab) {
      case "needs_grading":
        return submissionDetails.answers.filter(
          (a: any) => a.requiresManualCheck
        );
      case "graded":
        return submissionDetails.answers.filter(
          (a: any) => !a.requiresManualCheck
        );
      default:
        return submissionDetails.answers;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top || 20 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Submission Details</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <SimpleIcon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {submissionDetailsLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#007bff" />
          </View>
        ) : submissionDetailsError ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{submissionDetailsError}</Text>
          </View>
        ) : submissionDetails ? (
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {/* Student Overview */}
            <View style={styles.overview}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {submissionDetails.studentId?.firstName?.charAt(0) || "U"}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.studentName}>
                    {submissionDetails.studentId?.firstName}{" "}
                    {submissionDetails.studentId?.lastName}
                  </Text>
                  <View style={styles.tags}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>
                        {submissionDetails.status}
                      </Text>
                    </View>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>
                        {submissionDetails.graded ? "Graded" : "Not Graded"}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.email}>
                  {submissionDetails.studentId?.email}
                </Text>
                <Text style={styles.submittedAt}>
                  Submitted on:{" "}
                  {formatDateTime(
                    submissionDetails.submittedAt || submissionDetails.createdAt
                  )}
                </Text>
              </View>
            </View>

            {/* Assessment Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Assessment Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Assessment ID</Text>
                  <Text style={styles.summaryValue}>
                    {submissionDetails.assessment}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Points</Text>
                  <Text style={styles.summaryValue}>
                    {submissionDetails.totalScore} points
                  </Text>
                </View>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              {(["all", "needs_grading", "graded"] as const).map((tab) => {
                const count =
                  tab === "all"
                    ? submissionDetails.answers?.length ?? 0
                    : tab === "needs_grading"
                    ? submissionDetails.answers?.filter(
                        (a: any) => a.requiresManualCheck
                      ).length ?? 0
                    : submissionDetails.answers?.filter(
                        (a: any) => !a.requiresManualCheck
                      ).length ?? 0;

                const label =
                  tab === "all"
                    ? "All Questions"
                    : tab === "needs_grading"
                    ? "Needs Grading"
                    : "Graded";

                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === tab && styles.activeTabText,
                      ]}
                    >
                      {label} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Questions */}
            <View style={{ marginBottom: 20 }}>
              {getFilteredQuestions().map((answer: any, index: number) => (
                <View key={answer._id} style={styles.questionCard}>
                  {/* Question header */}
                  <View style={styles.questionHeader}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flexWrap: "wrap",
                        flexShrink: 1,
                        marginRight: 8,
                      }}
                    >
                      <Text style={styles.qNumber}>Question {index + 1}</Text>
                      <Text style={styles.qType}>
                        {answer.questionDetails?.type === "truefalse"
                          ? "True/False"
                          : answer.questionDetails?.type}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                        rowGap: 8,
                      }}
                    >
                      {answer.requiresManualCheck ? (
                        <View
                          style={[
                            styles.qTag,
                            {
                              backgroundColor: "#FEF3C7",
                              borderColor: "#F59E0B",
                              borderWidth: 1,
                            },
                          ]}
                        >
                          <Text style={[styles.qTagText, { color: "#92400E" }]}>
                            Needs Manual Grading
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.qTag,
                            {
                              backgroundColor: answer.isCorrect
                                ? "#D1FAE5"
                                : "#FEE2E2",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.qTagText,
                              {
                                color: answer.isCorrect ? "#065F46" : "#991B1B",
                              },
                            ]}
                          >
                            {answer.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                          </Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.qTag,
                          { backgroundColor: "#F3F4F6", marginLeft: 8 },
                        ]}
                      >
                        <Text style={[styles.qTagText, { color: "#374151" }]}>
                          {answer.pointsAwarded}/
                          {answer.questionDetails?.points} pts
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Question text */}
                  <Text style={styles.fieldLabel}>Question:</Text>
                  <View style={styles.fieldBox}>
                    <Text style={styles.fieldText}>
                      {answer.questionDetails?.question?.replace(
                        /<[^>]*>/g,
                        ""
                      ) || "No question text"}
                    </Text>
                  </View>

                  {/* Teacher files */}
                  {answer.questionDetails?.file?.length > 0 && (
                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.fieldLabel}>Teacher Files:</Text>
                      {answer.questionDetails.file.map((f: any, i: number) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.fileCard}
                          onPress={() => Linking.openURL(f.url)}
                        >
                          <SimpleIcon
                            name="description"
                            size={20}
                            color="#4285F4"
                          />
                          <Text style={styles.fileName}>{f.filename}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Student answer */}
                  <Text style={[styles.fieldLabel, { marginTop: 12 }]}>
                    Student's Answer:
                  </Text>
                  <View style={styles.fieldBox}>
                    <Text style={styles.fieldText}>
                      {answer.questionDetails?.type === "file"
                        ? answer.file?.length > 0
                          ? `${answer.file.length} file(s) uploaded`
                          : "No file uploaded"
                        : answer.selectedAnswer || "No answer provided"}
                    </Text>
                  </View>

                  {/* Student files */}
                  {answer.file?.length > 0 && (
                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.fieldLabel}>Student Files:</Text>
                      {answer.file.map((f: any, i: number) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.fileCard}
                          onPress={() => Linking.openURL(f.url)}
                        >
                          <SimpleIcon
                            name="description"
                            size={20}
                            color="#10B144"
                          />
                          <Text style={styles.fileName}>{f.filename}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Manual grading input */}
                  {answer.requiresManualCheck && !gradesSubmitted && (
                    <View style={styles.gradingBox}>
                      <Text style={styles.fieldLabel}>Assign Points:</Text>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <TextInput
                          style={styles.gradingInput}
                          placeholder="0"
                          value={answerGrades[answer.questionId] || ""}
                          onChangeText={(v) =>
                            onGradeChange(
                              answer.questionId,
                              v,
                              answer.questionDetails?.points || 0
                            )
                          }
                          keyboardType="numeric"
                          editable={!gradesSubmitted && !submittingGrades}
                        />
                        <Text style={styles.gradingMax}>
                          /{answer.questionDetails?.points} pts
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Submit Grades */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (gradesSubmitted || submittingGrades) &&
                  styles.submitBtnDisabled,
              ]}
              onPress={onSubmitGrades}
              disabled={gradesSubmitted || submittingGrades}
            >
              {submittingGrades ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {gradesSubmitted ? "Grades Submitted" : "Submit Grades"}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    // paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    position: "relative",
    // backgroundColor: "pink",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  closeBtn: {
    position: "absolute",
    bottom: 15,
    right: 0,
    justifyContent: "center",
    // backgroundColor: "red",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
  scroll: { flex: 1, paddingHorizontal: 20 },

  overview: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "bold", color: "#6B7280" },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  studentName: { fontSize: 16, fontWeight: "bold", color: "#111827", flex: 1 },
  tags: { flexDirection: "row", marginLeft: 12 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
    backgroundColor: "#E5E7EB",
  },
  tagText: { fontSize: 12, fontWeight: "500", color: "#374151" },
  email: { fontSize: 14, color: "#6B7280", marginBottom: 4 },
  submittedAt: { fontSize: 12, color: "#6B7280" },

  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  summaryCard: { backgroundColor: "#F9FAFB", borderRadius: 8, padding: 16 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 14, color: "#6B7280" },
  summaryValue: { fontSize: 14, fontWeight: "500", color: "#111827" },

  tabs: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  activeTab: { backgroundColor: "#111827" },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
  activeTabText: { color: "#fff" },

  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    rowGap: 8,
    marginBottom: 16,
  },
  qNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginRight: 12,
  },
  qType: { fontSize: 14, color: "#6B7280", marginRight: 12 },
  qTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  qTagText: { fontSize: 12, fontWeight: "500" },

  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  fieldBox: { backgroundColor: "#F9FAFB", borderRadius: 8, padding: 12 },
  fieldText: { fontSize: 14, color: "#111827" },

  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  fileName: { fontSize: 14, color: "#111827", marginLeft: 8, flex: 1 },

  gradingBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  gradingInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
    minWidth: 80,
    textAlign: "center",
  },
  gradingMax: { fontSize: 14, color: "#6B7280", marginLeft: 8 },

  submitBtn: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  submitBtnDisabled: { backgroundColor: "#9CA3AF" },
  submitBtnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});

export default SubmissionDetailModal;
