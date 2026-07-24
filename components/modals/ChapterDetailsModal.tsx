import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
} from "react-native";
import SimpleIcon from "../SimpleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  plusButtonRef?: React.RefObject<any>;
}

// ─── Memoized assessment row ───
// Only re-renders when its own assessment data changes, regardless of what
// else changes elsewhere in the (very large) parent tree.
interface AssessmentItemProps {
  assessment: any;
  index: number;
  onClose: () => void;
  onDeleteAssessmentDirect: (assessmentId: string) => void;
  onSelectAssessmentForModal: (assessment: any) => void;
  onAssessmentDetailsModalOpen: () => void;
}

const AssessmentItem = React.memo<AssessmentItemProps>(
  ({
    assessment,
    index,
    onClose,
    onDeleteAssessmentDirect,
    onSelectAssessmentForModal,
    onAssessmentDetailsModalOpen,
  }) => {
    const categoryLabel =
      typeof assessment.category === "string"
        ? assessment.category
        : assessment.category && assessment.category.name
        ? assessment.category.name
        : "Uncategorized";

    return (
      <View style={styles.assessmentItemContainer}>
        <View style={styles.assessmentItemHeader}>
          {assessment.category ? (
            <View style={styles.assessmentCategoryChip}>
              <Text style={styles.assessmentCategoryChipText}>
                {categoryLabel}
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
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => onDeleteAssessmentDirect(assessment._id),
                  },
                ]
              );
            }}
            style={styles.assessmentDeleteButton}
          >
            <SimpleIcon name="trash" size={25} color="#ef4444" />
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
    );
  }
);

// ─── Memoized lesson row ───
// `isDropdownOpen` is a plain boolean computed by the parent per-lesson, so
// toggling one lesson's dropdown doesn't force every other lesson card to
// re-render (which is what caused the scroll/interaction stutter on chapters
// with many lessons).
interface LessonCardProps {
  lesson: any;
  index: number;
  isDropdownOpen: boolean;
  onEditLesson: (lesson: any) => void;
  onDeleteLessonFromChapter: (lessonId: string) => void;
  onLessonsPlusButtonPress: (lesson: any) => void;
  onLessonsDropdownOption: (option: string) => void;
  onAddFilesToLesson: (lessonId: string) => void;
  onDeleteFile: (lessonId: string, fileId: string) => void;
  onOpenLink: (url: string) => void;
  onClose: () => void;
  onDeleteAssessmentDirect: (assessmentId: string) => void;
  onSelectAssessmentForModal: (assessment: any) => void;
  onAssessmentDetailsModalOpen: () => void;
}

