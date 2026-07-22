import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import SimpleIcon from "../SimpleIcon";

interface SBLItem {
  _id?: string;
  points: number;
  minPercentage: number;
  maxPercentage: number;
  remarks: string;
}

interface StandardGradeScaleModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (scale: SBLItem[]) => void;
  initialScale?: SBLItem[];
  courseId: string;
}

// Detect issues in the scale (overlaps, gaps)
const detectScaleIssues = (scale: SBLItem[]) => {
  const sorted = [...scale].sort((a, b) => a.minPercentage - b.minPercentage);
  const EPSILON = 0.001;
  const issues: { type: "gap" | "overlap"; from: number; to: number }[] = [];
  let expectedMin = 0;

  for (let i = 0; i < sorted.length; i++) {
    const { minPercentage, maxPercentage } = sorted[i];

    if (minPercentage - expectedMin > EPSILON) {
      issues.push({ type: "gap", from: expectedMin, to: minPercentage });
    }

    if (minPercentage < expectedMin - EPSILON) {
      issues.push({ type: "overlap", from: minPercentage, to: expectedMin });
    }

    expectedMin = parseFloat((maxPercentage + 0.01).toFixed(2));
  }

  if (expectedMin - 100 < -EPSILON) {
    issues.push({ type: "gap", from: expectedMin, to: 100 });
  }

  return {
    isComplete: issues.length === 0,
    issues,
  };
};

