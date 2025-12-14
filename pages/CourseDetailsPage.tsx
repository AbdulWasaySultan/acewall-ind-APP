import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  Platform,
  Linking,
  TouchableWithoutFeedback,
  Switch,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import GradeScaleModal from "../components/GradeScaleModal";
import {
  useRoute,
  useNavigation,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  getCourseDetails,
  deleteCourse,
  createChapter,
  deleteChapter,
  createAssessmentCategory,
  getAssessmentCategories,
  createAssessment,
  deleteAssessment,
  editAssessment,
  getSubcategories,
  createLesson,
  deleteLesson,
  editLesson,
  addMoreFilesToLesson,
  deleteLessonFile,
  updateAssessmentCategory,
  deleteAssessmentCategory,
  getSemesters,
  getQuartersBySemesters,
  addSemesterToCourse,
  getQuartersForSemester,
  getChaptersByQuarter,
  editCourseBasics,
  updateCourseThumbnail,
  archiveCourse,
  unarchiveCourse,
  getChapterDetailsWithLessons,
  editChapter,
  getGradeScale,
  gradingScale,
  getGPA,
  gpaScale,
  getChaptersForCourses,
  getSemestersOfCourse,
  createSemester,
  updateSemester,
  toggleSemesterArchive,
  createQuarter,
  updateQuarter,
  toggleQuarterArchive,
  createApiInstance,
  addAuthInterceptor,
} from "../services/course";
import {
  getCourseRating,
  isCourseRated,
  createRating,
} from "../services/rating";
import { getComments, sendComment } from "../services/comment";
import { deletePage } from "../services/page";
import SimpleIcon from "../components/SimpleIcon";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "react-native-image-picker";
import { RootStackParamList } from "../navigation/AppNavigator";
import Toast from "react-native-simple-toast";
import { getCourseGradebook } from "../services/gradebook";
import { pick, types } from "@react-native-documents/picker";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import GPAModal from "../components/GPAModal";

const fallbackImage = require("../assets/jpg.jpg");
interface Assessment {
  assessmentId: string
  assessmentTitle: string
  category: string
  maxPoints: number
  studentPoints: number
  isDiscussion: boolean
}

interface Quarter {
  quarterId: string
  quarterTitle: string
  grade: number
  gpa: number
  letterGrade: string
  assessments: Assessment[]
}

interface Semester {
  semesterId: string
  semesterTitle: string
  quarters: Quarter[]
}

interface Student {
  studentId: string
  studentName: string
  gpa: number
  finalGrade: number
  letterGrade: string
  semesters: Semester[]
}

interface GradebookData {
  courseId: string
  total: number
  page: number
  limit: number
  gradebook: Student[]
}
export interface GradeScaleItem {
  _id: string;
  grade: string;
  min: number;
  max: number;
}
export interface GPAItem {
  _id: string;
  gpa: number;
  minPercentage: number;
  maxPercentage: number;
}

