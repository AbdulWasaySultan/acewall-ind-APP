import React, { useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
} from "react-native";
import SimpleIcon from "../SimpleIcon";
import Toast from "react-native-simple-toast";

const styles = StyleSheet.create({
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fullScreenModalContent: {
    flex: 1,
    padding: 20,
  },
  fullScreenModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
  },
  chapterDetailsModalSpacer: {
    width: 40,
  },
  chapterDetailsModalButton: {
    backgroundColor: "#10B144",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  chapterDetailsModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  chapterDetailsModalInfo: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  chapterDetailsModalInfoText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  chapterDetailsModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  chapterDetailsModalDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  chapterDetailsModalSection: {
    marginBottom: 16,
  },
  chapterDetailsModalSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  chapterDetailsModalLessonCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  chapterDetailsModalLessonTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  chapterDetailsModalLessonDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  chapterDetailsModalLessonActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chapterDetailsModalLessonActionButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
  },
  chapterDetailsModalLessonActionText: {
    fontSize: 12,
    color: "#666",
  },
  chapterDetailsModalAssessmentCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  chapterDetailsModalAssessmentTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  chapterDetailsModalAssessmentType: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  chapterDetailsModalAssessmentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chapterDetailsModalAssessmentActionButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
  },
  chapterDetailsModalAssessmentActionText: {
    fontSize: 12,
    color: "#666",
  },
  chapterDetailsModalDropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    minWidth: 150,
  },
  chapterDetailsModalDropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  chapterDetailsModalDropdownItemText: {
    fontSize: 14,
    color: "#222",
  },
  chapterDetailsModalDropdownItemLast: {
    borderBottomWidth: 0,
  },
  addLessonButton: {
    backgroundColor: "#10B144",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  addLessonButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  chapterDetailsLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chapterDetailsLoadingText: {
    fontSize: 16,
    color: "#666",
  },
  chapterDetailsErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  chapterDetailsErrorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
  },
  chapterViewButton: {
    backgroundColor: "#10B144",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  chapterDetailsCloseButtonMargin: {
    marginBottom: 16,
  },
  chapterViewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  chapterDetailsCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  chapterDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  chapterDetailsIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  chapterDetailsActions: {
    flexDirection: "row",
    gap: 8,
  },
  chapterDetailsActionButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
  },
  plusButtonContainer: {
    position: "relative",
  },
  chapterDetailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  chapterDetailsDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  lessonsCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  lessonsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  lessonsIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  lessonsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  lessonsCount: {
    backgroundColor: "#10B144",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lessonsCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  chapterLessonsList: {
    marginTop: 12,
  },
  assessmentItemContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  assessmentItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  assessmentCategoryChip: {
    backgroundColor: "#10B144",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  assessmentCategoryChipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  assessmentDeleteButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#fee2e2",
  },
  assessmentContent: {
    marginTop: 8,
  },
  assessmentInfo: {
    marginBottom: 4,
  },
  assessmentTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
  },
  assessmentDescription: {
    fontSize: 12,
    color: "#666",
  },
  noLessonsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noLessonsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  noLessonsDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  lessonCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  lessonCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  lessonNumberBadge: {
    backgroundColor: "#10B144",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lessonCardNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  lessonCardActions: {
    flexDirection: "row",
    gap: 8,
  },
  lessonActionIcon: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
  },
  lessonsPlusButtonContainer: {
    position: "relative",
  },
  lessonAddButton: {
    backgroundColor: "#10B144",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  lessonsDropdownMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    minWidth: 150,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#222",
  },
  lessonCardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  lessonCardDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  filesSection: {
    marginTop: 12,
  },
  filesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  filesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
  },
  lessonAddFileButton: {
    backgroundColor: "#10B144",
    padding: 8,
    borderRadius: 4,
  },
  lessonAddFileButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  fileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    marginBottom: 4,
  },
  fileItemContent: {
    flex: 1,
  },
  fileName: {
    fontSize: 12,
    color: "#222",
    marginBottom: 2,
  },
  fileDate: {
    fontSize: 10,
    color: "#666",
  },
  noFilesText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  resourcesSection: {
    marginTop: 12,
  },
  lessonResourcesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  resourcesList: {
    marginTop: 8,
  },
  youtubeResource: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    marginBottom: 4,
  },
  resourceText: {
    fontSize: 12,
    color: "#222",
    marginLeft: 8,
  },
  linkResource: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    marginBottom: 4,
  },
});