const LessonCard = React.memo<LessonCardProps>(
  ({
    lesson,
    index,
    isDropdownOpen,
    onEditLesson,
    onDeleteLessonFromChapter,
    onLessonsPlusButtonPress,
    onLessonsDropdownOption,
    onAddFilesToLesson,
    onDeleteFile,
    onOpenLink,
    onClose,
    onDeleteAssessmentDirect,
    onSelectAssessmentForModal,
    onAssessmentDetailsModalOpen,
  }) => {
    const strippedDescription = useMemo(
      () => lesson.description?.replace(/<[^>]*>/g, "") || "No description",
      [lesson.description]
    );

    return (
      <View style={styles.lessonCard}>
        {/* Header row: number badge + action icons — dropdown lives ONLY here */}
        <View style={styles.lessonCardHeader}>
          <View style={styles.lessonNumberBadge}>
            <Text style={styles.lessonCardNumberText}>Lesson {index + 1}</Text>
          </View>
          <View style={styles.lessonCardActions}>
            <TouchableOpacity
              style={styles.lessonActionIcon}
              onPress={() => onEditLesson(lesson)}
            >
              <SimpleIcon name="pencil" size={26} useEmoji={true} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.lessonActionIcon}
              onPress={() => onDeleteLessonFromChapter(lesson._id)}
            >
              <SimpleIcon name="trash" size={30} color="#ef4444" />
            </TouchableOpacity>

            {/* add lesson button */}

            <View style={styles.lessonsPlusButtonContainer}>
              <TouchableOpacity
                style={styles.lessonAddButton}
                onPress={() => onLessonsPlusButtonPress(lesson)}
              >
                <SimpleIcon name="plus" size={22} color="#fff" />
              </TouchableOpacity>

              {isDropdownOpen ? (
                <View style={styles.lessonsDropdownMenu}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => onLessonsDropdownOption("assessment")}
                  >
                    <SimpleIcon name="clipboard" size={16} color="#10b981" />
                    <Text style={styles.dropdownItemText}>
                      + Add Assessment
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => onLessonsDropdownOption("page")}
                  >
                    <SimpleIcon name="description" size={16} color="#6b7280" />
                    <Text style={styles.dropdownItemText}>+ Add Page</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => onLessonsDropdownOption("discussion")}
                  >
                    <SimpleIcon name="chat" size={16} color="#6b7280" />
                    <Text style={styles.dropdownItemText}>+ Discussion</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Title & description — ALWAYS rendered, independent of dropdown state */}
        <View collapsable={false}>
          <Text style={styles.lessonCardTitle}>
            {lesson.title || "Untitled Lesson"}
          </Text>
          <Text style={styles.lessonCardDescription}>
            {strippedDescription}
          </Text>

          {/* Files Section */}
          <View style={styles.filesSection}>
            <View style={styles.filesHeader}>
              <Text style={styles.filesTitle}>Files</Text>
              <TouchableOpacity
                style={styles.lessonAddFileButton}
                onPress={() => onAddFilesToLesson(lesson._id)}
              >
                <Text style={styles.lessonAddFileButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            {lesson.pdfFiles && lesson.pdfFiles.length > 0 ? (
              lesson.pdfFiles.map((file: any, fileIndex: number) => (
                <View key={fileIndex} style={styles.fileItem}>
                  <TouchableOpacity
                    style={styles.fileItemContent}
                    onPress={() => onOpenLink(file.url)}
                  >
                    <SimpleIcon name="description" size={16} color="#10B144" />
                    <Text style={styles.fileName}>{file.filename}</Text>
                    <Text style={styles.fileDate}>
                      {new Date(file.uploadedAt).toLocaleDateString("en-US", {
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
                    onPress={() => onDeleteFile(lesson._id, file._id)}
                  >
                    <SimpleIcon name="trash" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noFilesText}>no files</Text>
            )}
          </View>

          {/* Lesson Assessments Section */}
          {lesson.lesson_assessments &&
            lesson.lesson_assessments.length > 0 && (
              <View style={styles.filesSection}>
                <View style={styles.filesHeader}>
                  <Text style={styles.filesTitle}>
                    Lesson Assessments ({lesson.lesson_assessments.length})
                  </Text>
                </View>
                {lesson.lesson_assessments.map(
                  (assessment: any, assessmentIndex: number) => (
                    <AssessmentItem
                      key={assessment._id || assessmentIndex}
                      assessment={assessment}
                      index={assessmentIndex}
                      onClose={onClose}
                      onDeleteAssessmentDirect={onDeleteAssessmentDirect}
                      onSelectAssessmentForModal={onSelectAssessmentForModal}
                      onAssessmentDetailsModalOpen={
                        onAssessmentDetailsModalOpen
                      }
                    />
                  )
                )}
              </View>
            )}

          {/* Resources Section */}
          {(lesson.youtubeLinks || lesson.otherLink) && (
            <View style={styles.resourcesSection}>
              <Text style={styles.lessonResourcesTitle}>Resources</Text>
              <View style={styles.resourcesList}>
                {lesson.youtubeLinks && (
                  <TouchableOpacity
                    style={styles.youtubeResource}
                    onPress={() => onOpenLink(lesson.youtubeLinks)}
                  >
                    <SimpleIcon name="play" size={16} color="#dc2626" />
                    <Text style={styles.resourceText}>YouTube Video</Text>
                  </TouchableOpacity>
                )}
                {lesson.otherLink && (
                  <TouchableOpacity
                    style={styles.linkResource}
                    onPress={() => onOpenLink(lesson.otherLink)}
                  >
                    <SimpleIcon name="link" size={16} color="#10B144" />
                    <Text style={styles.resourceText}>External Link</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }
);

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
  const insets = useSafeAreaInsets();
  const handleClose = () => {
    onClose();
    onChaptersForQuarterModalOpen();
  };

  // Virtualized so chapters with many lessons don't mount everything at
  // once (was the source of the scroll stutter/freeze).
  const renderLesson = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <LessonCard
        lesson={item}
        index={index}
        isDropdownOpen={
          showLessonsPlusDropdown &&
          currentLessonForAssessment?._id === item._id
        }
        onEditLesson={onEditLesson}
        onDeleteLessonFromChapter={onDeleteLessonFromChapter}
        onLessonsPlusButtonPress={onLessonsPlusButtonPress}
        onLessonsDropdownOption={onLessonsDropdownOption}
        onAddFilesToLesson={onAddFilesToLesson}
        onDeleteFile={onDeleteFile}
        onOpenLink={onOpenLink}
        onClose={onClose}
        onDeleteAssessmentDirect={onDeleteAssessmentDirect}
        onSelectAssessmentForModal={onSelectAssessmentForModal}
        onAssessmentDetailsModalOpen={onAssessmentDetailsModalOpen}
      />
    ),
    [
      showLessonsPlusDropdown,
      currentLessonForAssessment,
      onEditLesson,
      onDeleteLessonFromChapter,
      onLessonsPlusButtonPress,
      onLessonsDropdownOption,
      onAddFilesToLesson,
      onDeleteFile,
      onOpenLink,
      onClose,
      onDeleteAssessmentDirect,
      onSelectAssessmentForModal,
      onAssessmentDetailsModalOpen,
    ]
  );

  const lessonKeyExtractor = useCallback(
    (lesson: any, index: number) => lesson._id || String(index),
    []
  );

  const lessonsListHeader = useMemo(() => {
    if (!chapterDetails) return null;
    return (
      <>
        {/* ─── Chapter Info Card ─── */}
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
                <SimpleIcon name="pencil" size={23} useEmoji={true} />
              </TouchableOpacity>
              <View style={styles.plusButtonContainer}>
                <TouchableOpacity
                  style={[styles.chapterDetailsActionButton, {backgroundColor: "#10B144"}]}
                  onPress={onPlusButtonPress}
                  activeOpacity={0.8}
                >
                  <SimpleIcon name="plus" size={25} color="#fff" />

                  {showPlusDropdown && (
                    <View style={styles.dropdownMenu}>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => onDropdownOption("lesson")}
                      >
                        <SimpleIcon
                          name="menu-book"
                          size={16}
                          color="#10B144"
                        />
                        <Text style={styles.dropdownItemText}>
                          + Add Lesson
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => onDropdownOption("assessment")}
                      >
                        <SimpleIcon
                          name="clipboard"
                          size={16}
                          color="#10B144"
                        />
                        <Text style={styles.dropdownItemText}>
                          + Add Assessment
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => onDropdownOption("page")}
                      >
                        <SimpleIcon
                          name="description"
                          size={16}
                          color="#6b7280"
                        />
                        <Text style={styles.dropdownItemText}>+ Add Page</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => onDropdownOption("discussion")}
                      >
                        <SimpleIcon name="chat" size={16} color="#6b7280" />
                        <Text style={styles.dropdownItemText}>
                          + Discussion
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Text style={styles.chapterDetailsTitle}>{chapterDetails.title}</Text>
          <Text style={styles.chapterDetailsDescription}>
            {chapterDetails.description}
          </Text>
        </View>

        {/* ─── Chapter Assessments Card ─── */}
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
                  <AssessmentItem
                    key={assessment._id || index}
                    assessment={assessment}
                    index={index}
                    onClose={onClose}
                    onDeleteAssessmentDirect={onDeleteAssessmentDirect}
                    onSelectAssessmentForModal={onSelectAssessmentForModal}
                    onAssessmentDetailsModalOpen={onAssessmentDetailsModalOpen}
                  />
                )
              )}
            </View>
          ) : (
            <View style={styles.noLessonsContainer}>
              <SimpleIcon name="clipboard" size={48} color="#ccc" />
              <Text style={styles.noLessonsTitle}>No assessments yet</Text>
              <Text style={styles.noLessonsDescription}>
                Create your first assessment for this chapter.
              </Text>
            </View>
          )}
        </View>

        {/* ─── Lessons header (rows are virtualized below) ─── */}
        <View style={[styles.lessonsCard, styles.lessonsSectionHeaderCard]}>
          <View style={styles.lessonsHeader}>
            <View style={styles.lessonsIcon}>
              <SimpleIcon name="menu-book" size={24} color="#10B144" />
            </View>
            <Text style={styles.lessonsTitle}>Lessons</Text>
            <View style={styles.lessonsCount}>
              <Text style={styles.lessonsCountText}>
                {chapterDetails.lessons ? chapterDetails.lessons.length : 0}
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  }, [
    chapterDetails,
    showPlusDropdown,
    onEditChapter,
    onPlusButtonPress,
    onDropdownOption,
    onClose,
    onDeleteAssessmentDirect,
    onSelectAssessmentForModal,
    onAssessmentDetailsModalOpen,
  ]);

  const lessonsListEmpty = useMemo(
    () => (
      <View style={styles.noLessonsContainer}>
        <SimpleIcon name="menu-book" size={48} color="#ccc" />
        <Text style={styles.noLessonsTitle}>No lessons yet</Text>
        <Text style={styles.noLessonsDescription}>
          Create your first lesson to start building your chapter content.
        </Text>
        <TouchableOpacity style={styles.addLessonButton} onPress={onAddLesson}>
          <Text style={styles.addLessonButtonText}>+ Add Lesson</Text>
        </TouchableOpacity>
      </View>
    ),
    [onAddLesson]
  );

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.fullScreenModalContainer}>
        <View
          style={[
            styles.fullScreenModalContent,
            { paddingTop: insets.top + 20 },
          ]}
        >
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
                style={[
                  styles.chapterViewButton,
                  styles.chapterDetailsCloseButtonMargin,
                ]}
                onPress={onClose}
              >
                <Text style={styles.chapterViewButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : chapterDetails ? (
            <FlatList
              style={styles.lessonsList}
              data={chapterDetails.lessons || []}
              keyExtractor={lessonKeyExtractor}
              renderItem={renderLesson}
              ListHeaderComponent={lessonsListHeader}
              ListFooterComponent={
                <View style={styles.lessonsListFooterSpacer} />
              }
              ListEmptyComponent={lessonsListEmpty}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              removeClippedSubviews={false}
              contentContainerStyle={styles.lessonsListContent}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenModalContainer: { flex: 1, backgroundColor: "#fff" },
  fullScreenModalContent: { flex: 1, padding: 20 },
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
  fullScreenModalTitle: { fontSize: 24, fontWeight: "bold", color: "#222" },
  chapterDetailsModalSpacer: { width: 40 },
  chapterDetailsLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chapterDetailsLoadingText: { fontSize: 16, color: "#666" },
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
  chapterDetailsCloseButtonMargin: { marginBottom: 16 },
  chapterViewButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  chapterDetailsCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",

    overflow: "visible",

    zIndex: 999,
    elevation: 1,
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
  chapterDetailsActions: { flexDirection: "row", gap: 8 },
  chapterDetailsActionButton: {
    padding: 8,
    borderRadius: 4,
  },
  plusButtonContainer: {
    position: "relative",
    zIndex: 10, // always present, never toggled
    elevation: 10, // always present, never toggled
  },
  dropdownMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dropdownItemText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  chapterDetailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  chapterDetailsDescription: { fontSize: 14, color: "#666", marginBottom: 16 },
  lessonsCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",

    zIndex: 1,
    elevation: 1,
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
  lessonsTitle: { fontSize: 16, fontWeight: "bold", color: "#222" },
  lessonsCount: {
    backgroundColor: "#10B144",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lessonsCountText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  chapterLessonsList: { marginTop: 12 },
  lessonsSectionHeaderCard: { marginBottom: 4 },
  lessonsList: { flex: 1 },
  lessonsListContent: { flexGrow: 1 },
  lessonsListFooterSpacer: { height: 20 },
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
  assessmentContent: { marginTop: 8 },
  assessmentInfo: { marginBottom: 4 },
  assessmentTitle: { fontSize: 14, fontWeight: "bold", color: "#222" },
  assessmentDescription: { fontSize: 12, color: "#666" },
  noLessonsContainer: { padding: 20, alignItems: "center" },
  noLessonsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  noLessonsDescription: { fontSize: 14, color: "#666", textAlign: "center" },
  addLessonButton: {
    backgroundColor: "#10B144",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  addLessonButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
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
  lessonCardNumberText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  lessonCardActions: { flexDirection: "row", gap: 8 },
  lessonActionIcon: { padding: 8, borderRadius: 4, backgroundColor: "#f5f5f5" },
  lessonsPlusButtonContainer: {
    position: "relative",
    zIndex: 10,
    elevation: 10,
  },
  lessonsDropdownMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000, // was 999999999999999
  },
  lessonAddButton: {
    backgroundColor: "#10B144",
    paddingHorizontal: 9,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 4,
  },
  lessonCardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  lessonCardDescription: { fontSize: 12, color: "#666", marginBottom: 8 },
  filesSection: { marginTop: 12 },
  filesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  filesTitle: { fontSize: 14, fontWeight: "bold", color: "#222" },
  lessonAddFileButton: {
    backgroundColor: "#10B144",
    padding: 8,
    borderRadius: 4,
  },
  lessonAddFileButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  fileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    marginBottom: 4,
  },
  fileItemContent: { flex: 1 },
  fileName: { fontSize: 12, color: "#222", marginBottom: 2 },
  fileDate: { fontSize: 10, color: "#666" },
  noFilesText: { fontSize: 12, color: "#666", fontStyle: "italic" },
  resourcesSection: { marginTop: 12 },
  lessonResourcesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  resourcesList: { marginTop: 8 },
  youtubeResource: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    marginBottom: 4,
  },
  resourceText: { fontSize: 12, color: "#222", marginLeft: 8 },
  linkResource: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    marginBottom: 4,
  },
});

export default React.memo(ChapterDetailsModal);