const CourseDetailsPage = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<RootStackParamList, "CourseDetails">>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { courseId } = route.params;
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [showCreateChapterModal, setShowCreateChapterModal] = useState(false);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterDescription, setChapterDescription] = useState("");
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [showDeleteChapterModal, setShowDeleteChapterModal] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<any>(null);
  const [deleteChapterLoading, setDeleteChapterLoading] = useState(false);
  const [deleteChapterError, setDeleteChapterError] = useState<string | null>(
    null
  );

  const [
    showAddNewAssessmentCategoryModal,
    setShowAddNewAssessmentCategoryModal,
  ] = useState(false);

  const [newAssessmentCategoryName, setNewAssessmentCategoryName] =
    useState("");
  const [newAssessmentCategoryWeight, setNewAssessmentCategoryWeight] =
    useState("");
  const [weightError, setWeightError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [assessmentCategories, setAssessmentCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Grade Scale Modal state
  const [showGradeScaleModal, setShowGradeScaleModal] = useState(false);
  const [showGPAModal, setShowGPAModal] = useState(false);

  const [showDeleteAssessmentModal, setShowDeleteAssessmentModal] =
    useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<any>(null);
  const [deleteAssessmentLoading, setDeleteAssessmentLoading] = useState(false);
  const [deleteAssessmentError, setDeleteAssessmentError] = useState<
    string | null
  >(null);

  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);

  const MAX_PDF_SIZE_MB = 5;
  const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

  const [showDeleteLessonModal, setShowDeleteLessonModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<any>(null);
  const [deleteLessonLoading, setDeleteLessonLoading] = useState(false);
  const [deleteLessonError, setDeleteLessonError] = useState<string | null>(
    null
  );

  // Thumbnail upload states
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [showManageCategoriesModal, setShowManageCategoriesModal] =
    useState(false);
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  const [allSemesters, setAllSemesters] = useState<any[]>([]);
  const [showGradingPeriodsModal, setShowGradingPeriodsModal] = useState(false);
  const [gradingPeriods, setGradingPeriods] = useState<any[]>([]);
  const [loadingGradingPeriods, setLoadingGradingPeriods] = useState(false);
  const [showNewSemesterModal, setShowNewSemesterModal] = useState(false);
  const [showNewQuarterModal, setShowNewQuarterModal] = useState(false);
  const [showEditSemesterModal, setShowEditSemesterModal] = useState(false);
  const [showEditQuarterModal, setShowEditQuarterModal] = useState(false);
  const [selectedSemesterForQuarter, setSelectedSemesterForQuarter] = useState<any>(null);
  const [editingSemester, setEditingSemester] = useState<any>(null);
  const [editingQuarter, setEditingQuarter] = useState<any>(null);
  const [semesterTitle, setSemesterTitle] = useState("");
  const [semesterStartDate, setSemesterStartDate] = useState("");
  const [semesterEndDate, setSemesterEndDate] = useState("");
  const [quarterTitle, setQuarterTitle] = useState("");
  const [quarterStartDate, setQuarterStartDate] = useState("");
  const [quarterEndDate, setQuarterEndDate] = useState("");
  const [showSemesterDatePicker, setShowSemesterDatePicker] = useState<'start' | 'end' | null>(null);
  const [showQuarterDatePicker, setShowQuarterDatePicker] = useState<'start' | 'end' | null>(null);
  const [quarters, setQuarters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<any>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<any>(null);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingQuarters, setLoadingQuarters] = useState(false);
  const [showSemesterPicker, setShowSemesterPicker] = useState(false);
  const [showQuarterPicker, setShowQuarterPicker] = useState(false);
  const [isSavingSemester, setIsSavingSemester] = useState(false);
  const [showQuartersModal, setShowQuartersModal] = useState(false);
  const [semesterQuarters, setSemesterQuarters] = useState<any[]>([]);
  const [loadingSemesterQuarters, setLoadingSemesterQuarters] = useState(false);
  const [showChaptersForQuarterModal, setShowChaptersForQuarterModal] =
    useState(false);
  const [chaptersForQuarter, setChaptersForQuarter] = useState<any[]>([]);
  const [loadingChaptersForQuarter, setLoadingChaptersForQuarter] =
    useState(false);
  const [chaptersMessage, setChaptersMessage] = useState("");
  const [selectedQuarterId, setSelectedQuarterId] = useState<string | null>(
    null
  );
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const [showChaptersModal, setShowChaptersModal] = useState(false);
  const [chaptersForSelectedQuarter, setChaptersForSelectedQuarter] = useState<
    any[]
  >([]);
  const [
    loadingChaptersForSelectedQuarter,
    setLoadingChaptersForSelectedQuarter,
  ] = useState(false);
  const [
    chaptersMessageForSelectedQuarter,
    setChaptersMessageForSelectedQuarter,
  ] = useState("");
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [showAssessmentDetailsModal, setShowAssessmentDetailsModal] =
    useState(false);
  const [selectedAssessmentForModal, setSelectedAssessmentForModal] =
    useState<any>(null);
  const [expandedMcq, setExpandedMcq] = useState<{ [key: number]: boolean }>({ 0: true, });


  // Edit assessment modal states
  const [showEditAssessmentModal, setShowEditAssessmentModal] = useState(false);
  const [editAssessmentLoading, setEditAssessmentLoading] = useState(false);
  const [editAssessmentTitle, setEditAssessmentTitle] = useState("");
  const [editAssessmentDescription, setEditAssessmentDescription] =
    useState("");
  const [editAssessmentCategory, setEditAssessmentCategory] = useState("");
  const [editAssessmentDueDate, setEditAssessmentDueDate] =
    useState<Date | null>(null);


  const [showEditCategoryMenu, setShowEditCategoryMenu] = useState(false);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [showEditTimePicker, setShowEditTimePicker] = useState(false);
  const [tempEditDate, setTempEditDate] = useState<Date | null>(null);
  const [editQuarterDates, setEditQuarterDates] = useState<{ startDate: string, endDate: string } | null>(null);
  const [editQuarterId, setEditQuarterId] = useState<string | null>(null);

  const [showGradebookModal, setShowGradebookModal] = useState(false);
  const [gradebookLoading, setGradebookLoading] = useState(false);
  const [gradebookData, setGradebookData] = useState<any>(null);
  const [gradebookError, setGradebookError] = useState<string | null>(null);
  const [expandedGradebookStudent, setExpandedGradebookStudent] = useState<
    string | null
  >(null);

  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editCourseLoading, setEditCourseLoading] = useState(false);
  const [editCourseError, setEditCourseError] = useState<string | null>(null);
  const [editCourseTitle, setEditCourseTitle] = useState("");
  const [editCoursePrice, setEditCoursePrice] = useState("");
  const [editCourseCategory, setEditCourseCategory] = useState("");
  const [editCourseSubcategory, setEditCourseSubcategory] = useState("");
  const [editCourseLanguage, setEditCourseLanguage] = useState("");
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [editCourseDescription, setEditCourseDescription] = useState("");
  const [editTeachingPoints, setEditTeachingPoints] = useState<string[]>([]);
  const [editRequirements, setEditRequirements] = useState<string[]>([]);

  // Chapter details modal states
  const [showChapterDetailsModal, setShowChapterDetailsModal] = useState(false);
  const [chapterDetails, setChapterDetails] = useState<any>(null);
  const [chapterDetailsLoading, setChapterDetailsLoading] = useState(false);
  const [chapterDetailsError, setChapterDetailsError] = useState<string | null>(
    null
  );

  // Lesson creation modal states
  const [showLessonCreationModal, setShowLessonCreationModal] = useState(false);
  const [lessonCreationTitle, setLessonCreationTitle] = useState("");
  const [lessonCreationDescription, setLessonCreationDescription] =
    useState("");
  const [lessonCreationYoutubeLink, setLessonCreationYoutubeLink] =
    useState("");
  const [lessonCreationOtherLink, setLessonCreationOtherLink] = useState("");
  const [lessonCreationFiles, setLessonCreationFiles] = useState<any[]>([]);
  const [lessonCreationLoading, setLessonCreationLoading] = useState(false);
  const [lessonCreationError, setLessonCreationError] = useState<string | null>(
    null
  );
  const [currentChapterForLesson, setCurrentChapterForLesson] = useState<
    string | null
  >(null);

  // Lesson edit modal states
  const [showLessonEditModal, setShowLessonEditModal] = useState(false);
  const [lessonEditTitle, setLessonEditTitle] = useState("");
  const [lessonEditDescription, setLessonEditDescription] = useState("");
  const [lessonEditYoutubeLink, setLessonEditYoutubeLink] = useState("");
  const [lessonEditOtherLink, setLessonEditOtherLink] = useState("");
  const [lessonEditLoading, setLessonEditLoading] = useState(false);
  const [lessonEditError, setLessonEditError] = useState<string | null>(null);
  const [currentLessonForEdit, setCurrentLessonForEdit] = useState<
    string | null
  >(null);

  // Add files modal states
  const [showAddFilesModal, setShowAddFilesModal] = useState(false);
  const [addFilesLoading, setAddFilesLoading] = useState(false);
  const [addFilesError, setAddFilesError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [totalFileSize, setTotalFileSize] = useState(0);

  // Edit chapter modal states
  const [showEditChapterModal, setShowEditChapterModal] = useState(false);
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editChapterDescription, setEditChapterDescription] = useState("");
  const [editChapterLoading, setEditChapterLoading] = useState(false);
  const [editChapterError, setEditChapterError] = useState<string | null>(null);
  const [currentChapterForEdit, setCurrentChapterForEdit] = useState<
    string | null
  >(null);

  // Dropdown and new modal states
  const [showPlusDropdown, setShowPlusDropdown] = useState(false);
  const [showLessonsPlusDropdown, setShowLessonsPlusDropdown] = useState(false);
  const [currentLessonForAssessment, setCurrentLessonForAssessment] =
    useState<any>(null);
  const [showAddAssessmentModal, setShowAddAssessmentModal] = useState(false);
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set())
  const [expandedSemesters, setExpandedSemesters] = useState<Set<string>>(new Set())
  const [expandedQuarters, setExpandedQuarters] = useState<Set<string>>(new Set())
  const [showMore, setShowMore] = useState(false);
  const isLong = course?.courseDescription && course.courseDescription.length > 500;
  const courseDescription = course?.courseDescription && (showMore
    ? course.courseDescription
    : course.courseDescription.slice(0, 500) + (isLong ? "..." : ""))
  const [showGradeScaleManagement, setShowGradeScaleManagement] = useState(false)
  const [showGradeScaleManagementLoader, setShowGradeScaleManagementLoader] = useState(false)
  const [showGPAManagement, setShowGPAManagement] = useState(false)
  const [showGPAManagementLoader, setShowGPAManagementLoader] = useState(false)
  const [gradeScale, setGradeScale] = useState([])
  const [GPA, setGPA] = useState([])
  const [keyboardPadding,setKeyboardPadding] = useState(16)
  const formatDateWithOrdinal = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getUTCDate();
    const month = date.toLocaleDateString("en-US", {
      month: "long",
      timeZone: "UTC",
    });
    const year = date.getUTCFullYear();
    const getOrdinal = (d: number) => {
      if (d > 3 && d < 21) return "th";
      switch (d % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };
    return `${month} ${day}${getOrdinal(day)}, ${year}`;
  };
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardPadding(17);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardPadding(16);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    console.log("Fetching course details for:", courseId);
    getCourseDetails(courseId)
      .then((res) => {
        console.log(res, 'Course details')
        setCourse(res.course)
      })
      .catch(() => setError("Failed to load course details."))
      .finally(() => setLoading(false));
    console.log("Course details fetched:", course);
  }, [courseId]);

  useEffect(() => {
    if (showAddSemesterModal) {
      const fetchSemesters = async () => {
        try {
          setLoadingSemesters(true);
          const res = await getSemesters();
          setAllSemesters(res.semesters || []);
        } catch (error: any) {
          console.error(error)
          Toast.show(error.message || "Failed to fetch semesters.", Toast.LONG);
        } finally {
          setLoadingSemesters(false);
        }
      };
      fetchSemesters();
    }
  }, [showAddSemesterModal]);

  useEffect(() => {
    if (showGradingPeriodsModal && courseId) {
      fetchGradingPeriods();
    }
  }, [showGradingPeriodsModal, courseId]);
  const fetchCourseDetails = async () => {
    setError(null);
    getCourseDetails(courseId)
      .then((res) => setCourse(res.course))
      .catch(() => setError("Failed to load course details."))
      .finally(() => setLoading(false));
  }
  const fetchGradingPeriods = async () => {
    setLoadingGradingPeriods(true);
    try {
      const res = await getSemestersOfCourse(courseId);
      setGradingPeriods(res.semesters || []);
    } catch (error: any) {
      console.error(error);
      Toast.show(error.message || "Failed to fetch grading periods.", Toast.LONG);
    } finally {
      setLoadingGradingPeriods(false);
    }
  };

  useEffect(() => {
    if (course?._id) {
      fetchRatingAndComments();
    }
  }, [course?._id]);

  // Refresh chapter details when returning to the page (e.g., after creating an assessment)
  // useFocusEffect(
  //   React.useCallback(() => {
  //     if (chapterDetails?._id) {
  //       handleViewChapterDetails(chapterDetails._id);
  //     }
  //   }, [])
  // );

  const fetchRatingAndComments = async () => {
    setCommentsLoading(true);
    try {
      const ratingRes = await getCourseRating(course._id);
      if (ratingRes) {
        setAverageRating(ratingRes.averageStar || 0);
        setRatingCount(ratingRes.count || 0);
      }
      const commentsRes = await getComments(course._id);
      if (commentsRes && commentsRes.comments) {
        setComments(commentsRes.comments);
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setCommentsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!comment.trim()) return;
    setIsSubmittingComment(true);
    try {
      const response = await sendComment(course._id, comment.trim());
      if (response.comment) {
        setComments((prev) => [response.comment, ...prev]);
        setComment("");
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSemesterSelect = async (semester: any) => {
    setSelectedSemester(semester);
    setSelectedQuarter(null);
    setQuarters([]);
    setShowSemesterPicker(false);
    try {
      setLoadingQuarters(true);
      const res = await getQuartersBySemesters([semester._id]);
      setQuarters(res.quarters || []);
    } catch (error: any) {
      Toast.show(error.message || "Failed to fetch quarters.", Toast.LONG);
    } finally {
      setLoadingQuarters(false);
    }
  };

  const handleQuarterSelect = (quarter: any) => {
    setSelectedQuarter(quarter);
    setShowQuarterPicker(false);
  };

  const handleAddSemesterToCourse = async () => {
    if (!selectedSemester || !selectedQuarter) {
      Toast.show("Please select both a semester and a quarter.", Toast.LONG);
      return;
    }
    try {
      setIsSavingSemester(true);
      await addSemesterToCourse(
        courseId,
        selectedSemester._id,
        selectedQuarter._id
      );
      Toast.show(
        "Semester and quarter have been added to the course.",
        Toast.LONG
      );
      setShowAddSemesterModal(false);
      setSelectedSemester(null);
      setSelectedQuarter(null);
      // Refetch course details
      setLoading(true);
      getCourseDetails(courseId)
        .then((res) => setCourse(res.course))
        .catch(() => setError("Failed to load course details."))
        .finally(() => setLoading(false));
    } catch (error: any) {
      Toast.show(
        error.message || "Failed to add semester to course.",
        Toast.LONG
      );
    } finally {
      setIsSavingSemester(false);
    }
  };

  const handleSemesterPress = async (semester: any) => {
    setShowQuartersModal(true);
    try {
      setLoadingSemesterQuarters(true);
      const res = await getQuartersForSemester(semester._id);
          // If the course's semester object already contains associated quarters,
      // filter the fetched quarters to only those that belong to this course.
      const fetchedQuarters: any[] = res.quarters || [];
      const assignedQuarterIds: string[] = Array.isArray(course?.quarter)
        ? course.quarter
          .map((q: any) => q?._id || q?.quarterId || q?.quarter || q)
          .filter(Boolean)
        : [];
      console.log(course?.quarter, assignedQuarterIds);
      const quartersToShow = assignedQuarterIds.length > 0
        ? fetchedQuarters.filter((q: any) => assignedQuarterIds.includes(q._id))
        : fetchedQuarters;
      console.log(quartersToShow);

      setSemesterQuarters(quartersToShow);
    } catch (error: any) {
      Toast.show(error.message || "Failed to fetch quarters.", Toast.LONG);
    } finally {
      setLoadingSemesterQuarters(false);
    }
  };
  const handleChapterPress = async () => {
    setExpandedChapter(null);
    setShowChaptersForQuarterModal(true);
    await refreshChaptersForCourse(courseId);
  };
  const refreshChaptersForCourse = async (courseId: string) => {
    setLoadingChaptersForQuarter(true);
    setChaptersForQuarter([]);
    setChaptersMessage("");
    try {
      const res = await getChaptersForCourses(courseId);
      console.log(res)
      if (res.chapters && res.chapters.length > 0) {
        setChaptersForQuarter(res.chapters);
        
      } else {
        setChaptersMessage( "No chapters found.");
      }
    } catch (error: any) {
      Toast.show(error.message || "Failed to fetch chapters.", Toast.LONG);
      setChaptersMessage("Failed to fetch chapters.");
    } finally {
      setLoadingChaptersForQuarter(false);
    }
  };
  const refreshChaptersForQuarter = async (quarterId: string) => {
    setLoadingChaptersForQuarter(true);
    setChaptersForQuarter([]);
    setChaptersMessage("");
    try {
      const res = await getChaptersByQuarter(courseId, quarterId);
      if (res.chapters && res.chapters.length > 0) {
        setChaptersForQuarter(res.chapters);
      } else {
        setChaptersMessage("No chapters found.");
      }
    } catch (error: any) {
      Toast.show(error.message || "Failed to fetch chapters.", Toast.LONG);
      setChaptersMessage("Failed to fetch chapters.");
    } finally {
      setLoadingChaptersForQuarter(false);
    }
  };

  const handleQuarterCardPress = async (quarter: any) => {
    setExpandedChapter(null);
    setSelectedQuarterId(quarter._id);
    setShowQuartersModal(false);
    setShowChaptersForQuarterModal(true);
    await refreshChaptersForQuarter(quarter._id);
  };

  useEffect(() => {
    if (showManageCategoriesModal) {
      fetchAssessmentCategories();
    }
  }, [showManageCategoriesModal]);

  const fetchAssessmentCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await getAssessmentCategories(courseId);
      setAssessmentCategories(
        response.categories.map((category: any) => ({
          id: category._id,
          title: category.name,
          weight: category.weight.toString(),
        }))
      );
    } catch (error: any) {
      Toast.show(
        error.message || "Failed to fetch assessment categories",
        Toast.LONG
      );
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleWeightChange = (text: string, categoryId: string) => {
    const updatedCategories = assessmentCategories.map((cat) => {
      if (cat.id === categoryId) {
        return { ...cat, weight: text };
      }
      return cat;
    });
    setAssessmentCategories(updatedCategories);
  };

  const handleUpdateCategory = async (category: any) => {
    try {
      const weight = parseFloat(category.weight);
      if (isNaN(weight) || weight <= 0) {
        Toast.show("Weight must be a number greater than 0.", Toast.LONG);
        return;
      }
      await updateAssessmentCategory(courseId, category.id, weight);
      Toast.show("Category updated successfully.", Toast.LONG);
      fetchAssessmentCategories();
    } catch (error: any) {
      Toast.show(error.message || "Failed to update category.", Toast.LONG);
    }
  };

  const handleDeleteCategory = (category: any) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAssessmentCategory(category.id);
              Toast.show("Category deleted successfully.", Toast.LONG);
              setAssessmentCategories((prev) =>
                prev.filter((cat) => cat.id !== category.id)
              );
            } catch (error: any) {
              Toast.show(
                error.message || "Failed to delete category.",
                Toast.LONG
              );
            }
          },
        },
      ]
    );
  };

  const handleAddNewCategory = async () => {
    if (!newAssessmentCategoryName.trim()) {
      Toast.show("Category name is required.", Toast.LONG);
      return;
    }
    const weight = parseFloat(newAssessmentCategoryWeight);
    if (isNaN(weight) || weight <= 0) {
      Toast.show("Weight must be a positive number.", Toast.LONG);
      return;
    }
    try {
      setCreatingCategory(true);
      await createAssessmentCategory(
        courseId,
        newAssessmentCategoryName.trim(),
        weight
      );
      Toast.show("Category added successfully.", Toast.LONG);
      setNewAssessmentCategoryName("");
      setNewAssessmentCategoryWeight("");
      fetchAssessmentCategories();
    } catch (error: any) {
      Toast.show(error.message || "Failed to add category.", Toast.LONG);
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteCourse(courseId);
      setShowDeleteModal(false);
      navigation.navigate("Main" as never);
    } catch (error: any) {
      Toast.show(error.message || "Failed to delete course", Toast.LONG);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveCourse = async () => {
    try {
      await archiveCourse(courseId);
      setShowArchiveModal(false);
      Toast.show("Course archived successfully", Toast.LONG);
      // Navigate to MyCourses after archiving
      navigation.navigate("Main" as never);
    } catch (error: any) {
      console.error("Archive course error:", error);
      Alert.alert("Error", error.message || "Failed to archive course");
    }
  };

  const handleUnarchiveCourse = async () => {
    try {
      await unarchiveCourse(courseId);
      setShowUnarchiveModal(false);
      Toast.show("Course unarchived successfully", Toast.LONG);
      // Navigate to MyCourses after unarchiving
      navigation.navigate("Main" as never);
    } catch (error: any) {
      console.error("Unarchive course error:", error);
      Alert.alert("Error", error.message || "Failed to unarchive course");
    }
  };

  const handleDeleteAssessment = async () => {
    if (!assessmentToDelete) return;
    setDeleteAssessmentError(null);
    setDeleteAssessmentLoading(true);
    try {
      await deleteAssessment(assessmentToDelete._id);
      Toast.show("Assessment deleted successfully.", Toast.LONG);
      setShowDeleteAssessmentModal(false);
      setAssessmentToDelete(null);

      // Refresh chapter details if we're in the chapter details modal
      if (chapterDetails && chapterDetails._id) {
        try {
          const response = await getChapterDetailsWithLessons(
            chapterDetails._id
          );
          setChapterDetails(response.chapter);
        } catch (error) {
          console.error("Error refreshing chapter details:", error);
        }
      }

      // Also refresh chapters for quarter
      if (selectedQuarterId) {
        await refreshChaptersForQuarter(selectedQuarterId);
      }
    } catch (err: any) {
      setDeleteAssessmentError(err.message || "Failed to delete assessment.");
    } finally {
      setDeleteAssessmentLoading(false);
    }
  };

  const handleDeleteAssessmentDirect = async (assessmentId: string) => {
    try {
      await deleteAssessment(assessmentId);
      Toast.show("Assessment deleted successfully.", Toast.LONG);

      // Refresh chapter details if we're in the chapter details modal
      if (chapterDetails && chapterDetails._id) {
        try {
          const response = await getChapterDetailsWithLessons(
            chapterDetails._id
          );
          setChapterDetails(response.chapter);
        } catch (error) {
          console.error("Error refreshing chapter details:", error);
        }
      }

      // Also refresh chapters for quarter
      if (selectedQuarterId) {
        await refreshChaptersForQuarter(selectedQuarterId);
      }
    } catch (err: any) {
      console.error("Error deleting assessment:", err);
      Toast.show(err.message || "Failed to delete assessment.", Toast.LONG);
    }
  };

  const handleEditAssessment = async () => {
    if (!selectedAssessmentForModal) return;

    if (
      !editAssessmentTitle.trim() ||
      !editAssessmentDescription.trim() ||
      !editAssessmentCategory ||
      !editAssessmentDueDate
    ) {
      Toast.show("All fields are required", Toast.LONG);
      return;
    }
    if (editAssessmentDueDate && editQuarterDates) {
      const dueDateTimestamp = editAssessmentDueDate.getTime();
      const quarterStartTimestamp = new Date(editQuarterDates.startDate).getTime();
      const quarterEndTimestamp = new Date(editQuarterDates.endDate).getTime();

      if (dueDateTimestamp < quarterStartTimestamp || dueDateTimestamp > quarterEndTimestamp) {
        Toast.show(
          `Due date must be between ${formatDate(new Date(editQuarterDates.startDate))} and ${formatDate(new Date(editQuarterDates.endDate))}`,
          Toast.LONG
        );
        return;
      }
    }

    try {
      setEditAssessmentLoading(true);
      const payload = {
        title: editAssessmentTitle.trim(),
        description: editAssessmentDescription.trim(),
        category: editAssessmentCategory,
        dueDate: editAssessmentDueDate.toISOString(),
      };

      const res = await editAssessment(selectedAssessmentForModal._id, payload);
      Toast.show("Assessment updated successfully", Toast.LONG);

      // Close modals and refresh data
      setShowEditAssessmentModal(false);
      setShowAssessmentDetailsModal(true)
      // setShowAssessmentDetailsModal(false);

      // Refresh chapter details if we're in the chapter details modal
      if (chapterDetails && chapterDetails._id) {
        try {
          const response = await getChapterDetailsWithLessons(
            chapterDetails._id
          );
          setChapterDetails(response.chapter);
          setSelectedAssessmentForModal((prev:any)=>response.chapter.chapter_assessments.find((assessment:any)=>assessment._id ===prev._id ))
        } catch (error) {
          console.error("Error refreshing chapter details:", error);
        }
      }

      // Also refresh chapters for quarter
      if (selectedQuarterId) {
        await refreshChaptersForQuarter(selectedQuarterId);
      }
    } catch (err: any) {
      Toast.show(err.message || "Failed to update assessment", Toast.LONG);
    } finally {
      setEditAssessmentLoading(false);
    }
  };

  const fetchQuarterDatesForEdit = async (quarterId: string) => {
    try {
      const api = await createApiInstance();
      addAuthInterceptor(api);
      const response = await api.get(`/api/quarter/getDatesofQuarter/${quarterId}`);
      setEditQuarterDates({
        startDate: response.data.startDate,
        endDate: response.data.endDate
      });
    } catch (error) {
      console.error('Error fetching quarter dates:', error);
      // Don't show error toast as this is not critical
    }
  };

  const openEditAssessmentModal = async (assessment: any) => {
    setSelectedAssessmentForModal(assessment);
    setEditAssessmentTitle(assessment.title);
    setEditAssessmentDescription(assessment.description);
    setEditAssessmentCategory(assessment.category?._id || "");

    // Parse due date
    if (assessment.dueDate?.date) {
      const dueDate = new Date(assessment.dueDate.date);
      if (assessment.dueDate.time) {
        const [hours, minutes] = assessment.dueDate.time.split(":");
        dueDate.setHours(parseInt(hours), parseInt(minutes));
      }
      setEditAssessmentDueDate(dueDate);
    }

    // Fetch assessment categories
    try {
      const response = await getAssessmentCategories(courseId);
      setAssessmentCategories(
        response.categories.map((category: any) => ({
          id: category._id,
          title: category.name,
          weight: category.weight.toString(),
        }))
      );
    } catch (error) {
      console.error('Error fetching assessment categories:', error);
    }

    // Get quarter ID and fetch quarter dates
    const quarterId = assessment.quarter || chapterDetails?.quarter || selectedQuarterId;
    if (quarterId) {
      setEditQuarterId(quarterId);
      await fetchQuarterDatesForEdit(quarterId);
    }
    setShowAssessmentDetailsModal(false)
    setShowEditAssessmentModal(true);
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      await deletePage(pageId);
      Toast.show("Page deleted successfully.", Toast.LONG);

      // Refresh chapter details if we're in the chapter details modal
      if (chapterDetails && chapterDetails._id) {
        try {
          const response = await getChapterDetailsWithLessons(
            chapterDetails._id
          );
          setChapterDetails(response.chapter);
        } catch (error) {
          console.error("Error refreshing chapter details:", error);
        }
      }

      // Also refresh chapters for quarter
      if (selectedQuarterId) {
        await refreshChaptersForQuarter(selectedQuarterId);
      }
    } catch (err: any) {
      console.error("Error deleting page:", err);
      Toast.show(err.message || "Failed to delete page.", Toast.LONG);
    }
  };

  const handleDeleteLesson = async () => {
    let quarterId = selectedQuarterId;
    // Try to get quarterId from lessonToDelete if not set
    if (!quarterId && lessonToDelete && lessonToDelete.quarterId) {
      quarterId = lessonToDelete.quarterId;
    }
    if (!lessonToDelete || !quarterId) {
      Toast.show("Could not delete lesson: missing data.", Toast.LONG);
      return;
    }

    setDeleteLessonError(null);
    setDeleteLessonLoading(true);
    try {
      await deleteLesson(lessonToDelete._id);
      setShowDeleteLessonModal(false);
      setLessonToDelete(null);
      Toast.show("Lesson deleted successfully.", Toast.LONG);
      await refreshChaptersForQuarter(quarterId);
    } catch (err: any) {
      setDeleteLessonError(err.message || "Failed to delete lesson.");
    } finally {
      setDeleteLessonLoading(false);
    }
  };

  const handleChapterSelect = (chapterId: string) => {
    setCurrentChapterId(chapterId);
    setCurrentChapterForLesson(chapterId);
    setShowLessonCreationModal(true);
  };

  const handleViewChapterDetails = async (chapterId: string) => {
    try {
      // Close the chapters modal first
      setShowChaptersForQuarterModal(false);
      setShowChapterDetailsModal(true);
      setChapterDetailsLoading(true);
      setChapterDetailsError(null);
      const response = await getChapterDetailsWithLessons(chapterId);
      console.log("Chapter details response:", response);
      console.log(
        "Chapter assessments:",
        response.chapter?.chapter_assessments
      );
      setChapterDetails(response.chapter);
      setCurrentChapterForLesson(chapterId);
    } catch (error: any) {
      console.error("Error fetching chapter details:", error);
      setChapterDetailsError(
        error.message || "Failed to fetch chapter details"
      );
    } finally {
      setChapterDetailsLoading(false);
    }
  };

  const handleAddLesson = () => {
    if (chapterDetails) {
      setCurrentChapterForLesson(chapterDetails._id);
      // Close chapter details modal first
      setShowChapterDetailsModal(false);
      // Then open lesson creation modal
      setShowLessonCreationModal(true);
    }
  };

  // Dropdown handlers
  const handlePlusButtonPress = () => {
    setShowPlusDropdown(!showPlusDropdown);
  };

  const handleLessonsPlusButtonPress = (lesson: any) => {
    setCurrentLessonForAssessment(lesson);
    setShowLessonsPlusDropdown(!showLessonsPlusDropdown);
  };

  const handleDropdownOption = (option: string) => {
    setShowPlusDropdown(false);

    switch (option) {
      case "lesson":
        handleAddLesson();
        break;
      case "assessment":
        // Close any open modals and navigate to CreateAssessmentPage
        setShowAddAssessmentModal(false);
        // setShowChapterDetailsModal(false);
        if (chapterDetails ) {
          // Find semester ID from the quarter data
          const semesterId =
            selectedQuarter?.semester || course?.semester?.[0]?._id;
          navigation.navigate("CreateAssessment", {
            courseId: courseId,
            chapterId: chapterDetails._id,
            semesterId: semesterId || "",
            quarterId: selectedQuarterId,
            
            refreshAssessments: () => { handleViewChapterDetails(chapterDetails._id) },
          });
        } else {
          Toast.show("Please select a chapter and quarter first", Toast.LONG);
        }
        break;
      case "page":
        // Navigate to Chapter Pages view
        console.log('helllo',chapterDetails,course?._id)
        if (chapterDetails && course?._id) {
          setShowChapterDetailsModal(false);
          (navigation as any).navigate("ChapterPages", {
            courseId: course._id,
            chapterId: chapterDetails._id,
            navigateBack:()=>{
              navigation.goBack()
              setShowChapterDetailsModal(true)
            }
          });
        } else {
          Toast.show("Please open a chapter first", Toast.LONG);
        }
        break;
      case "discussion":
        if (chapterDetails) {
          setShowChapterDetailsModal(false);
          (navigation as any).navigate("ChapterDiscussions", {
            chapterId: chapterDetails._id,
            courseId: course._id,
            semesterId: selectedQuarter?.semester || course?.semester?.[0]?._id,
            quarterId: selectedQuarterId || undefined,
            navigateBack:()=>{
              navigation.goBack()
              setShowChapterDetailsModal(true)
            }
          });
        } else {
          Toast.show("Please open a chapter first", Toast.LONG);
        }
        break;
    }
  };

  const handleLessonsDropdownOption = (option: string) => {
    setShowLessonsPlusDropdown(false);

    switch (option) {
      case "assessment":
        // Close any open modals and navigate to CreateAssessmentPage
        setShowAddAssessmentModal(false);
        // setShowChapterDetailsModal(false);
        if (currentLessonForAssessment  || selectedQuarterId) {
          // Find semester ID from the quarter data
          const semesterId =
            selectedQuarter?.semester || course?.semester?.[0]?._id;
          (navigation as any).navigate("CreateAssessment", {
            courseId: courseId,
            chapterId: chapterDetails._id,
            lessonId: currentLessonForAssessment._id, // Pass lesson ID instead of chapter ID
            semesterId: semesterId || "",
            quarterId: selectedQuarterId,
            refreshAssessments: () => { handleViewChapterDetails(chapterDetails._id) },
          });
        } else {
          Toast.show("Please select a lesson and quarter first", Toast.LONG);
        }
        break;
      case "page":
        if (currentLessonForAssessment && course?._id) {
          // setShowChapterDetailsModal(false);
          (navigation as any).navigate("ChapterPages", {
            courseId: course._id,
            chapterId: chapterDetails._id,
            lessonId: currentLessonForAssessment._id,
          });
        } else {
          Toast.show("Please select a lesson first", Toast.LONG);
        }
        break;
      case "discussion":
        if (chapterDetails && currentLessonForAssessment) {
          // setShowChapterDetailsModal(false);
          (navigation as any).navigate("ChapterDiscussions", {
            chapterId: chapterDetails._id,
            courseId: course._id,
            semesterId: selectedQuarter?.semester || course?.semester?.[0]?._id,
            quarterId: selectedQuarterId || undefined,
            lessonId: currentLessonForAssessment._id,
          });
        } else {
          Toast.show("Please select a lesson first", Toast.LONG);
        }
        break;
    }
  };

  const handleEditChapter = () => {
    if (chapterDetails) {
      setEditChapterTitle(chapterDetails.title);
      setEditChapterDescription(chapterDetails.description);
      setCurrentChapterForEdit(chapterDetails._id);
      // Close chapter details modal first
      setShowChapterDetailsModal(false);
      // Then open edit modal
      setShowEditChapterModal(true);
    }
  };

  const handleUpdateChapter = async () => {
    if (!editChapterTitle.trim() || !editChapterDescription.trim()) {
      Toast.show("Chapter title and description are required", Toast.LONG);
      return;
    }

    if (!currentChapterForEdit) {
      Toast.show("Chapter not found", Toast.LONG);
      return;
    }

    try {
      setEditChapterLoading(true);
      setEditChapterError(null);

      await editChapter(
        currentChapterForEdit,
        editChapterTitle,
        editChapterDescription
      );

      Toast.show("Chapter updated successfully", Toast.LONG);

      // Close edit modal
      setShowEditChapterModal(false);

      // Refresh chapter details to show the updated data
      const updatedResponse = await getChapterDetailsWithLessons(
        currentChapterForEdit
      );
      setChapterDetails(updatedResponse.chapter);

      // Reopen chapter details modal to show updated data
      setShowChapterDetailsModal(true);
    } catch (error: any) {
      console.error("Error updating chapter:", error);
      setEditChapterError(error.message || "Failed to update chapter");
    } finally {
      setEditChapterLoading(false);
    }
  };

  const handleFilePickForLessonCreation = async () => {
    try {
      const result = await pick({
        type: [types.pdf],
        copyTo: "cachesDirectory",
      });

      if (result && result.length > 0) {
        const file = result[0];
        const fileSizeMB = file.size ? file.size / (1024 * 1024) : 0;

        if (fileSizeMB > 5) {
          Toast.show("File size must be less than 5MB", Toast.LONG);
          return;
        }

        setLessonCreationFiles((prev) => [
          ...prev,
          {
            uri: file.uri,
            name: file.name || file.uri.split("/").pop(),
            type: "application/pdf",
            size: file.size,
          },
        ]);
      }
    } catch (error) {
      // console.error("Error picking file:", error);
      // Toast.show("Error picking file", Toast.LONG);
    }
  };

  const handleRemoveFile = (index: number) => {
    setLessonCreationFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateLesson = async () => {
    if (!lessonCreationTitle.trim() || !lessonCreationDescription.trim()) {
      Toast.show("Lesson title and description are required", Toast.LONG);
      return;
    }

    if (!currentChapterForLesson) {
      Toast.show("Chapter not found", Toast.LONG);
      return;
    }

    try {
      setLessonCreationLoading(true);
      setLessonCreationError(null);

      const response = await createLesson(
        currentChapterForLesson,
        lessonCreationTitle,
        lessonCreationDescription,
        lessonCreationYoutubeLink,
        lessonCreationOtherLink,
        lessonCreationFiles
      );

      Toast.show("Lesson created successfully", Toast.LONG);

      // Reset form
      setLessonCreationTitle("");
      setLessonCreationDescription("");
      setLessonCreationYoutubeLink("");
      setLessonCreationOtherLink("");
      setLessonCreationFiles([]);

      // Close lesson creation modal
      setShowLessonCreationModal(false);

      // Refresh chapter details to show the new lesson
      const updatedResponse = await getChapterDetailsWithLessons(
        currentChapterForLesson
      );
      setChapterDetails(updatedResponse.chapter);

      // Reopen chapter details modal to show the updated data
      setShowChapterDetailsModal(true);
    } catch (error: any) {
      console.error("Error creating lesson:", error);
      setLessonCreationError(error.message || "Failed to create lesson");
    } finally {
      setLessonCreationLoading(false);
    }
  };

  const handleEditLesson = (lesson: any) => {
    setLessonEditTitle(lesson.title);
    setLessonEditDescription(lesson.description);
    setLessonEditYoutubeLink(lesson.youtubeLinks || "");
    setLessonEditOtherLink(lesson.otherLink || "");
    setCurrentLessonForEdit(lesson._id);
    // Close chapter details modal first
    setShowChapterDetailsModal(false);
    // Then open edit modal
    setShowLessonEditModal(true);
  };

  const handleUpdateLesson = async () => {
    if (!lessonEditTitle.trim() || !lessonEditDescription.trim()) {
      Toast.show("Lesson title and description are required", Toast.LONG);
      return;
    }

    if (!currentLessonForEdit) {
      Toast.show("Lesson not found", Toast.LONG);
      return;
    }

    try {
      setLessonEditLoading(true);
      setLessonEditError(null);

      await editLesson(
        currentLessonForEdit,
        lessonEditTitle,
        lessonEditDescription,
        lessonEditYoutubeLink,
        lessonEditOtherLink
      );

      Toast.show("Lesson updated successfully", Toast.LONG);

      // Close edit modal
      setShowLessonEditModal(false);

      // Refresh chapter details to show the updated data
      if (currentChapterForLesson) {
        const updatedResponse = await getChapterDetailsWithLessons(
          currentChapterForLesson
        );
        setChapterDetails(updatedResponse.chapter);
      }

      // Reopen chapter details modal to show updated data
      setShowChapterDetailsModal(true);
    } catch (error: any) {
      console.error("Error updating lesson:", error);
      setLessonEditError(error.message || "Failed to update lesson");
    } finally {
      setLessonEditLoading(false);
    }
  };

  const handleAddFilesToLesson = (lessonId: string) => {
    setCurrentLessonForEdit(lessonId);
    setSelectedFiles([]);
    setTotalFileSize(0);
    setAddFilesError(null);
    // Close chapter details modal first
    setShowChapterDetailsModal(false);
    // Then open add files modal
    setShowAddFilesModal(true);
  };

  const handleFileSelection = (files: any[]) => {
    setSelectedFiles(files);
    const totalSize = files.reduce(
      (sum, file) => sum + (file.fileSize || 0),
      0
    );
    setTotalFileSize(totalSize);
  };

  const handleRemoveSelectedFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    const totalSize = newFiles.reduce(
      (sum, file) => sum + (file.fileSize || 0),
      0
    );
    setTotalFileSize(totalSize);
  };

  const handleFilePickForAddFiles = async () => {
    try {
      const result = await pick({
        type: [types.pdf],
        copyTo: "cachesDirectory",
      });

      if (result && result.length > 0) {
        const file = result[0];
        const fileSizeMB = file.size ? file.size / (1024 * 1024) : 0;

        if (fileSizeMB > 5) {
          Toast.show("File size must be less than 5MB", Toast.LONG);
          return;
        }

        const newFile = {
          uri: file.uri,
          fileName: file.name || file.uri.split("/").pop(),
          fileSize: file.size,
          type: "application/pdf",
        };

        const updatedFiles = [...selectedFiles, newFile];
        const totalSize = updatedFiles.reduce(
          (sum, f) => sum + (f.fileSize || 0),
          0
        );

        if (totalSize > MAX_PDF_SIZE_BYTES) {
          Toast.show(
            `Total file size cannot exceed ${MAX_PDF_SIZE_MB}MB`,
            Toast.LONG
          );
          return;
        }

        setSelectedFiles(updatedFiles);
        setTotalFileSize(totalSize);
      }
    } catch (error) {
      console.error("Error picking files:", error);
      // Toast.show("Failed to pick files. Please try again.", Toast.LONG);
    }
  };

  const handleAddFiles = async () => {
    if (selectedFiles.length === 0) {
      Toast.show("Please select files to upload", Toast.LONG);
      return;
    }

    if (totalFileSize > MAX_PDF_SIZE_BYTES) {
      Toast.show(
        `Total file size must not exceed ${MAX_PDF_SIZE_MB}MB`,
        Toast.LONG
      );
      return;
    }

    if (!currentLessonForEdit) {
      Toast.show("Lesson not found", Toast.LONG);
      return;
    }

    try {
      setAddFilesLoading(true);
      setAddFilesError(null);

      await addMoreFilesToLesson(currentLessonForEdit, selectedFiles);

      Toast.show("Files added successfully", Toast.LONG);

      // Close add files modal
      setShowAddFilesModal(false);

      // Refresh chapter details to show the updated data
      if (currentChapterForLesson) {
        const updatedResponse = await getChapterDetailsWithLessons(
          currentChapterForLesson
        );
        setChapterDetails(updatedResponse.chapter);
        // Reopen chapter details modal to show the updated data
        setShowChapterDetailsModal(true);
      }
    } catch (error: any) {
      console.error("Error adding files:", error);
      setAddFilesError(error.message || "Failed to add files");
    } finally {
      setAddFilesLoading(false);
    }
  };

  const handleDeleteFile = async (lessonId: string, fileId: string) => {
    Alert.alert(
      "Are you absolutely sure?",
      "This action cannot be undone. This will permanently delete the File.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLessonFile(lessonId, fileId);
              Toast.show("File deleted successfully", Toast.LONG);

              // Refresh chapter details to show the updated data
              if (currentChapterForLesson) {
                const updatedResponse = await getChapterDetailsWithLessons(
                  currentChapterForLesson
                );
                setChapterDetails(updatedResponse.chapter);
              }
            } catch (error: any) {
              console.error("Error deleting file:", error);
              Toast.show(error.message || "Failed to delete file", Toast.LONG);
            }
          },
        },
      ]
    );
  };

  const handleOpenLink = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const handleDeleteLessonFromChapter = async (lessonId: string) => {
    Alert.alert(
      "Are you absolutely sure?",
      "This action cannot be undone. This will permanently delete the lesson.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLesson(lessonId);
              Toast.show("Lesson deleted successfully", Toast.LONG);

              // Refresh chapter details to show the updated data
              if (currentChapterForLesson) {
                const updatedResponse = await getChapterDetailsWithLessons(
                  currentChapterForLesson
                );
                setChapterDetails(updatedResponse.chapter);
              }
            } catch (error: any) {
              console.error("Error deleting lesson:", error);
              Toast.show(
                error.message || "Failed to delete lesson",
                Toast.LONG
              );
            }
          },
        },
      ]
    );
  };

  const handleCreateChapter = async () => {
    if (!chapterTitle.trim() || !chapterDescription.trim()) {
      Toast.show("Chapter title and description are required.", Toast.LONG);
      return;
    }

    if (!selectedQuarterId) {
      setChapterError("No quarter selected to associate the chapter with.");
      return;
    }

    try {
      setChapterLoading(true);
      console.log("Creating chapter with:", {
        courseId,
        chapterTitle,
        chapterDescription,
        selectedQuarterId,
      });
      const newChapter = await createChapter(
        courseId,
        chapterTitle.trim(),
        chapterDescription.trim(),
        selectedQuarterId
      );
      console.log("Chapter created successfully:", newChapter);
      Toast.show("Chapter created successfully!", Toast.LONG);
      setChapterTitle("");
      setChapterDescription("");
      setShowCreateChapterModal(false);
      setChapterLoading(false);
      setChapterError(null);
      setChaptersForSelectedQuarter((prev) => [...prev, newChapter]);
    } catch (err: any) {
      console.error("Error creating chapter:", err);
      setChapterError(err.message || "Failed to create chapter.");
    } finally {
      setChapterLoading(false);
    }
  };

  const handleDeleteChapter = async () => {
    if (!chapterToDelete || (!selectedQuarterId && course?.semesterbased)) {
      Toast.show("Could not delete chapter: missing data.", Toast.LONG);
      return;
    }
    setDeleteChapterError(null);
    setDeleteChapterLoading(true);
    try {
      await deleteChapter(chapterToDelete._id);
      setShowDeleteChapterModal(false);
      setShowChaptersForQuarterModal(true)
      setChapterToDelete(null);
      Toast.show("Chapter deleted successfully.", Toast.LONG);
      course?.semesterbased ?
      await refreshChaptersForQuarter(selectedQuarterId!):
      await refreshChaptersForCourse(courseId)
    } catch (err: any) {
      setDeleteChapterError(err.message || "Failed to delete chapter.");
    } finally {
      setDeleteChapterLoading(false);
    }
  };

  const handleQuarterPress = async (quarterId: string) => {
    setShowChaptersModal(true);
    setLoadingChaptersForSelectedQuarter(true);
    setChaptersForSelectedQuarter([]);
    setChaptersMessageForSelectedQuarter("");
    try {
      const res = await getChaptersByQuarter(courseId, quarterId);
      if (res.chapters && res.chapters.length > 0) {
        setChaptersForSelectedQuarter(res.chapters);
      } else {
        setChaptersMessageForSelectedQuarter(
          res.message || "No chapters found."
        );
      }
    } catch (error: any) {
      Toast.show(error.message || "Failed to fetch chapters.", Toast.LONG);
      setChaptersMessageForSelectedQuarter("Failed to fetch chapters.");
    } finally {
      setLoadingChaptersForSelectedQuarter(false);
    }
  };

  const handleExpandLesson = async (lessonId: string) => {
    const isAlreadyExpanded = expandedLesson === lessonId;
    setExpandedLesson(isAlreadyExpanded ? null : lessonId);
  };

  const fetchGradebook = async () => {
    setGradebookLoading(true);
    setGradebookError(null);
    try {
      const data = await getCourseGradebook(courseId);
      setGradebookData(data);
    } catch (err: any) {
      setGradebookError(err.message || "Failed to fetch gradebook");
    } finally {
      setGradebookLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    if (!categoryId) return;
    setSubcategoriesLoading(true);
    try {
      const data = await getSubcategories(categoryId);
      setSubcategories(data.data || []);
    } catch (err: any) {
      console.error("Error fetching subcategories:", err);
      setSubcategories([]);
    } finally {
      setSubcategoriesLoading(false);
    }
  };

  const handleThumbnailUpload = () => {
    const options = {
      mediaType: "photo" as const,
      quality: 0.8 as const,
      includeBase64: false,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        uploadThumbnail(asset);
      }
    });
  };
  const loadGradeScale = async () => {
    setShowGradeScaleManagement(true)
    setShowGradeScaleManagementLoader(true)
    try {
      const res = await getGradeScale(courseId)

      setGradeScale(res)
    } catch (err: any) {
      Toast.show(err?.message || 'Failed to get gradeScale', Toast.LONG)
    }
    finally {
      setShowGradeScaleManagementLoader(false)

    }
  }



  const loadGPA = async () => {
    setShowGPAManagement(true)
    setShowGPAManagementLoader(true)
    try {
      const res = await getGPA(courseId)
      setGPA(res)
    } catch (err: any) {
      Toast.show(err?.message || 'Failed to get GPA', Toast.LONG)
    }
    finally {
      setShowGPAManagementLoader(false)
    }
  }
  const uploadThumbnail = async (thumbnail: any) => {
    setThumbnailUploading(true);
    setThumbnailError(null);

    try {
      const response = await updateCourseThumbnail(courseId, thumbnail);

      // Update the course state with new thumbnail
      setCourse((prevCourse: any) => ({
        ...prevCourse,
        thumbnail: {
          url: thumbnail.uri,
          filename: thumbnail.fileName || "thumbnail.jpg",
        },
      }));

      Toast.show("Thumbnail updated successfully!", Toast.SHORT);
    } catch (err: any) {
      setThumbnailError(err.message || "Failed to update thumbnail");
      Toast.show(err.message || "Failed to update thumbnail", Toast.LONG);
    } finally {
      setThumbnailUploading(false);
    }
  };
  const toggleStudent = (studentId: string) => {
    const newSet = new Set(expandedStudents)
    if (newSet.has(studentId)) {
      newSet.delete(studentId)
    } else {
      newSet.add(studentId)
    }
    setExpandedStudents(newSet)
  }

  const toggleSemester = (semesterId: string) => {
    const newSet = new Set(expandedSemesters)
    if (newSet.has(semesterId)) {
      newSet.delete(semesterId)
    } else {
      newSet.add(semesterId)
    }
    setExpandedSemesters(newSet)
  }

  const toggleQuarter = (quarterId: string) => {
    const newSet = new Set(expandedQuarters)
    if (newSet.has(quarterId)) {
      newSet.delete(quarterId)
    } else {
      newSet.add(quarterId)
    }
    setExpandedQuarters(newSet)
  }

  // Format date for input (dd/mm/yyyy)
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  // Parse date from dd/mm/yyyy to ISO string
  const parseDateFromInput = (dateString: string) => {
    const [day, month, year] = dateString.split('/');
    const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    return date.toISOString();
  };

  // Get last semester end date
  const getLastSemesterEndDate = () => {
    if (gradingPeriods.length === 0) return null;
    const sortedSemesters = [...gradingPeriods].sort((a, b) =>
      new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    );
    return sortedSemesters[0].endDate;
  };

  const handleCreateSemester = async () => {
    if (!semesterTitle.trim()) {
      Toast.show("Please enter a semester title", Toast.LONG);
      return;
    }
    if (!semesterStartDate || !semesterEndDate) {
      Toast.show("Please select both start and end dates", Toast.LONG);
      return;
    }

    const lastEndDate = getLastSemesterEndDate();
    if (lastEndDate) {
      const startDate = new Date(parseDateFromInput(semesterStartDate));
      const lastEnd = new Date(lastEndDate);
      if (startDate <= lastEnd) {
        Toast.show("New semester must start after the last semester ends", Toast.LONG);
        return;
      }
    }

    const start = new Date(parseDateFromInput(semesterStartDate));
    const end = new Date(parseDateFromInput(semesterEndDate));
    if (start >= end) {
      Toast.show("End date must be after start date", Toast.LONG);
      return;
    }

    try {
      await createSemester(
        courseId,
        semesterTitle,
        parseDateFromInput(semesterStartDate),
        parseDateFromInput(semesterEndDate)
      );
      Toast.show("Semester created successfully", Toast.LONG);
      setShowNewSemesterModal(false)
      setShowGradingPeriodsModal(true)
      setSemesterTitle("");
      setSemesterStartDate("");
      setSemesterEndDate("");
      fetchGradingPeriods();
      fetchCourseDetails()
    } catch (error: any) {
      Toast.show(error.message || "Failed to create semester", Toast.LONG);
    }
  };

  const handleEditSemester = async () => {
    if (!semesterTitle.trim()) {
      Toast.show("Please enter a semester title", Toast.LONG);
      return;
    }
    if (!semesterStartDate || !semesterEndDate) {
      Toast.show("Please select both start and end dates", Toast.LONG);
      return;
    }

    const start = new Date(parseDateFromInput(semesterStartDate));
    const end = new Date(parseDateFromInput(semesterEndDate));
    if (start >= end) {
      Toast.show("End date must be after start date", Toast.LONG);
      return;
    }

    try {
      await updateSemester(
        editingSemester._id,
        courseId,
        semesterTitle,
        parseDateFromInput(semesterStartDate),
        parseDateFromInput(semesterEndDate)
      );
      Toast.show("Semester updated successfully", Toast.LONG);
      setShowEditSemesterModal(false)
      setShowGradingPeriodsModal(true)
      setEditingSemester(null);
      setSemesterTitle("");
      setSemesterStartDate("");
      setSemesterEndDate("");
      fetchGradingPeriods();
      fetchCourseDetails()
    } catch (error: any) {
      Toast.show(error.message || "Failed to update semester", Toast.LONG);
    }
  };

  const handleCreateQuarter = async () => {
    if (!quarterTitle.trim()) {
      Toast.show("Please enter a quarter title", Toast.LONG);
      return;
    }
    if (!quarterStartDate || !quarterEndDate) {
      Toast.show("Please select both start and end dates", Toast.LONG);
      return;
    }

    const semesterStart = new Date(selectedSemesterForQuarter.startDate);
    const semesterEnd = new Date(selectedSemesterForQuarter.endDate);
    const quarterStart = new Date(parseDateFromInput(quarterStartDate));
    const quarterEnd = new Date(parseDateFromInput(quarterEndDate));

    if (quarterStart < semesterStart || quarterEnd > semesterEnd) {
      Toast.show("Quarter dates must be within the semester duration", Toast.LONG);
      return;
    }

    if (quarterStart >= quarterEnd) {
      Toast.show("End date must be after start date", Toast.LONG);
      return;
    }

    try {
      await createQuarter(
        selectedSemesterForQuarter._id,
        quarterTitle,
        parseDateFromInput(quarterStartDate),
        parseDateFromInput(quarterEndDate)
      );
      Toast.show("Quarter created successfully", Toast.LONG);
      setShowNewQuarterModal(false);
      setShowGradingPeriodsModal(true)
      setSelectedSemesterForQuarter(null);
      setQuarterTitle("");
      setQuarterStartDate("");
      setQuarterEndDate("");
      fetchGradingPeriods();
      fetchCourseDetails()
    } catch (error: any) {
      Toast.show(error.message || "Failed to create quarter", Toast.LONG);
    }
  };

  const handleEditQuarter = async () => {
    if (!quarterTitle.trim()) {
      Toast.show("Please enter a quarter title", Toast.LONG);
      return;
    }
    if (!quarterStartDate || !quarterEndDate) {
      Toast.show("Please select both start and end dates", Toast.LONG);
      return;
    }

    const semester = gradingPeriods.find(s =>
      s.quarters?.some((q: any) => q._id === editingQuarter._id)
    );
    if (!semester) return;

    const semesterStart = new Date(semester.startDate);
    const semesterEnd = new Date(semester.endDate);
    const quarterStart = new Date(parseDateFromInput(quarterStartDate));
    const quarterEnd = new Date(parseDateFromInput(quarterEndDate));

    if (quarterStart < semesterStart || quarterEnd > semesterEnd) {
      Toast.show("Quarter dates must be within the semester duration", Toast.LONG);
      return;
    }

    if (quarterStart >= quarterEnd) {
      Toast.show("End date must be after start date", Toast.LONG);
      return;
    }

    try {
      console.log(editingQuarter)
      await updateQuarter(
        editingQuarter._id,
        courseId,
        editingQuarter.semester,
        quarterTitle,
        parseDateFromInput(quarterStartDate),
        parseDateFromInput(quarterEndDate)
      );
      Toast.show("Quarter updated successfully", Toast.LONG);
      setShowEditQuarterModal(false)
      setShowGradingPeriodsModal(true)
      setEditingQuarter(null);
      setQuarterTitle("");
      setQuarterStartDate("");
      setQuarterEndDate("");
      fetchGradingPeriods();
      fetchCourseDetails()
    } catch (error: any) {
      Toast.show(error.message || "Failed to update quarter", Toast.LONG);
    }
  };

  const handleToggleSemesterArchive = async (semester: any) => {
    try {
      await toggleSemesterArchive(semester._id, !semester.isArchived);
      Toast.show(
        semester.isArchived ? "Semester unarchived" : "Semester archived",
        Toast.LONG
      );
      fetchGradingPeriods();
      fetchCourseDetails()
    } catch (error: any) {
      Toast.show(error.message || "Failed to update semester", Toast.LONG);
    }
  };

  const handleToggleQuarterArchive = async (quarter: any) => {
    try {
      await toggleQuarterArchive(quarter._id, !quarter.isArchived);
      Toast.show(
        quarter.isArchived ? "Quarter unarchived" : "Quarter archived",
        Toast.LONG
      );
      fetchGradingPeriods();
      fetchCourseDetails()
    } catch (error: any) {
      Toast.show(error.message || "Failed to update quarter", Toast.LONG);
    }
  };

  const openEditSemesterModal = (semester: any) => {
    setEditingSemester(semester);
    setSemesterTitle(semester.title);
    setSemesterStartDate(formatDateForInput(semester.startDate));
    setSemesterEndDate(formatDateForInput(semester.endDate));
    setShowGradingPeriodsModal(false)
    setShowEditSemesterModal(true);
  };

  const openEditQuarterModal = (quarter: any) => {
    setEditingQuarter(quarter);
    setQuarterTitle(quarter.title);
    setQuarterStartDate(formatDateForInput(quarter.startDate));
    setQuarterEndDate(formatDateForInput(quarter.endDate));
    setShowEditQuarterModal(true);
    setShowGradingPeriodsModal(false)
  };

  const openNewQuarterModal = (semester: any) => {
    setSelectedSemesterForQuarter(semester);
    setQuarterTitle("");
    setQuarterStartDate("");
    setQuarterEndDate("");
    setShowNewQuarterModal(true);
    setShowGradingPeriodsModal(false)
  };
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#66bb6a" />
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "No course found."}</Text>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: "#fff", }}
    // activeOpacity={1}
    // onPress={() => {
    //   setShowPlusDropdown(false);
    //   setShowLessonsPlusDropdown(false);
    // }}
    >
      <View
        style={{
          minHeight: 56,
          backgroundColor: "#10B144",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          elevation: 4,
          shadowColor: "#000",
          paddingTop: insets.top,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 4, marginRight: 12 }}
        >
          <SimpleIcon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text
          style={{ color: "#fff", fontSize: 20, fontWeight: "bold", flex: 1 }}
        >
          Course Details
        </Text>
      </View>

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={styles.modalText}>
              This will permanently delete the course and all related data. Are
              you sure?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteConfirmButton]}
                onPress={handleDelete}
              >
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Archive Course Modal */}
      <Modal
        visible={showArchiveModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowArchiveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <SimpleIcon
                name="warning"
                size={24}
                color="#FF6B35"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.modalTitle, { color: "#FF6B35" }]}>
                Confirm Archive
              </Text>
            </View>
            <Text style={styles.modalText}>
              Are you sure you want to archive this course? This action can be
              reversed later.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowArchiveModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#FF6B35" }]}
                onPress={handleArchiveCourse}
              >
                <Text
                  style={[styles.deleteConfirmButtonText, { color: "#fff" }]}
                >
                  Yes Archive
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Unarchive Course Modal */}
      <Modal
        visible={showUnarchiveModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUnarchiveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <SimpleIcon
                name="check-circle"
                size={24}
                color="#43a047"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.modalTitle, { color: "#43a047" }]}>
                Confirm Unarchive
              </Text>
            </View>
            <Text style={styles.modalText}>
              Are you sure you want to unarchive this course? This will make the
              course available again.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowUnarchiveModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#43a047" }]}
                onPress={handleUnarchiveCourse}
              >
                <Text
                  style={[styles.deleteConfirmButtonText, { color: "#fff" }]}
                >
                  Yes Unarchive
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCreateChapterModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setShowCreateChapterModal(false);
          setShowChaptersForQuarterModal(true);
        }}
      >
        <View style={styles.chaptersModalContainer}>
          <View style={styles.chaptersModalHeader}>
            <Text style={styles.chaptersModalTitle}>Create New Chapter</Text>
            <TouchableOpacity
              onPress={() => {
                setShowCreateChapterModal(false);
                setShowChaptersForQuarterModal(true);
              }}
            >
              <SimpleIcon name="close" size={32} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.chaptersContent}>
            <View
              style={[styles.modalContent, { width: "100%", maxWidth: "100%" }]}
            >
              <Text style={styles.createChapterModalTitle}>
                Create New Chapter
              </Text>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.createChapterInput}
                  placeholder="Chapter Title"
                  placeholderTextColor="#999"
                  value={chapterTitle}
                  onChangeText={(text) => setChapterTitle(text)}
                  maxLength={100}
                />
                <Text style={styles.charCounter}>
                  {chapterTitle.length}/100
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[
                    styles.createChapterInput,
                    { height: 120, textAlignVertical: "top" },
                  ]}
                  placeholder="Chapter Description"
                  placeholderTextColor="#999"
                  value={chapterDescription}
                  onChangeText={(text) => setChapterDescription(text)}
                  maxLength={500}
                  multiline
                />
                <Text style={styles.charCounter}>
                  {chapterDescription.length}/500
                </Text>
              </View>

              <View style={{ marginTop: 24 }}>
                <TouchableOpacity
                  style={[
                    styles.createChapterModalButton,
                    styles.createChapterModalButtonPrimary,
                  ]}
                  onPress={async () => {
                    setChapterError(null);
                    if (!chapterTitle.trim() || !chapterDescription.trim()) {
                      setChapterError(
                        "Both title and description are required."
                      );
                      return;
                    }
                    setChapterLoading(true);
                    try {
                      if (course.semesterbased && !selectedQuarterId) {
                        throw new Error(
                          "No quarter selected to associate the chapter with."
                        );
                      }
                      await createChapter(
                        courseId,
                        chapterTitle.trim(),
                        chapterDescription.trim(),
                        selectedQuarterId
                      );
                      setShowCreateChapterModal(false);
                      setChapterTitle("");
                      setChapterDescription("");
                      course?.semesterbased ?
                      await refreshChaptersForQuarter(selectedQuarterId!):
                      await refreshChaptersForCourse(courseId)
                      setShowChaptersForQuarterModal(true);
                    } catch (err: any) {
                      console.log(err);
                      setChapterError(
                        err.message || "Failed to create chapter."
                      );
                    } finally {
                      setChapterLoading(false);
                    }
                  }}
                  disabled={chapterLoading}
                >
                  {chapterLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.createChapterModalButtonTextPrimary}>
                      Create Chapter
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.createChapterModalButton,
                    styles.createChapterModalButtonSecondary,
                  ]}
                  onPress={() => {
                    setShowCreateChapterModal(false);
                    setShowChaptersForQuarterModal(true);
                  }}
                  disabled={chapterLoading}
                >
                  <Text style={styles.createChapterModalButtonTextSecondary}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
              {chapterError ? (
                <Text
                  style={{ color: "red", marginTop: 12, textAlign: "center" }}
                >
                  {chapterError}
                </Text>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showDeleteChapterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() =>{ setShowDeleteChapterModal(false)
          setShowChaptersForQuarterModal(true)
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: "90%", maxWidth: 380 }]}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#b91c1c",
                marginBottom: 12,
              }}
            >
              Are you absolutely sure?
            </Text>
            <Text style={{ color: "#444", fontSize: 16, marginBottom: 24 }}>
              This action cannot be undone. This will permanently delete the
              chapter.
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 8,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#f5f5f5",
                  paddingVertical: 14,
                  paddingHorizontal: 32,
                  borderRadius: 12,
                  marginRight: 12,
                }}
                onPress={() => {setShowDeleteChapterModal(false)
                  setShowChaptersForQuarterModal(true)
                }}
                disabled={deleteChapterLoading}
              >
                <Text
                  style={{ color: "#222", fontWeight: "bold", fontSize: 18 }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "#b91c1c",
                  paddingVertical: 14,
                  paddingHorizontal: 32,
                  borderRadius: 12,
                }}
                onPress={handleDeleteChapter}
                disabled={deleteChapterLoading}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}
                >
                  {deleteChapterLoading ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
            {deleteChapterError ? (
              <Text style={{ color: "red", marginTop: 8, textAlign: "center" }}>
                {deleteChapterError}
              </Text>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDeleteLessonModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteLessonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: "90%", maxWidth: 380 }]}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#b91c1c",
                marginBottom: 12,
              }}
            >
              Are you absolutely sure?
            </Text>
            <Text style={{ color: "#444", fontSize: 16, marginBottom: 24 }}>
              This action cannot be undone. This will permanently delete the
              lesson.
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 8,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#f5f5f5",
                  paddingVertical: 14,
                  paddingHorizontal: 32,
                  borderRadius: 12,
                  marginRight: 12,
                }}
                onPress={() => setShowDeleteLessonModal(false)}
                disabled={deleteLessonLoading}
              >
                <Text
                  style={{ color: "#222", fontWeight: "bold", fontSize: 18 }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "#b91c1c",
                  paddingVertical: 14,
                  paddingHorizontal: 32,
                  borderRadius: 12,
                }}
                onPress={handleDeleteLesson}
                disabled={deleteLessonLoading}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}
                >
                  {deleteLessonLoading ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
            {deleteLessonError ? (
              <Text style={{ color: "red", marginTop: 8, textAlign: "center" }}>
                {deleteLessonError}
              </Text>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAddNewAssessmentCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddNewAssessmentCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: "90%", maxWidth: 400 }]}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#111",
                marginBottom: 8,
              }}
            >
              Add New Topic
            </Text>
            <Text style={{ fontSize: 16, color: "#666", marginBottom: 24 }}>
              Create a new assessment category for this course.
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#333",
                marginBottom: 8,
              }}
            >
              Topic Name
            </Text>
            <TextInput
              style={[
                {
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  marginBottom: 4,
                },
                nameError && { borderColor: "#dc2626" },
              ]}
              placeholder="e.g., Midterm Exam, Quiz, Assignment"
              value={newAssessmentCategoryName}
              onChangeText={(text) => {
                setNewAssessmentCategoryName(text);
                if (!text.trim()) {
                  setNameError("Category name is required");
                } else {
                  setNameError(null);
                }
              }}
            />
            {nameError && (
              <Text
                style={{ color: "#dc2626", fontSize: 14, marginBottom: 16 }}
              >
                {nameError}
              </Text>
            )}

            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#333",
                marginBottom: 8,
              }}
            >
              Weight (%)
            </Text>
            <TextInput
              style={[
                {
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  marginBottom: 4,
                },
                weightError && { borderColor: "#dc2626" },
              ]}
              placeholder="0"
              keyboardType="numeric"
              value={newAssessmentCategoryWeight}
              onChangeText={(text) => {
                setNewAssessmentCategoryWeight(text);
                const weight = parseFloat(text);
                if (weight <= 0) {
                  setWeightError("Weight must be greater than 0");
                } else {
                  setWeightError(null);
                }
              }}
            />
            {weightError && (
              <Text
                style={{ color: "#dc2626", fontSize: 14, marginBottom: 16 }}
              >
                {weightError}
              </Text>
            )}

            <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  alignItems: "center",
                }}
                onPress={() => setShowAddNewAssessmentCategoryModal(false)}
              >
                <Text
                  style={{ color: "#333", fontWeight: "bold", fontSize: 16 }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#222",
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  alignItems: "center",
                }}
                onPress={async () => {
                  if (!newAssessmentCategoryName.trim()) {
                    setNameError("Category name is required");
                    return;
                  }
                  const weight = parseFloat(newAssessmentCategoryWeight.trim());
                  if (weight <= 0) {
                    setWeightError("Weight must be greater than 0");
                    return;
                  }

                  try {
                    setCreatingCategory(true);
                    console.log("Creating category with data:", {
                      name: newAssessmentCategoryName.trim(),
                      weight: weight,
                      courseId: courseId,
                    });

                    const response = await createAssessmentCategory(
                      courseId,
                      newAssessmentCategoryName.trim(),
                      weight
                    );

                    console.log("Server response:", response);

                    const newCategory = {
                      id: response.category._id || response.category.id,
                      title: response.category.name || response.category.title,
                      weight: response.category.weight,
                    };

                    if (!newCategory.id || !newCategory.title) {
                      throw new Error(
                        "Invalid category data received from server"
                      );
                    }

                    setAssessmentCategories([
                      ...assessmentCategories,
                      newCategory,
                    ]);
                    setNewAssessmentCategoryName("");
                    setNewAssessmentCategoryWeight("0");
                    setWeightError(null);
                    setNameError(null);
                    setShowAddNewAssessmentCategoryModal(false);
                  } catch (error: any) {
                    console.error("Error creating category:", error);
                    Toast.show(
                      error.message ||
                      "Failed to create assessment category. Please try again.",
                      Toast.LONG
                    );
                  } finally {
                    setCreatingCategory(false);
                  }
                }}
                disabled={creatingCategory}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                >
                  {creatingCategory ? "Creating..." : "Create Category"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={{ padding: keyboardPadding }}>
        <View style={styles.thumbnailContainer}>
          <Image
            source={
              course.thumbnail?.url
                ? { uri: course.thumbnail.url }
                : fallbackImage
            }
            style={styles.image}
          />
          <TouchableOpacity
            style={styles.thumbnailUploadButton}
            onPress={handleThumbnailUpload}
            disabled={thumbnailUploading}
          >
            {thumbnailUploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <SimpleIcon name="camera" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.topActionButtonsContainer}>
          <TouchableOpacity
            onPress={() => setShowManageCategoriesModal(true)}
            style={[styles.topActionButton, { backgroundColor: "#808080" }]}
          >
            <Text style={styles.topActionButtonText}>
              Manage Assessment Categories
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CourseDetailStudentPage", {
                courseId: course._id,
                fromAdmin: true,
              })
            }
            style={[
              styles.topActionButton,
              {
                backgroundColor: "#ffffff",
                borderWidth: 1,
                borderColor: "#cccccc",
              },
            ]}
          >
            <Text style={[styles.topActionButtonText, { color: "#000000" }]}>
              Preview as Student
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={loadGradeScale}
            style={[
              styles.topActionButton,
              {
                backgroundColor: "#ffffff",
                borderWidth: 1,
                borderColor: "#cccccc",
              },
            ]}
          >
            <Text style={[styles.topActionButtonText, { color: "#000000" }]}>
              Manage GradeScale
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={loadGPA}
            style={[
              styles.topActionButton,
              {
                backgroundColor: "#ffffff",
                borderWidth: 1,
                borderColor: "#cccccc",
              },
            ]}
          >
            <Text style={[styles.topActionButtonText, { color: "#000000" }]}>
              Manage GPA
            </Text>
          </TouchableOpacity>
          {course.semesterbased &&
            <TouchableOpacity
              onPress={() => setShowGradingPeriodsModal(true)}
              style={[
                styles.topActionButton,
                {
                  backgroundColor: "#ffffff",
                  borderWidth: 1,
                  borderColor: "#cccccc",
                },
              ]}
            >
              <Text style={[styles.topActionButtonText, { color: "#000000" }]}>
                Manage semesters & Quarters
              </Text>
            </TouchableOpacity>
          }


          <TouchableOpacity
            onPress={async () => {
              setShowGradebookModal(true);
              setGradebookLoading(true);
              try {
                const gradebookData = await getCourseGradebook(course._id);
                console.log("Gradebook API Response:", gradebookData);
                setGradebookData(gradebookData);
              } catch (error: any) {
                console.error("Error fetching gradebook:", error);
                setGradebookError(error.message || "Failed to fetch gradebook");
              } finally {
                setGradebookLoading(false);
              }
            }}
            style={[styles.topActionButton, { backgroundColor: "#1E293B" }]}
          >
            <Text style={styles.topActionButtonText}>Gradebook</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              setEditCourseTitle(course.courseTitle || "");
              course?.price && setEditCoursePrice(course?.price.toString())
              setEditCourseCategory(course.category?._id || "");
              setEditCourseSubcategory(course.subcategory?._id || "");
              setEditCourseLanguage(course.language || "");
              setEditCourseDescription(course.courseDescription || "");
              setEditTeachingPoints(course.teachingPoints || []);
              setEditRequirements(course.requirements || []);
              setShowEditCourseModal(true);

              // Fetch subcategories for the current category
              if (course.category?._id) {
                await fetchSubcategories(course.category._id);
              }
            }}
            style={[styles.topActionButton, { backgroundColor: "#10B144" }]}
          >
            <Text style={styles.topActionButtonText}>Edit Course</Text>
          </TouchableOpacity>

          {course?.syllabus?.url && (
            <TouchableOpacity
              onPress={() => {
                if (course.syllabus.url) {
                  Linking.openURL(course.syllabus.url).catch((err) => {
                    console.error("Failed to open syllabus:", err);
                    Alert.alert(
                      "Error",
                      "Could not open syllabus. Please try again."
                    );
                  });
                }
              }}
              style={[styles.topActionButton, { backgroundColor: "#007AFF" }]}
            >
              <Text style={styles.topActionButtonText}>Syllabus</Text>
            </TouchableOpacity>
          )}

          {course?.published === false ? (
            <TouchableOpacity
              onPress={() => setShowUnarchiveModal(true)}
              style={[styles.topActionButton, { backgroundColor: "#43a047" }]}
            >
              <Text style={styles.topActionButtonText}>Unarchive Course</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setShowArchiveModal(true)}
              style={[styles.topActionButton, { backgroundColor: "#FF6B35" }]}
            >
              <Text style={styles.topActionButtonText}>Archive Course</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.uploadedText}>
            Uploaded: {course.createdAt?.slice(0, 10)}
          </Text>
          <Text style={styles.updatedText}>
            Last Updated: {course.updatedAt?.slice(0, 10)}
          </Text>
        </View>
        <View style={{flexDirection:'row',alignItems:'center'}}>

        <Text style={[styles.title,{flex:1}]}>{course.courseTitle?.toUpperCase()}</Text>
        <Text style={{fontSize:22,color:'#10B144',lineHeight:26}}>${course?.price}</Text>
        </View>
        <Text style={styles.chapterDetailsDescription}>
          {courseDescription}
          {isLong && (
            <Text
              onPress={() => setShowMore(!showMore)}
              style={{ color: '#10B144', marginTop: 5, fontWeight: '600' }}
            >
              {showMore ? " Read Less" : "Read More"}
            </Text>
          )}
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Category:</Text>
          <Text style={styles.infoValue}>
            {course.category?.title || "N/A"}
          </Text>
        </View>
        {/* <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Language:</Text>
          <Text style={styles.infoValue}>{course.language}</Text>
        </View> */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Semester:</Text>
          <Text style={styles.infoValue}>{course.semester?.length || 0}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Students Enrolled:</Text>
          <Text style={styles.infoValue}>
            {course.enrollments?.length || 0}
          </Text>
        </View>



        {course.semesterbased ? course.semester && course.semester.length > 0 ? (
          <View style={styles.semesterSection}>
            {course.semester.map((sem: any, index: number) => (
              <TouchableOpacity
                key={sem._id}
                style={styles.semesterCard}
                onPress={() => handleSemesterPress(sem)}
              >
                <Text style={styles.semesterTitle}>{`Semester ${index + 1}: ${sem.title
                  }`}</Text>
                <Text style={styles.semesterDates}>
                  {formatDateWithOrdinal(sem.startDate)} -{" "}
                  {formatDateWithOrdinal(sem.endDate)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.semesterCard}>

            <Text style={styles.semesterTitle}>No semesters found for this course.</Text>
          </View>

        ) : (
          <View style={styles.semesterSection}>
            <TouchableOpacity
              style={styles.semesterCard}
              onPress={handleChapterPress}
            >
              <Text style={styles.semesterTitle}>Course Chapters</Text>
              <Text style={styles.semesterDates}>
                Chapters
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.ratingSectionTitle}>Overall Course Rating</Text>
          <View style={styles.ratingCard}>
            <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
            <View style={styles.ratingStarsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <SimpleIcon
                  key={i}
                  name={
                    i <= Math.round(averageRating) ? "star" : "star-outline"
                  }
                  size={28}
                  color={i <= Math.round(averageRating) ? "#FFD700" : "#E0E0E0"}
                  style={{ marginRight: 2 }}
                />
              ))}
            </View>
            <Text style={styles.ratingCountText}>
              {ratingCount === 1 ? "(1 Rating)" : `(${ratingCount} Ratings)`}
            </Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.commentsSectionTitle}>
            Comments ({comments.length})
          </Text>
          <View style={styles.commentInputBox}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#A0AEC0"
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <View style={{ alignItems: "flex-end", marginTop: 8 }}>
              <TouchableOpacity
                style={[
                  styles.postCommentButton,
                  (!comment.trim() || isSubmittingComment) &&
                  styles.postCommentButtonDisabled,
                ]}
                disabled={!comment.trim() || isSubmittingComment}
                onPress={handlePostComment}
              >
                <SimpleIcon
                  name="send"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.postCommentButtonText}>Post Comment</Text>
              </TouchableOpacity>
            </View>
          </View>
          {commentsLoading ? (
            <ActivityIndicator style={{ marginTop: 16 }} />
          ) : comments.length > 0 ? (
            comments.map((c: any) => {
              const date = new Date(c.createdAt);
              const formattedDate = `${date
                .getDate()
                .toString()
                .padStart(2, "0")}/${(date.getMonth() + 1)
                  .toString()
                  .padStart(2, "0")}/${date.getFullYear()}`;
              const userName = c.createdby
                ? `${c.createdby.firstName} ${c.createdby.lastName}`
                : c.user?.firstName || "User";
              const userRole = c.createdby?.role;
              return (
                <View
                  key={c._id}
                  style={{
                    marginTop: 16,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <SimpleIcon
                      name="account-circle"
                      size={28}
                      color="#888"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: "#222",
                        marginRight: 8,
                      }}
                    >
                      {userName}
                    </Text>
                    {userRole && (
                      <View
                        style={{
                          backgroundColor: "#e0e7ff",
                          borderRadius: 6,
                          paddingHorizontal: 6,
                          marginRight: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: "#3730a3",
                            fontWeight: "bold",
                            fontSize: 10,
                          }}
                        >
                          {userRole.toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={{ color: "#888", fontSize: 12 }}>
                      {formattedDate}
                    </Text>
                  </View>
                  <Text style={{ color: "#333", fontSize: 15 }}>{c.text}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.noCommentsText}>
              No comments yet. Be the first to comment!
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Grading Periods Modal */}
      <Modal
        visible={showGradingPeriodsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGradingPeriodsModal(false)}
      >
        <View style={styles.gradingPeriodsModalOverlay}>
          <View style={[styles.gradingPeriodsModalContent,{paddingTop:insets.top}]}>
            <TouchableOpacity
              onPress={() => setShowGradingPeriodsModal(false)}
              style={styles.gradingPeriodsBackButton}
            >
              <SimpleIcon name="arrow-back" size={20} color="#000" />
              <Text style={styles.gradingPeriodsBackText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.gradingPeriodsHeader}>
              <View style={styles.gradingPeriodsTitleContainer}>
                <SimpleIcon name="calendar" size={24} color="#10B144" />
                <Text style={styles.gradingPeriodsTitle}>Grading Periods</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSemesterTitle("");
                  setSemesterStartDate("");
                  setSemesterEndDate("");
                  setShowNewSemesterModal(true);
                  setShowGradingPeriodsModal(false)
                }}
                style={styles.gradingPeriodsCreateButton}
              >
                <SimpleIcon name="add" size={20} color="#fff" />
                <Text style={styles.gradingPeriodsCreateText}>Create Semester</Text>
              </TouchableOpacity>
            </View>

            {loadingGradingPeriods ? (
              <View style={styles.gradingPeriodsLoadingContainer}>
                <ActivityIndicator size="large" color="#10B144" />
              </View>
            ) : (
              <ScrollView style={styles.gradingPeriodsList}>
                {gradingPeriods.length === 0 ? (
                  <Text style={styles.gradingPeriodsEmptyText}>
                    No semesters found. Create your first semester.
                  </Text>
                ) : (
                  gradingPeriods.map((semester: any) => {
                    const isSemesterArchived = semester.isArchived;
                    return (
                      <View
                        key={semester._id}
                        style={[
                          styles.gradingPeriodItem,
                          isSemesterArchived && styles.gradingPeriodItemDisabled
                        ]}
                      >
                        <View style={styles.gradingPeriodRow}>
                          <View style={styles.gradingPeriodInfo}>
                            <Text style={[
                              styles.gradingPeriodTitleText,
                              isSemesterArchived && styles.gradingPeriodTextDisabled
                            ]}>
                              {semester.title}
                            </Text>
                          
                          </View>
                          <View style={styles.gradingPeriodActions}>
                            <View style={styles.gradingPeriodSwitchContainer}>
                              <Switch
                                value={isSemesterArchived}
                                onValueChange={() => handleToggleSemesterArchive(semester)}
                                trackColor={{ false: '#d1d5db', true: '#10B144' }}
                                thumbColor={isSemesterArchived ? '#fff' : '#fff'}
                                style={{transform:[{scale:Platform.OS ==="ios"?0.6:1}]}}
                              />
                              <Text style={[
                                styles.gradingPeriodSwitchLabel,
                                isSemesterArchived && styles.gradingPeriodTextDisabled
                              ]}>
                                {isSemesterArchived ? "Archived" : "Unarchived"}
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={[
                                styles.gradingPeriodAddButton,
                                isSemesterArchived && styles.gradingPeriodButtonDisabled
                              ]}
                              onPress={() => openNewQuarterModal(semester)}
                              disabled={isSemesterArchived}
                            >
                              <SimpleIcon
                                name="add"
                                size={16}
                                color={isSemesterArchived ? "#9ca3af" : "#10B144"}
                              />
                              <Text style={[
                                styles.gradingPeriodAddButtonText,
                                isSemesterArchived && styles.gradingPeriodTextDisabled
                              ]}>
                                Quarter
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.gradingPeriodEditButton,
                                isSemesterArchived && styles.gradingPeriodButtonDisabled
                              ]}
                              onPress={() => openEditSemesterModal(semester)}
                              disabled={isSemesterArchived}
                            >
                              <SimpleIcon
                                name="edit"
                                size={18}
                                color={"#fff"}
                              />
                            </TouchableOpacity>
                          </View>
                          
                        </View>
                        <Text style={[
                              styles.gradingPeriodDates,
                              isSemesterArchived && styles.gradingPeriodTextDisabled
                            ]}>
                              {formatDateForInput(semester.startDate)} - {formatDateForInput(semester.endDate)}
                            </Text>
                        {semester.quarters && semester.quarters.length > 0 && (
                          <View style={styles.gradingPeriodQuarters}>
                            {semester.quarters.map((quarter: any) => {
                              const isQuarterArchived = quarter.isArchived;
                              const isDisabled = isSemesterArchived || isQuarterArchived;
                              return (
                                <View
                                  key={quarter._id}
                                  style={[
                                    styles.gradingPeriodQuarterItem,
                                    isDisabled && styles.gradingPeriodItemDisabled
                                  ]}
                                >
                                  <View style={styles.gradingPeriodRow}>
                                    <View style={styles.gradingPeriodInfo}>
                                      <Text style={[
                                        styles.gradingPeriodQuarterTitle,
                                        isDisabled && styles.gradingPeriodTextDisabled
                                      ]}>
                                        {quarter.title}
                                      </Text>
                                     
                                    </View>
                                    <View style={styles.gradingPeriodActions}>
                                      <View style={styles.gradingPeriodSwitchContainer}>
                                        <Switch
                                          value={isQuarterArchived}
                                          onValueChange={() => handleToggleQuarterArchive(quarter)}
                                          trackColor={{ false: '#d1d5db', true: '#10B144' }}
                                          thumbColor={isQuarterArchived ? '#fff' : '#fff'}
                                          disabled={isSemesterArchived}
                                          style={{transform:[{scale:Platform.OS ==="ios"?0.6:1}]}}
                                        />
                                        <Text style={[
                                          styles.gradingPeriodSwitchLabel,
                                          isDisabled && styles.gradingPeriodTextDisabled
                                        ]}>
                                          {isQuarterArchived ? "Archived" : "Unarchived"}
                                        </Text>
                                      </View>
                                      <TouchableOpacity
                                        style={[
                                          styles.gradingPeriodEditButton,

                                        ]}
                                        onPress={() => openEditQuarterModal(quarter)}
                                        disabled={isDisabled}
                                      >
                                        <SimpleIcon
                                          name="edit"
                                          size={18}
                                          color={"#fff"}
                                        />
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                  <Text style={[
                                        styles.gradingPeriodDates,
                                        {marginLeft:10,},
                                        isDisabled && styles.gradingPeriodTextDisabled
                                      ]}>
                                        {formatDateForInput(quarter.startDate)} - {formatDateForInput(quarter.endDate)}
                                      </Text>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* New Semester Modal */}
      <Modal
        visible={showNewSemesterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { setShowNewSemesterModal(false)
          setShowGradingPeriodsModal(true)}}
      >
        <View style={styles.semesterModalOverlay}>
          <View style={styles.semesterModalContent}>
            <Text style={styles.semesterModalTitle}>New Semester</Text>
            {getLastSemesterEndDate() && (
              <Text style={styles.semesterModalInfo}>
                Last semester ends on: {formatDateForInput(getLastSemesterEndDate()!)}
              </Text>
            )}
            <TextInput
              style={styles.semesterModalInput}
              placeholder="Semester Title"
              value={semesterTitle}
              onChangeText={setSemesterTitle}
            />
            <TouchableOpacity
              style={styles.semesterModalInput}
              onPress={() => setShowSemesterDatePicker('start')}
            >
              <Text style={semesterStartDate ? styles.semesterModalInputText : styles.semesterModalPlaceholder}>
                {semesterStartDate || "dd/mm/yyyy"}
              </Text>
            </TouchableOpacity>
            {showSemesterDatePicker === 'start' && (
              <DateTimePicker
                value={semesterStartDate ? new Date(parseDateFromInput(semesterStartDate)) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowSemesterDatePicker(null);
                  if (date) {
                    setSemesterStartDate(formatDateForInput(date.toISOString()));
                  }
                }}
              />
            )}
            <TouchableOpacity
              style={styles.semesterModalInput}
              onPress={() => setShowSemesterDatePicker('end')}
            >
              <Text style={semesterEndDate ? styles.semesterModalInputText : styles.semesterModalPlaceholder}>
                {semesterEndDate || "dd/mm/yyyy"}
              </Text>
            </TouchableOpacity>
            {showSemesterDatePicker === 'end' && (
              <DateTimePicker
                value={semesterEndDate ? new Date(parseDateFromInput(semesterEndDate)) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowSemesterDatePicker(null);
                  if (date) {
                    setSemesterEndDate(formatDateForInput(date.toISOString()));
                  }
                }}
              />
            )}
            <View style={styles.semesterModalContainer}>

            <TouchableOpacity
              style={styles.semesterModalButton}
              onPress={handleCreateSemester}
            >
              <Text style={styles.semesterModalButtonText}>Create Semester</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.semesterModalButton}
              onPress={() => {
                setShowNewSemesterModal(false)
              setShowGradingPeriodsModal(true)}}
            >
              <Text style={styles.semesterModalButtonText}>Cancel</Text>
            </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      {/* Edit Semester Modal */}
      <Modal
        visible={showEditSemesterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowEditSemesterModal(false)
          setShowGradingPeriodsModal(true)
        }}
      >
        <View style={styles.semesterModalOverlay}>
          <View style={styles.semesterModalContent}>
            <Text style={styles.semesterModalTitle}>Edit Semester</Text>
            <TextInput
              style={[styles.semesterModalInput, { backgroundColor: '#f0f0f0' }]}
              placeholder="Semester Title"
              value={semesterTitle}
              onChangeText={setSemesterTitle}
            />
            <TouchableOpacity
              style={styles.semesterModalInput}
              onPress={() => setShowSemesterDatePicker('start')}
            >
              <Text style={semesterStartDate ? styles.semesterModalInputText : styles.semesterModalPlaceholder}>
                {semesterStartDate || "dd/mm/yyyy"}
              </Text>
            </TouchableOpacity>
            {showSemesterDatePicker === 'start' && (
              <DateTimePicker
                value={semesterStartDate ? new Date(parseDateFromInput(semesterStartDate)) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowSemesterDatePicker(null);
                  if (date) {
                    setSemesterStartDate(formatDateForInput(date.toISOString()));
                  }
                }}
              />
            )}
            <TouchableOpacity
              style={styles.semesterModalInput}
              onPress={() => setShowSemesterDatePicker('end')}
            >
              <Text style={semesterEndDate ? styles.semesterModalInputText : styles.semesterModalPlaceholder}>
                {semesterEndDate || "dd/mm/yyyy"}
              </Text>
            </TouchableOpacity>
            {showSemesterDatePicker === 'end' && (
              <DateTimePicker
                value={semesterEndDate ? new Date(parseDateFromInput(semesterEndDate)) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowSemesterDatePicker(null);
                  if (date) {
                    setSemesterEndDate(formatDateForInput(date.toISOString()));
                  }
                }}
              />
            )}
            <View style={styles.semesterModalContainer}>

            <TouchableOpacity
              style={styles.semesterModalButton}
              onPress={handleEditSemester}
              >
              <Text style={styles.semesterModalButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.semesterModalButton}
              onPress={()=>{
                setShowEditSemesterModal(false)
                setShowGradingPeriodsModal(true)
              }}
              >
              <Text style={styles.semesterModalButtonText}>Cancel</Text>
            </TouchableOpacity>
              </View>
          </View>
        </View>
      </Modal>

      {/* New Quarter Modal */}
      <Modal
        visible={showNewQuarterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {      setShowNewQuarterModal(false);
          setShowGradingPeriodsModal(true)}}
      >
        <View style={styles.semesterModalOverlay}>
          <View style={styles.semesterModalContent}>
            <Text style={styles.semesterModalTitle}>New Quarter</Text>
            {selectedSemesterForQuarter && (
              <Text style={styles.semesterModalInfo}>
                Semester duration: {formatDateForInput(selectedSemesterForQuarter.startDate)} - {formatDateForInput(selectedSemesterForQuarter.endDate)}
              </Text>
            )}
            <TextInput
              style={styles.semesterModalInput}
              placeholder="Quarter Title"
              value={quarterTitle}
              onChangeText={setQuarterTitle}
            />
            <TouchableOpacity
              style={styles.semesterModalInput}
              onPress={() => setShowQuarterDatePicker('start')}
            >
              <Text style={quarterStartDate ? styles.semesterModalInputText : styles.semesterModalPlaceholder}>
                {quarterStartDate || "dd/mm/yyyy"}
              </Text>
            </TouchableOpacity>
            {showQuarterDatePicker === 'start' && (
              <DateTimePicker
                value={quarterStartDate ? new Date(parseDateFromInput(quarterStartDate)) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowQuarterDatePicker(null);
                  if (date) {
                    setQuarterStartDate(formatDateForInput(date.toISOString()));
                  }
                }}
              />
            )}
            <TouchableOpacity
              style={styles.semesterModalInput}
              onPress={() => setShowQuarterDatePicker('end')}
            >
              <Text style={quarterEndDate ? styles.semesterModalInputText : styles.semesterModalPlaceholder}>
                {quarterEndDate || "dd/mm/yyyy"}
              </Text>
            </TouchableOpacity>
            {showQuarterDatePicker === 'end' && (
              <DateTimePicker
                value={quarterEndDate ? new Date(parseDateFromInput(quarterEndDate)) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowQuarterDatePicker(null);
                  if (date) {
                    setQuarterEndDate(formatDateForInput(date.toISOString()));
                  }
                }}
              />
            )}
            <View style={styles.semesterModalContainer}>

            <TouchableOpacity
              style={styles.semesterModalButton}
              onPress={handleCreateQuarter}
              >
              <Text style={styles.semesterModalButtonText}>Create Quarter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.semesterModalButton}
              onPress={()=>{      setShowNewQuarterModal(false);
                setShowGradingPeriodsModal(true)
              }}
              >
              <Text style={styles.semesterModalButtonText}>Cancel</Text>
            </TouchableOpacity>
              </View>
          </View>
        </View>
      </Modal>

      {/* Edit Quarter Modal */}
      <Modal
        visible={showEditQuarterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowEditQuarterModal(false)
          setShowGradingPeriodsModal(true)
        }}
      >
        <View style={styles.semesterModalOverlay}>
          <View style={styles.semesterModalContent}>
            <Text style={styles.semesterModalTitle}>Edit Quarter</Text>
            <TextInput
              style={[styles.semesterModalInput, { backgroundColor: '#f0f0f0' }]}
              placeholder="Quarter Title"
              value={quarterTitle}
              onChangeText={setQuarterTitle}
            />
            <TouchableOpacity
              style={styles.semesterModalInput}
              onPress={() => setShowQuarterDatePicker('start')}
            >
              <Text style={quarterStartDate ? styles.semesterModalInputText : styles.semesterModalPlaceholder}>
                {quarterStartDate || "dd/mm/yyyy"}
              </Text>
            </TouchableOpacity>
            {showQuarterDatePicker === 'start' && (
              <DateTimePicker
                value={quarterStartDate ? new Date(parseDateFromInput(quarterStartDate)) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowQuarterDatePicker(null);
                  if (date) {
                    setQuarterStartDate(formatDateForInput(date.toISOString()));
                  }
                }}
              />
            )}
            <TouchableOpacity
              style={styles.semesterModalInput}
              onPress={() => setShowQuarterDatePicker('end')}
            >
              <Text style={quarterEndDate ? styles.semesterModalInputText : styles.semesterModalPlaceholder}>
                {quarterEndDate || "dd/mm/yyyy"}
              </Text>
            </TouchableOpacity>
            {showQuarterDatePicker === 'end' && (
              <DateTimePicker
                value={quarterEndDate ? new Date(parseDateFromInput(quarterEndDate)) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowQuarterDatePicker(null);
                  if (date) {
                    setQuarterEndDate(formatDateForInput(date.toISOString()));
                  }
                }}
              />
            )}
            <View style={styles.semesterModalContainer}>

            <TouchableOpacity
              style={styles.semesterModalButton}
              onPress={handleEditQuarter}
              >
              <Text style={styles.semesterModalButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.semesterModalButton}
              onPress={()=>{setShowEditQuarterModal(false)
                setShowGradingPeriodsModal(true)}}
              >
              <Text style={styles.semesterModalButtonText}>Cancel</Text>
            </TouchableOpacity>
              </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showManageCategoriesModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowManageCategoriesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.manageCategoriesModalContent}>
            <ScrollView>
              <Text style={styles.manageCategoriesModalTitle}>
                Assessment Categories
              </Text>
              <Text style={styles.manageCategoriesModalSubtitle}>
                Manage your course assessment categories and their weights.
              </Text>

              <View style={styles.categoriesListContainer}>
                <View style={styles.categoryItemHeader}>
                  <Text style={[styles.categoryItemHeaderText, { flex: 2 }]}>
                    Category Name
                  </Text>
                  <Text style={[styles.categoryItemHeaderText, { flex: 1 }]}>
                    Weight (%)
                  </Text>
                  <Text
                    style={[
                      styles.categoryItemHeaderText,
                      { flex: 1, textAlign: "center" },
                    ]}
                  >
                    Action
                  </Text>
                </View>

                {loadingCategories ? (
                  <ActivityIndicator
                    size="large"
                    color="#10B144"
                    style={{ marginVertical: 20 }}
                  />
                ) : (
                  assessmentCategories.map((cat) => (
                    <View key={cat.id} style={styles.categoryItem}>
                      <Text style={[styles.categoryName, { flex: 2 }]}>
                        {cat.title}
                      </Text>
                      <TextInput
                        style={[styles.categoryWeightInput, { flex: 1 }]}
                        value={String(cat.weight)}
                        onChangeText={(text) =>
                          handleWeightChange(text, cat.id)
                        }
                        keyboardType="numeric"
                      />
                      <View style={[styles.categoryActions, { flex: 1 }]}>
                        <TouchableOpacity
                          onPress={() => handleUpdateCategory(cat)}
                        >
                          <SimpleIcon
                            name="save-as"
                            size={24}
                            color="#3b82f6"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteCategory(cat)}
                        >
                          <SimpleIcon
                            name="trash"
                            size={24}
                            color="#ef4444"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <View style={styles.addNewCategoryContainer}>
                <Text style={styles.addNewCategoryTitle}>Add New Category</Text>

                <Text style={styles.inputLabel}>Category Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter category name"
                  value={newAssessmentCategoryName}
                  onChangeText={setNewAssessmentCategoryName}
                />

                <Text style={styles.inputLabel}>Weight (%)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter weight"
                  value={newAssessmentCategoryWeight}
                  onChangeText={setNewAssessmentCategoryWeight}
                  keyboardType="numeric"
                />

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddNewCategory}
                  disabled={creatingCategory}
                >
                  <Text style={styles.addButtonText}>
                    {creatingCategory ? "Adding..." : "+ Add"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.totalWeightContainer}>
                <Text style={styles.totalWeightText}>Total Weight:</Text>
                <Text style={styles.totalWeightValue}>
                  {assessmentCategories.reduce(
                    (sum, cat) => sum + (parseFloat(cat.weight) || 0),
                    0
                  )}
                  %
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  ...styles.addButton,
                  backgroundColor: "#6c757d",
                  marginTop: 10,
                }}
                onPress={() => setShowManageCategoriesModal(false)}
              >
                <Text style={styles.addButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAddSemesterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddSemesterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editProfileModalContent}>
            <Text style={styles.editProfileTitle}>Edit profile</Text>
            <Text style={styles.editProfileSubtitle}>
              Make changes to your profile here. Click save when you're done.
            </Text>

            <Text style={styles.dropdownLabel}>Semester</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowSemesterPicker(true)}
            >
              <Text style={styles.dropdownText}>
                {selectedSemester
                  ? selectedSemester.title
                  : "Select semester(s)"}
              </Text>
              <SimpleIcon name="chevron-down" size={20} color="#333" />
            </TouchableOpacity>

            <Text style={styles.dropdownLabel}>Quarter</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowQuarterPicker(true)}
              disabled={!selectedSemester}
            >
              <Text style={styles.dropdownText}>
                {selectedQuarter ? selectedQuarter.title : "Select Quarter(s)"}
              </Text>
              <SimpleIcon name="chevron-down" size={20} color="#333" />
            </TouchableOpacity>

            {loadingQuarters && (
              <ActivityIndicator style={{ marginVertical: 10 }} />
            )}

            <TouchableOpacity
              style={[
                styles.saveChangesButton,
                isSavingSemester && styles.disabledButton,
              ]}
              onPress={handleAddSemesterToCourse}
              disabled={isSavingSemester}
            >
              {isSavingSemester ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveChangesButtonText}>Save changes</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelProfileButton}
              onPress={() => setShowAddSemesterModal(false)}
            >
              <Text style={styles.cancelProfileButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSemesterPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSemesterPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowSemesterPicker(false)}
        >
          <View style={styles.pickerModalContent}>
            {loadingSemesters ? (
              <ActivityIndicator />
            ) : (
              allSemesters.map((s) => (
                <TouchableOpacity
                  key={s._id}
                  style={styles.pickerItem}
                  onPress={() => handleSemesterSelect(s)}
                >
                  <Text>{s.title}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showQuarterPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuarterPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowQuarterPicker(false)}
        >
          <View style={styles.pickerModalContent}>
            {quarters.length === 0 ? (
              <Text>No quarters found for this semester.</Text>
            ) : (
              quarters.map((q) => {
                const isExisting = course?.quarter?.some(
                  (cq: any) => cq._id === q._id
                );
                return (
                  <TouchableOpacity
                    key={q._id}
                    style={[styles.pickerItem, isExisting]}
                    onPress={() => handleQuarterSelect(q)}
                    disabled={isExisting}
                  >
                    <Text style={{ color: isExisting ? "#999" : "#333" }}>
                      {q.title}
                    </Text>
                    {isExisting && (
                      <SimpleIcon
                        name="check-circle"
                        size={22}
                        color="black"
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showQuartersModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowQuartersModal(false)}
      >
        <View style={styles.quartersModalContainer}>
          <View style={styles.quartersModalHeader}>
            <Text style={styles.quartersModalTitle}>Quarters</Text>
            <TouchableOpacity onPress={() => setShowQuartersModal(false)}>
              <SimpleIcon name="close" size={32} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {loadingSemesterQuarters ? (
              <ActivityIndicator
                size="large"
                color="#10B144"
                style={{ marginTop: 20 }}
              />
            ) : semesterQuarters.length > 0 ? (
              semesterQuarters.map((quarter: any) => (
                <TouchableOpacity
                  key={quarter._id}
                  style={styles.quarterCard}
                  onPress={() => handleQuarterCardPress(quarter)}
                >
                  <Text
                    style={styles.quarterTitle}
                  >{`Quarter: ${quarter.title}`}</Text>
                  <Text style={styles.quarterDates}>
                    {formatDateWithOrdinal(quarter.startDate)} -{" "}
                    {formatDateWithOrdinal(quarter.endDate)}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ textAlign: "center", marginTop: 20 }}>
                No quarters found for this semester.
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showChaptersForQuarterModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setShowChaptersForQuarterModal(false);
          course?.semesterbased &&
            setShowQuartersModal(true);
        }}
      >
        <View style={styles.chaptersModalContainer}>
          <View style={styles.chaptersModalHeader}>
            <Text style={styles.chaptersModalTitle}>Chapters</Text>
            <TouchableOpacity
              onPress={() => {
                setShowChaptersForQuarterModal(false);
                course?.semesterbased &&
                  setShowQuartersModal(true);
              }}
            >
              <SimpleIcon name="close" size={32} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.chaptersContent}>
            <TouchableOpacity style={styles.chaptersHeaderButton}>
              {/* <SimpleIcon
                name="menu-book"
                size={24}
                color="black"
                style={{ marginRight: 8 }}
              /> */}
              <Text style={styles.chaptersHeaderButtonText}>
                Manage your chapters and course content
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createChapterButton}
              onPress={() => {
                setShowChaptersForQuarterModal(false);
                setShowCreateChapterModal(true);
              }}
            >
              <Text style={styles.createChapterButtonText}>
                Create New Chapter
              </Text>
            </TouchableOpacity>

            {loadingChaptersForQuarter ? (
              <ActivityIndicator
                style={{ marginTop: 20 }}
                size="large"
                color="#10B144"
              />
            ) : chaptersForQuarter.length > 0 ? (
              <ScrollView>
                {chaptersForQuarter.map((chapter, index) => {
                  return (
                    <View key={chapter._id} style={styles.chapterCard}>
                      <View style={styles.chapterCardHeader}>
                        <View style={styles.chapterNumberChip}>
                          <Text style={styles.chapterNumberText}>
                            Chapter {index + 1}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            setChapterToDelete(chapter);
                            setShowChaptersForQuarterModal(false)
                            setShowDeleteChapterModal(true);
                          }}
                          style={styles.chapterDeleteButton}
                        >
                          <SimpleIcon
                            name="trash"
                            size={20}
                            color="#ef4444"
                          />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.chapterCardTitle}>
                        {chapter.title}
                      </Text>
                      <Text style={styles.chapterCardDescription}>
                        {chapter.description}
                      </Text>

                      <View style={styles.chapterCardStats}>
                        <View style={styles.chapterStatItem}>
                          <SimpleIcon
                            name="menu-book"
                            size={16}
                            color="#666"
                          />
                          <Text style={styles.chapterStatText}>
                            {chapter.lessons ? chapter.lessons.length : 0}{" "}
                            Lessons
                          </Text>
                        </View>
                        <View style={styles.chapterStatItem}>
                          <SimpleIcon name="star" size={16} color="#666" />
                          <Text style={styles.chapterStatText}>
                            {chapter.chapter_assessments
                              ? chapter.chapter_assessments.length
                              : 0}{" "}
                            Assessments
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.chapterViewButton}
                        onPress={() => handleViewChapterDetails(chapter._id)}
                      >
                        {/* <SimpleIcon name="visibility" size={20} color="#fff" /> */}
                        <Text style={styles.chapterViewButtonText}>
                          View Details
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <Text
                style={{ textAlign: "center", marginTop: 20, fontSize: 16 }}
              >
                {chaptersMessage}
              </Text>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAssessmentDetailsModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setShowAssessmentDetailsModal(false);
          setShowChapterDetailsModal(true);
        }}
      >
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          {/* Header */}
          <View style={[styles.assessmentDetailsHeader, { paddingTop: insets.top }]}>
            <TouchableOpacity
              onPress={() => {
                setShowAssessmentDetailsModal(false);
                setShowChapterDetailsModal(true);
              }}
              style={styles.assessmentDetailsBackButton}
            >
              <SimpleIcon name="arrow-back" size={24} color="#fff" />
              <Text style={styles.assessmentDetailsBackText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openEditAssessmentModal(selectedAssessmentForModal)}
              style={styles.assessmentDetailsEditButton}
            >
               <SimpleIcon name="pencil" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }}>
            {selectedAssessmentForModal && (
              <>
                {/* Title and Category */}
                <View style={styles.assessmentDetailsTitleContainer}>
                  <Text style={styles.assessmentDetailsTitle}>
                    {selectedAssessmentForModal.title}
                  </Text>
                  <View style={styles.assessmentDetailsCategoryBadge}>
                    <Text style={styles.assessmentDetailsCategoryText}>
                      {selectedAssessmentForModal.category?.name || "No Category"}
                    </Text>
                  </View>
                </View>

                {/* Due Date */}
                <View style={styles.assessmentDetailsDueDateContainer}>
                  <Text style={styles.assessmentDetailsDueDateLabel}>
                    Due date:{" "}
                    {new Date(selectedAssessmentForModal.dueDate?.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>

                {/* Description */}
                <View style={styles.assessmentDetailsDescriptionContainer}>
                  <Text style={styles.assessmentDetailsDescriptionTitle}>
                    Description
                  </Text>
                  <Text style={styles.assessmentDetailsDescriptionText}>
                    {selectedAssessmentForModal.description}
                  </Text>
                </View>

                {/* Questions */}
                <View style={styles.assessmentDetailsQuestionsContainer}>
                  <Text style={styles.assessmentDetailsQuestionsTitle}>
                    Questions
                  </Text>

                  {selectedAssessmentForModal.questions.map((question: any, index: number) => (
                    <View key={question._id} style={{ marginBottom: 16 }}>
                      <TouchableOpacity
                        style={styles.assessmentDetailsMcqHeader}
                        onPress={() =>
                          setExpandedMcq((prev: any) => ({
                            ...prev,
                            [index]: !prev[index],
                          }))
                        }
                      >
                        <Text style={styles.assessmentDetailsMcqTitle}>
                          {question.type.toUpperCase()}
                        </Text>
                        <SimpleIcon
                          name={expandedMcq?.[index] ? "chevron-up" : "chevron-down"}
                          size={20}
                          color="#000"
                        />
                      </TouchableOpacity>

                      {expandedMcq?.[index] && (
                        <View style={styles.assessmentDetailsQuestionCard}>
                          {/* Common Question Text */}
                          <Text style={styles.assessmentDetailsQuestionLabel}>Question:</Text>
                          <Text style={styles.assessmentDetailsQuestionText}>
                            {question.question.replace(/<[^>]*>/g, "")}
                          </Text>

                          {/* Render Based on Type */}
                          {question.type === "mcq" && (
                            <>
                              {question.options.map((option: string, optionIndex: number) => (
                                <View key={optionIndex} style={styles.assessmentDetailsOptionContainer}>
                                  <Text style={styles.assessmentDetailsBulletPoint}>•</Text>
                                  <Text
                                    style={[
                                      styles.assessmentDetailsOptionText,
                                      option === question.correctAnswer &&
                                      styles.assessmentDetailsCorrectOption,
                                    ]}
                                  >
                                    {option}
                                  </Text>
                                  {option === question.correctAnswer && (
                                    <Text style={styles.assessmentDetailsCorrectLabel}>Correct</Text>
                                  )}
                                </View>
                              ))}
                            </>
                          )}

                          {question.type === "truefalse" && (
                            <View style={{ marginTop: 8 }}>
                              <Text style={styles.assessmentDetailsQuestionLabel}>Answer:</Text>
                              <Text
                                style={[
                                  styles.assessmentDetailsOptionText,
                                  question.correctAnswer === "true"
                                    ? styles.assessmentDetailsCorrectOption
                                    : styles.assessmentDetailsWrongOption,
                                ]}
                              >
                                {question.correctAnswer === "true" ? "True" : "False"}
                              </Text>
                            </View>
                          )}

                          {question.type === "qa" && (
                            <View style={{ marginTop: 8 }}>
                              <Text style={styles.assessmentDetailsQuestionLabel}>Answer:</Text>
                              <Text style={styles.assessmentDetailsOptionText}>
                                {question.correctAnswer || "—"}
                              </Text>
                            </View>
                          )}

                          {question.type === "file" && question.files.length > 0 && (
                            <View style={{ marginTop: 10 }}>
                              <Text style={styles.assessmentDetailsQuestionLabel}>File:</Text>
                              {question.files.map((file: any, fIndex: number) => (
                                <TouchableOpacity
                                  key={fIndex}
                                  onPress={() => Linking.openURL(file.url)}
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginTop: 6,
                                  }}
                                >
                                  <SimpleIcon name="description" size={18} color="#007BFF" />
                                  <Text
                                    style={{
                                      color: "#007BFF",
                                      textDecorationLine: "underline",
                                      marginLeft: 6,
                                    }}
                                  >
                                    {file.filename}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>


      {/* Edit Assessment Modal */}
      <Modal
        visible={showEditAssessmentModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {setShowEditAssessmentModal(false)
          setShowAssessmentDetailsModal(true)
       }}
      >
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={[styles.assessmentDetailsHeader,{paddingTop:insets.top}]}>
            <TouchableOpacity
            onPress={() => {setShowEditAssessmentModal(false)
              setShowAssessmentDetailsModal(true)
           }}
              style={styles.assessmentDetailsBackButton}
            >
              <SimpleIcon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.assessmentDetailsHeaderTitle}>
              Edit Assessment
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            <Text style={styles.editAssessmentLabel}>Title</Text>
            <TextInput
              style={styles.editAssessmentInput}
              value={editAssessmentTitle}
              onChangeText={setEditAssessmentTitle}
              placeholder="Assessment title"
            />

            <Text style={styles.editAssessmentLabel}>Description</Text>
            <TextInput
              style={[
                styles.editAssessmentInput,
                { minHeight: 100, textAlignVertical: "top" },
              ]}
              value={editAssessmentDescription}
              onChangeText={setEditAssessmentDescription}
              placeholder="Assessment description"
              multiline
            />

            <Text style={styles.editAssessmentLabel}>Category</Text>
            <TouchableOpacity
              style={styles.editAssessmentCategoryButton}
              onPress={() => setShowEditCategoryMenu((s) => !s)}
              activeOpacity={0.8}
            >
              <Text style={styles.editAssessmentCategoryButtonText}>
                {assessmentCategories.find(
                   (c) => c.id === editAssessmentCategory
                  )?.title || "Select Category"}
              </Text>
              <SimpleIcon
                name={showEditCategoryMenu ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>

            {showEditCategoryMenu && (
              <View style={styles.editCategoryDropdownMenu}>
                <ScrollView>
                  {assessmentCategories.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => {
                        setEditAssessmentCategory(c.id);
                        setShowEditCategoryMenu(false);
                      }}
                      style={[
                        styles.editCategoryDropdownItem,
                        editAssessmentCategory === c.id && styles.editCategoryDropdownItemActive
                      ]}
                    >
                      <Text style={{ color: "#111" }}>{c.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text style={styles.editAssessmentLabel}>Due Date</Text>
            <TouchableOpacity
              style={styles.editAssessmentInput}
              onPress={() => setShowEditDatePicker(true)}
            >
              <Text style={{ color: editAssessmentDueDate ? "#000" : "#999" }}>
                {editAssessmentDueDate
                  ? `${editAssessmentDueDate.toLocaleDateString()} at ${editAssessmentDueDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                  : "Select due date"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.editAssessmentSaveButton,
                editAssessmentLoading && { opacity: 0.7 },
              ]}
              onPress={handleEditAssessment}
              disabled={editAssessmentLoading}
            >
              {editAssessmentLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.editAssessmentSaveButtonText}>
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
          {showEditDatePicker && (
            <>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    marginTop: 10,
                    marginRight: 15
                  }}
                  onPress={() => {
                    setShowEditDatePicker(false);
                    if (tempEditDate) {
                      setTimeout(() => setShowEditTimePicker(true), 200);
                    }
                  }}
                >
                  <Text
                    style={{
                      color: '#007AFF',
                      fontSize: 18,
                      fontWeight: '600'
                    }}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              )}
              <DateTimePicker
                value={editAssessmentDueDate || new Date()}
                mode="date"
                style={{ alignSelf: 'center' }}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') {
                    setShowEditDatePicker(false);
                    if (event.type === 'set' && selectedDate) {
                      setTempEditDate(selectedDate);
                      setTimeout(() => setShowEditTimePicker(true), 200);
                    } else {
                      setTempEditDate(null);
                    }
                  } else {
                    if (selectedDate) {
                      setTempEditDate(selectedDate);
                      setEditAssessmentDueDate(selectedDate);
                    }
                  }
                }}
              />
            </>
          )}

          {showEditTimePicker && (
            <>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    marginTop: 10,
                    marginRight: 15
                  }}
                  onPress={() => {
                    setShowEditTimePicker(false);
                    if (tempEditDate) {
                      setEditAssessmentDueDate(tempEditDate);
                    }
                  }}
                >
                  <Text
                    style={{
                      color: '#007AFF',
                      fontSize: 18,
                      fontWeight: '600'
                    }}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              )}
              <DateTimePicker
                value={tempEditDate || new Date()}
                mode="time"
                style={{ alignSelf: 'center' }}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  if (Platform.OS === 'android') {
                    setShowEditTimePicker(false);
                    if (event.type === 'set' && selectedTime && tempEditDate) {
                      const combined = new Date(tempEditDate);
                      combined.setHours(selectedTime.getHours());
                      combined.setMinutes(selectedTime.getMinutes());
                      setEditAssessmentDueDate(combined);
                    } else {
                      setTempEditDate(null);
                      setEditAssessmentDueDate(null);
                    }
                  } else {
                    // iOS: just update the time selection
                    if (selectedTime && tempEditDate) {
                      const combined = new Date(tempEditDate);
                      combined.setHours(selectedTime.getHours());
                      combined.setMinutes(selectedTime.getMinutes());
                      setTempEditDate(combined);
                    }
                  }
                }}
              />
            </>
          )}
        </View>
      </Modal>

      <Modal
        visible={showDeleteAssessmentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteAssessmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: "90%", maxWidth: 380 }]}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#b91c1c",
                marginBottom: 12,
              }}
            >
              Delete Assessment?
            </Text>
            <Text style={{ color: "#444", fontSize: 16, marginBottom: 24 }}>
              Are you sure you want to permanently delete this assessment?
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 8,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#f5f5f5",
                  paddingVertical: 14,
                  paddingHorizontal: 32,
                  borderRadius: 12,
                  marginRight: 12,
                }}
                onPress={() => setShowDeleteAssessmentModal(false)}
                disabled={deleteAssessmentLoading}
              >
                <Text
                  style={{ color: "#222", fontWeight: "bold", fontSize: 18 }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "#b91c1c",
                  paddingVertical: 14,
                  paddingHorizontal: 32,
                  borderRadius: 12,
                }}
                onPress={handleDeleteAssessment}
                disabled={deleteAssessmentLoading}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}
                >
                  {deleteAssessmentLoading ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
            {deleteAssessmentError ? (
              <Text style={{ color: "red", marginTop: 8, textAlign: "center" }}>
                {deleteAssessmentError}
              </Text>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showGradebookModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowGradebookModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#fff", padding: 0 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              paddingTop: Platform.OS === "ios" ? 40 : 16,
            }}
          >
            <Text
              style={{ fontSize: 28, fontWeight: "bold", color: "#1E293B" }}
            >
              Gradebook
            </Text>
            <TouchableOpacity onPress={() => setShowGradebookModal(false)}>
              <SimpleIcon name="close" size={32} color="#333" />
            </TouchableOpacity>
          </View>
          {gradebookLoading ? (
            <ActivityIndicator size="large" color="#10B144" style={{ marginVertical: 40 }} />
          ) : gradebookError ? (
            <Text style={{ color: "red", textAlign: "center", marginVertical: 20 }}>{gradebookError}</Text>
          ) : gradebookData ? (
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <View
                style={{
                  width: "100%",
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#eee",
                  marginBottom: 16,
                  padding: 16,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                {/* Table Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottomWidth: 1,
                    borderColor: "#eee",
                    paddingBottom: 12,
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      flex: 2,
                      textAlign: "left",
                      color: "#6b7280",
                    }}
                  >
                    Student
                  </Text>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      flex: 1,
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    Final Grade
                  </Text>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      flex: 1,
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    Letter Grade
                  </Text>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      flex: 1,
                      textAlign: "right",
                      color: "#6b7280",
                    }}
                  >
                    GPA
                  </Text>
                </View>

                {/* Student Rows */}
                {gradebookData.gradebook && gradebookData.gradebook.length > 0 ? (
                  gradebookData.gradebook.map((student: Student) => (
                    <View key={student.studentId}>
                      <TouchableOpacity
                        onPress={() => toggleStudent(student.studentId)}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingVertical: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: "#f5f5f5",
                        }}
                      >
                        <View
                          style={{
                            flex: 2,
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              marginRight: 8,
                              color: "#6b7280",
                              fontWeight: "bold",
                            }}
                          >
                            {expandedStudents.has(student.studentId) ? "▼" : "▶"}
                          </Text>
                          <Text
                            style={{
                              flex: 1,
                              fontSize: 16,
                              fontWeight: "bold",
                              color: "#1E293B",
                            }}
                          >
                            {student.studentName || "Unknown Student"}
                          </Text>
                        </View>
                        <Text
                          style={{
                            flex: 1,
                            textAlign: "center",
                            fontSize: 16,
                            color: "#1E293B",
                          }}
                        >
                          {student.finalGrade || 0}%
                        </Text>
                        <View style={{ flex: 1, alignItems: "center" }}>
                          <View
                            style={{
                              backgroundColor: "#dbeafe",
                              borderColor: "#93c5fd",
                              borderWidth: 1,
                              borderRadius: 6,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                            }}
                          >
                            <Text
                              style={{
                                color: "#1E293B",
                                fontWeight: "bold",
                                fontSize: 14,
                              }}
                            >
                              {student.letterGrade || "N/A"}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={{
                            flex: 1,
                            textAlign: "right",
                            fontSize: 16,
                            color: "#1E293B",
                          }}
                        >
                          {student.gpa || 0}
                        </Text>
                      </TouchableOpacity>

                      {expandedStudents.has(student.studentId) && (
                        <View
                          style={{
                            backgroundColor: "#f9fafb",
                            paddingLeft: 24,
                            paddingVertical: 12,
                            borderLeftWidth: 2,
                            borderLeftColor: "#e5e7eb",
                          }}
                        >
                          <Text
                            style={{
                              color: "#6b7280",
                              fontSize: 14,
                              fontWeight: "600",
                              marginBottom: 12,
                            }}
                          >
                            Academic Performance Breakdown
                          </Text>

                          {/* Semesters */}
                          {student.semesters && student.semesters.length > 0 ? (
                            student.semesters.map((semester: Semester) => (
                              <View key={semester.semesterId} style={{ marginBottom: 8 }}>
                                <TouchableOpacity
                                  onPress={() => toggleSemester(semester.semesterId)}
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                    backgroundColor: "#fff",
                                    borderRadius: 6,
                                    borderWidth: 1,
                                    borderColor: "#e5e7eb",
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 14,
                                      marginRight: 8,
                                      color: "#6b7280",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {expandedSemesters.has(semester.semesterId) ? "▼" : "▶"}
                                  </Text>
                                  <Text
                                    style={{
                                      flex: 1,
                                      fontSize: 14,
                                      fontWeight: "600",
                                      color: "#374151",
                                    }}
                                  >
                                    {semester.semesterTitle}
                                  </Text>
                                </TouchableOpacity>

                                {expandedSemesters.has(semester.semesterId) && (
                                  <View
                                    style={{
                                      marginTop: 8,
                                      marginLeft: 12,
                                      paddingLeft: 12,
                                      borderLeftWidth: 2,
                                      borderLeftColor: "#d1d5db",
                                    }}
                                  >
                                    {semester.quarters && semester.quarters.length > 0 ? (
                                      semester.quarters.map((quarter: Quarter) => (
                                        <View key={quarter.quarterId} style={{ marginBottom: 8 }}>
                                          <TouchableOpacity
                                            onPress={() => toggleQuarter(quarter.quarterId)}
                                            style={{
                                              flexDirection: "row",
                                              alignItems: "center",
                                              paddingVertical: 8,
                                              paddingHorizontal: 12,
                                              backgroundColor: "#f3f4f6",
                                              borderRadius: 6,
                                              borderWidth: 1,
                                              borderColor: "#d1d5db",
                                            }}
                                          >
                                            <Text
                                              style={{
                                                fontSize: 13,
                                                marginRight: 8,
                                                color: "#6b7280",
                                                fontWeight: "bold",
                                              }}
                                            >
                                              {expandedQuarters.has(quarter.quarterId) ? "▼" : "▶"}
                                            </Text>
                                            <Text
                                              style={{
                                                flex: 1,
                                                fontSize: 13,
                                                fontWeight: "600",
                                                color: "#374151",
                                              }}
                                            >
                                              {quarter.quarterTitle}
                                            </Text>
                                            <Text
                                              style={{
                                                fontSize: 12,
                                                color: "#6b7280",
                                                marginRight: 8,
                                              }}
                                            >
                                              {quarter.grade}%
                                            </Text>
                                            <View
                                              style={{
                                                backgroundColor: "#dbeafe",
                                                borderColor: "#93c5fd",
                                                borderWidth: 1,
                                                borderRadius: 4,
                                                paddingHorizontal: 6,
                                                paddingVertical: 2,
                                                marginRight: 8,
                                              }}
                                            >
                                              <Text
                                                style={{
                                                  color: "#1E293B",
                                                  fontWeight: "bold",
                                                  fontSize: 11,
                                                }}
                                              >
                                                {quarter.letterGrade}
                                              </Text>
                                            </View>
                                            <Text
                                              style={{
                                                fontSize: 12,
                                                color: "#6b7280",
                                              }}
                                            >
                                              GPA: {quarter.gpa}
                                            </Text>
                                          </TouchableOpacity>

                                          {expandedQuarters.has(quarter.quarterId) && (
                                            <View
                                              style={{
                                                marginTop: 8,
                                                marginLeft: 12,
                                                paddingLeft: 12,
                                                paddingVertical: 8,
                                                backgroundColor: "#fff",
                                                borderRadius: 6,
                                                borderWidth: 1,
                                                borderColor: "#e5e7eb",
                                              }}
                                            >
                                              {/* Assessment Headers */}
                                              <View
                                                style={{
                                                  flexDirection: "row",
                                                  paddingBottom: 8,
                                                  marginBottom: 8,
                                                  borderBottomWidth: 1,
                                                  borderBottomColor: "#e5e7eb",
                                                }}
                                              >
                                                <Text
                                                  style={{
                                                    flex: 2,
                                                    fontSize: 12,
                                                    fontWeight: "600",
                                                    color: "#6b7280",
                                                  }}
                                                >
                                                  Assessment
                                                </Text>
                                                <Text
                                                  style={{
                                                    flex: 1.5,
                                                    fontSize: 12,
                                                    fontWeight: "600",
                                                    color: "#6b7280",
                                                  }}
                                                >
                                                  Category
                                                </Text>
                                                <Text
                                                  style={{
                                                    flex: 1,
                                                    fontSize: 12,
                                                    fontWeight: "600",
                                                    color: "#6b7280",
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  Score
                                                </Text>
                                                <Text
                                                  style={{
                                                    flex: 1,
                                                    fontSize: 12,
                                                    fontWeight: "600",
                                                    color: "#6b7280",
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  %
                                                </Text>
                                              </View>

                                              {/* Assessment Rows */}
                                              {quarter.assessments && quarter.assessments.length > 0 ? (
                                                quarter.assessments.map((assessment: Assessment) => (
                                                  <View
                                                    key={assessment.assessmentId}
                                                    style={{
                                                      flexDirection: "row",
                                                      paddingVertical: 6,
                                                      borderBottomWidth: 1,
                                                      borderBottomColor: "#f3f4f6",
                                                    }}
                                                  >
                                                    <Text
                                                      style={{
                                                        flex: 2,
                                                        fontSize: 12,
                                                        color: "#374151",
                                                      }}
                                                      numberOfLines={1}
                                                    >
                                                      {assessment.assessmentTitle}
                                                    </Text>
                                                    <Text
                                                      style={{
                                                        flex: 1.5,
                                                        fontSize: 12,
                                                        color: "#6b7280",
                                                      }}
                                                      numberOfLines={1}
                                                    >
                                                      {assessment.category}
                                                    </Text>
                                                    <Text
                                                      style={{
                                                        flex: 1,
                                                        fontSize: 12,
                                                        color: "#374151",
                                                        textAlign: "center",
                                                      }}
                                                    >
                                                      {assessment.studentPoints}/{assessment.maxPoints}
                                                    </Text>
                                                    <Text
                                                      style={{
                                                        flex: 1,
                                                        fontSize: 12,
                                                        color: "#374151",
                                                        textAlign: "right",
                                                        fontWeight: "600",
                                                      }}
                                                    >
                                                      {assessment.maxPoints > 0
                                                        ? (
                                                          (assessment.studentPoints / assessment.maxPoints) *
                                                          100
                                                        ).toFixed(1)
                                                        : 0}
                                                      %
                                                    </Text>
                                                  </View>
                                                ))
                                              ) : (
                                                <Text
                                                  style={{
                                                    fontSize: 12,
                                                    color: "#9ca3af",
                                                    textAlign: "center",
                                                    paddingVertical: 8,
                                                  }}
                                                >
                                                  No assessments found.
                                                </Text>
                                              )}
                                            </View>
                                          )}
                                        </View>
                                      ))
                                    ) : (
                                      <Text
                                        style={{
                                          fontSize: 12,
                                          color: "#9ca3af",
                                          paddingVertical: 8,
                                        }}
                                      >
                                        No quarters found.
                                      </Text>
                                    )}
                                  </View>
                                )}
                              </View>
                            ))
                          ) : (
                            <Text
                              style={{
                                fontSize: 12,
                                color: "#9ca3af",
                                paddingVertical: 8,
                              }}
                            >
                              No semesters found.
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <View style={{ paddingVertical: 20, alignItems: "center" }}>
                    <Text
                      style={{
                        color: "#6b7280",
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    >
                      No students found in this course.
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          ) : (
            <Text
              style={{
                textAlign: "center",
                color: "#7b8794",
                marginVertical: 40,
              }}
            >
              No gradebook data found.
            </Text>
          )}
        </View>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        visible={showEditCourseModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditCourseModal(false)}
      >
       <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalOverlay}>
            
              <View
                style={[styles.modalContent, { width: "95%", maxWidth: 420 }]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "bold",
                      flex: 1,
                      textAlign: "center",
                    }}
                  >
                    Edit Course Info
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowEditCourseModal(false)}
                    style={{ padding: 4 }}
                  >
                    <SimpleIcon name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <ScrollView nestedScrollEnabled={true}>
                  <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                    Course Title
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={editCourseTitle}
                    onChangeText={setEditCourseTitle}
                    placeholder="Course Title"
                  />
                  <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                    Course Price
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={editCoursePrice}
                    onChangeText={(text)=>{
                          // Only allow digits
          let numericValue = text.replace(/[^0-9]/g, '');

          // If it starts with 1–9 and length exceeds 4 → limit to 4 digits
          if (/^[1-9]/.test(numericValue) && numericValue.length > 4) {
            numericValue = '9999';
          }

          setEditCoursePrice(numericValue);
                    }}
                    placeholder="Course Price"
                  />
                  <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                    Sub Category
                  </Text>
                  {subcategoriesLoading ? (
                    <View
                      style={[
                        styles.textInput,
                        { justifyContent: "center", alignItems: "center" },
                      ]}
                    >
                      <ActivityIndicator size="small" color="#10B144" />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.textInput,
                        {
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        },
                      ]}
                      onPress={() => {
                        // Toggle dropdown visibility
                        setShowSubcategoryDropdown(!showSubcategoryDropdown);
                      }}
                    >
                      <Text
                        style={{
                          color: editCourseSubcategory ? "#333" : "#999",
                        }}
                      >
                        {editCourseSubcategory
                          ? subcategories.find(
                            (s) => s._id === editCourseSubcategory
                          )?.title || "Select sub category"
                          : "Select sub category"}
                      </Text>
                      <SimpleIcon name="chevron-down" size={16} color="#666" />
                    </TouchableOpacity>
                  )}

                  {showSubcategoryDropdown && (
                    <View
                      style={{
                        position: "absolute",
                        top: 200,
                        left: 16,
                        right: 16,
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: "#ddd",
                        borderRadius: 8,
                        maxHeight: 200,
                        zIndex: 1000,
                        elevation: 5,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                      }}
                    >
                      <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
                        {subcategories.map((subcategory) => (
                          <TouchableOpacity
                            key={subcategory._id}
                            style={{
                              padding: 12,
                              borderBottomWidth: 1,
                              borderBottomColor: "#eee",
                              backgroundColor:
                                editCourseSubcategory === subcategory._id
                                  ? "#e3f2fd"
                                  : "transparent",
                            }}
                            onPress={() => {
                              setEditCourseSubcategory(subcategory._id);
                              setShowSubcategoryDropdown(false);
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  editCourseSubcategory === subcategory._id
                                    ? "#1976d2"
                                    : "#333",
                                fontWeight:
                                  editCourseSubcategory === subcategory._id
                                    ? "bold"
                                    : "normal",
                              }}
                            >
                              {subcategory.title}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        {subcategories.length === 0 && (
                          <Text
                            style={{
                              padding: 12,
                              color: "#666",
                              textAlign: "center",
                            }}
                          >
                            No subcategories found
                          </Text>
                        )}
                      </ScrollView>
                    </View>
                  )}
                  <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                    Language
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.textInput,
                      {
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      },
                    ]}
                    onPress={() => {
                      setShowLanguageDropdown(!showLanguageDropdown);
                    }}
                  >
                    <Text
                      style={{ color: editCourseLanguage ? "#333" : "#999" }}
                    >
                      {editCourseLanguage || "Select language"}
                    </Text>
                    <SimpleIcon name="chevron-down" size={16} color="#666" />
                  </TouchableOpacity>

                  {showLanguageDropdown && (
                    <View
                      style={{
                        position: "absolute",
                        top: 280,
                        left: 16,
                        right: 16,
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: "#ddd",
                        borderRadius: 8,
                        maxHeight: 200,
                        zIndex: 1000,
                        elevation: 5,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                      }}
                    >
                      <ScrollView style={{ maxHeight: 200 }}>
                        {[
                          "English",
                          "Spanish",
                          "French",
                          "German",
                          "Italian",
                          "Portuguese",
                          "Chinese",
                          "Japanese",
                          "Korean",
                          "Arabic",
                        ].map((language) => (
                          <TouchableOpacity
                            key={language}
                            style={{
                              padding: 12,
                              borderBottomWidth: 1,
                              borderBottomColor: "#eee",
                              backgroundColor:
                                editCourseLanguage === language
                                  ? "#e3f2fd"
                                  : "transparent",
                            }}
                            onPress={() => {
                              setEditCourseLanguage(language);
                              setShowLanguageDropdown(false);
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  editCourseLanguage === language
                                    ? "#1976d2"
                                    : "#333",
                                fontWeight:
                                  editCourseLanguage === language
                                    ? "bold"
                                    : "normal",
                              }}
                            >
                              {language}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                  <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                    Course Description
                  </Text>
                  <TextInput
                    style={[styles.textInput, { minHeight: 80 }]}
                    value={editCourseDescription}
                    onChangeText={setEditCourseDescription}
                    placeholder="Course Description"
                    multiline
                  />
                  {/* What you will teach in this course */}
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: 8,
                      fontSize: 16,
                    }}
                  >
                    What you will teach in this course (max 12)
                  </Text>
                  {editTeachingPoints.map((point, index) => (
                    <View key={index} style={{ marginBottom: 12 }}>
                      <Text
                        style={{ fontSize: 14, color: "#666", marginBottom: 4 }}
                      >
                        Entry {String(index + 1).padStart(2, "0")}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <TextInput
                            style={[styles.textInput, { minHeight: 40 }]}
                            value={point}
                            onChangeText={(text) => {
                              const newPoints = [...editTeachingPoints];
                              newPoints[index] = text;
                              setEditTeachingPoints(newPoints);
                            }}
                            placeholder="What you will teach in this course..."
                            multiline
                          />
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#999",
                              marginTop: 4,
                            }}
                          >
                            {120 - point.length} characters remaining
                          </Text>
                        </View>
                        {editTeachingPoints.length > 1 && (
                          <TouchableOpacity
                            style={{
                              backgroundColor: "#ff4444",
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              borderRadius: 6,
                              marginTop: 2,
                            }}
                            onPress={() => {
                              const newPoints = editTeachingPoints.filter(
                                (_, i) => i !== index
                              );
                              setEditTeachingPoints(newPoints);
                            }}
                          >
                            <Text
                              style={{
                                color: "white",
                                fontSize: 12,
                                fontWeight: "bold",
                              }}
                            >
                              Remove
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                  {editTeachingPoints.length < 12 && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#007AFF",
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 8,
                        alignSelf: "flex-start",
                        marginBottom: 16,
                      }}
                      onPress={() => {
                        if (editTeachingPoints.length < 12) {
                          setEditTeachingPoints([...editTeachingPoints, ""]);
                        }
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        + Add Teaching Point
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Course Requirements */}
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: 8,
                      fontSize: 16,
                    }}
                  >
                    Course Requirements (max 12)
                  </Text>
                  {editRequirements.map((requirement, index) => (
                    <View key={index} style={{ marginBottom: 12 }}>
                      <Text
                        style={{ fontSize: 14, color: "#666", marginBottom: 4 }}
                      >
                        Entry {String(index + 1).padStart(2, "0")}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <TextInput
                            style={[styles.textInput, { minHeight: 40 }]}
                            value={requirement}
                            onChangeText={(text) => {
                              const newRequirements = [...editRequirements];
                              newRequirements[index] = text;
                              setEditRequirements(newRequirements);
                            }}
                            placeholder="Course requirement..."
                            multiline
                          />
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#999",
                              marginTop: 4,
                            }}
                          >
                            {120 - requirement.length} characters remaining
                          </Text>
                        </View>
                        {editRequirements.length > 1 && (
                          <TouchableOpacity
                            style={{
                              backgroundColor: "#ff4444",
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              borderRadius: 6,
                              marginTop: 2,
                            }}
                            onPress={() => {
                              const newRequirements = editRequirements.filter(
                                (_, i) => i !== index
                              );
                              setEditRequirements(newRequirements);
                            }}
                          >
                            <Text
                              style={{
                                color: "white",
                                fontSize: 12,
                                fontWeight: "bold",
                              }}
                            >
                              Remove
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                  {editRequirements.length < 12 && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#007AFF",
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 8,
                        alignSelf: "flex-start",
                        marginBottom: 16,
                      }}
                      onPress={() => {
                        if (editRequirements.length < 12) {
                          setEditRequirements([...editRequirements, ""]);
                        }
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        + Add Requirement
                      </Text>
                    </TouchableOpacity>
                  )}
                  {editCourseError && (
                    <Text style={{ color: "red", marginVertical: 8 }}>
                      {editCourseError}
                    </Text>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.saveChangesButton,
                      editCourseLoading && styles.disabledButton,
                    ]}
                    onPress={async () => {
                      setEditCourseLoading(true);
                      setEditCourseError(null);
                      try {
                        await editCourseBasics(course._id, {
                          courseTitle: editCourseTitle,
                          category: editCourseCategory,
                          price:editCoursePrice,
                          subcategory: editCourseSubcategory,
                          language: editCourseLanguage,
                          courseDescription: editCourseDescription,
                          teachingPoints: JSON.stringify(editTeachingPoints),
                          requirements: JSON.stringify(editRequirements),
                        });

                        getCourseDetails(courseId)
                          .then((res) => {
                            setCourse(res.course);
                            Toast.show(
                              "Course updated successfully",
                              Toast.LONG
                            );
                            setShowEditCourseModal(false);
                            setLoading(true);
                          })
                          .catch(() =>
                            setError("Failed to load course details.")
                          )
                          .finally(() => setLoading(false));
                      } catch (err: any) {
                        setEditCourseError(
                          err.message || "Failed to update course"
                        );
                      } finally {
                        setEditCourseLoading(false);
                      }
                    }}
                    disabled={editCourseLoading}
                  >
                    {editCourseLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.saveChangesButtonText}>
                        Update Course Info
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelProfileButton}
                    onPress={() => setShowEditCourseModal(false)}
                  >
                    <Text style={styles.cancelProfileButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Chapter Details Modal */}
      <Modal
        visible={showChapterDetailsModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setShowChapterDetailsModal(false);
          setShowChaptersForQuarterModal(true);
        }}
      >
        <View style={styles.fullScreenModalContainer}>
          <View style={styles.fullScreenModalContent}>
            <View style={styles.fullScreenModalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setShowChapterDetailsModal(false);
                  setShowChaptersForQuarterModal(true);
                }}
                style={styles.backButton}
              >
                <SimpleIcon name="arrow-back" size={24} color="#10B144" />
              </TouchableOpacity>
              <Text style={styles.fullScreenModalTitle}>Chapter Details</Text>
              <View style={{ width: 40 }} />
            </View>

            {chapterDetailsLoading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 40,
                }}
              >
                <ActivityIndicator size="large" color="#10B144" />
                <Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
                  Loading chapter details...
                </Text>
              </View>
            ) : chapterDetailsError ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 40,
                }}
              >
                <SimpleIcon name="alert-circle" size={48} color="#ff6b6b" />
                <Text
                  style={{
                    marginTop: 16,
                    fontSize: 16,
                    color: "#ff6b6b",
                    textAlign: "center",
                  }}
                >
                  {chapterDetailsError}
                </Text>
                <TouchableOpacity
                  style={[styles.chapterViewButton, { marginTop: 16 }]}
                  onPress={() => setShowChapterDetailsModal(false)}
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
                      <SimpleIcon
                        name="menu-book"
                        size={24}
                        color="#10B144"
                      />
                    </View>
                    <View style={styles.chapterDetailsActions}>
                      <TouchableOpacity
                        style={styles.chapterDetailsActionButton}
                        onPress={handleEditChapter}
                      >
                        <SimpleIcon name="pencil" size={25} color="#fff" />
                      </TouchableOpacity>
                      <View style={styles.plusButtonContainer}>
                        <TouchableOpacity
                          style={styles.chapterDetailsActionButton}
                          onPress={handlePlusButtonPress}
                        >
                          <SimpleIcon name="plus" size={25} color="#fff" />
                        </TouchableOpacity>

                        {showPlusDropdown && (
                          <View style={styles.dropdownMenu}>
                            <TouchableOpacity
                              style={styles.dropdownItem}
                              onPress={() => handleDropdownOption("lesson")}
                            >
                              <SimpleIcon
                                name="menu-book"
                                size={20}
                                color="#3b82f6"
                              />
                              <Text style={styles.dropdownItemText}>
                                + Add Lesson
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.dropdownItem}
                              onPress={() => handleDropdownOption("assessment")}
                            >
                              <SimpleIcon
                                name="clipboard"
                                size={20}
                                color="#10b981"
                              />
                              <Text style={styles.dropdownItemText}>
                                + Add Assessment
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.dropdownItem}
                              onPress={() => handleDropdownOption("page")}
                            >
                              <SimpleIcon
                                name="description"
                                size={20}
                                color="#6b7280"
                              />
                              <Text style={styles.dropdownItemText}>
                                + Add Page
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.dropdownItem}
                              onPress={() => handleDropdownOption("discussion")}
                            >
                              <SimpleIcon
                                name="chat"
                                size={20}
                                color="#6b7280"
                              />
                              <Text style={styles.dropdownItemText}>
                                + Discussion
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
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
                                  <Text
                                    style={styles.assessmentCategoryChipText}
                                  >
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
                                    `Are you sure you want to delete "${assessment.title || "this assessment"
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
                                          handleDeleteAssessmentDirect(
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
                                setShowChapterDetailsModal(false); // Close chapter details modal first
                                setSelectedAssessmentForModal(assessment);
                                setShowAssessmentDetailsModal(true);
                              }}
                            >
                              <View style={styles.assessmentInfo}>
                                <Text style={styles.assessmentTitle}>
                                  {assessment.title ||
                                    `Assessment ${index + 1}`}
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
                      <SimpleIcon
                        name="menu-book"
                        size={24}
                        color="#10B144"
                      />
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

                  {chapterDetails.lessons &&
                    chapterDetails.lessons.length > 0 ? (
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
                                  onPress={() => handleEditLesson(lesson)}
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
                                    handleDeleteLessonFromChapter(lesson._id)
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
                                      handleLessonsPlusButtonPress(lesson)
                                    }
                                  >
                                    <SimpleIcon
                                      name="plus"
                                      size={22}
                                      color="#fff"
                                    />
                                  </TouchableOpacity>

                                  {showLessonsPlusDropdown && (
                                    <View style={styles.lessonsDropdownMenu}>
                                      <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() =>
                                          handleLessonsDropdownOption(
                                            "assessment"
                                          )
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
                                          handleLessonsDropdownOption("page")
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
                                          handleLessonsDropdownOption(
                                            "discussion"
                                          )
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
                                  )}
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
                                  onPress={() =>
                                    handleAddFilesToLesson(lesson._id)
                                  }
                                >
                                  <Text style={styles.lessonAddFileButtonText}>
                                    + Add
                                  </Text>
                                </TouchableOpacity>
                              </View>
                              {lesson.pdfFiles && lesson.pdfFiles.length > 0 ? (
                                lesson.pdfFiles.map(
                                  (file: any, fileIndex: number) => (
                                    <View
                                      key={fileIndex}
                                      style={styles.fileItem}
                                    >
                                      <TouchableOpacity
                                        style={styles.fileItemContent}
                                        onPress={() => handleOpenLink(file.url)}
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
                                          handleDeleteFile(lesson._id, file._id)
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
                                        handleOpenLink(lesson.youtubeLinks)
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
                                      onPress={() =>
                                        handleOpenLink(lesson.otherLink)
                                      }
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

                            {/* Lesson Pages Section - Always visible in lesson card */}
                            {/* <View style={styles.lessonPagesSection}>
                              <Text style={styles.lessonPagesTitle}>
                                {console.log(lesson)}
                                Lesson Pages ({lesson.lesson_pages?.length || 0}
                                )
                              </Text>
                              {lesson.lesson_pages &&
                              lesson.lesson_pages.length > 0 ? (
                                lesson.lesson_pages.map(
                                  (page: any, pageIndex: number) => (
                                    <View
                                      key={page._id || pageIndex}
                                      style={styles.pageCard}
                                    >
                                      <View style={styles.pageHeader}>
                                        <View style={styles.pageBadge}>
                                          <Text style={styles.pageBadgeText}>
                                            Page
                                          </Text>
                                        </View>
                                        <TouchableOpacity
                                          onPress={() => {
                                            Alert.alert(
                                              "Delete Page",
                                              "Are you sure you want to delete this page?",
                                              [
                                                {
                                                  text: "Cancel",
                                                  style: "cancel",
                                                },
                                                {
                                                  text: "Delete",
                                                  style: "destructive",
                                                  onPress: () =>
                                                    handleDeletePage(page._id),
                                                },
                                              ]
                                            );
                                          }}
                                          style={styles.pageDeleteButton}
                                        >
                                          <SimpleIcon
                                            name="trash"
                                            size={16}
                                            color="#6b7280"
                                          />
                                        </TouchableOpacity>
                                      </View>
                                      <Text style={styles.pageTitle}>
                                        {page.title}
                                      </Text>
                                      <Text style={styles.pageDescription}>
                                        {page.description}
                                      </Text>
                                    </View>
                                  )
                                )
                              ) : (
                                <Text style={styles.noPagesText}>
                                  No pages yet
                                </Text>
                              )}
                            </View> */}

                            {/* Lesson Assessments Section - Always visible in lesson card */}
                            {/* <View style={styles.lessonAssessmentsSection}>
                              <Text style={styles.lessonAssessmentsTitle}>
                                Lesson Assessments (
                                {lesson.lesson_assessments?.length || 0})
                              </Text>
                              {lesson.lesson_assessments &&
                              lesson.lesson_assessments.length > 0 ? (
                                lesson.lesson_assessments.map(
                                  (
                                    assessment: any,
                                    assessmentIndex: number
                                  ) => (
                                    <TouchableOpacity
                                      key={assessment._id || assessmentIndex}
                                      style={styles.assessmentCard}
                                      activeOpacity={0.8}
                                      onPress={() => {
                                        setShowChapterDetailsModal(false); // Close chapter details modal first
                                        setSelectedAssessmentForModal(
                                          assessment
                                        );
                                        setShowAssessmentDetailsModal(true);
                                      }}
                                    >
                                      <View style={styles.assessmentHeader}>
                                        <View style={styles.assessmentBadge}>
                                          <Text
                                            style={styles.assessmentBadgeText}
                                          >
                                            {assessment.category?.name ||
                                              "testing"}
                                          </Text>
                                        </View>
                                        <TouchableOpacity
                                          onPress={() => {
                                            Alert.alert(
                                              "Delete Assessment",
                                              "Are you sure you want to delete this assessment?",
                                              [
                                                {
                                                  text: "Cancel",
                                                  style: "cancel",
                                                },
                                                {
                                                  text: "Delete",
                                                  style: "destructive",
                                                  onPress: () =>
                                                    handleDeleteAssessmentDirect(
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
                                            size={16}
                                            color="#6b7280"
                                          />
                                        </TouchableOpacity>
                                      </View>
                                      <Text style={styles.assessmentTitle}>
                                        {assessment.title}
                                      </Text>
                                      <Text
                                        style={styles.assessmentDescription}
                                      >
                                        {assessment.description}
                                      </Text>
                                    </TouchableOpacity>
                                  )
                                )
                              ) : (
                                <Text style={styles.noAssessmentsText}>
                                  No assessments yet
                                </Text>
                              )}
                            </View> */}
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
                        onPress={handleAddLesson}
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

      {/* Lesson Creation Modal */}
      <Modal
        visible={showLessonCreationModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowLessonCreationModal(false)}
      >
        <View style={styles.fullScreenModalContainer}>
          <View style={styles.fullScreenModalContent}>
            <View style={styles.fullScreenModalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setShowLessonCreationModal(false);
                  setShowChapterDetailsModal(true);
                }}
                style={styles.backButton}
              >
                <SimpleIcon name="arrow-left" size={24} color="#10B144" />
              </TouchableOpacity>
              <Text style={styles.fullScreenModalTitle}>Add Lesson</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={{ flex: 1 }}>
              <Text style={styles.lessonFormInstruction}>
                Fill in the lesson details. Upload only PDF files, max 5MB
                total.
              </Text>

              {/* Lesson Title */}
              <View style={styles.lessonFormField}>
                <Text style={styles.lessonFormLabel}>Lesson Title</Text>
                <View style={styles.lessonTitleContainer}>
                  <TextInput
                    style={styles.lessonTitleInput}
                    value={lessonCreationTitle}
                    onChangeText={setLessonCreationTitle}
                    placeholder="Enter lesson title"
                    maxLength={100}
                  />
                  <Text style={styles.characterCount}>
                    {lessonCreationTitle.length}/100
                  </Text>
                </View>
              </View>

              {/* Lesson Description */}
              <View style={styles.lessonFormField}>
                <Text style={styles.lessonFormLabel}>Lesson Description</Text>
                <TextInput
                  style={styles.lessonDescriptionInput}
                  value={lessonCreationDescription}
                  onChangeText={setLessonCreationDescription}
                  placeholder="Start writing..."
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                />
              </View>

              {/* YouTube Link */}
              <View style={styles.lessonFormField}>
                <Text style={styles.lessonFormLabel}>YouTube Link</Text>
                <TextInput
                  style={styles.lessonLinkInput}
                  value={lessonCreationYoutubeLink}
                  onChangeText={setLessonCreationYoutubeLink}
                  placeholder="https://www.youtube.com/watch?v=..."
                  keyboardType="url"
                />
              </View>

              {/* Other Link */}
              <View style={styles.lessonFormField}>
                <Text style={styles.lessonFormLabel}>Other Link</Text>
                <TextInput
                  style={styles.lessonLinkInput}
                  value={lessonCreationOtherLink}
                  onChangeText={setLessonCreationOtherLink}
                  placeholder="https://example.com"
                  keyboardType="url"
                />
              </View>

              {/* PDF Files */}
              <View style={styles.lessonFormField}>
                <Text style={styles.lessonFormLabel}>
                  Lesson PDF Files (optional)
                </Text>

                <TouchableOpacity
                  style={styles.filePickerButton}
                  onPress={handleFilePickForLessonCreation}
                >
                  <Text style={styles.filePickerButtonText}>
                    Choose file No file chosen
                  </Text>
                </TouchableOpacity>

                {lessonCreationFiles.length > 0 && (
                  <View style={styles.fileList}>
                    {lessonCreationFiles.map((file, index) => (
                      <View key={index} style={styles.fileItem}>
                        <SimpleIcon name="description" size={20} color="#10B144" />
                        <Text style={styles.fileName}>{file.name}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveFile(index)}
                        >
                          <SimpleIcon name="trash" size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.addAnotherFileButton}
                  onPress={handleFilePickForLessonCreation}
                >
                  <SimpleIcon name="plus" size={16} color="#10B144" />
                  <Text style={styles.addAnotherFileText}>
                    Add Another File
                  </Text>
                </TouchableOpacity>

                <Text style={styles.lessonFileSizeText}>
                  Total size:{" "}
                  {(
                    lessonCreationFiles.reduce(
                      (total, file) => total + (file.size || 0),
                      0
                    ) /
                    (1024 * 1024)
                  ).toFixed(2)}{" "}
                  MB / 5 MB
                </Text>
              </View>

              {lessonCreationError && (
                <Text style={styles.lessonErrorText}>
                  {lessonCreationError}
                </Text>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.lessonCreationActionButtons}>
              <TouchableOpacity
                style={styles.lessonCancelButton}
                onPress={() => {
                  setShowLessonCreationModal(false);
                  setShowChapterDetailsModal(true);
                }}
              >
                <Text style={styles.lessonCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.lessonSaveButton,
                  lessonCreationLoading && styles.lessonDisabledButton,
                ]}
                onPress={handleCreateLesson}
                disabled={lessonCreationLoading}
              >
                {lessonCreationLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.lessonSaveButtonText}>Save Lesson</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Chapter Modal */}
      <Modal
        visible={showEditChapterModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setShowEditChapterModal(false)
          setShowChapterDetailsModal(true)
        }}
      >
        <View style={styles.fullScreenModalContainer}>
          <View style={[styles.fullScreenModalHeader, { paddingTop: insets.top }]}>
            <TouchableOpacity
              onPress={() => {
                setShowEditChapterModal(false)
                setShowChapterDetailsModal(true)

              }}
              style={styles.backButton}
            >
              <SimpleIcon name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.fullScreenModalTitle}>Edit Chapter</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.editChapterForm}>
            {/* Chapter Title */}
            <View style={styles.editChapterField}>
              <Text style={styles.editChapterLabel}>Chapter Title</Text>
              <View style={styles.editChapterTitleContainer}>
                <TextInput
                  style={styles.editChapterTitleInput}
                  value={editChapterTitle}
                  onChangeText={setEditChapterTitle}
                  placeholder="Enter chapter title"
                  maxLength={100}
                />
                <Text style={styles.editChapterCharacterCount}>
                  {editChapterTitle.length}/100
                </Text>
              </View>
            </View>

            {/* Chapter Description */}
            <View style={styles.editChapterField}>
              <Text style={styles.editChapterLabel}>Chapter Description</Text>
              <View style={styles.editChapterDescriptionContainer}>
                <TextInput
                  style={styles.editChapterDescriptionInput}
                  value={editChapterDescription}
                  onChangeText={setEditChapterDescription}
                  placeholder="Enter chapter description"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.editChapterCharacterCount}>
                  {editChapterDescription.length}/500
                </Text>
              </View>
            </View>

            {editChapterError && (
              <Text style={styles.editChapterErrorText}>
                {editChapterError}
              </Text>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.editChapterActionButtons}>
            <TouchableOpacity
              style={styles.editChapterCancelButton}
              onPress={() => {
                setShowEditChapterModal(false)
                setShowChapterDetailsModal(true)

              }}
            >
              <Text style={styles.editChapterCancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.editChapterSaveButton,
                editChapterLoading && styles.editChapterDisabledButton,
              ]}
              onPress={handleUpdateChapter}
              disabled={editChapterLoading}
            >
              {editChapterLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.editChapterSaveButtonText}>
                  Edit Chapter
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Lesson Edit Modal */}
      <Modal
        visible={showLessonEditModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setShowLessonEditModal(false)
          setShowChapterDetailsModal(true)
        }}
      >
        <View style={styles.fullScreenModalContainer}>
          <View style={[styles.fullScreenModalHeader, { paddingTop: insets.top }]}>
            <TouchableOpacity
              onPress={() => {
                setShowLessonEditModal(false)
                setShowChapterDetailsModal(true)
              }}
              style={styles.backButton}
            >
              <SimpleIcon name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.fullScreenModalTitle}>Edit Lesson</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.lessonEditForm}>
            {/* Lesson Title */}
            <View style={styles.lessonEditField}>
              <Text style={styles.lessonEditLabel}>Lesson Title</Text>
              <View style={styles.lessonEditTitleContainer}>
                <TextInput
                  style={styles.lessonEditTitleInput}
                  value={lessonEditTitle}
                  onChangeText={setLessonEditTitle}
                  placeholder="Enter lesson title"
                  maxLength={100}
                />
                <Text style={styles.lessonEditCharacterCount}>
                  {lessonEditTitle.length}/100
                </Text>
              </View>
            </View>

            {/* Lesson Description */}
            <View style={styles.lessonEditField}>
              <Text style={styles.lessonEditLabel}>Lesson Description</Text>
              <View style={styles.lessonEditDescriptionContainer}>
                <TextInput
                  style={styles.lessonEditDescriptionInput}
                  value={lessonEditDescription}
                  onChangeText={setLessonEditDescription}
                  placeholder="Enter lesson description"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.lessonEditCharacterCount}>
                  {lessonEditDescription.length}/500
                </Text>
              </View>
            </View>

            {/* YouTube Link */}
            <View style={styles.lessonEditField}>
              <Text style={styles.lessonEditLabel}>YouTube Link</Text>
              <TextInput
                style={styles.lessonEditLinkInput}
                value={lessonEditYoutubeLink}
                onChangeText={setLessonEditYoutubeLink}
                placeholder="https://www.youtube.com/watch?v=..."
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Other Link */}
            <View style={styles.lessonEditField}>
              <Text style={styles.lessonEditLabel}>Other Link</Text>
              <TextInput
                style={styles.lessonEditLinkInput}
                value={lessonEditOtherLink}
                onChangeText={setLessonEditOtherLink}
                placeholder="https://example.com"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {lessonEditError && (
              <Text style={styles.lessonEditErrorText}>{lessonEditError}</Text>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.lessonEditActionButtons}>
            <TouchableOpacity
              style={styles.lessonEditCancelButton}
              onPress={() => {
                setShowLessonEditModal(false)
                setShowChapterDetailsModal(true)
              }}
            >
              <Text style={styles.lessonEditCancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.lessonEditSaveButton,
                lessonEditLoading && styles.lessonEditDisabledButton,
              ]}
              onPress={handleUpdateLesson}
              disabled={lessonEditLoading}
            >
              {lessonEditLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.lessonEditSaveButtonText}>Save Lesson</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Files Modal */}
      <Modal
        visible={showAddFilesModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setShowAddFilesModal(false)
          setShowChapterDetailsModal(true)
        }}
      >
        <View style={styles.fullScreenModalContainer}>
          <View style={styles.fullScreenModalContent}>
            <View style={styles.fullScreenModalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setShowAddFilesModal(false)
                  setShowChapterDetailsModal(true)
                }}
                style={styles.backButton}
              >
                <SimpleIcon name="arrow-back" size={24} color="#10B144" />
              </TouchableOpacity>
              <Text style={styles.fullScreenModalTitle}>Add Files</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={{ flex: 1 }}>
              <Text style={styles.lessonFormInstruction}>
                Upload only PDF files, max 5MB total.
              </Text>

              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={handleFilePickForAddFiles}
              >
                <Text style={styles.filePickerButtonText}>
                  Choose file No file chosen
                </Text>
              </TouchableOpacity>

              {selectedFiles.length > 0 && (
                <View style={styles.fileList}>
                  {selectedFiles.map((file, index) => (
                    <View key={index} style={styles.fileItem}>
                      <SimpleIcon
                        name="description"
                        size={20}
                        color="#10B144"
                      />
                      <Text style={styles.fileName}>{file.fileName}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveSelectedFile(index)}
                      >
                        <SimpleIcon
                          name="trash"
                          size={20}
                          color="#ef4444"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.fileSizeText}>
                Total size: {(totalFileSize / (1024 * 1024)).toFixed(2)} MB / 5
                MB
              </Text>

              {addFilesError && (
                <Text style={styles.addFilesErrorText}>{addFilesError}</Text>
              )}

              <TouchableOpacity
                style={[
                  styles.addFilesAddButton,
                  addFilesLoading && styles.addFilesDisabledButton,
                ]}
                onPress={handleAddFiles}
                disabled={addFilesLoading}
              >
                {addFilesLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.addFilesAddButtonText}>Add Files</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Assessment Modal */}
      <Modal
        visible={showAddAssessmentModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowAddAssessmentModal(false)}
      >
        <View style={styles.fullScreenModalContainer}>
          <View style={styles.fullScreenModalContent}>
            <View style={styles.fullScreenModalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setShowAddAssessmentModal(false);
                  setShowChapterDetailsModal(true);
                }}
                style={styles.backButton}
              >
                <SimpleIcon name="arrow-back" size={24} color="#10B144" />
              </TouchableOpacity>
              <Text style={styles.fullScreenModalTitle}>Add Assessment</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={{ flex: 1 }}>
              <Text style={styles.lessonFormInstruction}>
                Create a new assessment for this chapter.
              </Text>

              <View style={styles.lessonFormField}>
                <Text style={styles.lessonFormLabel}>Assessment Title</Text>
                <TextInput
                  style={styles.lessonTitleInput}
                  placeholder="Enter assessment title"
                />
              </View>

              <View style={styles.lessonFormField}>
                <Text style={styles.lessonFormLabel}>Description</Text>
                <TextInput
                  style={styles.lessonDescriptionInput}
                  placeholder="Enter assessment description"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={styles.addFilesAddButton}
                onPress={() => {
                  Toast.show("Assessment creation coming soon!", Toast.LONG);
                  setShowAddAssessmentModal(false);
                }}
              >
                <Text style={styles.addFilesAddButtonText}>
                  Create Assessment
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Page Modal */}
      <Modal
        visible={showAddPageModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowAddPageModal(false)}
      >
        <View style={styles.fullScreenModalContainer}>
          <View style={styles.fullScreenModalContent}>
            <View style={styles.fullScreenModalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setShowAddPageModal(false);
                  setShowChapterDetailsModal(true);
                }}
                style={styles.backButton}
              >
                <SimpleIcon name="arrow-left" size={24} color="#10B144" />
              </TouchableOpacity>
              <Text style={styles.fullScreenModalTitle}>Add Page</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={{ flex: 1 }}>
              <Text style={styles.lessonFormInstruction}>
                Create a new page for this chapter.
              </Text>

              <View style={styles.lessonFormField}>
                <Text style={styles.lessonFormLabel}>Page Title</Text>
                <TextInput
                  style={styles.lessonTitleInput}
                  placeholder="Enter page title"
                />
              </View>

              <View style={styles.lessonFormField}>
                <Text style={styles.lessonFormLabel}>Content</Text>
                <TextInput
                  style={styles.lessonDescriptionInput}
                  placeholder="Enter page content"
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={styles.addFilesAddButton}
                onPress={() => {
                  Toast.show("Page creation coming soon!", Toast.LONG);
                  setShowAddPageModal(false);
                }}
              >
                <Text style={styles.addFilesAddButtonText}>Create Page</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Discussion Modal */}
      <Modal
        visible={showDiscussionModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowDiscussionModal(false)}
      >
        <View style={styles.fullScreenModalContainer}>
          <View style={styles.fullScreenModalContent}>
            <View style={styles.fullScreenModalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setShowDiscussionModal(false);
                  setShowChapterDetailsModal(true);
                }}
                style={styles.backButton}
              >
                <SimpleIcon name="arrow-left" size={24} color="#10B144" />
              </TouchableOpacity>
              <Text style={styles.fullScreenModalTitle}>Discussion</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={{ flex: 1 }}>
              <Text style={styles.lessonFormInstruction}>
                Start a discussion for this chapter.
              </Text>

              <View style={styles.lessonFormField}>
                <Text style={styles.lessonFormLabel}>Discussion Topic</Text>
                <TextInput
                  style={styles.lessonTitleInput}
                  placeholder="Enter discussion topic"
                />
              </View>

              <View style={styles.lessonFormField}>
                <Text style={styles.lessonFormLabel}>Description</Text>
                <TextInput
                  style={styles.lessonDescriptionInput}
                  placeholder="Describe what you'd like to discuss"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={styles.addFilesAddButton}
                onPress={() => {
                  Toast.show("Discussion creation coming soon!", Toast.LONG);
                  setShowDiscussionModal(false);
                }}
              >
                <Text style={styles.addFilesAddButtonText}>
                  Start Discussion
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Grade Scale Modal */}
      <Modal
        visible={showGradeScaleManagement}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowGradeScaleManagement(false)}
      >
        <View style={styles.fullScreenModalContainer}>
          <View style={styles.fullScreenModalContent}>
            <View style={styles.fullScreenModalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setShowGradeScaleManagement(false);
                }}
                style={styles.backButton}
              >
                <SimpleIcon name="arrow-back" size={24} color="#10B144" />
              </TouchableOpacity>
              <Text style={styles.fullScreenModalTitle}>Grade Scale</Text>
              <View style={{ width: 40 }} />

            </View>
            <TouchableOpacity style={styles.manageButton} onPress={() => {
              setShowGradeScaleManagement(false)
              setShowGradeScaleModal(true)
            }}>
              <Text style={styles.manageButtonText}>Manage Grade Scale</Text>
            </TouchableOpacity>
            {showGradeScaleManagementLoader ?
              <ActivityIndicator
                size="large"
                color="#10B144"
                style={{ marginTop: 20 }}
              /> :
              Object.keys(gradeScale).length > 0 ?
                <ScrollView style={{ flex: 1, marginTop: 20 }}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.headerText, { flex: 1 }]}>Grade</Text>
                    <Text style={[styles.headerText, { flex: 2 }]}>Range</Text>
                    <Text style={[styles.headerText, { flex: 3 }]}>Percentage</Text>
                  </View>

                  {/* Table Rows */}
                  {gradeScale?.map((item: GradeScaleItem) => {
                    const percentage = (item.max - item.min) / 100; // simulate visual fill

                    return (
                      <View key={item._id} style={styles.tableRow}>
                        {/* Grade */}
                        <View style={styles.gradeBadge}>
                          <Text style={styles.gradeText}>{item.grade}</Text>
                        </View>

                        {/* Range */}
                        <Text style={[styles.rangeText, { flex: 2 }]}>
                          {item.min}% - {item.max}%
                        </Text>

                        {/* Custom Progress Bar */}
                        <View style={[styles.progressWrapper, { flex: 3 }]}>
                          <View style={[styles.progressBackground]}>
                            <View
                              style={[
                                styles.progressFill,
                                { width: `${percentage * 100}%` },
                              ]}
                            />
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
                :
                <Text style={{ marginTop: 20 }}>No gradescale found for this course.</Text>
            }
          </View>
        </View>
      </Modal>
      <GradeScaleModal
        visible={showGradeScaleModal}
        onClose={() => {
          setShowGradeScaleModal(false)
          setShowGradeScaleManagement(true)
        }
        }
        onSave={async (newGradeScales) => {
          try {
            console.log(newGradeScales)
            const res = await gradingScale(courseId, newGradeScales)
            Toast.show('Successfully created grade scale', Toast.LONG)
            setShowGradeScaleModal(false)
            loadGradeScale()

          }
          catch (err) {
            console.log(err)
            Toast.show('Failed to create grade scale', Toast.LONG)
            setShowGradeScaleModal(false)
            setShowGradeScaleManagement(true)
          }
        }}
      />
      <Modal
        visible={showGPAManagement}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowGPAManagement(false)}
      >
        <View style={styles.fullScreenModalContainer}>
          <View style={styles.fullScreenModalContent}>
            <View style={styles.fullScreenModalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setShowGPAManagement(false);
                }}
                style={styles.backButton}
              >
                <SimpleIcon name="arrow-back" size={24} color="#10B144" />
              </TouchableOpacity>
              <Text style={styles.fullScreenModalTitle}>GPA</Text>
              <View style={{ width: 40 }} />

            </View>
            <TouchableOpacity style={styles.manageButton} onPress={() => {
              setShowGPAManagement(false)
              setShowGPAModal(true)
            }}>
              <Text style={styles.manageButtonText}>Manage GPA</Text>
            </TouchableOpacity>
            {showGPAManagementLoader ?
              <ActivityIndicator
                size="large"
                color="#10B144"
                style={{ marginTop: 20 }}
              /> : Object.keys(GPA).length > 0 ?
                <ScrollView style={{ flex: 1, marginTop: 20 }}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.headerText, { flex: 1 }]}>GPA</Text>
                    <Text style={[styles.headerText, { flex: 2 }]}>Range</Text>
                    <Text style={[styles.headerText, { flex: 3 }]}>Percentage</Text>
                  </View>

                  {/* Table Rows */}
                  {GPA?.map((item: GPAItem) => {
                    const percentage = (item.maxPercentage - item.minPercentage) / 100; // simulate visual fill
                    console.log(percentage)
                    return (
                      <View key={item._id} style={styles.tableRow}>
                        {/* Grade */}
                        <View style={styles.gradeBadge}>
                          <Text style={styles.gradeText}>{item.gpa}</Text>
                        </View>

                        {/* Range */}
                        <Text style={[styles.rangeText, { flex: 2 }]}>
                          {item.minPercentage}% - {item.maxPercentage}%
                        </Text>

                        {/* Custom Progress Bar */}
                        <View style={[styles.progressWrapper, { flex: 3 }]}>
                          <View style={[styles.progressBackground]}>
                            <View
                              style={[
                                styles.progressFill,
                                { width: `${percentage * 100}%` },
                              ]}
                            />
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
                :
                <Text style={{ marginTop: 20 }}>No gradescale found for this course.</Text>}
          </View>
        </View>
      </Modal>
      <GPAModal
        visible={showGPAModal}
        onClose={() => {
          setShowGPAModal(false)
          setShowGPAManagement(true)
        }
        }
        onSave={async (newGradeScales) => {
          try {
            console.log(newGradeScales, courseId)
            const res = await gpaScale(courseId, newGradeScales)
            Toast.show('Successfully created gpa scale', Toast.LONG)
            setShowGPAModal(false)
            loadGradeScale()
          }
          catch (err) {
            console.log(err)
            Toast.show('Failed to create gpa scale', Toast.LONG)
            setShowGPAModal(false)
            setShowGPAManagement(true)
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: 180, borderRadius: 8, marginBottom: 16 },
  thumbnailContainer: {
    position: "relative",
    marginBottom: 16,
  },
  thumbnailUploadButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cameraIconText: {
    fontSize: 20,
    color: "#fff",
  },
  backIconText: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  uploadedText: { color: "#888", fontSize: 12 },
  updatedText: { color: "#888", fontSize: 12 },
  title: { fontSize: 26, fontWeight: "bold", color: "#222"},
  subtitle: { fontSize: 16, color: "#666", marginBottom: 16 },
  infoCard: {
    backgroundColor: "#fdf6f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#5e35b1",
    marginRight: 8,
    fontSize: 15,
  },
  infoValue: { color: "#333", fontSize: 15 },
  section: { marginTop: 18, marginBottom: 8 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#66bb6a",
    marginBottom: 8,
  },
  listItem: { fontSize: 15, color: "#555", marginLeft: 8, marginBottom: 4 },
  ratingBox: {
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  ratingText: { color: "#888", fontSize: 16 },
  commentBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  commentPlaceholder: { color: "#888", fontSize: 15 },
  errorText: { color: "red", fontSize: 16 },
  topActionButtonsContainer: {
    flexDirection: "column",
    marginVertical: 10,
  },
  topActionButton: {
    marginVertical: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  topActionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "bold",
  },
  deleteConfirmButton: {
    backgroundColor: "#ff4444",
  },
  deleteConfirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    position: "relative",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalBody: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  uploadButton: {
    backgroundColor: "#10B144",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  manageCategoriesModalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "95%",
    maxHeight: "80%",
  },
  manageCategoriesModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  manageCategoriesModalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  categoriesListContainer: {
    marginBottom: 20,
  },
  categoryItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
    marginBottom: 10,
  },
  categoryItemHeaderText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#495057",
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  categoryName: {
    fontSize: 14,
  },
  categoryWeightInput: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 14,
    textAlign: "center",
  },
  categoryActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  addNewCategoryContainer: {
    padding: 16,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#dee2e6",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginTop: 20,
  },
  addNewCategoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: "#495057",
    marginBottom: 8,
    fontWeight: "600",
  },
  textInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    alignSelf: "flex-end",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  totalWeightContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#dee2e6",
    marginTop: 20,
  },
  totalWeightText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalWeightValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B144",
  },
  addSemesterButton: {
    backgroundColor: "#10B144",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  addSemesterButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  semesterSection: {
    marginTop: 10,
  },
  semesterCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    padding: 16,
    marginBottom: 10,
  },
  semesterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
  },
  semesterDates: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 4,
  },
  editProfileModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    alignItems: "stretch",
  },
  editProfileTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  editProfileSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dropdownText: {
    fontSize: 16,
  },
  saveChangesButton: {
    backgroundColor: "#1E293B",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  saveChangesButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelProfileButton: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cancelProfileButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  pickerModalContent: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    width: "80%",
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  disabledPickerItem: {
    backgroundColor: "#f0f0f0",
  },
  disabledButton: {
    opacity: 0.7,
  },
  quartersModalContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  quartersModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: Platform.OS === "ios" ? 40 : 10,
  },
  quartersModalTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  quarterCard: {
    backgroundColor: "#eef2f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  quarterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  quarterDates: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 4,
  },
  chaptersModalContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  chaptersModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: Platform.OS === "ios" ? 40 : 10,
  },
  chaptersModalTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  chaptersContent: {
    paddingHorizontal: 8,
    flex: 1,
  },
  chaptersHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 16,
  },
  chaptersHeaderButtonText: {
    fontSize: 18,
    fontWeight: "600",
    paddingLeft: 20,
  },
  createChapterButton: {
    backgroundColor: "#00C853",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  createChapterButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  chapterItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  // chapterItemTitle: {
  //     fontSize: 16,
  //     fontWeight: 'bold',
  //     marginBottom: 4,
  // },
  createChapterModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  createChapterInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  charCounter: {
    textAlign: "right",
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  createChapterModalButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  createChapterModalButtonPrimary: {
    backgroundColor: "#00C853",
  },
  createChapterModalButtonSecondary: {
    borderWidth: 1,
    borderColor: "#ccc",
  },
  createChapterModalButtonTextPrimary: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  createChapterModalButtonTextSecondary: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  chapterItemContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chapterItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  chapterNumberChip: {
    backgroundColor: "#ffe4c2",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 12,
  },
  chapterNumberText: {
    color: "#b26a00",
    fontWeight: "bold",
    fontSize: 15,
  },
  chapterItemTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#222",
    flex: 1,
  },
  chapterItemContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    marginTop: 8,
  },
  chapterItemDescription: {
    color: "#444",
    fontSize: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  chapterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chapterActionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  chapterActionButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  lessonItemText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  pdfSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  pdfFileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  pdfFileInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  pdfFileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  pdfFileText: {
    flex: 1,
    fontSize: 16,
  },
  addFileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 8,
  },
  addFileButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  fileSizeText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  pdfErrorText: {
    fontSize: 14,
    color: "#dc2626",
    marginBottom: 16,
  },
  lessonsChip: {
    backgroundColor: "#eef2ff",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  lessonsChipText: {
    color: "#4338ca",
    fontWeight: "bold",
    fontSize: 14,
  },
  lessonItemContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  lessonItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  lessonNumberChip: {
    backgroundColor: "#e0f2fe",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 12,
  },
  lessonNumberText: {
    color: "#0284c7",
    fontWeight: "bold",
    fontSize: 14,
  },
  lessonItemTitle: {
    fontWeight: "600",
    fontSize: 16,
    color: "#333",
    flexShrink: 1,
    marginLeft: 8,
  },
  lessonItemContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  lessonItemDescription: {
    color: "#555",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  resourcesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  resourceButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  resourceButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  resourceButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  assessmentItemContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  assessmentItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  assessmentContent: {
    flex: 1,
  },
  assessmentCategoryChip: {
    backgroundColor: "#eef2ff",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  assessmentCategoryChipText: {
    color: "#4338ca",
    fontWeight: "600",
    fontSize: 12,
  },
  assessmentInfo: {
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  // Assessment Details Modal Styles
  assessmentDetailsHeader: {
    // height: 56,
    backgroundColor: "#10B144",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  assessmentDetailsBackButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  assessmentDetailsBackText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 8,
  },
  assessmentDetailsEditButton: {
    padding: 8,
  },
  assessmentDetailsHeaderTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  assessmentDetailsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  assessmentDetailsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
  },
  assessmentDetailsCategoryBadge: {
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  assessmentDetailsCategoryText: {
    fontSize: 14,
    color: "#6b7280",
  },
  assessmentDetailsDueDateContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  assessmentDetailsDueDateLabel: {
    fontSize: 16,
    color: "#374151",
  },
  assessmentDetailsDescriptionContainer: {
    backgroundColor: "#e0f2fe",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  assessmentDetailsDescriptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0369a1",
    marginBottom: 8,
  },
  assessmentDetailsDescriptionText: {
    fontSize: 16,
    color: "#0369a1",
  },
  assessmentDetailsQuestionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  assessmentDetailsQuestionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  assessmentDetailsMcqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  assessmentDetailsMcqTitle: {
    fontSize: 16,
    color: "#000",
  },
  assessmentDetailsQuestionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assessmentDetailsQuestionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  assessmentDetailsQuestionText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 16,
  },
  assessmentDetailsOptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  assessmentDetailsBulletPoint: {
    fontSize: 16,
    color: "#000",
    marginRight: 8,
  },
  assessmentDetailsOptionText: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  assessmentDetailsCorrectOption: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  assessmentDetailsWrongOption: {
    backgroundColor: "red",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  assessmentDetailsCorrectLabel: {
    fontSize: 12,
    color: "#16a34a",
    fontWeight: "bold",
    marginLeft: 8,
  },
  // Edit Assessment Modal Styles
  editAssessmentLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    marginTop: 16,
  },
  editAssessmentInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#000",
  },
  editAssessmentCategoryButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editAssessmentCategoryButtonText: {
    fontSize: 16,
    color: "#000",
  },
  editAssessmentSaveButton: {
    backgroundColor: "#10B144",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  editAssessmentSaveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  mcqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  mcqTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  mcqContent: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: 8,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  ratingSectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 12,
  },
  ratingCard: {
    backgroundColor: "#EAFBF2",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
  },
  ratingStarsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
  },
  ratingCountText: {
    color: "#A0AEC0",
    fontSize: 16,
    marginTop: 4,
    fontWeight: "500",
  },
  commentsSectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 12,
  },
  commentInputBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 16,
  },
  commentInput: {
    minHeight: 60,
    fontSize: 16,
    color: "#222",
    borderRadius: 8,
    backgroundColor: "#fff",
    padding: 0,
    textAlignVertical: "top",
  },
  postCommentButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B144",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  postCommentButtonDisabled: {
    backgroundColor: "#A0E7B2",
  },
  postCommentButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  noCommentsText: {
    color: "#A0AEC0",
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
    fontWeight: "500",
  },
  // Chapter Card Styles
  chapterCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chapterCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  chapterDeleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
  },
  chapterCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  chapterCardDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  chapterCardStats: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 16,
  },
  chapterStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chapterStatText: {
    fontSize: 14,
    color: "#666",
  },
  chapterViewButton: {
    backgroundColor: "#10B144",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  chapterViewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Chapter Details Modal Styles
  chapterDetailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 99999999999999999,
  },
  chapterDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chapterDetailsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
  },
  chapterDetailsActions: {
    flexDirection: "row",
    gap: 8,
  },
  chapterDetailsActionButton: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: "#10B144",
    justifyContent: "center",
    alignItems: "center",
  },
  plusButtonContainer: {
    position: "relative",
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
    zIndex: 99999999999999999,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
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
  lessonsPlusButtonContainer: {
    position: "relative",
  },
  lessonsDropdownMenu: {
    position: "absolute",
    top: 30,
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
    zIndex: 9999999999,
  },
  chapterDetailsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  chapterDetailsDescription: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
  },
  lessonsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 9999,
    marginBottom: 16,
  },
  lessonsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  lessonsIcon: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  lessonsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
  },
  lessonsCount: {
    backgroundColor: "#6b7280",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lessonsCountText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  chapterLessonsList: {
    gap: 12,
  },
  chapterLessonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  chapterLessonTitle: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
    flex: 1,
  },
  noLessonsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noLessonsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  noLessonsDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  addLessonButton: {
    alignSelf: "flex-start",
  },
  addLessonButtonText: {
    color: "#10B144",
    fontSize: 16,
    fontWeight: "600",
  },
  // Full Screen Modal Styles
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  fullScreenModalContent: {
    flex: 1,
    padding: 20,
    paddingTop: 60, // Add padding for status bar
  },
  fullScreenModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f9ff",
  },
  fullScreenModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    flex: 1,
  },
  // Lesson Creation Modal Styles
  lessonFormInstruction: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 24,
    lineHeight: 24,
  },
  lessonFormField: {
    marginBottom: 24,
  },
  lessonFormLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  lessonTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lessonTitleInput: {
    flex: 1,
    borderWidth: 1,
    color: "#000",
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  characterCount: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 8,
  },
  lessonDescriptionInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#000",
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 120,
  },
  lessonLinkInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    color: "#000",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  filePickerButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    marginBottom: 12,
  },
  filePickerButtonText: {
    fontSize: 16,
    color: "#6b7280",
  },
  fileList: {
    marginBottom: 12,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
  },
  addAnotherFileButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    marginBottom: 8,
  },
  addAnotherFileText: {
    fontSize: 14,
    color: "#10B144",
    marginLeft: 4,
    fontWeight: "600",
  },
  lessonFileSizeText: {
    fontSize: 12,
    color: "#6b7280",
  },
  lessonCreationActionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  lessonCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    marginRight: 12,
    alignItems: "center",
  },
  lessonCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  lessonSaveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#374151",
    alignItems: "center",
  },
  lessonSaveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  lessonDisabledButton: {
    opacity: 0.6,
  },
  lessonErrorText: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: 8,
    textAlign: "center",
  },
  // Lesson Card Styles
  lessonCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10B144",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
    fontWeight: "600",
  },
  lessonCardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lessonActionIcon: {
    padding: 4,
  },
  lessonCardActionButton: {
    backgroundColor: "#10B144",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lessonCardActionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  lessonAddButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B144",
    justifyContent: "center",
    alignItems: "center",
  },
  lessonCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  lessonCardDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  filesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  filesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  lessonAddFileButton: {
    backgroundColor: "#10B144",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lessonAddFileButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  fileDate: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 8,
  },
  resourcesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  lessonResourcesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  resourcesList: {
    flexDirection: "row",
    gap: 8,
  },
  youtubeResource: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  linkResource: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8b5cf6",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  resourceText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  // Edit Chapter Modal Styles
  editChapterForm: {
    flex: 1,
    padding: 20,
  },
  editChapterField: {
    marginBottom: 20,
  },
  editChapterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  editChapterTitleContainer: {
    position: "relative",
  },
  editChapterTitleInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    paddingRight: 60,
  },
  editChapterDescriptionContainer: {
    position: "relative",
  },
  editChapterDescriptionInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 100,
    paddingBottom: 30,
  },
  editChapterCharacterCount: {
    position: "absolute",
    bottom: 8,
    right: 8,
    fontSize: 12,
    color: "#6b7280",
  },
  editChapterActionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  editChapterCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  editChapterCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  editChapterSaveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#10B144",
  },
  editChapterSaveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  editChapterDisabledButton: {
    opacity: 0.6,
  },
  editChapterErrorText: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: 8,
    textAlign: "center",
  },
  closeButton: {
    padding: 4,
  },
  // Lesson Edit Modal Styles
  lessonEditForm: {
    flex: 1,
    padding: 20,
  },
  lessonEditField: {
    marginBottom: 20,
  },
  lessonEditLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  lessonEditTitleContainer: {
    position: "relative",
  },
  lessonEditTitleInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    paddingRight: 60,
  },
  lessonEditDescriptionContainer: {
    position: "relative",
  },
  lessonEditDescriptionInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 100,
    paddingBottom: 30,
  },
  lessonEditLinkInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  lessonEditCharacterCount: {
    position: "absolute",
    bottom: 8,
    right: 8,
    fontSize: 12,
    color: "#6b7280",
  },
  lessonEditActionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  lessonEditCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  lessonEditCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  lessonEditSaveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#10B144",
  },
  lessonEditSaveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  lessonEditDisabledButton: {
    opacity: 0.6,
  },
  lessonEditErrorText: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: 8,
    textAlign: "center",
  },
  // Add Files Modal Styles
  addFilesContent: {
    padding: 20,
  },
  addFilesInstruction: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  fileInputButton: {
    borderWidth: 2,
    borderColor: "#10B144",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    marginVertical: 16,
    backgroundColor: "#f9fafb",
  },
  fileInputButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B144",
    marginBottom: 4,
  },
  fileInputSubtext: {
    fontSize: 14,
    color: "#6b7280",
  },
  addFilesActionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  addFilesCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  addFilesCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  addFilesAddButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#374151",
  },
  addFilesAddButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  addFilesDisabledButton: {
    opacity: 0.6,
  },
  addFilesErrorText: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: 8,
    textAlign: "center",
  },
  // File Item Styles
  fileItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  noFilesText: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
  // Lesson Assessments Styles
  lessonAssessmentsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  lessonAssessmentsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 12,
  },
  assessmentCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  assessmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  assessmentBadge: {
    backgroundColor: "#374151",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  assessmentBadgeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  assessmentDeleteButton: {
    padding: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  assessmentDescription: {
    fontSize: 14,
    color: "#374151",
  },
  noAssessmentsText: {
    color: "#9ca3af",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  // Lesson Pages Styles
  lessonPagesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  lessonPagesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 12,
  },
  pageCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pageBadge: {
    backgroundColor: "#374151",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pageBadgeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  pageDeleteButton: {
    padding: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  pageDescription: {
    fontSize: 14,
    color: "#374151",
  },
  noPagesText: {
    color: "#9ca3af",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  gradeBadge: {
    backgroundColor: '#6EE7B7',
    borderRadius: 10,
    height: 40,
    flex: 0.8,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  rangeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
  },
  progressWrapper: {
    justifyContent: 'center',
  },
  progressBackground: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B144',
    borderRadius: 10,
  },
  manageButton: {
    backgroundColor: '#10B144',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  manageButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  // Grading Periods Modal Styles
  gradingPeriodsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  gradingPeriodsModalContent: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10
  },
  gradingPeriodsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  gradingPeriodsBackButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    width: 100,
    margin: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  gradingPeriodsBackText: {
    marginLeft: 4,
    fontSize: 16,
    color: "#000",
  },
  gradingPeriodsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  gradingPeriodsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 8,
  },
  gradingPeriodsCreateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  gradingPeriodsCreateText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  gradingPeriodsLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradingPeriodsList: {
    flex: 1,
    padding: 16,
  },
  gradingPeriodsEmptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 16,
    marginTop: 40,
  },
  gradingPeriodItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    padding: 16,
  },
  gradingPeriodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gradingPeriodInfo: {
    flex: 1,
  },
  gradingPeriodTitleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  gradingPeriodQuarterTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
    marginLeft: 16,
  },
  gradingPeriodDates: {
    fontSize: 14,
    color: "#6b7280",
  },
  gradingPeriodActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gradingPeriodSwitchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gradingPeriodSwitchLabel: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  gradingPeriodItemDisabled: {
    opacity: 0.8,
    backgroundColor: "#f9fafb",
  },
  gradingPeriodTextDisabled: {
    color: "#9ca3af",
  },
  gradingPeriodButtonDisabled: {
    opacity: 0.8,
  },
  gradingPeriodAddButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  gradingPeriodAddButtonText: {
    color: "#10B144",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  gradingPeriodEditButton: {
    backgroundColor: "#374151",
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  gradingPeriodQuarters: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  gradingPeriodQuarterItem: {
    marginTop: 8,
  },
  // Semester/Quarter Modal Styles
  semesterModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  semesterModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  semesterModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  semesterModalInfo: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  semesterModalInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  semesterModalInputText: {
    fontSize: 16,
    color: "#000",
  },
  semesterModalPlaceholder: {
    fontSize: 16,
    color: "#9ca3af",
  },
  semesterModalContainer: {
  flexDirection:'row',
  justifyContent:'space-around',
  alignItems:'center'
  },
  semesterModalButton: {
    backgroundColor: "#374151",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  semesterModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  editCategoryDropdownMenu: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
    maxHeight: 180,
    marginTop: 6,
  },
  editCategoryDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  editCategoryDropdownItemActive: {
    backgroundColor: "#eef2ff",
  },
});

export default CourseDetailsPage;