interface ChapterDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  chapterDetails: any;
  chapterDetailsLoading: boolean;
  chapterDetailsError: string | null;
  showPlusDropdown: boolean;
  showLessonsPlusDropdown: boolean;
  currentLessonForAssessment: any;
  onEditChapter: () => void;
  onAddLesson: () => void;
  onPlusButtonPress: () => void;
  onLessonsPlusButtonPress: (lesson: any) => void;
  onDropdownOption: (option: string) => void;
  onLessonsDropdownOption: (option: string) => void;
  onEditLesson: (lesson: any) => void;
  onDeleteLessonFromChapter: (lessonId: string) => void;
  onDeleteFile: (lessonId: string, fileId: string) => void;
  onAddFilesToLesson: (lessonId: string) => void;
  onOpenLink: (url: string) => void;
  onDeleteAssessmentDirect: (assessmentId: string) => void;
  onSelectAssessmentForModal: (assessment: any) => void;
  onAssessmentDetailsModalOpen: () => void;
  onChaptersForQuarterModalOpen: () => void;
}

const ChapterDetailsModal: React.FC<ChapterDetailsModalProps> = ({
  visible,
  onClose,
  chapterDetails,
  chapterDetailsLoading,
  chapterDetailsError,
  showPlusDropdown,
  showLessonsPlusDropdown,
  currentLessonForAssessment,
  onEditChapter,
  onAddLesson,
  onPlusButtonPress,
  onLessonsPlusButtonPress,
  onDropdownOption,
  onLessonsDropdownOption,
  onEditLesson,
  onDeleteLessonFromChapter,
  onDeleteFile,
  onAddFilesToLesson,
  onOpenLink,
  onDeleteAssessmentDirect,
  onSelectAssessmentForModal,
  onAssessmentDetailsModalOpen,
  onChaptersForQuarterModalOpen,
}) => {
  const plusButtonRef = useRef<any>(null);

  const handleClose = () => {
    onClose();
    onChaptersForQuarterModalOpen();
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.fullScreenModalContainer}>
        <View style={styles.fullScreenModalContent}>
          <View style={styles.fullScreenModalHeader}>
            <TouchableOpacity onPress={handleClose} style={styles.backButton}>
              <SimpleIcon name="arrow-back" size={24} color="#10B144" />
            </TouchableOpacity>
            <Text style={styles.fullScreenModalTitle}>Chapter Details</Text>
            <View style={styles.chapterDetailsModalSpacer} />
          </View>

          {chapterDetailsLoading ? (
            <View style={styles.chapterDetailsLoadingContainer}>
              <ActivityIndicator size="large" color="#10B144" />
              <Text style={styles.chapterDetailsLoadingText}>
                Loading chapter details...
              </Text>
            </View>
          ) : chapterDetailsError ? (
            <View style={styles.chapterDetailsErrorContainer}>
              <SimpleIcon name="alert-circle" size={48} color="#ff6b6b" />
              <Text style={styles.chapterDetailsErrorText}>
                {chapterDetailsError}
              </Text>
              <TouchableOpacity
                style={[styles.chapterViewButton, styles.chapterDetailsCloseButtonMargin]}
                onPress={onClose}
              >
                <Text style={styles.chapterViewButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : chapterDetails ? (
            <ScrollView>
              {/* Chapter Info Card */}
              <View style={styles.chapterDetailsCard}>
                <View style={styles.chapterDetailsHeader}>
                  <View style={styles.chapterDetailsIcon}>
                    <SimpleIcon name="menu-book" size={24} color="#10B144" />
                  </View>
                  <View style={styles.chapterDetailsActions}>
                    <TouchableOpacity
                      style={styles.chapterDetailsActionButton}
                      onPress={onEditChapter}
                    >
                      <SimpleIcon name="pencil" size={25} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.plusButtonContainer}>
                      <TouchableOpacity
                        ref={plusButtonRef}
                        style={styles.chapterDetailsActionButton}
                        onPress={onPlusButtonPress}
                      >
                        <SimpleIcon name="plus" size={25} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <Text style={styles.chapterDetailsTitle}>
                  {chapterDetails.title}
                </Text>
                <Text style={styles.chapterDetailsDescription}>
                  {chapterDetails.description}
                </Text>
              </View>

              {/* Chapter Assessments Card */}
              <View style={styles.lessonsCard}>
                <View style={styles.lessonsHeader}>
                  <View style={styles.lessonsIcon}>
                    <SimpleIcon name="clipboard" size={22} color="#10B144" />
                  </View>
                  <Text style={styles.lessonsTitle}>Chapter Assessments</Text>
                  <View style={styles.lessonsCount}>
                    <Text style={styles.lessonsCountText}>
                      {chapterDetails.chapter_assessments
                        ? chapterDetails.chapter_assessments.length
                        : 0}
                    </Text>
                  </View>
                </View>

                {chapterDetails.chapter_assessments &&
                chapterDetails.chapter_assessments.length > 0 ? (
                  <View style={styles.chapterLessonsList}>
                    {chapterDetails.chapter_assessments.map(
                      (assessment: any, index: number) => (
                        <View
                          key={assessment._id || index}
                          style={styles.assessmentItemContainer}
                        >
                          <View style={styles.assessmentItemHeader}>
                            {assessment.category ? (
                              <View style={styles.assessmentCategoryChip}>
                                <Text style={styles.assessmentCategoryChipText}>
                                  {typeof assessment.category === "string"
                                    ? assessment.category
                                    : assessment.category &&
                                      assessment.category.name
                                    ? assessment.category.name
                                    : "Uncategorized"}
                                </Text>
                              </View>
                            ) : null}
                            <TouchableOpacity
                              onPress={() => {
                                Alert.alert(
                                  "Delete Assessment",
                                  `Are you sure you want to delete "${
                                    assessment.title || "this assessment"
                                  }"?`,
                                  [
                                    {
                                      text: "Cancel",
                                      style: "cancel",
                                    },
                                    {
                                      text: "Delete",
                                      style: "destructive",
                                      onPress: () =>
                                        onDeleteAssessmentDirect(
                                          assessment._id
                                        ),
                                    },
                                  ]
                                );
                              }}
                              style={styles.assessmentDeleteButton}
                            >
                              <SimpleIcon
                                name="trash"
                                size={25}
                                color="#ef4444"
                              />
                            </TouchableOpacity>
                          </View>

                          <TouchableOpacity
                            style={styles.assessmentContent}
                            activeOpacity={0.8}
                            onPress={() => {
                              onClose();
                              onSelectAssessmentForModal(assessment);
                              onAssessmentDetailsModalOpen();
                            }}
                          >
                            <View style={styles.assessmentInfo}>
                              <Text style={styles.assessmentTitle}>
                                {assessment.title || `Assessment ${index + 1}`}
                              </Text>
                              {assessment.description ? (
                                <Text style={styles.assessmentDescription}>
                                  {assessment.description}
                                </Text>
                              ) : null}
                            </View>
                          </TouchableOpacity>
                        </View>
                      )
                    )}
                  </View>
                ) : (
                  <View style={styles.noLessonsContainer}>
                    <SimpleIcon name="clipboard" size={48} color="#ccc" />
                    <Text style={styles.noLessonsTitle}>
                      No assessments yet
                    </Text>
                    <Text style={styles.noLessonsDescription}>
                      Create your first assessment for this chapter.
                    </Text>
                  </View>
                )}
              </View>

              {/* Lessons Card */}
              <View style={styles.lessonsCard}>
                <View style={styles.lessonsHeader}>
                  <View style={styles.lessonsIcon}>
                    <SimpleIcon name="menu-book" size={24} color="#10B144" />
                  </View>
                  <Text style={styles.lessonsTitle}>Lessons</Text>
                  <View style={styles.lessonsCount}>
                    <Text style={styles.lessonsCountText}>
                      {chapterDetails.lessons
                        ? chapterDetails.lessons.length
                        : 0}
                    </Text>
                  </View>
                </View>

                {chapterDetails.lessons && chapterDetails.lessons.length > 0 ? (
                  <View style={styles.chapterLessonsList}>
                    {chapterDetails.lessons.map(
                      (lesson: any, index: number) => (
                        <View
                          key={lesson._id || index}
                          style={styles.lessonCard}
                        >
                          <View style={styles.lessonCardHeader}>
                            <View style={styles.lessonNumberBadge}>
                              <Text style={styles.lessonCardNumberText}>
                                Lesson {index + 1}
                              </Text>
                            </View>
                            <View style={styles.lessonCardActions}>
                              <TouchableOpacity
                                style={styles.lessonActionIcon}
                                onPress={() => onEditLesson(lesson)}
                              >
                                <SimpleIcon
                                  name="pencil"
                                  size={30}
                                  color="#10B144"
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.lessonActionIcon}
                                onPress={() =>
                                  onDeleteLessonFromChapter(lesson._id)
                                }
                              >
                                <SimpleIcon
                                  name="trash"
                                  size={30}
                                  color="#ef4444"
                                />
                              </TouchableOpacity>

                              <View style={styles.lessonsPlusButtonContainer}>
                                <TouchableOpacity
                                  style={styles.lessonAddButton}
                                  onPress={() =>
                                    onLessonsPlusButtonPress(lesson)
                                  }
                                >
                                  <SimpleIcon
                                    name="plus"
                                    size={22}
                                    color="#fff"
                                  />
                                </TouchableOpacity>

                                {showLessonsPlusDropdown &&
                                currentLessonForAssessment?._id ===
                                  lesson._id ? (
                                  <View style={styles.lessonsDropdownMenu}>
                                    <TouchableOpacity
                                      style={styles.dropdownItem}
                                      onPress={() =>
                                        onLessonsDropdownOption("assessment")
                                      }
                                    >
                                      <SimpleIcon
                                        name="clipboard"
                                        size={16}
                                        color="#10b981"
                                      />
                                      <Text style={styles.dropdownItemText}>
                                        + Add Assessment
                                      </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      style={styles.dropdownItem}
                                      onPress={() =>
                                        onLessonsDropdownOption("page")
                                      }
                                    >
                                      <SimpleIcon
                                        name="description"
                                        size={16}
                                        color="#6b7280"
                                      />
                                      <Text style={styles.dropdownItemText}>
                                        + Add Page
                                      </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      style={styles.dropdownItem}
                                      onPress={() =>
                                        onLessonsDropdownOption("discussion")
                                      }
                                    >
                                      <SimpleIcon
                                        name="chat"
                                        size={16}
                                        color="#6b7280"
                                      />
                                      <Text style={styles.dropdownItemText}>
                                        + Discussion
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                ) : null}
                              </View>
                            </View>
                          </View>
                          <Text style={styles.lessonCardTitle}>
                            {lesson.title}
                          </Text>
                          <Text style={styles.lessonCardDescription}>
                            {lesson.description?.replace(/<[^>]*>/g, "") ||
                              "No description"}
                          </Text>

                          {/* Files Section */}
                          <View style={styles.filesSection}>
                            <View style={styles.filesHeader}>
                              <Text style={styles.filesTitle}>Files</Text>
                              <TouchableOpacity
                                style={styles.lessonAddFileButton}
                                onPress={() => onAddFilesToLesson(lesson._id)}
                              >
                                <Text style={styles.lessonAddFileButtonText}>
                                  + Add
                                </Text>
                              </TouchableOpacity>
                            </View>
                            {lesson.pdfFiles && lesson.pdfFiles.length > 0 ? (
                              lesson.pdfFiles.map(
                                (file: any, fileIndex: number) => (
                                  <View key={fileIndex} style={styles.fileItem}>
                                    <TouchableOpacity
                                      style={styles.fileItemContent}
                                      onPress={() => onOpenLink(file.url)}
                                    >
                                      <SimpleIcon
                                        name="description"
                                        size={16}
                                        color="#10B144"
                                      />
                                      <Text style={styles.fileName}>
                                        {file.filename}
                                      </Text>
                                      <Text style={styles.fileDate}>
                                        {new Date(
                                          file.uploadedAt
                                        ).toLocaleDateString("en-US", {
                                          month: "2-digit",
                                          day: "2-digit",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        })}
                                      </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      onPress={() =>
                                        onDeleteFile(lesson._id, file._id)
                                      }
                                    >
                                      <SimpleIcon
                                        name="trash"
                                        size={16}
                                        color="#ef4444"
                                      />
                                    </TouchableOpacity>
                                  </View>
                                )
                              )
                            ) : (
                              <Text style={styles.noFilesText}>no files</Text>
                            )}
                          </View>

                          {/* Resources Section */}
                          {(lesson.youtubeLinks || lesson.otherLink) && (
                            <View style={styles.resourcesSection}>
                              <Text style={styles.lessonResourcesTitle}>
                                Resources
                              </Text>
                              <View style={styles.resourcesList}>
                                {lesson.youtubeLinks && (
                                  <TouchableOpacity
                                    style={styles.youtubeResource}
                                    onPress={() =>
                                      onOpenLink(lesson.youtubeLinks)
                                    }
                                  >
                                    <SimpleIcon
                                      name="play"
                                      size={16}
                                      color="#fff"
                                    />
                                    <Text style={styles.resourceText}>
                                      YouTube Video
                                    </Text>
                                  </TouchableOpacity>
                                )}
                                {lesson.otherLink && (
                                  <TouchableOpacity
                                    style={styles.linkResource}
                                    onPress={() => onOpenLink(lesson.otherLink)}
                                  >
                                    <SimpleIcon
                                      name="link"
                                      size={16}
                                      color="#fff"
                                    />
                                    <Text style={styles.resourceText}>
                                      External Link
                                    </Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>
                          )}
                        </View>
                      )
                    )}
                  </View>
                ) : (
                  <View style={styles.noLessonsContainer}>
                    <SimpleIcon name="menu-book" size={48} color="#ccc" />
                    <Text style={styles.noLessonsTitle}>No lessons yet</Text>
                    <Text style={styles.noLessonsDescription}>
                      Create your first lesson to start building your chapter
                      content.
                    </Text>
                    <TouchableOpacity
                      style={styles.addLessonButton}
                      onPress={onAddLesson}
                    >
                      <Text style={styles.addLessonButtonText}>
                        + Add Lesson
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

export default ChapterDetailsModal;