const StandardGradeScaleModal: React.FC<StandardGradeScaleModalProps> = ({
  visible,
  onClose,
  onSave,
  initialScale = [],
  courseId,
}) => {
  const [scale, setScale] = useState<SBLItem[]>(initialScale);
  const [newPoints, setNewPoints] = useState("");
  const [newRemarks, setNewRemarks] = useState("");
  const [newMin, setNewMin] = useState("90");
  const [newMax, setNewMax] = useState("100");
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setScale(initialScale);
      const nextRange = getNextRange(initialScale);
      setNewPoints("");
      setNewRemarks("");
      setNewMin(nextRange.min.toString());
      setNewMax(nextRange.max.toString());
    }
  }, [visible, initialScale]);

  const getNextRange = (currentScale: SBLItem[]) => {
    if (currentScale.length === 0) return { min: 90, max: 100 };
    const sorted = [...currentScale].sort(
      (a, b) => a.minPercentage - b.minPercentage
    );
    const lowest = sorted[0];
    const nextMax = lowest.minPercentage - 0.01;
    const nextMin = Math.max(0, nextMax - 9.99);
    return {
      min: parseFloat(nextMin.toFixed(2)),
      max: parseFloat(nextMax.toFixed(2)),
    };
  };

  const handleAdd = () => {
    const points = parseFloat(newPoints);
    const min = parseFloat(newMin);
    const max = parseFloat(newMax);
    const remarks = newRemarks.trim();

    if (isNaN(points)) {
      Alert.alert("Error", "Points must be a valid number");
      return;
    }
    if (!remarks) {
      Alert.alert("Error", "Remarks are required");
      return;
    }
    if (min < 0 || max > 100 || min >= max) {
      Alert.alert("Error", "Enter a valid percentage range (min < max, 0–100)");
      return;
    }

    // Check overlap
    const hasOverlap = scale.some(
      (item) =>
        (min >= item.minPercentage && min <= item.maxPercentage) ||
        (max >= item.minPercentage && max <= item.maxPercentage) ||
        (min <= item.minPercentage && max >= item.maxPercentage)
    );
    if (hasOverlap) {
      Alert.alert(
        "Error",
        "This percentage range overlaps with an existing scale."
      );
      return;
    }

    const exists = scale.some((item) => item.points === points);
    if (exists) {
      Alert.alert("Error", "This points value already exists");
      return;
    }

    const newEntry: SBLItem = {
      // No _id here - the backend's scale subdocuments auto-generate a real
      // Mongo ObjectId. Sending a client-side placeholder (e.g. Date.now())
      // would fail Mongoose's ObjectId cast when saving.
      points,
      minPercentage: min,
      maxPercentage: max,
      remarks,
    };

    const updated = [...scale, newEntry].sort(
      (a, b) => b.maxPercentage - a.maxPercentage
    );
    setScale(updated);

    // Reset form with next suggested range
    const nextRange = getNextRange(updated);
    setNewPoints("");
    setNewRemarks("");
    setNewMin(nextRange.min.toString());
    setNewMax(nextRange.max.toString());
  };

  const handleReset = () => {
    setScale([]);
    setNewPoints("");
    setNewRemarks("");
    setNewMin("90");
    setNewMax("100");
  };

  const { isComplete, issues } = detectScaleIssues(scale);

  const handleSave = async () => {
    if (!isComplete) {
      Alert.alert(
        "Incomplete Scale",
        "The scale has gaps or overlaps. Please fix the issues before saving."
      );
      return;
    }
    setSaving(true);
    try {
      await onSave?.(scale);
      onClose();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save scale");
    } finally {
      setSaving(false);
    }
  };

  // Render individual item row
  const renderItem = (item: SBLItem, index: number) => {
    const barWidth = ((item.maxPercentage - item.minPercentage) / 100) * 100;
    return (
      <View key={item._id || index} style={styles.row}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.points}</Text>
        </View>
        <Text style={styles.rangeText}>
          {item.minPercentage}% – {item.maxPercentage}%
        </Text>
        <Text style={styles.remarksText} numberOfLines={1}>
          {item.remarks}
        </Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressFill, { width: `${barWidth}%` }]} />
        </View>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <SimpleIcon name="arrow-back" size={24} color="#10B144" />
          </TouchableOpacity>
          <Text style={styles.title}>SBL Scale</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Add Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add New SBL Range</Text>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Points</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 4.0, 3.5"
                  keyboardType="decimal-pad"
                  value={newPoints}
                  onChangeText={setNewPoints}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Remarks</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Excellent"
                  value={newRemarks}
                  onChangeText={setNewRemarks}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Min %</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="decimal-pad"
                  value={newMin}
                  onChangeText={setNewMin}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Max %</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="decimal-pad"
                  value={newMax}
                  onChangeText={setNewMax}
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  isComplete && styles.addButtonDisabled,
                ]}
                onPress={handleAdd}
                disabled={isComplete}
              >
                <SimpleIcon name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>
                  {isComplete ? "Completed" : "Add Range"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
              >
                <SimpleIcon name="refresh" size={20} color="#10B144" />
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Scale List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SBL Scale</Text>

            {scale.length === 0 ? (
              <View style={styles.emptyContainer}>
                <SimpleIcon name="clipboard-outline" size={48} color="#aaa" />
                <Text style={styles.emptyText}>No ranges added yet</Text>
                <Text style={styles.emptySubtext}>
                  Add your first range using the form above
                </Text>
              </View>
            ) : (
              <View>
                {/* Header Row */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>
                    Points
                  </Text>
                  <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>
                    Range
                  </Text>
                  <Text style={[styles.tableHeaderText, { flex: 2 }]}>
                    Remarks
                  </Text>
                  <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>
                    Bar
                  </Text>
                </View>

                {scale.map((item, index) => renderItem(item, index))}

                {/* Issues Alert */}
                {issues.length > 0 && (
                  <View style={styles.issuesAlert}>
                    <SimpleIcon name="alert-circle" size={18} color="#b91c1c" />
                    <Text style={styles.issuesText}>Scale has issues:</Text>
                    {issues.map((issue, i) => (
                      <Text key={i} style={styles.issueDetail}>
                        {issue.type === "gap"
                          ? `🟡 Gap from ${issue.from}% to ${issue.to}%`
                          : `🔴 Overlap from ${issue.from}% to ${issue.to}%`}
                      </Text>
                    ))}
                  </View>
                )}

                {isComplete && (
                  <View style={styles.completionContainer}>
                    <SimpleIcon name="check-circle" size={20} color="#10B144" />
                    <Text style={styles.completionText}>
                      Scale completed (0% to 100%)!
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer – Save Button (only when complete) */}
        {isComplete && scale.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Scale</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: { marginRight: 10 },
  title: { fontSize: 22, fontWeight: "bold", color: "#10B144", flex: 1 },
  content: { padding: 16 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  inputRow: { flexDirection: "row", marginBottom: 12 },
  inputContainer: { flex: 1, marginRight: 10 },
  inputLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    fontWeight: "500",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B144",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    marginRight: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  addButtonDisabled: { backgroundColor: "#ccc" },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#10B144",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
  },
  resetButtonText: {
    color: "#10B144",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontWeight: "bold",
    color: "#6b7280",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  badge: {
    backgroundColor: "#10B144",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flex: 1,
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  rangeText: { flex: 1.5, fontSize: 14, color: "#333", marginLeft: 8 },
  remarksText: { flex: 2, fontSize: 14, color: "#555", marginLeft: 8 },
  progressContainer: {
    flex: 1.5,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginLeft: 8,
  },
  progressFill: { height: "100%", backgroundColor: "#10B144" },
  emptyContainer: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#666", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#999" },
  issuesAlert: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  issuesText: { fontWeight: "bold", color: "#b91c1c", marginBottom: 4 },
  issueDetail: { fontSize: 13, color: "#b91c1c", marginLeft: 8 },
  completionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e8",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  completionText: { color: "#10B144", marginLeft: 6, fontWeight: "600" },
  footer: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  saveButton: {
    backgroundColor: "#10B144",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});

export default StandardGradeScaleModal;
