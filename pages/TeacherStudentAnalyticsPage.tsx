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
import Svg, { Polyline, Circle, Line as SvgLine } from "react-native-svg";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import SimpleIcon from "../components/SimpleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getTeacherStudentAnalytics,
  TeacherStudentAnalytics,
} from "../services/gradebook";
import { getFriendlyErrorMessage } from "../utils/errorMessage";

type RouteParams = RouteProp<RootStackParamList, "TeacherStudentAnalytics">;

// ─── Submission History line chart — fixed 0-100 y-domain, x labels hidden
// (matches web's XAxis `hide`), blue-600 line. ───
const LineChartSVG = ({
  data,
  width,
  height = 170,
}: {
  data: { name: string; score: number }[];
  width: number;
  height?: number;
}) => {
  if (!data || data.length === 0) {
    return <Text style={styles.chartEmptyText}>No submission history yet</Text>;
  }
  const padding = 12;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const scores = data.map((d) => Math.min(100, Math.max(0, d.score || 0)));

  const points = scores.map((s, i) => {
    const x =
      padding + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
    const y = padding + chartH - (s / 100) * chartH;
    return { x, y };
  });
  const pointsAttr = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <Svg width={width} height={height}>
      {[0, 25, 50, 75, 100].map((v) => {
        const y = padding + chartH - (v / 100) * chartH;
        return (
          <SvgLine
            key={v}
            x1={padding}
            y1={y}
            x2={width - padding}
            y2={y}
            stroke="#f0f0f0"
            strokeWidth={1}
          />
        );
      })}
      <Polyline points={pointsAttr} fill="none" stroke="#2563eb" strokeWidth={3} />
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={4} fill="#2563eb" />
      ))}
    </Svg>
  );
};

// ─── Competency Breakdown horizontal bar chart — binary color threshold
// (>=80 emerald, <80 blue) and 0-decimal labels, per this screen's spec
// (deliberately different from CourseAnalyticsPage's 3-tier version). ───
const CompetencyBarChart = ({
  data,
}: {
  data: { category: string; average: number }[];
}) => {
  if (!data || data.length === 0) {
    return <Text style={styles.chartEmptyText}>No category data yet</Text>;
  }
  return (
    <View>
      {data.map((d, i) => {
        const pct = Math.min(100, Math.max(0, d.average || 0));
        const color = pct >= 80 ? "#10b981" : "#3b82f6";
        return (
          <View key={i} style={styles.barRow}>
            <Text style={styles.barLabel} numberOfLines={1}>
              {d.category}
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]}
              />
            </View>
            <Text style={styles.barValue}>{pct.toFixed(0)}%</Text>
          </View>
        );
      })}
    </View>
  );
};

