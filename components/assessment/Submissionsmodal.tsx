// SubmissionsModal.tsx
// On "More Details" press → opens AssessmentDetailsModal
// On "View Analytics" press → opens a separate AnalyticsModal

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SimpleIcon from "../SimpleIcon";
import AssessmentDetailsModal from "./AssessmentDetailsModal";
import { useEffect } from "react";

interface SubmissionsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedAssessment: any;
  filteredSubmissions: any[];
  submissionsLoading: boolean;
  submissionsError: string | null;
  statusValue: string;
  setStatusValue: (v: any) => void;
  modalStatusOpen: boolean;
  setModalStatusOpen: React.Dispatch<React.SetStateAction<boolean>>;
  gradingValue: string | null;
  setGradingValue: (v: any) => void;
  modalGradingOpen: boolean;
  setModalGradingOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmissionPress: (item: any) => void;
  formatDate: (d: string) => string;
  formatDateTime: (d: string) => string;
  onViewAnalytics?: () => void;
}

const statusItems = [
  { label: "All Statuses", value: "all" },
  { label: "After Due Date", value: "after_due" },
  { label: "Before Due Date", value: "before_due" },
];

const gradingItems = [
  { label: "All Grading", value: "all" },
  { label: "Graded", value: "graded" },
  { label: "Not Graded", value: "not_graded" },
];

// ── Analytics Modal (separate full-screen modal) ────────────────────────────
const AnalyticsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  analytics: any;
  assessmentTitle: string;
}> = ({ visible, onClose, analytics, assessmentTitle }) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <ScrollView style={analyticsStyles.container}>
        {/* Header */}
        <View style={[analyticsStyles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onClose} style={analyticsStyles.backBtn}>
            <SimpleIcon name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={analyticsStyles.headerTitle}>Assessment Analytics</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={analyticsStyles.scrollContent}>
          {/* Assessment name */}
          <Text style={analyticsStyles.assessmentName}>{assessmentTitle}</Text>

          {/* Summary Cards */}
          <Text style={analyticsStyles.sectionTitle}>Overview</Text>
          <View style={analyticsStyles.cardsRow}>
            <View style={[analyticsStyles.statCard, { backgroundColor: "#EFF6FF" }]}>
              <Text style={[analyticsStyles.statValue, { color: "#2563EB" }]}>
                {analytics.total}
              </Text>
              <Text style={analyticsStyles.statLabel}>Total Submissions</Text>
            </View>
            <View style={[analyticsStyles.statCard, { backgroundColor: "#F0FDF4" }]}>
              <Text style={[analyticsStyles.statValue, { color: "#16A34A" }]}>
                {analytics.graded}
              </Text>
              <Text style={analyticsStyles.statLabel}>Graded</Text>
            </View>
            <View style={[analyticsStyles.statCard, { backgroundColor: "#FEF3C7" }]}>
              <Text style={[analyticsStyles.statValue, { color: "#D97706" }]}>
                {analytics.notGraded}
              </Text>
              <Text style={analyticsStyles.statLabel}>Not Graded</Text>
            </View>
          </View>

          {/* Grading Progress */}
          <Text style={analyticsStyles.sectionTitle}>Grading Progress</Text>
          <View style={analyticsStyles.progressCard}>
            <View style={analyticsStyles.progressBarContainer}>
              <View
                style={[
                  analyticsStyles.progressBarFill,
                  {
                    flex: analytics.graded || 0.01,
                    backgroundColor: "#16A34A",
                    borderTopLeftRadius: 6,
                    borderBottomLeftRadius: 6,
                  },
                ]}
              />
              <View
                style={[
                  analyticsStyles.progressBarFill,
                  {
                    flex: analytics.notGraded || 0.01,
                    backgroundColor: "#E5E7EB",
                    borderTopRightRadius: 6,
                    borderBottomRightRadius: 6,
                  },
                ]}
              />
            </View>
            <Text style={analyticsStyles.progressText}>
              {analytics.total > 0
                ? `${Math.round((analytics.graded / analytics.total) * 100)}% graded`
                : "No submissions yet"}
            </Text>
          </View>

          {/* Timing Breakdown */}
          {analytics.hasDueDate && (
            <>
              <Text style={analyticsStyles.sectionTitle}>Submission Timing</Text>
              <View style={analyticsStyles.cardsRow}>
                <View style={[analyticsStyles.statCard, { backgroundColor: "#F0FDF4" }]}>
                  <Text style={[analyticsStyles.statValue, { color: "#16A34A" }]}>
                    {analytics.onTime}
                  </Text>
                  <Text style={analyticsStyles.statLabel}>On Time</Text>
                </View>
                <View style={[analyticsStyles.statCard, { backgroundColor: "#FEF2F2" }]}>
                  <Text style={[analyticsStyles.statValue, { color: "#DC2626" }]}>
                    {analytics.late}
                  </Text>
                  <Text style={analyticsStyles.statLabel}>Late</Text>
                </View>
              </View>
              {analytics.total > 0 && (
                <View style={analyticsStyles.progressCard}>
                  <View style={analyticsStyles.progressBarContainer}>
                    <View
                      style={[
                        analyticsStyles.progressBarFill,
                        { flex: analytics.onTime || 0.01, backgroundColor: "#16A34A" },
                      ]}
                    />
                    <View
                      style={[
                        analyticsStyles.progressBarFill,
                        { flex: analytics.late || 0.01, backgroundColor: "#DC2626" },
                      ]}
                    />
                  </View>
                  <View style={analyticsStyles.legendRow}>
                    <View style={analyticsStyles.legendItem}>
                      <View style={[analyticsStyles.legendDot, { backgroundColor: "#16A34A" }]} />
                      <Text style={analyticsStyles.legendText}>
                        On Time ({analytics.total > 0 ? Math.round((analytics.onTime / analytics.total) * 100) : 0}%)
                      </Text>
                    </View>
                    <View style={analyticsStyles.legendItem}>
                      <View style={[analyticsStyles.legendDot, { backgroundColor: "#DC2626" }]} />
                      <Text style={analyticsStyles.legendText}>
                        Late ({analytics.total > 0 ? Math.round((analytics.late / analytics.total) * 100) : 0}%)
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}

          {/* Score Statistics */}
          {analytics.gradedCount > 0 && (
            <>
              <Text style={analyticsStyles.sectionTitle}>Score Statistics</Text>
              <View style={analyticsStyles.cardsRow}>
                <View style={[analyticsStyles.statCard, { backgroundColor: "#EFF6FF" }]}>
                  <Text style={[analyticsStyles.statValue, { color: "#2563EB" }]}>
                    {analytics.avgScore}
                  </Text>
                  <Text style={analyticsStyles.statLabel}>Average Score</Text>
                </View>
                <View style={[analyticsStyles.statCard, { backgroundColor: "#F0FDF4" }]}>
                  <Text style={[analyticsStyles.statValue, { color: "#16A34A" }]}>
                    {analytics.highestScore}
                  </Text>
                  <Text style={analyticsStyles.statLabel}>Highest</Text>
                </View>
                <View style={[analyticsStyles.statCard, { backgroundColor: "#FEF2F2" }]}>
                  <Text style={[analyticsStyles.statValue, { color: "#DC2626" }]}>
                    {analytics.lowestScore}
                  </Text>
                  <Text style={analyticsStyles.statLabel}>Lowest</Text>
                </View>
              </View>
            </>
          )}

          {analytics.total === 0 && (
            <View style={analyticsStyles.emptyState}>
              <Text style={analyticsStyles.emptyIcon}>📭</Text>
              <Text style={analyticsStyles.emptyTitle}>No Submissions Yet</Text>
              <Text style={analyticsStyles.emptyDesc}>
                Analytics will appear once students start submitting.
              </Text>
            </View>
          )}
        </ScrollView>
      </ScrollView>
    </Modal>
  );
};

const analyticsStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  assessmentName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
    marginTop: 8,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
  },
  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  progressBarContainer: {
    flexDirection: "row",
    height: 10,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  progressBarFill: { height: 10 },
  progressText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: { fontSize: 12, color: "#6B7280" },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#374151", marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: "#6B7280", textAlign: "center" },
});

