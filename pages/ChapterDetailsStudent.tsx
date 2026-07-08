import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator,
  Linking,
  Modal,
} from "react-native";
import {
  useRoute,
  useNavigation,
  type RouteProp,
} from "@react-navigation/native";
import SimpleIcon from "../components/SimpleIcon";
import {
  getChapterDetailsForStudent,
  getChapterDiscussionsForStudent,
  getChapterPagesForStudent,
  getLessonDiscussionsForStudent,
  getLessonPagesForStudent,
  getStudentAssessmentDetails,
} from "../services/course";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import YoutubePlayer from "react-native-youtube-iframe";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useSafeAreaInsets } from "react-native-safe-area-context";
interface ChapterDetailParams {
  chapterId: string;
  navigateBack: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface ChapterDetails {
  _id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  chapterAssessments: ChapterAssessment[];
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  pdfFiles: PdfFile[];
  youtubeLinks: string;
  otherLink: string;
  chapter: string;
  createdby: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  lessonAssessments: LessonAssessment[];
}

export interface PdfFile {
  url: string;
  public_id: string;
  filename: string;
  _id: string;
  uploadedAt: string;
}

export interface LessonAssessment {
  _id: string;
  title: string;
  description: string;
}

export interface ChapterAssessment {
  _id: string;
  title: string;
  description: string;
}

export interface Discussion {
  _id: string;
  dueDate: {
    date: string;
    time: string;
  };
  course: {
    _id: string;
    courseTitle: string;
    thumbnail: Thumbnail;
  };
  totalMarks: number;
  topic: string;
  description: string;
  files: DiscussionFile[];
  category: string;
  semester: string;
  quarter: string;
  chapter: string;
  type: string;
  createdby: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface DiscussionFile {
  _id: string;
  url: string;
  type: string;
  filename: string;
  publicId: string;
}

export interface Thumbnail {
  url: string;
  publicId: string;
  filename: string;
}
export interface Page {
  _id: string;
  title: string;
  description: string;
  course: string;
  chapter: string;
  type: string;
  image: PageImage;
  files: any[]; // or a specific type if you have one
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PageImage {
  url: string;
  filename: string;
  publicId: string;
}

type TabType =
  | "description"
  | "files"
  | "assessments"
  | "discussions"
  | "pages";
const extractVideoId = (url: string): string | null => {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
const ChapterDetailsStudent = () => {
  const route =
    useRoute<RouteProp<Record<string, ChapterDetailParams>, string>>();
  const navigation = useNavigation<NavigationProp>();
  const { chapterId, navigateBack } = route.params;
  const [chapter, setChapter] = useState<null | ChapterDetails>(null);
  const [chapterDetailsLoading, setChapterDetailsLoading] = useState(false);
  const [discussions, setDiscussions] = useState<null | Discussion[]>(null);
  const [pages, setPages] = useState<null | Page[]>(null);
  const [expanded, setExpanded] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonDiscussions, setLessonDiscussions] = useState<Discussion[]>([]);
  const [lessonPages, setLessonPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const insets = useSafeAreaInsets();

  const [detailedModalVisible, setDetailedModalVisible] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState<any>(null);
  const [submissionDetailsLoading, setSubmissionDetailsLoading] =
    useState(false);
  const [submissionDetailsError, setSubmissionDetailsError] = useState<
    string | null
  >(null);
  const [modalActiveTab, setModalActiveTab] = useState<
    "all" | "needs_grading" | "graded"
  >("all");

  useEffect(() => {
    const fetchChapterData = async () => {
      setChapterDetailsLoading(true);
      try {
        const results = await Promise.allSettled([
          getChapterDetailsForStudent(chapterId),
          getChapterDiscussionsForStudent(chapterId),
          getChapterPagesForStudent(chapterId),
        ]);

        const [details, discussions, pages] = results.map((r) =>
          r.status === "fulfilled" ? r.value : null
        );
        console.log(details, discussions, pages);
        if (details) setChapter(details.chapterDetails);
        if (discussions) setDiscussions(discussions.discussion);
        if (pages) setPages(pages.pages);
      } catch (err) {
        console.log("error", err);
      } finally {
        setChapterDetailsLoading(false);
      }
    };

    fetchChapterData();
  }, [chapterId]);

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

  const getFilteredQuestions = () => {
    if (!submissionDetails?.answers) return [];

    switch (modalActiveTab) {
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

  const handleAssessmentPress = async (assessmentId: string) => {
    // setDetailedModalVisible(true);
    setSubmissionDetails(null);
    setSubmissionDetailsLoading(true);
    setSubmissionDetailsError(null);

    try {
      const details = await getStudentAssessmentDetails(assessmentId);
      if (details.message === "Submission found") {
        setDetailedModalVisible(true);
        setSubmissionDetails(details.submission);
      } else {
        navigation.navigate("AssessmentScreenStudent", { assessmentId });
      }
    } catch (err: any) {
      setSubmissionDetailsError("Failed to load assessment details");
      console.error("Error fetching assessment details:", err);
      // If there's an error, we might still want to try navigating to the assessment screen
      // but only if the error specifically means "no submission found" or similar.
      // Based on the prompt, we should navigate if message is NOT "Submission found".
      setDetailedModalVisible(false);
      navigation.navigate("AssessmentScreenStudent", { assessmentId });
    } finally {
      setSubmissionDetailsLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState<TabType>("description");
  const handleLessonSelect = async (lesson: Lesson) => {
    setSelectedLesson(lesson);
    try {
      const [lessonDiscussionsRes, lessonPagesRes] = await Promise.allSettled([
        getLessonDiscussionsForStudent(lesson._id),
        getLessonPagesForStudent(lesson._id),
      ]);
      if (lessonDiscussionsRes.status === "fulfilled")
        setLessonDiscussions(lessonDiscussionsRes.value.discussion || []);
      else setLessonDiscussions([]);

      if (lessonPagesRes.status === "fulfilled")
        setLessonPages(lessonPagesRes.value.pages || []);
      else setLessonPages([]);
    } catch (err) {
      console.log("Error fetching lesson data:", err);
    }
  };
  const renderTabButton = (tab: TabType, label: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        style={[
          styles.tabButtonText,
          activeTab === tab && styles.tabButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderDescription = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>{chapter?.title}</Text>
      <Text style={styles.descriptionText}>
        {chapter?.description || "This is the chapter description"}
      </Text>
      {selectedLesson && (
        <View
          style={{
            borderTopWidth: 1,
            marginTop: 20,
            borderTopColor: "#e0e0e0",
          }}
        >
          <Text style={styles.sectionTitle}>
            Current Lesson: {selectedLesson?.title}
          </Text>
          <Text style={styles.descriptionText}>
            {selectedLesson?.description}
          </Text>
        </View>
      )}
    </View>
  );

  const renderFiles = () => (
    <View style={styles.tabContent}>
      {selectedLesson && selectedLesson?.pdfFiles.length > 0 ? (
        selectedLesson?.pdfFiles.map((file: PdfFile, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.fileCard}
            onPress={() => Linking.openURL(file.url)}
          >
            <SimpleIcon name="description" size={24} color="#10B144" />
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>
                {file.filename || `File ${index + 1}`}
              </Text>
              <Text style={styles.fileSize}>
                Uploaded:{" "}
                {file.uploadedAt && new Date(file.uploadedAt).toDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <SimpleIcon name="file" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>
            No PDF files available for this lesson
          </Text>
        </View>
      )}
    </View>
  );

  const renderAssessments = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Lesson Assessments</Text>

      {selectedLesson && selectedLesson?.lessonAssessments.length > 0 ? (
        selectedLesson?.lessonAssessments.map(
          (assessment: any, index: number) => (
            <TouchableOpacity
              key={index}
              style={styles.assessmentCard}
              onPress={() => handleAssessmentPress(assessment._id)}
            >
              <View style={styles.assessmentHeader}>
                <SimpleIcon name="menu-book" size={24} color="#10B144" />
                <Text style={styles.assessmentTitle}>{assessment.title}</Text>
              </View>
              <Text style={styles.assessmentDescription}>
                {assessment.description}
              </Text>
            </TouchableOpacity>
          )
        )
      ) : (
        <Text style={styles.emptyMessage}>No lesson assessments available</Text>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
        Chapter Assessment
      </Text>
      {chapter?.chapterAssessments && chapter?.chapterAssessments.length > 0 ? (
        chapter?.chapterAssessments.map((assessment: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.assessmentCard}
            onPress={() => handleAssessmentPress(assessment._id)}
          >
            <View style={styles.assessmentHeader}>
              <SimpleIcon name="menu-book" size={24} color="#10B144" />
              <Text style={styles.assessmentTitle}>{assessment.title}</Text>
            </View>
            <Text style={styles.assessmentDescription}>
              {assessment.description}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <SimpleIcon name="clipboard" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No assessments available</Text>
        </View>
      )}
    </View>
  );

  const renderDiscussions = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Chapter Discussion</Text>
      {discussions && discussions.length > 0 ? (
        <View style={styles.discussionsGrid}>
          {discussions.map((discussion: Discussion, index: number) => (
            <TouchableOpacity
              key={index}
              style={styles.discussionCard}
              onPress={() =>
                navigation.navigate("DiscussionStudent", {
                  discussionId: discussion?._id,
                })
              }
            >
              <Image
                source={{ uri: discussion.course.thumbnail.url }}
                style={{ width: "100%", height: 150 }}
              />

              <Text style={styles.dueDate}>
                Due Date: {new Date(discussion.dueDate.date).toDateString()}
              </Text>

              <View style={styles.chapterBadge}>
                <Text style={styles.chapterBadgeText}>{discussion.type}</Text>
              </View>

              <Text style={styles.discussionTitle}>{discussion.topic}</Text>
              <Text style={styles.discussionSubtitle}>
                {discussion.course.courseTitle || "test"}
              </Text>
              <Text style={styles.discussionDescription}>
                {discussion.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <SimpleIcon name="chat-bubble-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No discussions available</Text>
        </View>
      )}

      {selectedLesson && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Lesson Discussion
          </Text>
          {lessonDiscussions && lessonDiscussions.length > 0 ? (
            lessonDiscussions.map((discussion, index) => (
              <TouchableOpacity
                key={`lesson-discussion-${index}`}
                style={styles.discussionCard}
                onPress={() =>
                  navigation.navigate("DiscussionStudent", {
                    discussionId: discussion?._id,
                  })
                }
              >
                <Image
                  source={{ uri: discussion.course.thumbnail.url }}
                  style={{ width: "100%", height: 150 }}
                />
                <Text style={styles.dueDate}>
                  Due Date: {new Date(discussion.dueDate.date).toDateString()}
                </Text>
                <View style={styles.chapterBadge}>
                  <Text style={styles.chapterBadgeText}>{discussion.type}</Text>
                </View>
                <Text style={styles.discussionTitle}>{discussion.topic}</Text>
                <Text style={styles.discussionSubtitle}>
                  {discussion.course.courseTitle || "test"}
                </Text>
                <Text style={styles.discussionDescription}>
                  {discussion.description}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyMessage}>
              No discussions found for this lesson
            </Text>
          )}
        </>
      )}
    </View>
  );

  const renderPages = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Chapter Pages</Text>
      {pages && pages.length > 0 ? (
        pages.map((page: Page, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.pageCard}
            onPress={() => setSelectedPage(page)}
          >
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>{page.title}</Text>
            </View>
            <Text style={styles.pageDescription}>{page.description}</Text>
            {page.image && (
              <Image
                source={{ uri: page.image.url }}
                style={styles.pageImage}
              />
            )}
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <SimpleIcon name="description" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No pages available</Text>
        </View>
      )}
      {selectedLesson && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Lesson Pages
          </Text>
          {lessonPages && lessonPages.length > 0 ? (
            lessonPages.map((page, index) => (
              <TouchableOpacity
                key={`lesson-page-${index}`}
                style={styles.pageCard}
                onPress={() => setSelectedPage(page)}
              >
                <View style={styles.pageHeader}>
                  <Text style={styles.pageTitle}>{page.title}</Text>
                </View>
                <Text style={styles.pageDescription}>{page.description}</Text>
                {page.image && (
                  <Image
                    source={{ uri: page.image.url }}
                    style={styles.pageImage}
                  />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyMessage}>
              No pages found for this lesson
            </Text>
          )}
        </>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return renderDescription();
      case "files":
        return renderFiles();
      case "assessments":
        return renderAssessments();
      case "discussions":
        return renderDiscussions();
      case "pages":
        return renderPages();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigateBack ? navigateBack() : navigation.goBack())}
          style={styles.backButton}
        >
          <SimpleIcon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Chapter: {chapter?.title}
        </Text>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Left Content */}
        <View style={styles.leftContent}>
          {/* Tabs */}
          {selectedLesson?.youtubeLinks && (
            <View style={{ margin: 16, borderRadius: 8, overflow: "hidden" }}>
              <YoutubePlayer
                height={220}
                play={false}
                videoId={extractVideoId(selectedLesson.youtubeLinks)}
              />
            </View>
          )}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {renderTabButton("description", "Description")}
              {renderTabButton("files", "Files")}
              {renderTabButton("assessments", "Assessments")}
              {renderTabButton("discussions", "Discussions")}
              {renderTabButton("pages", "Pages")}
            </ScrollView>
          </View>

          {/* Tab Content */}
          {chapterDetailsLoading ? (
            <ActivityIndicator
              size={"large"}
              color={"#10B144"}
              style={{ alignSelf: "center", height: "30%" }}
            />
          ) : (
            <ScrollView style={styles.contentScrollView}>
              {renderTabContent()}
            </ScrollView>
          )}
        </View>

        {/* Right Sidebar - Chapter Content */}
        {!chapterDetailsLoading && (
          <View style={styles.bottomBar}>
            <Text style={styles.sidebarTitle}>Chapter Content</Text>

            <View style={styles.chapterContentCard}>
              <TouchableOpacity
                style={styles.chapterContentHeader}
                onPress={() => setExpanded((prev) => !prev)}
                activeOpacity={0.8}
              >
                <SimpleIcon
                  name={expanded ? "chevron-down" : "chevron-right"}
                  size={20}
                  color="#333"
                />
                <Text style={styles.chapterContentTitle}>{chapter?.title}</Text>
                <Text style={styles.lessonsCount}>
                  {chapter?.lessons?.length || 0} lessons
                </Text>
              </TouchableOpacity>

              {expanded && chapter?.lessons && chapter?.lessons.length > 0 && (
                <ScrollView
                  style={styles.lessonsList}
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  {chapter.lessons.map((lesson: Lesson, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.lessonItem,
                        {
                          backgroundColor:
                            selectedLesson?._id === lesson._id
                              ? "#C7F3DD"
                              : "#fff",
                        },
                      ]}
                      onPress={() => handleLessonSelect(lesson)}
                    >
                      <SimpleIcon
                        name="play-circle-outline"
                        size={20}
                        color="#666"
                      />
                      <Text style={styles.lessonItemText}>
                        Lesson {index + 1}:{" "}
                        {lesson.title || `Lesson ${index + 1}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        )}
      </View>
      {selectedPage && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{selectedPage.title}</Text>

            {selectedPage.image?.url && (
              <Image
                source={{ uri: selectedPage.image.url }}
                style={styles.modalImage}
              />
            )}

            <Text style={styles.modalDescription}>
              {selectedPage.description}
            </Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPage(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Detailed Submission Modal */}
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
          <View style={styles.detailedModalHeader}>
            <Text style={styles.detailedModalTitle}>Submission Details</Text>
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
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailedModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : submissionDetails ? (
            <ScrollView style={styles.detailedModalContent}>
              {/* Student and Submission Overview */}
              <View style={styles.submissionOverview}>
                <View style={styles.studentOverviewDetails}>
                  <View style={styles.statusTags}>
                    <View
                      style={[styles.statusTag, { backgroundColor: "#E5E7EB" }]}
                    >
                      <Text style={styles.statusTagText}>
                        {submissionDetails.status}
                      </Text>
                    </View>
                    <View
                      style={[styles.statusTag, { backgroundColor: "#E5E7EB" }]}
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
                    styles.modalTab,
                    modalActiveTab === "all" && styles.modalActiveTab,
                  ]}
                  onPress={() => setModalActiveTab("all")}
                >
                  <Text
                    style={[
                      styles.modalTabText,
                      modalActiveTab === "all" && styles.modalActiveTabText,
                    ]}
                  >
                    All Questions ({submissionDetails.answers?.length || 0})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalTab,
                    modalActiveTab === "needs_grading" && styles.modalActiveTab,
                  ]}
                  onPress={() => setModalActiveTab("needs_grading")}
                >
                  <Text
                    style={[
                      styles.modalTabText,
                      modalActiveTab === "needs_grading" &&
                        styles.modalActiveTabText,
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
                    styles.modalTab,
                    modalActiveTab === "graded" && styles.modalActiveTab,
                  ]}
                  onPress={() => setModalActiveTab("graded")}
                >
                  <Text
                    style={[
                      styles.modalTabText,
                      modalActiveTab === "graded" && styles.modalActiveTabText,
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
                {getFilteredQuestions().map((answer: any, index: number) => (
                  <View key={answer._id} style={styles.questionCard}>
                    <View style={styles.questionHeader}>
                      <View style={styles.questionHeaderLeft}>
                        <Text style={styles.questionNumber}>
                          Question {index + 1}
                        </Text>
                        <Text style={styles.questionType}>
                          {answer.question?.type == "truefalse"
                            ? "True/False"
                            : answer.question?.type}
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
                              {answer.isCorrect ? "✓ Correct" : "✗ Incorrect"}
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
                            {answer.pointsAwarded}/{answer.question?.points} pts
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.questionContent}>
                      <Text style={styles.questionLabel}>Question:</Text>
                      <View style={styles.questionTextContainer}>
                        <Text style={styles.questionText}>
                          {answer.question?.question?.replace(/<[^>]*>/g, "") ||
                            "No question text"}
                        </Text>
                      </View>

                      {/* Teacher uploaded files */}
                      {answer.question?.files &&
                        answer.question.files.length > 0 && (
                          <View style={styles.teacherFilesContainer}>
                            <Text style={styles.filesLabel}>
                              Teacher Files:
                            </Text>
                            {answer.question.files.map(
                              (file: any, fileIndex: number) => (
                                <TouchableOpacity
                                  key={fileIndex}
                                  style={styles.fileCard}
                                  onPress={() => Linking.openURL(file.url)}
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
                      <Text style={styles.answerLabel}>Your Answer:</Text>
                      <View style={styles.answerTextContainer}>
                        <Text style={styles.answerText}>
                          {answer.question?.type === "file"
                            ? answer.file && answer.file.length > 0
                              ? `${answer.file.length} file(s) uploaded`
                              : "No file uploaded"
                            : answer.selectedAnswer || "No answer provided"}
                        </Text>
                      </View>

                      {/* Student uploaded files */}
                      {answer.file && answer.file.length > 0 && (
                        <View style={styles.studentFilesContainer}>
                          <Text style={styles.filesLabel}>Uploaded Files:</Text>
                          {answer.file.map((file: any, fileIndex: number) => (
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
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : null}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === "ios" ? 50 : 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  leftContent: {
    flex: 1,
  },
  bottomBar: {
    width: "100%",
    borderTopWidth: 1,
    maxHeight: "30%",
    borderTopColor: "#e0e0e0",
    padding: 16,
    marginBottom: 10,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 16,
  },
  chapterContentCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    flexShrink: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  chapterContentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  chapterContentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    flex: 1,
    marginLeft: 8,
  },
  lessonsCount: {
    fontSize: 14,
    color: "#666",
  },
  lessonsList: {
    marginTop: 8,
    maxHeight: 150,
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
    paddingVertical: 8,
    paddingLeft: 28,
  },
  lessonItemText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#10B144",
  },
  tabButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  tabButtonTextActive: {
    color: "#10B144",
    fontWeight: "600",
  },
  contentScrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",

    color: "#111",
    marginVertical: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#888",
    marginTop: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#888",
    fontStyle: "italic",
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  fileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  fileSize: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  assessmentCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  assessmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  assessmentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginLeft: 8,
  },
  assessmentDescription: {
    fontSize: 14,
    color: "#666",
  },
  discussionsGrid: {
    // flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  discussionCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  discussionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  discussionLessonsLabel: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    flex: 1,
  },
  discussionBadge: {
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  discussionBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  discussionContent: {
    borderLeftWidth: 3,
    borderLeftColor: "#10B144",
    paddingLeft: 12,
    marginBottom: 12,
  },
  lessonBadge: {
    backgroundColor: "#10B144",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  lessonBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  lessonDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  filesSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  filesSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#10B144",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  noFilesText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  dueDate: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  chapterBadge: {
    backgroundColor: "#6366f1",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  chapterBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  discussionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  discussionSubtitle: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "600",
    marginBottom: 4,
  },
  discussionDescription: {
    fontSize: 14,
    color: "#666",
  },
  pageCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    flex: 1,
  },
  pageDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  pageImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  // --- MODAL STYLES ---
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },

  modalImage: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    resizeMode: "cover",
    marginBottom: 12,
  },

  modalDescription: {
    fontSize: 16,
    color: "#555",
    marginBottom: 16,
    textAlign: "center",
  },

  closeButton: {
    backgroundColor: "#10B144",
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
  },

  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
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
  questionTabs: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 4,
  },
  modalTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  modalActiveTab: {
    backgroundColor: "#111827",
  },
  modalTabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
  modalActiveTabText: {
    color: "#FFFFFF",
  },
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
  studentFilesContainer: {
    marginTop: 12,
  },
  filesLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  teacherFilesContainer: {
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
});

export default ChapterDetailsStudent;
