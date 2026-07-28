import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import SimpleIcon from "../components/SimpleIcon";
import { getSBLScale, setSBLScale } from "../services/course";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StandardGradeScaleModal from "../components/modals/StandardGradeScaleModal";
import { RootStackParamList } from "../navigation/AppNavigator";

interface SBLItem {
  _id?: string;
  points: number;
  minPercentage: number;
  maxPercentage: number;
  remarks: string;
}

type RouteParams = RouteProp<
  RootStackParamList,
  "StandardGradeScaleManagement"
>;

const StandardGradeScaleManagementPage = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const { courseId } = route.params;
  const insets = useSafeAreaInsets();
  const [scale, setScale] = useState<SBLItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchScale = async () => {
    setLoading(true);
    try {
      const res = await getSBLScale(courseId);
      setScale(res.scale || []);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setScale([]);
      } else {
        Alert.alert("Error", err.message || "Failed to fetch scale");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScale();
  }, [courseId]);

  const handleSave = async (newScale: SBLItem[]) => {
    try {
      await setSBLScale(courseId, newScale);
      setScale(newScale);
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save scale");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <SimpleIcon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Standard-Based Learning Scale</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <SimpleIcon name="book" size={20} color="#10B144" />
              <Text style={styles.cardTitle}>SBL Scale</Text>
            </View>
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.manageButtonText}>Manage Scale</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#10B144"
              style={styles.loader}
            />
          ) : scale.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No SBL scale found</Text>
              <Text style={styles.emptySubtext}>
                Tap "Manage Scale" to create one
              </Text>
            </View>
          ) : (
            <View>
              {/* Header Row */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colRange]}>
                  Range
                </Text>
                <Text
                  style={[
                    styles.tableHeaderText,
                    styles.colPoints,
                    { textAlign: "center" },
                  ]}
                >
                  Points
                </Text>
                <Text style={[styles.tableHeaderText, styles.colRemarks]}>
                  Remarks
                </Text>
                <Text
                  style={[
                    styles.tableHeaderText,
                    styles.colBar,
                    { textAlign: "center" },
                  ]}
                >
                  Bar
                </Text>
              </View>

              {/* Data Rows */}
              {scale.map((item, index) => (
                <View key={item._id || index} style={styles.row}>
                  {/* Range */}
                  <Text
                    style={[styles.rowText, styles.colRange]}
                    numberOfLines={1}
                  >
                    {item.minPercentage}% – {item.maxPercentage}%
                  </Text>

                  {/* Points Badge Container */}
                  <View style={[styles.colPoints, styles.badgeColumn]}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.points}</Text>
                    </View>
                  </View>

                  {/* Remarks */}
                  <Text
                    style={[styles.rowText, styles.colRemarks]}
                    numberOfLines={2}
                  >
                    {item.remarks}
                  </Text>

                  {/* Progress Bar */}
                  <View style={[styles.colBar, styles.progressColumn]}>
                    <View style={styles.progressContainer}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(
                              Math.max(item.maxPercentage, 0),
                              100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <StandardGradeScaleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        initialScale={scale}
        courseId={courseId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  header: {
    backgroundColor: "#10B144",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    minHeight: 56,
  },
  backButton: { padding: 4, marginRight: 12 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", flex: 1 },
  content: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center" },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 8, color: "#333" },
  manageButton: {
    backgroundColor: "#10B144",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  manageButtonText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  loader: { marginVertical: 40 },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#666", marginTop: 12 },
  emptySubtext: { fontSize: 13, color: "#999", marginTop: 4 },

  // Table Structure
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderColor: "#e5e7eb",
    paddingBottom: 10,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontWeight: "700",
    color: "#6b7280",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  rowText: { fontSize: 13, color: "#1f2937", paddingRight: 4 },

  // Strict Column Flex Widths
  colRange: { flex: 2.2 },
  colPoints: { flex: 1.2, marginRight: 30 },
  colRemarks: { flex: 2.1 },
  colBar: { flex: 1.5, marginLeft: -30 },

  // Component-specific Layout Helpers
  badgeColumn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badge: {
    backgroundColor: "#10B144",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  progressColumn: {
    justifyContent: "center",
    paddingLeft: 4,
  },
  progressContainer: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: { height: "100%", backgroundColor: "#10B144" },
});

export default StandardGradeScaleManagementPage;
