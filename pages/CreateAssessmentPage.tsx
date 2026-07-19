// screens/CreateAssessmentPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SimpleIcon from "../components/SimpleIcon";
import AddAssessmentForm from "../components/AddAssessmentForm";
import { getQuarterDetails } from "../services/course";

const CreateAssessmentPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const params = route.params as any;

  const [quarterStartDate, setQuarterStartDate] = useState<Date | null>(null);
  const [quarterEndDate, setQuarterEndDate] = useState<Date | null>(null);
  const [loadingQuarter, setLoadingQuarter] = useState(true);
  const [quarterError, setQuarterError] = useState<string | null>(null);

  const fetchQuarterDates = useCallback(async (quarterId: string) => {
    setLoadingQuarter(true);
    setQuarterError(null);
    try {
      const data = await getQuarterDetails(quarterId);
      const start = data?.quarter?.startDate
        ? new Date(data.quarter.startDate)
        : null;
      const end = data?.quarter?.endDate
        ? new Date(data.quarter.endDate)
        : null;

      if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error(
          "Quarter dates were missing or invalid in the response."
        );
      }

      setQuarterStartDate(start);
      setQuarterEndDate(end);
    } catch (error) {
      console.error("Failed to fetch quarter dates:", error);
      setQuarterStartDate(null);
      setQuarterEndDate(null);
      setQuarterError(
        "Couldn't load this quarter's date range. You can still create the assessment, but its due date won't be checked against the quarter."
      );
    } finally {
      setLoadingQuarter(false);
    }
  }, []);

  useEffect(() => {
    if (params?.quarterId) {
      fetchQuarterDates(params.quarterId);
    } else {
      setLoadingQuarter(false);
    }
  }, [params?.quarterId, fetchQuarterDates]);

  const handleBack = () => {
    if (params?.navigateBack) {
      params.navigateBack();
    } else {
      navigation.goBack();
    }
  };

  if (loadingQuarter) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#10B144" />
        <Text style={styles.loadingText}>Loading quarter details…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <SimpleIcon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Create New Assessment</Text>
          <Text style={styles.headerSubtitle}>
            Create a new Assessment for students.
          </Text>
        </View>
      </View>

      {/* Non-blocking banner: quarter dates failed to load, but the teacher
          can still proceed — the assessment just won't be date-range checked. */}
      {quarterError && (
        <View style={styles.errorBanner}>
          <SimpleIcon name="alert-circle" size={18} color="#b91c1c" />
          <Text style={styles.errorBannerText}>{quarterError}</Text>
          {params?.quarterId && (
            <TouchableOpacity
              onPress={() => fetchQuarterDates(params.quarterId)}
              style={styles.errorBannerRetry}
            >
              <Text style={styles.errorBannerRetryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Form Component */}
      <AddAssessmentForm
        courseId={params.courseId}
        chapterId={params.chapterId}
        lessonId={params.lessonId}
        semesterId={params.semesterId}
        quarterId={params.quarterId}
        quarterStartDate={quarterStartDate}
        quarterEndDate={quarterEndDate}
        onAssessmentCreated={params.refreshAssessments}
        onCancel={handleBack}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#fecaca",
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#b91c1c",
    marginLeft: 8,
    marginRight: 8,
  },
  errorBannerRetry: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  errorBannerRetryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#b91c1c",
  },
});

export default CreateAssessmentPage;
