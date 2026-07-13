import React, { useState } from "react";
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
  Pressable,
  Image,
} from "react-native";
import {
  pick,
  types,
  isErrorWithCode,
  errorCodes,
} from "@react-native-documents/picker";
import RNFS from "react-native-fs";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { courseImport } from "../services/courseImport";

// ─── Type definitions ────────────────────────────────────────────────────────
interface CourseImportData {
  courseTitle: string;
  category: string;
  subcategory: string;
  language: string;
  courseDescription: string;
  teachingPoints: string[];
  requirements: string[];
  curriculum: any[]; // adjust to your actual type
  assessments: any[];
  discussions: any[];
}

interface PickedFile {
  uri: string;
  name: string | null;
}

// ─── Icon helper ────────────────────────────────────────────────────────────
const Icon = ({
  name,
  size = 24,
  color = "#000",
}: {
  name: string;
  size?: number;
  color?: string;
}) => <MaterialIcons name={name as any} size={size} color={color} />;

// ─── Main component ─────────────────────────────────────────────────────────
const CourseImportPage = () => {
  const navigation = useNavigation();

  const [file, setFile] = useState<PickedFile | null>(null);
  const [previewData, setPreviewData] = useState<CourseImportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isImported, setIsImported] = useState(false);

  // ── Permission helper ─────────────────────────────────────────────────────
  // const requestStoragePermission = async () => {
  //   if (Platform.OS !== "android") return true;
  //   if (Platform.Version >= 30) return true; // Android 11+ no need
  //   try {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  //       {
  //         title: "Storage Permission",
  //         message: "App needs access to your storage to import course files.",
  //         buttonNeutral: "Ask Me Later",
  //         buttonNegative: "Cancel",
  //         buttonPositive: "OK",
  //       }
  //     );
  //     return granted === PermissionsAndroid.RESULTS.GRANTED;
  //   } catch (err) {
  //     console.warn(err);
  //     return false;
  //   }
  // };

  // ── Cancel selected file ──────────────────────────────────────────────────
  const handleCancelFile = () => {
    setFile(null);
    setPreviewData(null);
  };

  // ── 1. Pick JSON file ─────────────────────────────────────────────────────
  const handlePickFile = async () => {
    // Check permissions (now uncommented)
    // const hasPermissions = await requestStoragePermission();
    // if (!hasPermissions) {
    //   Alert.alert("Permission Denied", "Cannot access storage.");
    //   return;
    // }

    try {
      const res = await pick({
        type: [types.allFiles],
      });

      const picked = res[0];
      if (
        picked.type === "application/json" ||
        picked.name?.toLowerCase().endsWith(".json")
      ) {
        setFile({ uri: picked.uri, name: picked.name });

        const content = await RNFS.readFile(picked.uri, "utf8");
        try {
          const json = JSON.parse(content) as CourseImportData;
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
        console.log("User cancelled the file picker");
      } else {
        Alert.alert(
          "Error",
          "An unexpected error occurred while picking the file."
        );
        console.error(err);
      }
    }
  };

  // ── 2. Start import ────────────────────────────────────────────────────────
  const handleStartImport = async () => {
    if (!previewData) {
      Alert.alert("Error", "No data to import");
      return;
    }

    setLoading(true);
    try {
      // Complete required keys list (now includes description, teachingPoints, requirements)
      const requiredKeys: (keyof CourseImportData)[] = [
        "courseTitle",
        "category",
        "subcategory",
        "language",
        "courseDescription",
        "teachingPoints",
        "requirements",
        "curriculum",
        "assessments",
        "discussions",
      ];
      const missing = requiredKeys.filter((key) => !previewData[key]);
      if (missing.length) {
        const presentKeys = Object.keys(previewData);
        Alert.alert(
          "Invalid Data",
          `Missing fields: ${missing.join(
            ", "
          )}\n\nYour file has: ${presentKeys.join(", ")}`
        );
        return;
      }

      const response = await courseImport(previewData);

      if (response.data.success) {
        // No extra Alert – we go straight to the success screen
        setIsImported(true);
      }
    } catch (err: any) {
      // ── Improved error handling ──
      let errorMessage = "Server Error during import";

      if (err.response?.data) {
        const data = err.response.data;
        // If the server returns a structured validation object (e.g., { field: "error" })
        if (typeof data === "object" && data !== null) {
          const messages = Object.entries(data)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join("\n");
          if (messages) {
            errorMessage = `Validation failed:\n${messages}`;
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (typeof data === "string") {
          errorMessage = data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      console.log("Import error:", err);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ── 3. Reset all states ──────────────────────────────────────────────────
  const resetPage = () => {
    setFile(null);
    setPreviewData(null);
    setIsImported(false);
  };

  // ── Success screen ────────────────────────────────────────────────────────
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

  // ── Main import UI ──────────────────────────────────────────────────────
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
          {/* Left column: upload area */}
          <View style={styles.leftColumn}>
            <View style={styles.dropZoneContainer}>
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

              {file && (
                <Pressable
                  onPress={handleCancelFile}
                  style={styles.cancelUpload}
                >
                  <Image
                    source={require("../assets/cancel.png")}
                    style={styles.cancelIcon}
                  />
                </Pressable>
              )}
            </View>

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

          {/* Right column: summary card */}
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

// ─── Styles (unchanged – copied from your code) ────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  container: { flex: 1 },
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
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  headerSubtitle: { fontSize: 14, color: "#6b7280", marginTop: 2 },

  content: { paddingHorizontal: 16 },
  leftColumn: { marginBottom: 24 },

  dropZoneContainer: { position: "relative", width: "100%" },
  dropZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  dropZoneIdle: { borderColor: "#d1d5db" },
  dropZoneActive: { borderColor: "#10B981", backgroundColor: "#f0fdf4" },

  cancelUpload: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 6,
  },
  cancelIcon: { width: 24, height: 24, tintColor: "#ef4444", margin: 8 },

  dropZoneTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    color: "#111827",
  },
  dropZoneSubtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  uploadIconBg: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 50,
    marginBottom: 8,
  },

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
  warningText: { flex: 1, fontSize: 14, color: "#92400E" },

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
  summaryTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  summaryContent: { gap: 12 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  summaryLabel: { color: "#6b7280", fontSize: 14 },
  summaryValue: { fontWeight: "600", color: "#111827", fontSize: 14 },
  importBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  importBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  emptySummary: { alignItems: "center", paddingVertical: 32 },
  emptyText: { color: "#9ca3af", fontSize: 14 },

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
  successButtons: { width: "100%", gap: 12, paddingHorizontal: 40 },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  outlineBtnText: { fontWeight: "600", color: "#374151", fontSize: 16 },
  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

export default CourseImportPage;
