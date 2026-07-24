import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import Svg, {
  Path,
  Circle,
  Line as SvgLine,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import SimpleIcon from "../components/SimpleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getCourseEnrollmentStats } from "../services/course";

type RouteParams = RouteProp<RootStackParamList, "EnrollmentStats">;

type RangeOption = "7d" | "30d" | "6m" | "all";
const RANGE_OPTIONS: { value: RangeOption; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "6m", label: "6M" },
  { value: "all", label: "All" },
];

// ─── Area chart (Enrollment Trends) ───
const EnrollmentAreaChart = ({
  data,
  width,
  height = 300,
}: {
  data: { date: string; students: number }[];
  width: number;
  height?: number;
}) => {
  const padding = 12;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const maxStudents = Math.max(1, ...data.map((d) => d.students));
  // Integer-only y-axis: round the max tick up to a whole number step.
  const yMax = Math.max(1, Math.ceil(maxStudents));

  const points = data.map((d, i) => {
    const x =
      padding + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
    const y = padding + chartH - (d.students / yMax) * chartH;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${padding + chartH} L ${points[0].x} ${padding + chartH} Z`
      : "";

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * yMax));

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="enrollmentFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#16a34a" stopOpacity={0.3} />
            <Stop offset="1" stopColor="#16a34a" stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {yTicks.map((v, i) => {
          const y = padding + chartH - (v / yMax) * chartH;
          return (
            <SvgLine
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#f0f0f0"
              strokeWidth={1}
            />
          );
        })}

        {areaPath ? <Path d={areaPath} fill="url(#enrollmentFill)" /> : null}
        {linePath ? (
          <Path d={linePath} fill="none" stroke="#16a34a" strokeWidth={2.5} />
        ) : null}

        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3} fill="#16a34a" />
        ))}
      </Svg>

      <View style={styles.yAxisLabels}>
        {yTicks
          .slice()
          .reverse()
          .map((v, i) => (
            <Text key={i} style={styles.axisLabel}>
              {v}
            </Text>
          ))}
      </View>

      {data.length > 0 && (
        <View style={styles.xAxisLabels}>
          <Text style={styles.axisLabel}>{data[0].date}</Text>
          {data.length > 1 && (
            <Text style={styles.axisLabel}>{data[data.length - 1].date}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const EnrollmentStatsPage = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteParams>();
  const { courseId } = route.params;
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 32 - 32; // page padding + card padding

  const [range, setRange] = useState<RangeOption>("30d");
  const [stats, setStats] = useState<{ date: string; students: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCourseEnrollmentStats(courseId, range);
      setStats(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Could not load enrollment data.");
      setStats([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, range]);

  useEffect(() => {
    if (courseId) fetchStats();
  }, [courseId, range, fetchStats]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <SimpleIcon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enrollment Trends</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <SimpleIcon name="calendar" size={18} color="#16a34a" />
          <Text style={styles.subtitle}>Overview of student sign-ups</Text>
        </View>

        <View style={styles.rangeSelector}>
          {RANGE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.rangeButton,
                range === opt.value && styles.rangeButtonActive,
              ]}
              onPress={() => setRange(opt.value)}
            >
              <Text
                style={[
                  styles.rangeButtonText,
                  range === opt.value && styles.rangeButtonTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chartCard}>
          {loading ? (
            <View style={[styles.centered, { height: 300 }]}>
              <ActivityIndicator size="large" color="#10B144" />
              <Text style={styles.stateText}>Fetching analytics...</Text>
            </View>
          ) : error ? (
            <View style={[styles.centered, { height: 300 }]}>
              <SimpleIcon name="alert-circle" size={28} color="#dc2626" />
              <Text style={styles.errorText}>Could not load enrollment data.</Text>
            </View>
          ) : stats.length === 0 ? (
            <View style={[styles.emptyBox, { height: 300 }]}>
              <Text style={styles.emptyText}>
                No enrollment data found for this period.
              </Text>
            </View>
          ) : (
            <EnrollmentAreaChart data={stats} width={chartWidth} />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    minHeight: 56,
    backgroundColor: "#10B144",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: { padding: 4, marginRight: 12 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", flex: 1 },
  content: { flex: 1, padding: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 },
  subtitle: { fontSize: 13, color: "#6b7280" },
  rangeSelector: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  rangeButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  rangeButtonText: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  rangeButtonTextActive: { color: "#16a34a" },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 16,
  },
  centered: { justifyContent: "center", alignItems: "center" },
  stateText: { color: "#6b7280", marginTop: 8, fontSize: 13 },
  errorText: {
    color: "#dc2626",
    marginTop: 8,
    fontSize: 13,
    fontStyle: "italic",
  },
  emptyBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { color: "#9ca3af", fontSize: 13 },
  yAxisLabels: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 20,
    justifyContent: "space-between",
  },
  xAxisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 12,
  },
  axisLabel: { fontSize: 10, color: "#9ca3af" },
});

export default EnrollmentStatsPage;
