
import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform, ActivityIndicator, Linking } from "react-native"
import { useRoute, useNavigation, type RouteProp } from "@react-navigation/native"
import SimpleIcon from "../components/SimpleIcon"
import { getChapterDetailsForStudent, getChapterDiscussionsForStudent, getChapterPagesForStudent, getLessonDiscussionsForStudent, getLessonPagesForStudent } from "../services/course"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import YoutubePlayer from "react-native-youtube-iframe";
import { RootStackParamList } from "../navigation/AppNavigator"
interface ChapterDetailParams {
  chapterId: string,
  navigateBack:()=>void
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

type TabType = "description" | "files" | "assessments" | "discussions" | "pages"
const extractVideoId = (url: string): string | null => {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
const ChapterDetailsStudent = () => {
  const route = useRoute<RouteProp<Record<string, ChapterDetailParams>, string>>()
  const navigation = useNavigation<NavigationProp>()
  const { chapterId,navigateBack } = route.params
  const [chapter, setChapter] = useState<null | ChapterDetails>(null)
  const [chapterDetailsLoading, setChapterDetailsLoading] = useState(false)
  const [discussions, setDiscussions] = useState<null | Discussion[]>(null)
  const [pages, setPages] = useState<null | Page[]>(null)
  const [expanded, setExpanded] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonDiscussions, setLessonDiscussions] = useState<Discussion[]>([])
  const [lessonPages, setLessonPages] = useState<Page[]>([])
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);


  useEffect(() => {
    const fetchChapterData = async () => {
      setChapterDetailsLoading(true)
      try {

        const results = await Promise.allSettled([
          getChapterDetailsForStudent(chapterId),
          getChapterDiscussionsForStudent(chapterId),
          getChapterPagesForStudent(chapterId),
        ]);

        const [details, discussions, pages] = results.map(r =>
          r.status === "fulfilled" ? r.value : null
        );
        console.log(details, discussions, pages)
        if (details) setChapter(details.chapterDetails);
        if (discussions) setDiscussions(discussions.discussion);
        if (pages) setPages(pages.pages);
      } catch (err) {
        console.log('error', err)
      } finally {
        setChapterDetailsLoading(false)
      }
    }


    fetchChapterData()
  }, [chapterId])

  const [activeTab, setActiveTab] = useState<TabType>("description")
  const handleLessonSelect = async (lesson: Lesson) => {
    setSelectedLesson(lesson)
    try {
      const [lessonDiscussionsRes, lessonPagesRes] = await Promise.allSettled([
        getLessonDiscussionsForStudent(lesson._id),
        getLessonPagesForStudent(lesson._id),
      ])
      if (lessonDiscussionsRes.status === "fulfilled")
        setLessonDiscussions(lessonDiscussionsRes.value.discussion || [])
      else setLessonDiscussions([])

      if (lessonPagesRes.status === "fulfilled")
        setLessonPages(lessonPagesRes.value.pages || [])
      else setLessonPages([])
    } catch (err) {
      console.log("Error fetching lesson data:", err)
    }
  }
  const renderTabButton = (tab: TabType, label: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  )

  const renderDescription = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>{chapter?.title}</Text>
      <Text style={styles.descriptionText}>{chapter?.description || "This is the chapter description"}</Text>
      {
        selectedLesson &&
        <View style={{
          borderTopWidth: 1,
          marginTop: 20,
          borderTopColor: "#e0e0e0",
        }}>
          <Text style={styles.sectionTitle}>Current Lesson: {selectedLesson?.title}</Text>
          <Text style={styles.descriptionText}>{selectedLesson?.description}</Text>

        </View>
      }