const TeacherStudentAnalyticsPage = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteParams>();
  const { courseId, studentId } = route.params;
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 32 - 32; // page padding + card padding

  const [data, setData] = useState<TeacherStudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTeacherStudentAnalytics(courseId, studentId);
      if (!res) {
        setError("No data found");
      } else {
        setData(res);
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, "No data found"));
    } finally {
      setLoading(false);
    }
  }, [courseId, studentId]);

  useEffect(() => {
    if (courseId && studentId) fetchAnalytics();
  }, [courseId, studentId, fetchAnalytics]);

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#10B144" />
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || "No data found"}</Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { summary, insights, charts, courseName } = data;
  const isImproving = insights?.trendStatus === "increasing";

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <SimpleIcon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Student Performance Report</Text>
          <Text style={styles.headerSubtitle}>
            Student ID: {studentId} | Course: {courseName}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {/* Trend insight banner */}
        {insights && (
          <View
            style={[
              styles.trendBanner,
              isImproving ? styles.trendBannerUp : styles.trendBannerDown,
            ]}
          >
            <View
              style={[
                styles.trendIconWrap,
                { backgroundColor: isImproving ? "#dcfce7" : "#fee2e2" },
              ]}
            >
              <SimpleIcon
                name={isImproving ? "arrow-up" : "arrow-down"}
                size={22}
                color={isImproving ? "#16a34a" : "#dc2626"}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.trendTitle,
                  { color: isImproving ? "#166534" : "#991b1b" },
                ]}
              >
                {isImproving ? "Positive Momentum" : "Performance Decline"}
              </Text>
              <Text style={styles.trendBody}>
                In the last{" "}
                <Text style={styles.trendBold}>{insights.sampleSize} submissions</Text>
                , the student's average is{" "}
                <Text style={styles.trendBold}>{insights.recentAverage}%</Text>. This
                is a{" "}
                <Text style={styles.trendBold}>{insights.percentageChange}%</Text>{" "}
                {insights.trendStatus} compared to their overall average of{" "}
                <Text style={styles.trendBold}>{insights.overallAverage}%</Text>.
              </Text>
            </View>
          </View>
        )}

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Current Grade</Text>
              <SimpleIcon name="star" size={16} color="#ca8a04" />
            </View>
            <Text style={styles.statCardValue}>{summary.currentPercentage}%</Text>
          </View>

          <View style={[styles.statCard, styles.statCardAccent]}>
            <View style={styles.statCardHeader}>
              <Text style={[styles.statCardLabel, { color: "#111827" }]}>
                Projected Final
              </Text>
              <SimpleIcon name="refresh" size={16} color="#16a34a" />
            </View>
            <Text style={styles.statCardValue}>
              {insights ? `${insights.projectedFinalScore}%` : "—"}
            </Text>
            <Text style={styles.statCardHint}>ESTIMATED RESULT</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Points</Text>
              <SimpleIcon name="clipboard" size={16} color="#2563eb" />
            </View>
            <Text style={styles.statCardValue}>
              {summary.pointsEarned} / {summary.pointsPossible}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Total Work</Text>
              <SimpleIcon name="menu-book" size={16} color="#16a34a" />
            </View>
            <Text style={styles.statCardValue}>{summary.totalAssessments} items</Text>
          </View>
        </View>

        {/* Intervention alert */}
        {insights?.weakestCategory && (
          <View style={styles.weakestAlert}>
            <SimpleIcon name="alert-circle" size={20} color="#dc2626" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.weakestTitle}>
                Intervention Needed: {insights.weakestCategory.name}
              </Text>
              <Text style={styles.weakestBody}>
                The student is struggling most with{" "}
                <Text style={styles.trendBold}>{insights.weakestCategory.name}</Text>.
                There is a{" "}
                <Text style={styles.trendBold}>{insights.weakestCategory.gap}%</Text>{" "}
                proficiency gap between this and their best category.
              </Text>
            </View>
          </View>
        )}

        {/* Submission History */}
        <View style={styles.chartCard}>
          <Text style={styles.chartCardTitle}>Submission History</Text>
          <View style={{ marginTop: 12, alignItems: "center" }}>
            <LineChartSVG data={charts.lineChart} width={chartWidth} />
          </View>
        </View>

        {/* Competency Breakdown */}
        <View style={styles.chartCard}>
          <Text style={styles.chartCardTitle}>Competency Breakdown</Text>
          <View style={{ marginTop: 16 }}>
            <CompetencyBarChart data={charts.categoryPerformance} />
          </View>
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
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  headerSubtitle: { color: "#e0f2e9", fontSize: 12, marginTop: 2 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  errorText: { color: "#dc2626", fontSize: 15, marginBottom: 16, textAlign: "center" },
  goBackButton: {
    backgroundColor: "#10B144",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  goBackButtonText: { color: "#fff", fontWeight: "700" },
  content: { flex: 1, padding: 16 },
  trendBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },
  trendBannerUp: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  trendBannerDown: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  trendIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  trendTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 4 },
  trendBody: { fontSize: 13, color: "#374151", lineHeight: 19 },
  trendBold: { fontWeight: "700", color: "#111827" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statCard: {
    width: "48.5%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 14,
    marginBottom: 10,
  },
  statCardAccent: { backgroundColor: "#fef3c7", borderColor: "#fde68a" },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statCardLabel: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
  statCardValue: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  statCardHint: {
    fontSize: 9,
    color: "#92400e",
    marginTop: 4,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  weakestAlert: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  weakestTitle: { fontSize: 13, fontWeight: "bold", color: "#991b1b", marginBottom: 4 },
  weakestBody: { fontSize: 12, color: "#7f1d1d", lineHeight: 18 },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 16,
    marginBottom: 16,
  },
  chartCardTitle: { fontSize: 15, fontWeight: "bold", color: "#111827" },
  chartEmptyText: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 13,
    paddingVertical: 24,
  },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  barLabel: {
    width: 90,
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginRight: 8,
  },
  barTrack: {
    flex: 1,
    height: 22,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 6 },
  barValue: {
    width: 42,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginLeft: 8,
  },
});

export default TeacherStudentAnalyticsPage;
