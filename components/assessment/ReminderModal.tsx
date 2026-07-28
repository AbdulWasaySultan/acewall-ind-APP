import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  loadReminderSetting,
  saveReminderSetting,
} from "../../services/reminderService";

interface Props {
  assessmentId: string;
}

const REMINDER_OPTIONS = [
  { label: "12 Hours Before", value: "12hours" },
  { label: "24 Hours Before", value: "24hours" },
  { label: "48 Hours Before", value: "48hours" },
  { label: "No Reminder", value: "noReminder" },
];

export default function ReminderModal({ assessmentId }: Props) {
  const [reminder, setReminder] = useState<string>("noReminder");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch current setting when the modal opens
  useEffect(() => {
    if (visible) {
      const fetch = async () => {
        try {
          const current = await loadReminderSetting(assessmentId);
          setReminder(current);
        } catch (err: any) {
          Alert.alert("Error", "Unable to load current reminder setting.");
        }
      };
      fetch();
    }
  }, [visible, assessmentId]);

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      await saveReminderSetting(assessmentId, reminder);
      Alert.alert("Success", "Reminder setting saved successfully.");
      setVisible(false);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to save reminder setting.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }, [assessmentId, reminder]);

  return (
    <>
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Set Reminder"
      >
        <Text style={styles.triggerButtonText}>Set Reminder</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assessment Reminder</Text>
            <Text style={styles.modalDescription}>
              Select when students should be reminded about this assessment.
            </Text>

            {REMINDER_OPTIONS.map((option) => {
              const isSelected = reminder === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioItem}
                  onPress={() => setReminder(option.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={option.label}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInnerCircle} />}
                  </View>
                  <Text style={styles.radioLabel}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, loading && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Styles (unchanged, just grouped)
const styles = StyleSheet.create({
  triggerButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  triggerButtonText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  radioCircle: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#10B144",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radioCircleSelected: {
    borderColor: "#10B144",
  },
  radioInnerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#10B144",
  },
  radioLabel: {
    fontSize: 16,
    color: "#333",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#e5e5e5",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "#10B144",
    flexDirection: "row",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
