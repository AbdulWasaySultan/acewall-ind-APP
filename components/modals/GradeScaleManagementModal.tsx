import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import SimpleIcon from "../SimpleIcon";

interface GradeScaleManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onManageGradeScale: () => void;
  showGradeScaleManagementLoader: boolean;
  gradeScale: any[];
}

const GradeScaleManagementModal: React.FC<GradeScaleManagementModalProps> = ({
  visible,
  onClose,
  onManageGradeScale,
  showGradeScaleManagementLoader,
  gradeScale,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.fullScreenModalContainer}>
        <View style={styles.fullScreenModalContent}>
          <View style={styles.fullScreenModalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <SimpleIcon name="arrow-back" size={24} color="#10B144" />
            </TouchableOpacity>
            <Text style={styles.fullScreenModalTitle}>Grade Scale</Text>
            <View style={{ width: 40 }} />
          </View>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={onManageGradeScale}
          >
            <Text style={styles.manageButtonText}>Manage Grade Scale</Text>
          </TouchableOpacity>
          {showGradeScaleManagementLoader ? (
            <ActivityIndicator
              size="large"
              color="#10B144"
              style={{ marginTop: 20 }}
            />
          ) : Object.keys(gradeScale).length > 0 ? (
            <ScrollView style={{ flex: 1, marginTop: 20 }}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerText, { flex: 1 }]}>Grade</Text>
                <Text style={[styles.headerText, { flex: 2 }]}>Range</Text>
                <Text style={[styles.headerText, { flex: 3 }]}>
                  Percentage
                </Text>
              </View>

              {/* Table Rows */}
              {gradeScale?.map((item: any) => {
                const percentage = (item.max - item.min) / 100; // simulate visual fill

                return (
                  <View key={item._id} style={styles.tableRow}>
                    {/* Grade */}
                    <View style={styles.gradeBadge}>
                      <Text style={styles.gradeText}>{item.grade}</Text>
                    </View>

                    {/* Range */}
                    <Text style={[styles.rangeText, { flex: 2 }]}>
                      {item.min}% - {item.max}%
                    </Text>

                    {/* Custom Progress Bar */}
                    <View style={[styles.progressWrapper, { flex: 3 }]}>
                      <View style={[styles.progressBackground]}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${percentage * 100}%` },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={{ marginTop: 20 }}>
              No gradescale found for this course.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fullScreenModalContent: {
    flex: 1,
    padding: 20,
  },
  fullScreenModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
  },
  manageButton: {
    backgroundColor: "#10B144",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  manageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#666",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  gradeBadge: {
    backgroundColor: "#10B144",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  gradeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  rangeText: {
    fontSize: 14,
    color: "#666",
  },
  progressWrapper: {
    paddingHorizontal: 8,
  },
  progressBackground: {
    height: 8,
    backgroundColor: "#e5e5e5",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B144",
  },
});

export default GradeScaleManagementModal;
