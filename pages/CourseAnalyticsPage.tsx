import React, { useEffect, useState } from "react";
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
import { getCourseAnalytics } from "../services/gradebook";
import { getFriendlyErrorMessage } from "../utils/errorMessage";

type RouteParams = RouteProp<RootStackParamList, "CourseAnalytics">;

// ─── Simple SVG line chart (Performance History) ───
const LineChartSVG = ({
  data,
  width,
  height = 170,
}: {
  data: { name: string; score: string | number }[];
  width: number;
  height?: number;
}) => {
  if (!data || data.length === 0) {
    return <Text style={styles.chartEmptyText}>No history yet</Text>;
  }
  const padding = 12;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const scores = data.map((d) => Math.min(100, Math.max(0, Number(d.score) || 0)));

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
      <Polyline
        points={pointsAttr}
        fill="none"
        stroke="#2563eb"
        strokeWidth={3}
      />
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={4} fill="#2563eb" />
      ))}
    </Svg>
  );
};

// ─── Horizontal bar chart (Category Analysis) ───
const CategoryBarChart = ({
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
        const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#3b82f6" : "#f59e0b";
        return (
          <View key={i} style={styles.barRow}>
            <Text style={styles.barLabel} numberOfLines={1}>
              {d.category}
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${pct}%`, backgroundColor: color },
                ]}
              />
            </View>
            <Text style={styles.barValue}>{pct.toFixed(0)}%</Text>
          </View>
        );
      })}
    </View>
  );
};

const CourseAnalyticsPage = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteParams>();
  const { courseId } = route.params;
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 32 - 32; // page padding + card padding

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getCourseAnalytics(courseId);
        setData(res);
      } catch (err: any) {
        setError(getFriendlyErrorMessage(err, "Failed to load analytics."));
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchAnalytics();
  }, [courseId]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <SimpleIcon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Performance Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#10B144" />
        </View>
      ) : error || !data ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || "No data found"}</Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {data.courseName ? (
            <Text style={styles.courseName}>{data.courseName}</Text>
          ) : null}

          {/* Trend insight banner */}
          {data.insights &&
            (() => {
              const isImproving = data.insights.trendStatus === "increasing";
              return (
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
                      Performance Trend: {isImproving ? "Improving" : "Decreasing"}
                    </Text>
                    <Text style={styles.trendBody}>
                      Based on your last{" "}
                      <Text style={styles.trendBold}>
                        {data.insights.sampleSize} submissions
                      </Text>
                      , your performance is {data.insights.trendStatus}. Your
                      recent average is{" "}
                      <Text style={styles.trendBold}>
                        {data.insights.recentAverage}%
                      </Text>
                      , a change of{" "}
                      <Text style={styles.trendBold}>
                        {data.insights.percentageChange}%
                      </Text>{" "}
                      compared to your historical average.
                    </Text>
                  </View>
                </View>
              );
            })()}

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>Current Grade</Text>
                <SimpleIcon name="star" size={16} color="#ca8a04" />
              </View>
              <Text style={styles.statCardValue}>
                {data.summary?.currentPercentage ?? 0}%
              </Text>
            </View>

            <View style={[styles.statCard, styles.statCardAccent]}>
              <View style={styles.statCardHeader}>
                <Text style={[styles.statCardLabel, { color: "#111827" }]}>
                  Projected Final
                </Text>
                <SimpleIcon name="refresh" size={16} color="#16a34a" />
              </View>
              <Text style={styles.statCardValue}>
                {data.insights?.projectedFinalScore ?? "—"}%
              </Text>
              <Text style={styles.statCardHint}>
                ESTIMATED BASED ON CURRENT PACE
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>Points Earned</Text>
                <SimpleIcon name="clipboard" size={16} color="#2563eb" />
              </View>
              <Text style={styles.statCardValue}>
                {data.summary?.pointsEarned ?? 0} /{" "}
                {data.summary?.pointsPossible ?? 0}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>Assessments</Text>
                <SimpleIcon name="menu-book" size={16} color="#16a34a" />
              </View>
              <Text style={styles.statCardValue}>
                {data.summary?.totalAssessments ?? 0}
              </Text>
            </View>
          </View>

          {/* Weakest category alert */}
          {data.insights?.weakestCategory && (
            <View style={styles.weakestAlert}>
              <SimpleIcon name="alert-circle" size={20} color="#dc2626" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.weakestTitle}>
                  Priority Improvement Area:{" "}
                  {data.insights.weakestCategory.name}
                </Text>
                <Text style={styles.weakestBody}>
                  Your performance in{" "}
                  <Text style={styles.trendBold}>
                    {data.insights.weakestCategory.name}
                  </Text>{" "}
                  ({data.insights.weakestCategory.average}%) is currently{" "}
                  <Text style={styles.trendBold}>
                    {data.insights.weakestCategory.gap}% lower
                  </Text>{" "}
                  than your top-performing category. Improving this area will
                  significantly boost your final grade.
                </Text>
              </View>
            </View>
          )}

          {/* Performance History */}
          <View style={styles.chartCard}>
            <Text style={styles.chartCardTitle}>Performance History</Text>
            <Text style={styles.chartCardSubtitle}>
              Score trend across all assessments
            </Text>
            <View style={{ marginTop: 12, alignItems: "center" }}>
              <LineChartSVG
                data={data.charts?.lineChart || []}
                width={chartWidth}
              />
            </View>
          </View>

          {/* Category Analysis */}
          <View style={styles.chartCard}>
            <Text style={styles.chartCardTitle}>Category Analysis</Text>
            <Text style={styles.chartCardSubtitle}>
              Average proficiency per task type
            </Text>
            <View style={{ marginTop: 16 }}>
              <CategoryBarChart data={data.charts?.categoryPerformance || []} />
            </View>
          </View>

          {/* Personalized Study Advice */}
          <View style={styles.adviceCard}>
            <View style={styles.adviceHeader}>
              <SimpleIcon name="star" size={18} color="#facc15" />
              <Text style={styles.adviceTitle}>Personalized Study Advice</Text>
            </View>
            <Text style={styles.adviceBody}>
              {data.insights?.trendStatus === "increasing"
                ? "You've built great momentum recently! To maintain this growth, ensure you maintain your consistency in your top subjects while slowly bridging the gap in your weaker areas."
                : "We've noticed a slight dip in your recent scores. Don't worry — this usually happens before a breakthrough. Focus on reviewing the fundamentals of your weakest category to stop the downward trend."}
            </Text>
            <View style={styles.adviceChipsRow}>
              <View style={styles.adviceChip}>
                <Text style={styles.adviceChipText}>
                  Goal: {data.insights?.projectedFinalScore ?? "—"}%
                </Text>
              </View>
              {data.insights?.weakestCategory && (
                <View style={styles.adviceChip}>
                  <Text style={styles.adviceChipText}>
                    Focus: {data.insights.weakestCategory.name}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}
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
  courseName: { fontSize: 14, color: "#6b7280", marginBottom: 16 },
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
  statCardAccent: {
    backgroundColor: "#fef3c7",
    borderColor: "#fde68a",
  },
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
  weakestTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#991b1b",
    marginBottom: 4,
  },
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
  chartCardSubtitle: { fontSize: 12, color: "#6b7280", marginTop: 2 },
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
  adviceCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 18,
  },
  adviceHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  adviceTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#facc15",
    marginLeft: 8,
  },
  adviceBody: { fontSize: 13, color: "#e2e8f0", lineHeight: 19 },
  adviceChipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  adviceChip: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  adviceChipText: { color: "#fff", fontSize: 11, fontWeight: "600" },
});

export default CourseAnalyticsPage;