    </View>
  )

  const renderFiles = () => (
    <View style={styles.tabContent}>
      {selectedLesson && selectedLesson?.pdfFiles.length > 0 ? (
        selectedLesson?.pdfFiles.map((file: PdfFile, index: number) => (
          <TouchableOpacity key={index} style={styles.fileCard} onPress={() => Linking.openURL(file.url)}>
            <SimpleIcon name="description" size={24} color="#10B144" />
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{file.filename || `File ${index + 1}`}</Text>
              <Text style={styles.fileSize}>Uploaded: {file.uploadedAt && new Date(file.uploadedAt).toDateString()}</Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <SimpleIcon name="file" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No PDF files available for this lesson</Text>
        </View>
      )}
    </View>
  )

  const renderAssessments = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Lesson Assessments</Text>

      {
        selectedLesson &&
          selectedLesson?.lessonAssessments.length > 0 ?
          selectedLesson?.lessonAssessments.map((assessment: any, index: number) => (
            <TouchableOpacity key={index} style={styles.assessmentCard} onPress={() => navigation.navigate("AssessmentScreenStudent", { assessmentId: assessment._id })}>
              <View style={styles.assessmentHeader}>
                <SimpleIcon name="menu-book" size={24} color="#10B144" />
                <Text style={styles.assessmentTitle}>{assessment.title}</Text>
              </View>
              <Text style={styles.assessmentDescription}>{assessment.description}</Text>
            </TouchableOpacity>
          ))
          :
          <Text style={styles.emptyMessage}>No lesson assessments available</Text>

      }


      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Chapter Assessment</Text>
      {chapter?.chapterAssessments && chapter?.chapterAssessments.length > 0 ? (
        chapter?.chapterAssessments.map((assessment: any, index: number) => (
          <TouchableOpacity key={index} style={styles.assessmentCard} onPress={() => navigation.navigate("AssessmentScreenStudent", { assessmentId: assessment._id })}>
            <View style={styles.assessmentHeader}>
              <SimpleIcon name="menu-book" size={24} color="#10B144" />
              <Text style={styles.assessmentTitle}>{assessment.title}</Text>
            </View>
            <Text style={styles.assessmentDescription}>{assessment.description}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <SimpleIcon name="clipboard" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No assessments available</Text>
        </View>
      )}
    </View>
  )

  const renderDiscussions = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Chapter Discussion</Text>
      {discussions && discussions.length > 0 ? (
        <View style={styles.discussionsGrid}>
          {discussions.map((discussion: Discussion, index: number) => (
            <TouchableOpacity key={index} style={styles.discussionCard} onPress={() => navigation.navigate('DiscussionStudent', { discussionId: discussion?._id })}>


              <Image source={{ uri: discussion.course.thumbnail.url }} style={{ width: '100%', height: 150 }} />

              <Text style={styles.dueDate}>Due Date: {new Date(discussion.dueDate.date).toDateString()}</Text>

              <View style={styles.chapterBadge}>
                <Text style={styles.chapterBadgeText}>{discussion.type}</Text>
              </View>

              <Text style={styles.discussionTitle}>{discussion.topic}</Text>
              <Text style={styles.discussionSubtitle}>{discussion.course.courseTitle || "test"}</Text>
              <Text style={styles.discussionDescription}>{discussion.description}</Text>
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
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Lesson Discussion</Text>
          {lessonDiscussions && lessonDiscussions.length > 0 ? (
            lessonDiscussions.map((discussion, index) => (
              <TouchableOpacity key={`lesson-discussion-${index}`} style={styles.discussionCard}  onPress={() => navigation.navigate('DiscussionStudent', { discussionId: discussion?._id })}>
                <Image source={{ uri: discussion.course.thumbnail.url }} style={{ width: "100%", height: 150 }} />
                <Text style={styles.dueDate}>Due Date: {new Date(discussion.dueDate.date).toDateString()}</Text>
                <View style={styles.chapterBadge}><Text style={styles.chapterBadgeText}>{discussion.type}</Text></View>
                <Text style={styles.discussionTitle}>{discussion.topic}</Text>
                <Text style={styles.discussionSubtitle}>{discussion.course.courseTitle || "test"}</Text>
                <Text style={styles.discussionDescription}>{discussion.description}</Text>
                </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyMessage}>No discussions found for this lesson</Text>
          )}
        </>
      )}
    </View>
  )

  const renderPages = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Chapter Pages</Text>
      {pages && pages.length > 0 ? (
        pages.map((page: Page, index: number) => (
          <TouchableOpacity key={index} style={styles.pageCard} onPress={() => setSelectedPage(page)}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>{page.title}</Text>

            </View>
            <Text style={styles.pageDescription}>{page.description}</Text>
            {page.image && <Image source={{ uri: page.image.url }} style={styles.pageImage} />}
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
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Lesson Pages</Text>
          {lessonPages && lessonPages.length > 0 ? (
            lessonPages.map((page, index) => (
              <TouchableOpacity key={`lesson-page-${index}`} style={styles.pageCard} onPress={() => setSelectedPage(page)}>
                <View style={styles.pageHeader}>
                  <Text style={styles.pageTitle}>{page.title}</Text>
                </View>
                <Text style={styles.pageDescription}>{page.description}</Text>
                {page.image && <Image source={{ uri: page.image.url }} style={styles.pageImage} />}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyMessage}>No pages found for this lesson</Text>
          )}
        </>
      )}


    </View>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return renderDescription()
      case "files":
        return renderFiles()
      case "assessments":
        return renderAssessments()
      case "discussions":
        return renderDiscussions()
      case "pages":
        return renderPages()
      default:
        return null
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => navigateBack?navigateBack():navigation.goBack()} style={styles.backButton}>
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
          {chapterDetailsLoading ?
            <ActivityIndicator size={'large'} color={'#10B144'} style={{ alignSelf: 'center', height: '30%' }} /> :
            <ScrollView style={styles.contentScrollView}>{renderTabContent()}</ScrollView>
          }
        </View>

        {/* Right Sidebar - Chapter Content */}
        {!chapterDetailsLoading &&
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
                    <TouchableOpacity key={index} style={[styles.lessonItem, { backgroundColor: selectedLesson?._id === lesson._id ? '#C7F3DD' : '#fff' }]}
                      onPress={() => handleLessonSelect(lesson)}>
                      <SimpleIcon name="play-circle-outline" size={20} color="#666" />
                      <Text style={styles.lessonItemText}>
                        Lesson {index + 1}: {lesson.title || `Lesson ${index + 1}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        }


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

            <Text style={styles.modalDescription}>{selectedPage.description}</Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPage(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </View>
  )
}

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
    width: '100%',
    borderTopWidth: 1,
    maxHeight: '30%',
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
    justifyContent: 'center',
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
    fontWeight: 'bold',
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
    fontWeight: "600",
  },

})

export default ChapterDetailsStudent
