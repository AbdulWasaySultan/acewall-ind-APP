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

type RouteParams = RouteProp<RootStackParamList, "StandardGradeScaleManagement">;

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
      // if 404 or not found, treat as empty
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
    // Save to API
    try {
      // call API to set scale
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
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <SimpleIcon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Standard-Based Learning Scale</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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
              {/* <SimpleIcon name="alert-circle" size={40} color="#aaa" /> */}
              <Text style={styles.emptyText}>No SBL scale found</Text>
              <Text style={styles.emptySubtext}>
                Tap "Manage Scale" to create one
              </Text>
            </View>
          ) : (
            <View>
              {/* Header Row */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>
                  Range
                </Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>
                  Points
                </Text>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>
                  Remarks
                </Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Bar</Text>
              </View>

              {scale.map((item, index) => (
                <View key={item._id || index} style={styles.row}>
                  <Text style={[styles.rowText, { flex: 1.5 }]}>
                    {item.minPercentage}% – {item.maxPercentage}%
                  </Text>
                  <View style={[styles.badge, { flex: 1 }]}>
                    <Text style={styles.badgeText}>{item.points}</Text>
                  </View>
                  <Text style={[styles.rowText, { flex: 2 }]} numberOfLines={1}>
                    {item.remarks}
                  </Text>
                  <View style={[styles.progressContainer, { flex: 1.5 }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${item.maxPercentage}%` },
                      ]}
                    />
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
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", flex: 1 },
  content: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
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
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  manageButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  loader: { marginVertical: 40 },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#666", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#999", marginTop: 4 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderText: { fontWeight: "bold", color: "#6b7280", fontSize: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  rowText: { fontSize: 14, color: "#333" },
  badge: {
    backgroundColor: "#10B144",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  progressContainer: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginLeft: 8,
  },
  progressFill: { height: "100%", backgroundColor: "#10B144" },
});

export default StandardGradeScaleManagementPage;