// ── Main SubmissionsModal ───────────────────────────────────────────────────
const SubmissionsModal: React.FC<SubmissionsModalProps> = ({
  visible,
  onClose,
  selectedAssessment,
  filteredSubmissions,
  submissionsLoading,
  submissionsError,
  statusValue,
  setStatusValue,
  modalStatusOpen,
  setModalStatusOpen,
  gradingValue,
  setGradingValue,
  modalGradingOpen,
  setModalGradingOpen,
  onSubmissionPress,
  formatDate,
  formatDateTime,
  onViewAnalytics,
}) => {
  const insets = useSafeAreaInsets();

  // ── Details modal state ───────────────────────────────────────────────────
  const [detailsVisible, setDetailsVisible] = useState(false);

  // ── Analytics modal state ─────────────────────────────────────────────────
  const [analyticsVisible, setAnalyticsVisible] = useState(false);

  // ── Compute analytics from submissions ────────────────────────────────────
  const analytics = useMemo(() => {
    const total = filteredSubmissions.length;
    const graded = filteredSubmissions.filter((s) => s.graded === true).length;
    const notGraded = total - graded;

    let onTime = 0;
    let late = 0;
    const dueDate = selectedAssessment?.dueDate?.date
      ? new Date(selectedAssessment.dueDate.date)
      : null;

    filteredSubmissions.forEach((s) => {
      const subDate = new Date(s.submissionDate || s.submittedAt || s.createdAt);
      if (dueDate) {
        if (subDate <= dueDate) onTime++;
        else late++;
      }
    });

    const gradedSubs = filteredSubmissions.filter(
      (s) => s.graded && typeof s.totalScore === "number"
    );
    let avgScore = 0;
    let highestScore = 0;
    let lowestScore = 0;
    if (gradedSubs.length > 0) {
      const scores = gradedSubs.map((s) => s.totalScore);
      const sum = scores.reduce((a: number, b: number) => a + b, 0);
      avgScore = sum / scores.length;
      highestScore = Math.max(...scores);
      lowestScore = Math.min(...scores);
    }

    return {
      total,
      graded,
      notGraded,
      onTime,
      late,
      hasDueDate: !!dueDate,
      avgScore: avgScore.toFixed(1),
      highestScore,
      lowestScore,
      gradedCount: gradedSubs.length,
    };
  }, [filteredSubmissions, selectedAssessment]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: 20 }]}>
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <SimpleIcon name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>

          <View style={styles.actionBtns}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setAnalyticsVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>View Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setDetailsVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>☰</Text>
              <Text style={styles.actionText}>More Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Title + Due Date ── */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{selectedAssessment?.title ?? ""}</Text>
          <Text style={styles.dueDate}>
            Due:{" "}
            {selectedAssessment
              ? formatDate(selectedAssessment.dueDate?.date)
              : ""}
          </Text>
        </View>

        {/* ── Filters ── */}
        <View style={styles.dropdownRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <DropDownPicker
              open={modalStatusOpen}
              value={statusValue}
              items={statusItems}
              setOpen={setModalStatusOpen}
              setValue={setStatusValue}
              setItems={() => {}}
              placeholder="All Statuses"
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              zIndex={5000}
              zIndexInverse={4000}
              listMode="SCROLLVIEW"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <DropDownPicker
              open={modalGradingOpen}
              value={gradingValue}
              items={gradingItems}
              setOpen={setModalGradingOpen}
              setValue={setGradingValue}
              setItems={() => {}}
              placeholder="All Grading"
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              zIndex={4000}
              zIndexInverse={3000}
              listMode="SCROLLVIEW"
            />
          </View>
        </View>

        {/* ── Submissions list ── */}
        <View style={styles.content}>
          {submissionsLoading ? (
            <ActivityIndicator
              size="large"
              color="#007bff"
              style={{ marginTop: 50 }}
            />
          ) : submissionsError ? (
            <Text style={styles.errorText}>{submissionsError}</Text>
          ) : filteredSubmissions.length === 0 ? (
            <Text style={styles.emptyText}>No submissions found</Text>
          ) : (
            <FlatList
              style={{ width: "100%" }}
              data={filteredSubmissions}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => onSubmissionPress(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.studentRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {item.studentId?.firstName?.charAt(0) || "U"}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentName}>
                        {item.studentId?.firstName} {item.studentId?.lastName}
                      </Text>
                      <Text style={styles.studentEmail}>
                        {item.studentId?.email}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Status:</Text>
                    <Text
                      style={[
                        styles.value,
                        {
                          color:
                            item.status === "before due date"
                              ? "#10B144"
                              : "#FF6B6B",
                        },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Grading:</Text>
                    <Text
                      style={[
                        styles.value,
                        { color: item.graded ? "#10B144" : "#FF6B6B" },
                      ]}
                    >
                      {item.graded ? "Graded" : "Not Graded"}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Submitted At:</Text>
                    <Text style={styles.value}>
                      {formatDateTime(item.submittedAt || item.createdAt)}
                    </Text>
                  </View>

                  {item.graded && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Score:</Text>
                      <Text
                        style={[
                          styles.value,
                          { color: "#10B144", fontWeight: "bold" },
                        ]}
                      >
                        {item.totalScore} points
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* ── Analytics Modal (separate full-screen) ── */}
        <AnalyticsModal
          visible={analyticsVisible}
          onClose={() => setAnalyticsVisible(false)}
          analytics={analytics}
          assessmentTitle={selectedAssessment?.title ?? ""}
        />

        {/* ── Assessment Details Modal ── */}
        <AssessmentDetailsModal
          visible={detailsVisible}
          onClose={() => setDetailsVisible(false)}
          assessment={selectedAssessment}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtns: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  actionIcon: { fontSize: 13 },
  actionText: { fontSize: 13, fontWeight: "600", color: "#374151" },

  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  dueDate: { fontSize: 14, color: "#6B7280" },

  dropdownRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dropdown: { backgroundColor: "#fff", borderColor: "#ddd", borderRadius: 8 },
  dropdownContainer: { height: 50, marginBottom: 10 },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
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
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  studentRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: "bold", color: "#6B7280" },
  studentName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  studentEmail: { fontSize: 13, color: "#6B7280" },
  row: { marginBottom: 10 },
  label: { fontSize: 13, color: "#6B7280", marginBottom: 3 },
  value: { fontSize: 14, fontWeight: "500", color: "#111827" },
});

export default SubmissionsModal;
