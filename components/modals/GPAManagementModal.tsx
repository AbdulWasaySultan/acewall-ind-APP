import React, { useEffect } from "react";
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

interface GPAManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onManageGPA: () => void;
  showGPAManagementLoader: boolean;
  GPA: any[];
  error?: string | null;
  onRetry?: () => void;
}

const GPAManagementModal: React.FC<GPAManagementModalProps> = ({
  visible,
  onClose,
  onManageGPA,
  showGPAManagementLoader,
  GPA,
  error,
  onRetry,
}) => {
  useEffect(() => {
    console.log("GPA data:", GPA);
  }, []);

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
            <Text style={styles.fullScreenModalTitle}>GPA</Text>
            <View style={{ width: 40 }} />
          </View>
          <TouchableOpacity style={styles.manageButton} onPress={onManageGPA}>
            <Text style={styles.manageButtonText}>Manage GPA</Text>
          </TouchableOpacity>
          {showGPAManagementLoader ? (
            <ActivityIndicator
              size="large"
              color="#10B144"
              style={{ marginTop: 20 }}
            />
          ) : error ? (
            <View style={styles.errorContainer}>
              <SimpleIcon name="alert-circle" size={48} color="#ef4444" />
              <Text style={styles.errorTitle}>Something went wrong</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              {onRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : Object.keys(GPA).length > 0 ? (
            <ScrollView style={{ flex: 1, marginTop: 20 }}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerText, { flex: 1 }]}>GPA</Text>
                <Text style={[styles.headerText, { flex: 2 }]}>Range</Text>
                <Text style={[styles.headerText, { flex: 3 }]}>Percentage</Text>
              </View>

              {/* Table Rows */}
              {GPA?.map((item: any) => {
                const percentage =
                  (item.maxPercentage - item.minPercentage) / 100; // simulate visual fill
                console.log(percentage);
                return (
                  <View key={item._id} style={styles.tableRow}>
                    {/* Grade */}
                    <View style={styles.gradeBadge}>
                      <Text style={styles.gradeText}>{item.gpa}</Text>
                    </View>

                    {/* Range */}
                    <Text style={[styles.rangeText, { flex: 2 }]}>
                      {item.minPercentage}% - {item.maxPercentage}%
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

export default GPAManagementModal;

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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginVertical: 8,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#10B144",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});
