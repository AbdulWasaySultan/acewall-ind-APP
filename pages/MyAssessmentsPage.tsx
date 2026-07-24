
import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Modal,
  Linking,
} from "react-native";
import {
  getAllAssessmentForStudent,
  getStudentAssessmentDetails,
} from "../services/course";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import SimpleIcon from "../components/SimpleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SearchFilterView from "../components/filters/SearchFilter";
import { FilterBar } from "../components/filters/FilterBar";
import { DropdownFilter } from "../components/filters/DropDown"

// ---------- INTERFACE ----------
export interface AssessmentItem {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    courseTitle: string;
  };
  chapter: {
    _id: string;
    title: string;
  };
  type: "chapter-assessment" | string;
  category: {
    _id: string;
    name: string;
    weight: number;
    course: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  dueDate: {
    date: string;
    time: string;
  };
  createdAt: string;
  isSubmitted: boolean;
  source: "assessment" | "discussion";
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, "StudentAssessmentsByCourse">;

// ---------- COMPONENT ----------
const MyAssessmentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { courseId, courseTitle } = route.params;
  const [error, setError] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [detailedModalVisible, setDetailedModalVisible] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState<any>(null);
  const [submissionDetailsLoading, setSubmissionDetailsLoading] =
    useState(false);
  const [submissionDetailsError, setSubmissionDetailsError] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "needs_grading" | "graded"
  >("all");

  // Chapter state
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  // Secondary filters
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState<string | null>(null);
  const [categoryItems, setCategoryItems] = useState<
    { label: string; value: string }[]
  >([]);

  const [typeOpen, setTypeOpen] = useState(false);
  const [typeValue, setTypeValue] = useState<string | null>(null);
  const [typeItems, setTypeItems] = useState<
    { label: string; value: string }[]
  >([]);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusValue, setStatusValue] = useState<string | null>(null);
  const statusItems = [
    { label: "All Status", value: "all" },
    { label: "Submitted", value: "submitted" },
    { label: "Pending", value: "pending" },
  ];

  const insets = useSafeAreaInsets();

  // ----------- FETCHING -----------
  const normalizeArray = (res: any): AssessmentItem[] => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.assessments)) return res.assessments;
    if (Array.isArray(res?.items)) return res.items;
    return [];
  };

  const extractChapters = (assessmentList: AssessmentItem[]) => {
    const uniqueChapters = assessmentList.reduce((acc: any[], assessment) => {
      if (assessment.chapter && assessment.chapter._id) {
        const exists = acc.find(c => c._id === assessment.chapter._id);
        if (!exists) {
          acc.push({
            _id: assessment.chapter._id,
            title: assessment.chapter.title,
          });
        }
      }
      return acc;
    }, []);
    setChapters(uniqueChapters);
  };

  const handleChapterChange = async (chapterId: string | null) => {
    setSelectedChapter(chapterId);
  };

  const formatDateTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllAssessmentForStudent();
      const list = normalizeArray(res);
      setAssessments(list);

      // Scope category/type/chapter filter options to just this course's
      // assessments (matches web's Assignment.jsx, which derives its filter
      // options from the already course-filtered set, not the full list).
      const courseList = list.filter((a) => a.course?._id === courseId);

      const uniqueCategories = Array.from(
        new Map(
          courseList
            .filter((a) => a.category?._id)
            .map((a) => [a.category._id, a.category])
        ).values()
      );
      setCategoryItems([
        { label: "All Categories", value: "all" },
        ...uniqueCategories.map((cat) => ({
          label: cat.name,
          value: cat._id,
        })),
      ]);

      // Extract unique types
      const uniqueTypes = [...new Set(courseList.map((a) => a.type))];
      setTypeItems([
        { label: "All Types", value: "all" },
        { label: "Semester Based", value: "semester-assessment" },
        { label: "Chapter Based", value: "chapter-assessment" },
        ...uniqueTypes
          .filter(type => type !== "semester-assessment" && type !== "chapter-assessment")
          .map((type) => ({
            label: type.replace(/-/g, " "),
            value: type,
          })),
      ]);

      // Extract chapters from loaded assessments (scoped to this course)
      extractChapters(courseList);
    } catch (err: any) {
      console.log("[getAllAssessmentForStudent] error:", err);
      setError(err?.message || "Failed to load assessments");
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchAssessments();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAssessments();

      return () => {
        console.log("Screen unfocused");
      };
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAssessments();
    setRefreshing(false);
  }, []);

  // ----------- HELPERS -----------
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "—";
    const date = new Date(`1970-01-01T${timeStr}Z`);
    return isNaN(date.getTime())
      ? "—"
      : date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
  };

  const getFilteredQuestions = () => {
    if (!submissionDetails?.answers) return [];

    switch (activeTab) {
      case "needs_grading":
        return submissionDetails.answers.filter(
          (answer: any) => answer.requiresManualCheck
        );
      case "graded":
        return submissionDetails.answers.filter(
          (answer: any) => !answer.requiresManualCheck
        );
      default:
        return submissionDetails.answers;
    }
  };

  const getTitle = (item: AssessmentItem) => item.title || "Untitled";
  const getCourse = (item: AssessmentItem) => item?.course?.courseTitle || "—";
  const getChapter = (item: AssessmentItem) => item?.chapter?.title || "—";
  const getDueDate = (item: AssessmentItem) =>
    item?.dueDate || { date: "", time: "" };
  const getDescription = (item: AssessmentItem) =>
    item.description || "No description provided.";
  const getType = (item: AssessmentItem) => {
    const type = item.type?.toLowerCase() ?? "";
    if (type.includes("chapter")) return "Chapter Assessment";
    if (type.includes("lesson")) return "Lesson Assessment";
    return "Assessment";
  };
  const getStatus = (item: AssessmentItem) =>
    item.isSubmitted ? "Submitted" : "Pending";

  // Apply ALL filters, always scoped to the course passed in via route params
  const filtered = useMemo(() => {
    // Step 1: Filter by course (fixed for this screen instance)
    let result = assessments.filter((a) => a.course?._id === courseId);

    // Step 2: Filter by chapter
    if (selectedChapter && selectedChapter !== "all") {
      result = result.filter((a) => a.chapter?._id === selectedChapter);
    }

    // Step 3: Apply remaining secondary filters
    return result.filter((a) => {
      // Search filter
      const matchesSearch =
        searchQuery.trim() === "" ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType =
        !typeValue || typeValue === "all" || a.type === typeValue;

      // Category filter
      const matchesCategory =
        !categoryValue ||
        categoryValue === "all" ||
        a.category?._id === categoryValue;

      // Status filter
      const matchesStatus =
        !statusValue ||
        statusValue === "all" ||
        (statusValue === "submitted" && a.isSubmitted) ||
        (statusValue === "pending" && !a.isSubmitted);

      return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });
  }, [
    assessments,
    courseId,
    selectedChapter,
    searchQuery,
    typeValue,
    categoryValue,
    statusValue,
  ]);

  // Dropdown interlock - close others when one opens
  useEffect(() => {
    if (typeOpen) {
      setCategoryOpen(false);
      setStatusOpen(false);
    }
  }, [typeOpen]);

  useEffect(() => {
    if (categoryOpen) {
      setTypeOpen(false);
      setStatusOpen(false);
    }
  }, [categoryOpen]);

  useEffect(() => {
    if (statusOpen) {
      setTypeOpen(false);
      setCategoryOpen(false);
    }
  }, [statusOpen]);

  // ---------- COMPONENTS ----------
  const StatusBadge = ({ status }: { status: string }) => {
    const isSubmitted = status.toLowerCase() === "submitted";
    return (
      <View
        style={[
          styles.badge,
          isSubmitted ? styles.badgeSuccess : styles.badgePending,
        ]}
      >
        <Text style={styles.badgeText} numberOfLines={1}>
          {isSubmitted ? "Submitted" : "Pending"}
        </Text>
      </View>
    );
  };

  const ExpandedDetails = ({ item }: { item: AssessmentItem }) => {
    const due = getDueDate(item);

    return (
      <View style={styles.expandedCard}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.sectionBody}>{getDescription(item)}</Text>

        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Course</Text>
        <Text style={styles.sectionBody}>{getCourse(item)}</Text>

        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Chapter</Text>
        <Text style={styles.sectionBody}>{getChapter(item)}</Text>

        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Category</Text>
        <Text style={styles.sectionBody}>
          {item.category.name} — {item.category.weight}%
        </Text>

        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Due Date</Text>
        <Text style={styles.sectionBody}>
          {formatDate(due.date)} at {formatTime(due.time)}
        </Text>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={async () => {
            console.log(item.source);
            if (item.source === "discussion") {
              navigation.navigate("DiscussionStudent", {
                discussionId: item._id,
              });
            } else {
              if (item?.isSubmitted) {
                setDetailedModalVisible(true);
                setSubmissionDetails(null);
                setSubmissionDetailsLoading(true);
                setSubmissionDetailsError(null);

                try {
                  const details = await getStudentAssessmentDetails(item._id);
                  setSubmissionDetails(details.submissions?.[0] || null);
                } catch (err: any) {
                  setSubmissionDetailsError(
                    "Failed to load submission details"
                  );
                  console.error("Error fetching submission details:", err);
                } finally {
                  setSubmissionDetailsLoading(false);
                }
              } else {
                navigation.navigate("AssessmentScreenStudent", {
                  assessmentId: item._id,
                });
              }
            }
          }}
        >
          <Text style={styles.submitBtnText}>
            {item?.isSubmitted ? "See Result" : "Submit Assessment"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ---------- UI ----------
  return (
    <View style={styles.screen}>
      <View style={styles.banner}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <SimpleIcon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.bannerText} numberOfLines={1}>
          {courseTitle || "Course Assessment Details"}
        </Text>
        <View style={{ width: 40 }} />
      </View>
    <FlatList
      style={styles.container}
      data={loading || error ? [] : filtered}
      keyExtractor={(item, index) => item._id || `${index}`}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: 60 }}
      ListHeaderComponent={
        // Secondary Filters — course itself is fixed via route params
        <View style={{ overflow: "visible", zIndex: 9999, elevation: 9999 }}>
          <FilterBar resultsCount={filtered.length} resultsLabel="assessments">
            <SearchFilterView
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title"
              style={{ flex: 1 }}
            />
          </FilterBar>

          <FilterBar>
            <DropdownFilter
              open={typeOpen}
              value={typeValue}
              items={typeItems}
              setOpen={setTypeOpen}
              setValue={setTypeValue}
              placeholder="All Types"
              zIndex={3000}
              dropDownContainerStyle={styles.dropdownContainer}
              style={{ flex: 1 }}
            />
            <DropdownFilter
              open={categoryOpen}
              value={categoryValue}
              items={categoryItems}
              setOpen={setCategoryOpen}
              setValue={setCategoryValue}
              placeholder="All Categories"
              zIndex={2000}
              dropDownContainerStyle={styles.dropdownContainer}
              style={{ flex: 1 }}
            />
            <DropdownFilter
              open={statusOpen}
              value={statusValue}
              items={statusItems}
              setOpen={setStatusOpen}
              setValue={setStatusValue}
              placeholder="All Status"
              zIndex={1000}
              dropDownContainerStyle={styles.dropdownContainer}
              style={{ flex: 1 }}
            />
          </FilterBar>
        </View>
      }
      ListEmptyComponent={
        loading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator size="small" color="#16A34A" />
            <Text style={styles.stateText}>Loading assessments...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateWrap}>
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.stateWrap}>
            <Text style={styles.stateText}>No assessments available.</Text>
          </View>
        )
      }
      renderItem={({ item, index }) => (
        <View style={{ paddingHorizontal: 16 }}>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              setExpanded((prev) => ({
                ...prev,
                [item._id]: !prev[item._id],
              }))
            }
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle}>{getTitle(item)}</Text>
                <Text style={styles.cardCourse}>{getCourse(item)}</Text>
              </View>
              <View style={styles.cardRight}>
                <StatusBadge status={getStatus(item)} />
                <Text style={styles.cardArrow}>
                  {expanded[item._id] ? "▲" : "▼"}
                </Text>
              </View>
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.cardMetaText}>Due: {formatDate(getDueDate(item).date)}</Text>
              <Text style={styles.cardMetaText}>Type: {getType(item)}</Text>
            </View>
          </TouchableOpacity>
          {expanded[item._id] && <ExpandedDetails item={item} />}
        </View>
      )}
    />
      <Modal
        visible={detailedModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setDetailedModalVisible(false);
        }}
      >
        <View
          style={[
            styles.detailedModalContainer,
            { paddingTop: insets.top || 20 },
          ]}
        >
          {/* Header */}
          <View style={[styles.detailedModalHeader]}>
            <Text style={styles.detailedModalTitle}>
              Submission Details
            </Text>
            <TouchableOpacity
              style={styles.detailedModalCloseButton}
              onPress={() => {
                setDetailedModalVisible(false);
              }}
            >
              <SimpleIcon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {submissionDetailsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
            </View>
          ) : submissionDetailsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{submissionDetailsError}</Text>
            </View>
          ) : submissionDetails ? (
            <ScrollView style={styles.detailedModalContent}>
              {submissionDetails && console.log(submissionDetails)}

              {/* Student and Submission Overview */}
              <View style={styles.submissionOverview}>
                <View style={styles.studentOverviewDetails}>
                  <View style={styles.statusTags}>
                    <View
                      style={[
                        styles.statusTag,
                        { backgroundColor: "#E5E7EB" },
                      ]}
                    >
                      <Text style={styles.statusTagText}>
                        {submissionDetails.status}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusTag,
                        { backgroundColor: "#E5E7EB" },
                      ]}
                    >
                      <Text style={styles.statusTagText}>
                        {submissionDetails.graded ? "Graded" : "Not Graded"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.submissionTime}>
                    Submitted on:{" "}
                    {formatDateTime(
                      submissionDetails.submittedAt ||
                      submissionDetails.createdAt
                    )}
                  </Text>
                </View>
              </View>

              {/* Assessment Summary */}
              <View style={styles.assessmentSummary}>
                <Text style={styles.assessmentSummaryTitle}>
                  Assessment Summary
                </Text>
                <View style={styles.assessmentSummaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Assessment ID</Text>
                    <Text style={styles.summaryValue}>
                      {submissionDetails.assessment}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Points</Text>
                    <Text style={styles.summaryValue}>
                      {submissionDetails.totalScore} points
                    </Text>
                  </View>
                </View>
              </View>

              {/* Question Tabs */}
              <View style={styles.questionTabs}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "all" && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab("all")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "all" && styles.activeTabText,
                    ]}
                  >
                    All Questions ({submissionDetails.answers?.length || 0})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "needs_grading" && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab("needs_grading")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "needs_grading" && styles.activeTabText,
                    ]}
                  >
                    Needs Grading (
                    {submissionDetails.answers?.filter(
                      (a: any) => a.requiresManualCheck
                    ).length || 0}
                    )
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "graded" && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab("graded")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "graded" && styles.activeTabText,
                    ]}
                  >
                    Graded (
                    {submissionDetails.answers?.filter(
                      (a: any) => !a.requiresManualCheck
                    ).length || 0}
                    )
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Questions List */}
              <View style={styles.questionsContainer}>
                {getFilteredQuestions().map(
                  (answer: any, index: number) => (
                    <View key={answer._id} style={styles.questionCard}>
                      <View style={styles.questionHeader}>
                        <View style={styles.questionHeaderLeft}>
                          <Text style={styles.questionNumber}>
                            Question {index + 1}
                          </Text>
                        </View>
                        <View style={styles.questionTags}>
                          {answer.requiresManualCheck ? (
                            <View
                              style={[
                                styles.questionTag,
                                {
                                  backgroundColor: "#FEF3C7",
                                  borderColor: "#F59E0B",
                                  borderWidth: 1,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.questionTagText,
                                  { color: "#92400E" },
                                ]}
                              >
                                Needs Manual Grading
                              </Text>
                            </View>
                          ) : (
                            <View
                              style={[
                                styles.questionTag,
                                {
                                  backgroundColor: answer.isCorrect
                                    ? "#D1FAE5"
                                    : "#FEE2E2",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.questionTagText,
                                  {
                                    color: answer.isCorrect
                                      ? "#065F46"
                                      : "#991B1B",
                                  },
                                ]}
                              >
                                {answer.isCorrect
                                  ? "✓ Correct"
                                  : "✗ Incorrect"}
                              </Text>
                            </View>
                          )}
                          <View
                            style={[
                              styles.questionTag,
                              { backgroundColor: "#F3F4F6" },
                            ]}
                          >
                            <Text
                              style={[
                                styles.questionTagText,
                                { color: "#374151" },
                              ]}
                            >
                              {answer.pointsAwarded}/
                              {answer.questionDetails?.points} pts
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.questionContent}>
                        <Text style={styles.questionLabel}>Question:</Text>
                        <View style={styles.questionTextContainer}>
                          <Text style={styles.questionText}>
                            {answer.question?.question?.replace(
                              /<[^>]*>/g,
                              ""
                            ) || "No question text"}
                          </Text>
                        </View>

                        {/* Teacher uploaded files */}
                        {answer.questionDetails?.file &&
                          answer.questionDetails.file.length > 0 && (
                            <View style={styles.teacherFilesContainer}>
                              <Text style={styles.filesLabel}>
                                Teacher Files:
                              </Text>
                              {answer.questionDetails.file.map(
                                (file: any, fileIndex: number) => (
                                  <TouchableOpacity
                                    key={fileIndex}
                                    style={styles.fileCard}
                                    onPress={() =>
                                      Linking.openURL(file.url)
                                    }
                                  >
                                    <SimpleIcon
                                      name="description"
                                      size={20}
                                      color="#4285F4"
                                    />
                                    <Text style={styles.fileName}>
                                      {file.filename}
                                    </Text>
                                  </TouchableOpacity>
                                )
                              )}
                            </View>
                          )}
                      </View>

                      <View style={styles.answerContent}>
                        <Text style={styles.answerLabel}>
                          Student's Answer:
                        </Text>
                        <View style={styles.answerTextContainer}>
                          <Text style={styles.answerText}>
                            {answer.questionDetails?.type === "file"
                              ? answer.file && answer.file.length > 0
                                ? `${answer.file.length} file(s) uploaded`
                                : "No file uploaded"
                              : answer.selectedAnswer ||
                              "No answer provided"}
                          </Text>
                        </View>

                        {/* Student uploaded files */}
                        {answer.file && answer.file.length > 0 && (
                          <View style={styles.studentFilesContainer}>
                            <Text style={styles.filesLabel}>
                              Student Files:
                            </Text>
                            {answer.file.map(
                              (file: any, fileIndex: number) => (
                                <TouchableOpacity
                                  key={fileIndex}
                                  style={styles.fileCard}
                                  onPress={() => Linking.openURL(file.url)}
                                >
                                  <SimpleIcon
                                    name="description"
                                    size={20}
                                    color="#10B144"
                                  />
                                  <Text style={styles.fileName}>
                                    {file.filename}
                                  </Text>
                                </TouchableOpacity>
                              )
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  )
                )}
              </View>
            </ScrollView>
          ) : null}
        </View>
      </Modal>
    </View>
  );
};

// ---------- STYLES ----------
const COLORS = {
  green: "#16A34A",
  gray100: "#F3F4F6",
  gray600: "#4B5563",
  gray700: "#374151",
  white: "#FFFFFF",
  pendingBg: "#FEF3C7",
  successBg: "#DCFCE7",
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 12,
  },
  banner: {
    minHeight: 56,
    backgroundColor: "#10B144",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
  },
  bannerText: { color: COLORS.white, fontSize: 18, fontWeight: "bold", flex: 1 },
  backButton: { padding: 4, marginRight: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    minWidth: 800,
  },
  td: {
    color: COLORS.gray700,
    fontSize: 14,
  },
  colName: { width: 200 },
  colCourse: { width: 150 },
  colDue: { width: 180 },
  colStatus: { width: 120 },
  colType: { width: 150 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgePending: { backgroundColor: COLORS.pendingBg },
  badgeSuccess: { backgroundColor: COLORS.successBg },
  badgeText: { color: COLORS.gray700, fontSize: 12, fontWeight: "700" },
  stateWrap: { alignItems: "center", padding: 20 },
  stateText: { color: COLORS.gray600 },
  expandedCard: {
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    marginTop: 0,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  cardCourse: {
    fontSize: 14,
    color: "#6B7280",
  },
  cardMeta: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  cardMetaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  cardArrow: {
    fontSize: 16,
    color: "#6B7280",
  },
  sectionTitle: { fontWeight: "700", color: COLORS.gray700 },
  sectionBody: { color: COLORS.gray700, marginTop: 2 },
  submitBtn: {
    marginTop: 10,
    backgroundColor: COLORS.green,
    borderRadius: 8,
    padding: 10,
  },
  submitBtnText: { color: COLORS.white, fontWeight: "700" },
  centered: { alignItems: "flex-start", justifyContent: "flex-start" },
  detailedModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  detailedModalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    position: "relative",
  },
  detailedModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  detailedModalCloseButton: {
    position: "absolute",
    right: 20,
    top: 16,
    bottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  detailedModalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  // Submission Overview Styles
  submissionOverview: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  studentOverviewDetails: {
    flex: 1,
    gap: 10,
  },
  studentNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  studentOverviewName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  studentOverviewEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  statusTags: {
    flexDirection: "row",
    gap: 8,
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  submissionTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  // Assessment Summary Styles
  assessmentSummary: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  assessmentSummaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  assessmentSummaryCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  // Question Tabs Styles
  questionTabs: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#111827",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  // Questions Container Styles
  questionsContainer: {
    marginBottom: 20,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  questionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginRight: 12,
  },
  questionType: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 12,
  },
  questionTags: {
    flexDirection: "row",
    marginLeft: "auto",
  },
  questionTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  questionTagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  questionContent: {
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  questionTextContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  questionText: {
    fontSize: 14,
    color: "#111827",
  },
  answerContent: {
    marginBottom: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  answerTextContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  answerText: {
    fontSize: 14,
    color: "#111827",
  },
  // File Display Styles
  teacherFilesContainer: {
    marginTop: 12,
  },
  studentFilesContainer: {
    marginTop: 12,
  },
  filesLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  fileName: {
    fontSize: 14,
    color: "#111827",
    marginLeft: 8,
    flex: 1,
  },
  // Grading Input Styles
  gradingInputContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  manualGradingLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  gradingInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  gradingInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
    minWidth: 80,
    textAlign: "center",
  },
  gradingPointsText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
  },
  // Submit Button Styles
  submitGradesButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  submitGradesButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitGradesButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6B7280",
  },
  dropdownContainer: {
    zIndex: 9999,
    elevation: 9999,
  },
});

export default MyAssessmentsPage;