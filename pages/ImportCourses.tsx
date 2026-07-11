import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
// import DocumentPicker from "@react-native-documents/picker";
import {
  pick,
  types,
  isErrorWithCode,
  errorCodes,
} from "@react-native-documents/picker";
import RNFS from "react-native-fs";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { getApiInstance } from "../services/apiInstance";

const Icon = ({
  name,
  size = 24,
  color = "#000",
}: {
  name: string;
  size?: number;
  color?: string;
}) => <MaterialIcons name={name as any} size={size} color={color} />;

const CourseImportPage = () => {
  const navigation = useNavigation();

  const [file, setFile] = useState<any>(null); // { uri, name }
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isImported, setIsImported] = useState(false);

  // ── Permission helper (Android only) ──────────────────────────────
  const requestStoragePermission = async () => {
    if (Platform.OS !== "android") return true;
    // On Android 11+ (API 30+) we don't need READ_EXTERNAL_STORAGE for the picker
    if (Platform.Version >= 30) return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "Storage Permission",
          message: "App needs access to your storage to import course files.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // ── 1. Pick JSON file ───────────────────────────────────────────────────────
  const handlePickFile = async () => {
    try {
      const hasPermissions = await requestStoragePermission();
      if (!hasPermissions) {
        Alert.alert("Permission Denied", "Cannot access storage.");
        return;
      }
      const res = await pick({
        type: [types.allFiles],
        // On Android you could also filter by mimeType: 'application/json'
      });

      const picked = res[0];
      // Only accept JSON files
      if (
        picked.type === "application/json" ||
        picked.name?.endsWith(".json")
      ) {
        setFile({ uri: picked.uri, name: picked.name });

        // Read the file content
        const content = await RNFS.readFile(picked.uri, "utf8");

        // const response = await fetch(picked.uri);
        // const content = await response.text();
        try {
          const json = JSON.parse(content);
          console.log("Parsed JSON:", json);
          console.log("Keys:", Object.keys(json));
          setPreviewData(json);
          Alert.alert("Success", "File parsed successfully");
        } catch (parseErr) {
          Alert.alert("Error", "Invalid JSON format inside file");
          setFile(null);
          setPreviewData(null);
        }
      } else {
        Alert.alert("Error", "Please select a valid .json file");
      }
    } catch (err: any) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        console.error(err);
        console.log(err);
      }
    }
  };

  // ── 2. Start import ─────────────────────────────────────────────────────────
  const handleStartImport = async () => {
    if (!previewData) {
      Alert.alert("Error", "No data to import");
      return;
    }

    setLoading(true);
    try {
      const requiredKeys = [
        "courseTitle",
        "category",
        "subcategory",
        "language",
        "curriculum",
        "assessments",
        "discussions",
      ];
      const missing = requiredKeys.filter((key) => !previewData[key]);
      if (missing.length) {
        console.log("ye agya range mein", missing);
        Alert.alert("Invalid Data", `Missing fields: ${missing.join(", ")}`);
        return;
      }
      const api = await getApiInstance();
      const response = await api.post(
        `/course/import-full-course`,
        previewData
      );

      if (response.data.success) {
        setIsImported(true);
        Alert.alert("Success", "Course Created Successfully!");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Server Error during import";
      console.log("Import error:", err);
      console.log("Response data:", err.response?.data);
      console.log("Status:", err.response?.status);
      console.log(message);
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  // ── 3. Reset all states ─────────────────────────────────────────────────────
  const resetPage = () => {
    setFile(null);
    setPreviewData(null);
    setIsImported(false);
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (isImported) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Icon name="check-circle" size={100} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Course Imported!</Text>
          <Text style={styles.successSubtitle}>
            The course{" "}
            <Text style={{ fontWeight: "bold" }}>
              "{previewData?.courseTitle}"
            </Text>{" "}
            has been successfully cloned to your account.
          </Text>

          <View style={styles.successButtons}>
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => (navigation as any).navigate("MyCourses")}
            >
              <Text style={styles.outlineBtnText}>Go to Courses</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={resetPage}>
              <Icon name="add-circle" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Import Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main import UI ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Icon name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Course Importer</Text>
            <Text style={styles.headerSubtitle}>
              Clone full courses using exported JSON data.
            </Text>
          </View>
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Left side: upload area */}
          <View style={styles.leftColumn}>
            <TouchableOpacity
              style={[
                styles.dropZone,
                file ? styles.dropZoneActive : styles.dropZoneIdle,
              ]}
              onPress={handlePickFile}
              activeOpacity={0.7}
            >
              {file ? (
                <Icon name="code" size={64} color="#10B981" />
              ) : (
                <View style={styles.uploadIconBg}>
                  <Icon name="upload-file" size={32} color="#2563EB" />
                </View>
              )}
              <Text style={styles.dropZoneTitle}>
                {file ? file.name : "Select Course JSON"}
              </Text>
              <Text style={styles.dropZoneSubtitle}>
                Click to browse for a .json file
              </Text>
            </TouchableOpacity>

            {/* Warning box */}
            <View style={styles.warningBox}>
              <Icon name="warning" size={20} color="#D97706" />
              <Text style={styles.warningText}>
                <Text style={{ fontWeight: "bold" }}>Important:</Text> This
                process will replicate the entire course structure. Make sure
                you are using a JSON file exported from the "Course Tools" menu.
              </Text>
            </View>
          </View>

          {/* Right side: summary panel */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Icon name="history" size={18} color="#111827" />
              <Text style={styles.summaryTitle}>Import Summary</Text>
            </View>

            {previewData ? (
              <View style={styles.summaryContent}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Target Course Title:</Text>
                  <Text style={styles.summaryValue}>
                    {previewData.courseTitle}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Chapters:</Text>
                  <Text style={styles.summaryValue}>
                    {previewData.curriculum?.length || 0}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Assessments:</Text>
                  <Text style={styles.summaryValue}>
                    {previewData.assessments?.length || 0}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discussions:</Text>
                  <Text style={styles.summaryValue}>
                    {previewData.discussions?.length || 0}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.importBtn, loading && { opacity: 0.6 }]}
                  onPress={handleStartImport}
                  disabled={loading}
                >
                  {loading ? (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.importBtnText}> Processing...</Text>
                    </View>
                  ) : (
                    <Text style={styles.importBtnText}>Confirm & Create</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptySummary}>
                <Text style={styles.emptyText}>No file loaded yet</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },

  // Main layout
  content: {
    paddingHorizontal: 16,
  },
  leftColumn: {
    marginBottom: 24,
  },

  // Drop zone
  dropZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  dropZoneIdle: {
    borderColor: "#d1d5db",
  },
  dropZoneActive: {
    borderColor: "#10B981",
    backgroundColor: "#f0fdf4",
  },
  dropZoneTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    color: "#111827",
  },
  dropZoneSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  uploadIconBg: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 50,
    marginBottom: 8,
  },

  // Warning
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    alignItems: "flex-start",
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
  },

  // Summary card
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 12,
    marginBottom: 12,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  summaryLabel: {
    color: "#6b7280",
    fontSize: 14,
  },
  summaryValue: {
    fontWeight: "600",
    color: "#111827",
    fontSize: 14,
  },
  importBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  importBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  emptySummary: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
  },

  // Success state
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  successIconContainer: {
    backgroundColor: "#D1FAE5",
    padding: 24,
    borderRadius: 100,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  successButtons: {
    width: "100%",
    gap: 12,
    paddingHorizontal: 40,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  outlineBtnText: {
    fontWeight: "600",
    color: "#374151",
    fontSize: 16,
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default CourseImportPage;
