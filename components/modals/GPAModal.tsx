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
} from "react-native";
import SimpleIcon from "../SimpleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GPAItem } from "../../types/course";

interface GPAModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (gpaScales: GPAItem[]) => void;
  initialGpaScales?: GPAItem[];
}

const GPAModal: React.FC<GPAModalProps> = ({
  visible,
  onClose,
  onSave,
  initialGpaScales = [],
}) => {
  const insets = useSafeAreaInsets();
  const [gpaScales, setGpaScales] = useState<GPAItem[]>(initialGpaScales);
  const [newGpa, setNewGpa] = useState({
    gpaInput: "",
    minInput: "90",
    maxInput: "100",
  });

  useEffect(() => {
    if (initialGpaScales.length > 0) {
      setGpaScales(initialGpaScales);
    }
  }, [initialGpaScales]);

  const getNextRange = (scales: GPAItem[] = gpaScales) => {
    if (scales.length === 0) return { min: 90, max: 100 };

    const sorted = [...scales].sort(
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

  const isScaleComplete = () => {
    if (gpaScales.length === 0) return false;
    const sorted = [...gpaScales].sort(
      (a, b) => a.minPercentage - b.minPercentage
    );
    return (
      sorted[0].minPercentage === 0 &&
      sorted[sorted.length - 1].maxPercentage === 100
    );
  };

  const handleAddGPA = () => {
    if (isScaleComplete()) {
      Alert.alert("Notice", "GPA scale already covers 0% to 100%.");
      return;
    }

    const { gpaInput, minInput, maxInput } = newGpa;
    const gpa = parseFloat(gpaInput);
    const min = parseFloat(minInput);
    const max = parseFloat(maxInput);

    if (isNaN(gpa) || gpa < 0 || gpa > 4) {
      Alert.alert("Error", "Please enter a valid GPA between 0.0 and 4.0.");
      return;
    }

    if (isNaN(min) || isNaN(max) || min < 0 || max > 100 || min >= max) {
      Alert.alert("Error", "Please enter a valid percentage range.");
      return;
    }

    // Check overlap
    for (const g of gpaScales) {
      const overlaps = !(max < g.minPercentage || min > g.maxPercentage);
      if (overlaps) {
        Alert.alert(
          "Error",
          `The range ${min}% - ${max}% overlaps with existing GPA ${g.gpa} (${g.minPercentage}% - ${g.maxPercentage}%).`
        );
        return;
      }
    }

    if (gpaScales.some((g) => g.gpa === gpa)) {
      Alert.alert("Error", "This GPA already exists.");
      return;
    }

    const newEntry: GPAItem = {
      _id: Date.now().toString(),
      gpa,
      minPercentage: min,
      maxPercentage: max,
    };

    const updatedScales = [...gpaScales, newEntry];
    setGpaScales(updatedScales);

    const nextRange = getNextRange(updatedScales);
    if (nextRange.min === 0) {
      setNewGpa({ gpaInput: "", minInput: "0", maxInput: "0" });
    } else {
      setNewGpa({
        gpaInput: "",
        minInput: nextRange.min.toString(),
        maxInput: nextRange.max.toString(),
      });
    }
  };

  const handleReset = () => {
    setGpaScales([]);
    setNewGpa({ gpaInput: "", minInput: "90", maxInput: "100" });
  };

  const handleSave = () => {
    if (gpaScales.length === 0) {
      Alert.alert("Error", "Please add at least one GPA scale.");
      return;
    }

    const sorted = [...gpaScales].sort(
      (a, b) => a.minPercentage - b.minPercentage
    );
    if (sorted[0].minPercentage !== 0) {
      Alert.alert("Error", "GPA scale must start at 0%.");
      return;
    }

    onSave?.(gpaScales);
    handleReset();
  };

  const getPercentageBarWidth = (min: number, max: number) =>
    ((max - min) / 100) * 100;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <SimpleIcon name="arrow-back" size={24} color="#10B144" />
          </TouchableOpacity>
          <Text style={styles.title}>GPA Scale</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {/* Add GPA */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add New GPA</Text>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>GPA Value</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 4.0, 3.5, 2.0"
                  keyboardType="decimal-pad"
                  value={newGpa.gpaInput}
                  onChangeText={(t) =>
                    setNewGpa((prev) => ({ ...prev, gpaInput: t }))
                  }
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Min %</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="decimal-pad"
                  value={newGpa.minInput}
                  onChangeText={(t) =>
                    setNewGpa((prev) => ({ ...prev, minInput: t }))
                  }
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Max %</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="decimal-pad"
                  value={newGpa.maxInput}
                  onChangeText={(t) =>
                    setNewGpa((prev) => ({ ...prev, maxInput: t }))
                  }
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  isScaleComplete() && styles.addButtonDisabled,
                ]}
                onPress={handleAddGPA}
                disabled={isScaleComplete()}
              >
                <SimpleIcon name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>
                  {isScaleComplete() ? "Completed" : "Add GPA"}
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

          {/* Existing GPAs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GPA Scale</Text>

            {gpaScales.length === 0 ? (
              <View style={styles.emptyContainer}>
                <SimpleIcon name="clipboard-outline" size={48} color="#aaa" />
                <Text style={styles.emptyText}>No GPA entries yet</Text>
                <Text style={styles.emptySubtext}>
                  Start by adding your first GPA above
                </Text>
              </View>
            ) : (
              gpaScales.map((item) => (
                <View key={item._id} style={styles.gradeRow}>
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeText}>{item.gpa.toFixed(1)}</Text>
                  </View>

                  <View style={styles.rangeTextContainer}>
                    <Text style={styles.rangeText}>
                      {item.minPercentage}% - {item.maxPercentage}%
                    </Text>
                  </View>

                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${getPercentageBarWidth(
                            item.minPercentage,
                            item.maxPercentage
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))
            )}

            {isScaleComplete() && (
              <View style={styles.completionContainer}>
                <SimpleIcon
                  name="check-circle-outline"
                  size={20}
                  color="#10B144"
                />
                <Text style={styles.completionText}>
                  Perfect! Scale covers 0% to 100%
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {isScaleComplete() && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.createButton} onPress={handleSave}>
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

// ⬇ styles remain exactly the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: { marginRight: 10 },
  title: { fontSize: 22, fontWeight: "bold", color: "#10B144" },
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
  gradeRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  gradeBadge: {
    backgroundColor: "#10B144",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  gradeText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  rangeTextContainer: { flex: 1, marginLeft: 10 },
  rangeText: { color: "#333", fontSize: 16 },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    width: 100,
  },
  progressFill: { height: "100%", backgroundColor: "#10B144" },
  emptyContainer: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#666", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#999" },
  completionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e8",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  completionText: { color: "#10B144", marginLeft: 6, fontWeight: "600" },
  footer: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  createButton: {
    backgroundColor: "#10B144",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  addButtonDisabled: {
    backgroundColor: "#ccc",
  },
});

export default GPAModal;
