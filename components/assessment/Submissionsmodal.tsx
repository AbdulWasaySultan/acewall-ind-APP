// SubmissionsModal.tsx
// On "More Details" press → opens AssessmentDetailsModal

import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
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

  // ── Details modal state — managed here ────────────────────────────────────
  const [detailsVisible, setDetailsVisible] = useState(false);

  useEffect(() => {
    console.log("hi this is submission modal screen!");
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: 20 }]}>
        {/* ── Top bar: ← back  |  [📊 Analytics] [☰ More Details] ── */}
        <View style={styles.topBar}>
          {/* Back */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <SimpleIcon name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>

          {/* Right buttons */}
          <View style={styles.actionBtns}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onViewAnalytics}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>View Analytics</Text>
            </TouchableOpacity>

            {/* ✅ More Details — opens AssessmentDetailsModal */}
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
                  {/* Student */}
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

                  {/* Status */}
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

                  {/* Grading */}
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

                  {/* Submitted At */}
                  <View style={styles.row}>
                    <Text style={styles.label}>Submitted At:</Text>
                    <Text style={styles.value}>
                      {formatDateTime(item.submittedAt || item.createdAt)}
                    </Text>
                  </View>

                  {/* Score */}
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

        {/* ── Assessment Details Modal — opens on More Details ── */}
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
