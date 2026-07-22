import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
  Linking,
  Keyboard,
} from "react-native";
import {
  useRoute,
  useNavigation,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "react-native-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { pick, types } from "@react-native-documents/picker";
import Toast from "react-native-simple-toast";

import SimpleIcon from "../components/SimpleIcon";
import ConfirmationModal from "../components/common/ConfirmationModal";
import CreateChapterModal from "../components/modals/CreateChapterModal";
import EditChapterModal from "../components/modals/EditChapterModal";
import ChapterDetailsModal from "../components/modals/ChapterDetailsModal";
import GradebookModal from "../components/modals/GradebookModal";
import EditCourseModal from "../components/modals/EditCourseModal";
import AddAssessmentCategoryModal from "../components/modals/AddAssessmentCategoryModal";
import ManageCategoriesModal from "../components/modals/ManageCategoriesModal";
import NewSemesterModal from "../components/modals/NewSemesterModal";
import EditSemesterModal from "../components/modals/EditSemesterModal";
import NewQuarterModal from "../components/modals/NewQuarterModal";
import EditQuarterModal from "../components/modals/EditQuarterModal";
import GradingPeriodsModal from "../components/modals/GradingPeriodsModal";
import ChaptersForQuarterModal from "../components/modals/ChaptersForQuarterModal";
import AssessmentDetailsModal from "../components/modals/AssessmentDetailsModal";
import EditAssessmentModal from "../components/modals/EditAssessmentModal";
import AddFilesModal from "../components/modals/AddFilesModal";
import LessonCreationModal from "../components/modals/LessonCreationModal";
import LessonEditModal from "../components/modals/LessonEditModal";
import GradeScaleManagementModal from "../components/modals/GradeScaleManagementModal";
import GPAManagementModal from "../components/modals/GPAManagementModal";
import AddSemesterModal from "../components/modals/AddSemesterModal";
import SemesterPickerModal from "../components/modals/SemesterPickerModal";
import QuarterPickerModal from "../components/modals/QuarterPickerModal";
import QuartersModal from "../components/modals/QuartersModal";
import GPAModal from "../components/modals/GPAModal";
import GradeScaleModal from "../components/modals/GradeScaleModal";

import { VideoIcon } from "../assets/components/VideoIcon";

import {
  getCourseDetails,
  deleteCourse,
  createChapter,
  deleteChapter,
  createAssessmentCategory,
  getAssessmentCategories,
  deleteAssessment,
  editAssessment,
  getSubcategories,
  createLesson,
  deleteLesson,
  editLesson,
  addMoreFilesToLesson,
  deleteLessonFile,
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
} from "../services/course";
import { getCourseRating, createRating } from "../services/rating";
import { getApiInstance } from "../services/apiInstance";
import { getComments, sendComment } from "../services/comment";
import { deletePage } from "../services/page";
import { getCourseGradebook } from "../services/gradebook";
import { fetchCouponsByCourse } from "../services/coupon";
import { useUser } from "../contexts/UserContext";
import { useAuth } from "../contexts/AuthContext";

const fallbackImage = require("../assets/star.png");

const CourseDetailsPage = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<RootStackParamList, "CourseDetails">>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { courseId } = route.params;
  const { user } = useUser();
  const { userRole } = useAuth();
  const plusButtonRef = useRef<any>(null);

  // ---- Core Course State ----
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ---- Modals visibility ----
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [showCreateChapterModal, setShowCreateChapterModal] = useState(false);
  const [showDeleteChapterModal, setShowDeleteChapterModal] = useState(false);
  const [showDeleteLessonModal, setShowDeleteLessonModal] = useState(false);
  const [showDeleteAssessmentModal, setShowDeleteAssessmentModal] =
    useState(false);
  const [showGradeScaleModal, setShowGradeScaleModal] = useState(false);
  const [showGPAModal, setShowGPAModal] = useState(false);
  const [showGradeScaleManagement, setShowGradeScaleManagement] =
    useState(false);
  const [showGPAManagement, setShowGPAManagement] = useState(false);
  const [showCouponsManagement, setShowCouponsManagement] = useState(false);
  const [showGradebookModal, setShowGradebookModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [showChapterDetailsModal, setShowChapterDetailsModal] = useState(false);
  const [showLessonCreationModal, setShowLessonCreationModal] = useState(false);
  const [showLessonEditModal, setShowLessonEditModal] = useState(false);
  const [showAddFilesModal, setShowAddFilesModal] = useState(false);
  const [showEditChapterModal, setShowEditChapterModal] = useState(false);
  const [showAssessmentDetailsModal, setShowAssessmentDetailsModal] =
    useState(false);
  const [showEditAssessmentModal, setShowEditAssessmentModal] = useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] =
    useState(false);
  const [
    showAddNewAssessmentCategoryModal,
    setShowAddNewAssessmentCategoryModal,
  ] = useState(false);
  const [showGradingPeriodsModal, setShowGradingPeriodsModal] = useState(false);
  const [showNewSemesterModal, setShowNewSemesterModal] = useState(false);
  const [showEditSemesterModal, setShowEditSemesterModal] = useState(false);
  const [showNewQuarterModal, setShowNewQuarterModal] = useState(false);
  const [showEditQuarterModal, setShowEditQuarterModal] = useState(false);
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  const [showSemesterPicker, setShowSemesterPicker] = useState(false);
  const [showQuarterPicker, setShowQuarterPicker] = useState(false);
  const [showQuartersModal, setShowQuartersModal] = useState(false);
  const [showChaptersForQuarterModal, setShowChaptersForQuarterModal] =
    useState(false);

  // ---- Chapter / Lesson / Assessment data ----
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterDescription, setChapterDescription] = useState("");
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [chapterToDelete, setChapterToDelete] = useState<any>(null);
  const [deleteChapterLoading, setDeleteChapterLoading] = useState(false);
  const [deleteChapterError, setDeleteChapterError] = useState<string | null>(
    null
  );
  const [lessonToDelete, setLessonToDelete] = useState<any>(null);
  const [deleteLessonLoading, setDeleteLessonLoading] = useState(false);
  const [deleteLessonError, setDeleteLessonError] = useState<string | null>(
    null
  );
  const [assessmentToDelete, setAssessmentToDelete] = useState<any>(null);
  const [deleteAssessmentLoading, setDeleteAssessmentLoading] = useState(false);
  const [deleteAssessmentError, setDeleteAssessmentError] = useState<
    string | null
  >(null);
  const [selectedAssessmentForModal, setSelectedAssessmentForModal] =
    useState<any>(null);
  const [expandedMcq, setExpandedMcq] = useState<{ [key: number]: boolean }>({
    0: true,
  });

  // ---- Assessment Categories ----
  const [assessmentCategories, setAssessmentCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // ---- Edit Assessment ----
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
  const [editQuarterDates, setEditQuarterDates] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [editQuarterId, setEditQuarterId] = useState<string | null>(null);

  // ---- Thumbnail ----
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  // ---- Grading Periods ----
  const [gradingPeriods, setGradingPeriods] = useState<any[]>([]);
  const [loadingGradingPeriods, setLoadingGradingPeriods] = useState(false);
  const [selectedSemesterForQuarter, setSelectedSemesterForQuarter] =
    useState<any>(null);
  const [editingSemester, setEditingSemester] = useState<any>(null);
  const [editingQuarter, setEditingQuarter] = useState<any>(null);
  const [semesterTitle, setSemesterTitle] = useState("");
  const [semesterStartDate, setSemesterStartDate] = useState<string>("");
  const [semesterEndDate, setSemesterEndDate] = useState<string>("");
  const [quarterTitle, setQuarterTitle] = useState("");
  const [quarterStartDate, setQuarterStartDate] = useState<string>("");
  const [quarterEndDate, setQuarterEndDate] = useState<string>("");
  const [showSemesterDatePicker, setShowSemesterDatePicker] = useState<
    "start" | "end" | null
  >(null);
  const [showQuarterDatePicker, setShowQuarterDatePicker] = useState<
    "start" | "end" | null
  >(null);

  // ---- Add Semester to Course ----
  const [allSemesters, setAllSemesters] = useState<any[]>([]);
  const [quarters, setQuarters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<any>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<any>(null);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingQuarters, setLoadingQuarters] = useState(false);
  const [isSavingSemester, setIsSavingSemester] = useState(false);

  // ---- Quarters & Chapters ----
  const [semesterQuarters, setSemesterQuarters] = useState<any[]>([]);
  const [loadingSemesterQuarters, setLoadingSemesterQuarters] = useState(false);
  const [chaptersForQuarter, setChaptersForQuarter] = useState<any[]>([]);
  const [loadingChaptersForQuarter, setLoadingChaptersForQuarter] =
    useState(false);
  const [chaptersMessage, setChaptersMessage] = useState("");
  const [selectedQuarterId, setSelectedQuarterId] = useState<string | null>(
    null
  );
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  // ---- Chapter Details ----
  const [chapterDetails, setChapterDetails] = useState<any>(null);
  const [chapterDetailsLoading, setChapterDetailsLoading] = useState(false);
  const [chapterDetailsError, setChapterDetailsError] = useState<string | null>(
    null
  );
  const [currentChapterForLesson, setCurrentChapterForLesson] = useState<
    string | null
  >(null);
  const [currentChapterForEdit, setCurrentChapterForEdit] = useState<
    string | null
  >(null);

  // ---- Lesson Creation ----
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

  // ---- Lesson Edit ----
  const [lessonEditTitle, setLessonEditTitle] = useState("");
  const [lessonEditDescription, setLessonEditDescription] = useState("");
  const [lessonEditYoutubeLink, setLessonEditYoutubeLink] = useState("");
  const [lessonEditOtherLink, setLessonEditOtherLink] = useState("");
  const [lessonEditLoading, setLessonEditLoading] = useState(false);
  const [lessonEditError, setLessonEditError] = useState<string | null>(null);
  const [currentLessonForEdit, setCurrentLessonForEdit] = useState<
    string | null
  >(null);

  // ---- Add Files ----
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [totalFileSize, setTotalFileSize] = useState(0);
  const [addFilesLoading, setAddFilesLoading] = useState(false);
  const [addFilesError, setAddFilesError] = useState<string | null>(null);
  const MAX_PDF_SIZE_MB = 5;
  const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

  // ---- Edit Chapter ----
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editChapterDescription, setEditChapterDescription] = useState("");
  const [editChapterLoading, setEditChapterLoading] = useState(false);
  const [editChapterError, setEditChapterError] = useState<string | null>(null);

  // ---- Grade Scale & GPA ----
  const [gradeScale, setGradeScale] = useState<any[]>([]);
  const [GPA, setGPA] = useState<any[]>([]);
  const [gpaError, setGpaError] = useState<string | null>(null);
  const [showGradeScaleManagementLoader, setShowGradeScaleManagementLoader] =
    useState(false);
  const [showGPAManagementLoader, setShowGPAManagementLoader] = useState(false);
  const [showCouponsManagementLoader, setShowCouponsManagementLoader] =
    useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);

  // ---- Ratings & Comments ----
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [selectedStars, setSelectedStars] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // ---- Gradebook ----
  const [gradebookData, setGradebookData] = useState<any>(null);
  const [gradebookLoading, setGradebookLoading] = useState(false);
  const [gradebookError, setGradebookError] = useState<string | null>(null);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(
    new Set()
  );
  const [expandedSemesters, setExpandedSemesters] = useState<Set<string>>(
    new Set()
  );
  const [expandedQuarters, setExpandedQuarters] = useState<Set<string>>(
    new Set()
  );

  // ---- Edit Course ----
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

  // ---- Dropdowns ----
  const [showPlusDropdown, setShowPlusDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [showLessonsPlusDropdown, setShowLessonsPlusDropdown] = useState(false);
  const [currentLessonForAssessment, setCurrentLessonForAssessment] =
    useState<any>(null);
  const [showMore, setShowMore] = useState(false);
  const [keyboardPadding, setKeyboardPadding] = useState(16);

  // ---- Helpers ----
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDateFromInput = (dateString: string) => {
    const [day, month, year] = dateString.split("/");
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  };

  const getLastSemesterEndDate = () => {
    if (gradingPeriods.length === 0) return null;
    const sorted = [...gradingPeriods].sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    );
    return sorted[0].endDate;
  };

  const isLong =
    course?.courseDescription && course.courseDescription.length > 500;
  const courseDescription = course?.courseDescription
    ? showMore
      ? course.courseDescription
      : course.courseDescription.slice(0, 500) + (isLong ? "..." : "")
    : "";

  // ---- Effects ----
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardPadding(17)
    );
    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardPadding(16)
    );
    return () => {
      keyboardDidHide.remove();
      keyboardDidShow.remove();
    };
  }, []);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  useEffect(() => {
    if (course?._id) {
      fetchRatingAndComments();
    }
  }, [course?._id, refreshKey]);

  useEffect(() => {
    if (showAddSemesterModal) {
      fetchAllSemesters();
    }
  }, [showAddSemesterModal]);

  useEffect(() => {
    if (showGradingPeriodsModal) {
      fetchGradingPeriods();
    }
  }, [showGradingPeriodsModal]);

  useFocusEffect(
    useCallback(() => {
      if (chapterDetails?._id) {
        handleViewChapterDetails(chapterDetails._id);
      }
    }, [])
  );

  // ---- Data fetching ----
  const fetchCourseDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCourseDetails(courseId);
      setCourse(res.course);
    } catch {
      setError("Failed to load course details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchGradingPeriods = async () => {
    setLoadingGradingPeriods(true);
    try {
      const res = await getSemestersOfCourse(courseId);
      setGradingPeriods(res.semesters || []);
    } catch (error: any) {
      Toast.show(
        error.message || "Failed to fetch grading periods.",
        Toast.LONG
      );
    } finally {
      setLoadingGradingPeriods(false);
    }
  };

  const fetchAllSemesters = async () => {
    setLoadingSemesters(true);
    try {
      const res = await getSemesters();
      setAllSemesters(res.semesters || []);
    } catch (error: any) {
      Toast.show(error.message || "Failed to fetch semesters.", Toast.LONG);
    } finally {
      setLoadingSemesters(false);
    }
  };

  const fetchAssessmentCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await getAssessmentCategories(courseId);
      setAssessmentCategories(
        response.categories.map((cat: any) => ({
          id: cat._id,
          title: cat.name,
          weight: cat.weight.toString(),
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

  const fetchRatingAndComments = async () => {
    setCommentsLoading(true);
    try {
      const ratingRes = await getCourseRating(course._id);
      if (ratingRes) {
        setAverageRating(ratingRes.averageStar || 0);
        setRatingCount(ratingRes.count || 0);
      }
      const commentsRes = await getComments(course._id);
      setComments(commentsRes?.comments || []);
    } catch (err) {
      // ignore
    } finally {
      setCommentsLoading(false);
    }
  };

  const refreshChaptersForCourse = async (courseId: string) => {
    setLoadingChaptersForQuarter(true);
    setChaptersForQuarter([]);
    setChaptersMessage("");
    try {
      const res = await getChaptersForCourses(courseId);
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

  const fetchSubcategories = async (categoryId: string) => {
    if (!categoryId) return;
    setSubcategoriesLoading(true);
    try {
      const data = await getSubcategories(categoryId);
      setSubcategories(data.data || []);
    } catch (err) {
      setSubcategories([]);
    } finally {
      setSubcategoriesLoading(false);
    }
  };

  const loadGradeScale = async () => {
    setShowGradeScaleManagement(true);
    setShowGradeScaleManagementLoader(true);
    try {
      const res = await getGradeScale(courseId);
      setGradeScale(res);
    } catch (err: any) {
      // Check if error is a 404 (no grade scale found)
      const is404 =
        err?.response?.status === 404 ||
        err?.message?.toLowerCase().includes("not found") ||
        err?.response?.data?.message?.toLowerCase().includes("not found");

      if (is404) {
        Toast.show("No grade scale found. You can create one.", Toast.LONG);
        // Optionally set gradeScale to empty array so management modal shows "empty" state
        setGradeScale([]);
      } else {
        Toast.show(err?.message || "Failed to load grade scale", Toast.LONG);
      }
    } finally {
      setShowGradeScaleManagementLoader(false);
    }
  };

  const loadGPA = async () => {
    if (!courseId) {
      Toast.show("Course ID is missing", Toast.LONG);
      return;
    }
    console.log(courseId);
    setShowGPAManagement(true);
    setShowGPAManagementLoader(true);
    setGpaError(null); // clear previous errors
    try {
      const res = await getGPA(courseId);
      setGPA(res);
    } catch (err: any) {
      // Check for 404 vs other errors
      const status = err?.response?.status;
      if (status === 404) {
        // No GPA scale found – this is not an error, just empty state
        setGPA([]);
        setGpaError(null);
        Toast.show("No GPA scale found. You can create one.", Toast.LONG);
      } else if (status === 500) {
        setGpaError("Server error. Please try again later.");
        Toast.show("Failed to load GPA due to server error.", Toast.LONG);
      } else {
        setGpaError(err?.message || "Failed to load GPA");
        Toast.show(err?.message || "Failed to load GPA", Toast.LONG);
      }
    } finally {
      setShowGPAManagementLoader(false);
    }
  };

  const retryLoadGPA = () => {
    loadGPA(); // re-run the fetch
  };

  const loadStandardGradeScale = () => {
    navigation.navigate("StandardGradeScaleManagement", { courseId: course._id });

  }

  // ---- Handlers ----
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
      navigation.navigate("Main" as never);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to archive course");
    }
  };

  const handleUnarchiveCourse = async () => {
    try {
      await unarchiveCourse(courseId);
      setShowUnarchiveModal(false);
      Toast.show("Course unarchived successfully", Toast.LONG);
      navigation.navigate("Main" as never);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to unarchive course");
    }
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
    setChapterLoading(true);
    setChapterError(null);
    try {
      await createChapter(
        courseId,
        chapterTitle.trim(),
        chapterDescription.trim(),
        selectedQuarterId
      );
      Toast.show("Chapter created successfully!", Toast.LONG);
      setChapterTitle("");
      setChapterDescription("");
      setShowCreateChapterModal(false);
      if (course?.semesterbased) {
        await refreshChaptersForQuarter(selectedQuarterId);
      } else {
        await refreshChaptersForCourse(courseId);
      }
      setShowChaptersForQuarterModal(true);
    } catch (err: any) {
      setChapterError(err.message || "Failed to create chapter.");
    } finally {
      setChapterLoading(false);
    }
  };

  const handleDeleteChapter = async () => {
    if (!chapterToDelete) return;
    setDeleteChapterLoading(true);
    setDeleteChapterError(null);
    try {
      await deleteChapter(chapterToDelete._id);
      setShowDeleteChapterModal(false);
      setChapterToDelete(null);
      Toast.show("Chapter deleted successfully.", Toast.LONG);
      if (course?.semesterbased && selectedQuarterId) {
        await refreshChaptersForQuarter(selectedQuarterId);
      } else {
        await refreshChaptersForCourse(courseId);
      }
      setShowChaptersForQuarterModal(true);
    } catch (err: any) {
      setDeleteChapterError(err.message || "Failed to delete chapter.");
    } finally {
      setDeleteChapterLoading(false);
    }
  };

  const handleViewChapterDetails = async (chapterId: string) => {
    setShowChaptersForQuarterModal(false);
    setShowChapterDetailsModal(true);
    setChapterDetailsLoading(true);
    setChapterDetailsError(null);
    try {
      const res = await getChapterDetailsWithLessons(chapterId);
      setChapterDetails(res.chapter);
      setCurrentChapterForLesson(chapterId);
    } catch (error: any) {
      setChapterDetailsError(
        error.message || "Failed to fetch chapter details"
      );
    } finally {
      setChapterDetailsLoading(false);
    }
  };

  const handleEditChapter = () => {
    if (chapterDetails) {
      setEditChapterTitle(chapterDetails.title);
      setEditChapterDescription(chapterDetails.description);
      setCurrentChapterForEdit(chapterDetails._id);
      setShowChapterDetailsModal(false);
      setShowEditChapterModal(true);
    }
  };

  // const handleUpdateChapter = async () => {
  //   if (!editChapterTitle.trim() || !editChapterDescription.trim()) {
  //     Toast.show("Chapter title and description are required", Toast.LONG);
  //     return;
  //   }
  //   if (!currentChapterForEdit) {
  //     Toast.show("Chapter not found", Toast.LONG);
  //     return;
  //   }
  //   setEditChapterLoading(true);
  //   setEditChapterError(null);
  //   try {
  //     await editChapter(
  //       currentChapterForEdit,
  //       editChapterTitle,
  //       editChapterDescription
  //     );
  //     Toast.show("Chapter updated successfully", Toast.LONG);
  //     setShowEditChapterModal(false);
  //     const updated = await getChapterDetailsWithLessons(currentChapterForEdit);
  //     setChapterDetails(updated.chapter);
  //     setShowChapterDetailsModal(true);
  //   } catch (error: any) {
  //     setEditChapterError(error.message || "Failed to update chapter");
  //   } finally {
  //     setEditChapterLoading(false);
  //   }
  // };

  const handleChapterUpdated = (updatedChapter: any) => {
    console.log("Received in parent:", updatedChapter);

    setChapterDetails(updatedChapter);

    // Optional: refresh chapter list if it's open
    if (course?.semesterbased && selectedQuarterId) {
      refreshChaptersForQuarter(selectedQuarterId);
    } else {
      refreshChaptersForCourse(courseId);
    }

    setShowEditChapterModal(false);
    setShowChapterDetailsModal(true);
  };

  const handleAddLesson = () => {
    if (chapterDetails) {
      setCurrentChapterForLesson(chapterDetails._id);
      setShowChapterDetailsModal(false);
      setShowLessonCreationModal(true);
    }
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
    setLessonCreationLoading(true);
    setLessonCreationError(null);
    try {
      await createLesson(
        currentChapterForLesson,
        lessonCreationTitle,
        lessonCreationDescription,
        lessonCreationYoutubeLink,
        lessonCreationOtherLink,
        lessonCreationFiles
      );
      Toast.show("Lesson created successfully", Toast.LONG);
      setLessonCreationTitle("");
      setLessonCreationDescription("");
      setLessonCreationYoutubeLink("");
      setLessonCreationOtherLink("");
      setLessonCreationFiles([]);
      setShowLessonCreationModal(false);
      const updated = await getChapterDetailsWithLessons(
        currentChapterForLesson
      );
      setChapterDetails(updated.chapter);
      setShowChapterDetailsModal(true);
    } catch (error: any) {
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
    setShowChapterDetailsModal(false);
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
    setLessonEditLoading(true);
    setLessonEditError(null);
    try {
      await editLesson(
        currentLessonForEdit,
        lessonEditTitle,
        lessonEditDescription,
        lessonEditYoutubeLink,
        lessonEditOtherLink
      );
      Toast.show("Lesson updated successfully", Toast.LONG);
      setShowLessonEditModal(false);
      if (currentChapterForLesson) {
        const updated = await getChapterDetailsWithLessons(
          currentChapterForLesson
        );
        setChapterDetails(updated.chapter);
      }
      setShowChapterDetailsModal(true);
    } catch (error: any) {
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
    setShowChapterDetailsModal(false);
    setShowAddFilesModal(true);
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
    setAddFilesLoading(true);
    setAddFilesError(null);
    try {
      await addMoreFilesToLesson(currentLessonForEdit, selectedFiles);
      Toast.show("Files added successfully", Toast.LONG);
      setShowAddFilesModal(false);
      if (currentChapterForLesson) {
        const updated = await getChapterDetailsWithLessons(
          currentChapterForLesson
        );
        setChapterDetails(updated.chapter);
      }
      setShowChapterDetailsModal(true);
    } catch (error: any) {
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
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLessonFile(lessonId, fileId);
              Toast.show("File deleted successfully", Toast.LONG);
              if (currentChapterForLesson) {
                const updated = await getChapterDetailsWithLessons(
                  currentChapterForLesson
                );
                setChapterDetails(updated.chapter);
              }
            } catch (error: any) {
              Toast.show(error.message || "Failed to delete file", Toast.LONG);
            }
          },
        },
      ]
    );
  };

  // ---- Delete lesson from modal (uses lessonToDelete state) ----
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

  // ---- Delete lesson directly from chapter details (without modal state) ----
  const handleDeleteLessonFromChapter = async (lessonId: string) => {
    Alert.alert(
      "Are you absolutely sure?",
      "This action cannot be undone. This will permanently delete the lesson.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLesson(lessonId);
              Toast.show("Lesson deleted successfully", Toast.LONG);
              if (currentChapterForLesson) {
                const updated = await getChapterDetailsWithLessons(
                  currentChapterForLesson
                );
                setChapterDetails(updated.chapter);
              }
            } catch (error: any) {
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

  const handleDeleteAssessment = async () => {
    if (!assessmentToDelete) return;
    setDeleteAssessmentLoading(true);
    setDeleteAssessmentError(null);
    try {
      await deleteAssessment(assessmentToDelete._id);
      Toast.show("Assessment deleted successfully.", Toast.LONG);
      setShowDeleteAssessmentModal(false);
      setAssessmentToDelete(null);
      if (chapterDetails?._id) {
        const updated = await getChapterDetailsWithLessons(chapterDetails._id);
        setChapterDetails(updated.chapter);
      }
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
      if (chapterDetails?._id) {
        const updated = await getChapterDetailsWithLessons(chapterDetails._id);
        setChapterDetails(updated.chapter);
      }
      if (selectedQuarterId) {
        await refreshChaptersForQuarter(selectedQuarterId);
      }
    } catch (err: any) {
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
    if (editQuarterDates) {
      const due = editAssessmentDueDate.getTime();
      const start = new Date(editQuarterDates.startDate).getTime();
      const end = new Date(editQuarterDates.endDate).getTime();
      if (due < start || due > end) {
        Toast.show(
          `Due date must be between ${formatDate(
            new Date(start)
          )} and ${formatDate(new Date(end))}`,
          Toast.LONG
        );
        return;
      }
    }
    setEditAssessmentLoading(true);
    try {
      const payload = {
        title: editAssessmentTitle.trim(),
        description: editAssessmentDescription.trim(),
        category: editAssessmentCategory,
        dueDate: editAssessmentDueDate.toISOString(),
      };
      await editAssessment(selectedAssessmentForModal._id, payload);
      Toast.show("Assessment updated successfully", Toast.LONG);
      setShowEditAssessmentModal(false);
      setShowAssessmentDetailsModal(true);
      if (chapterDetails?._id) {
        const updated = await getChapterDetailsWithLessons(chapterDetails._id);
        setChapterDetails(updated.chapter);
        const newSelected = updated.chapter.chapter_assessments.find(
          (a: any) => a._id === selectedAssessmentForModal._id
        );
        if (newSelected) setSelectedAssessmentForModal(newSelected);
      }
    } catch (err: any) {
      Toast.show(err.message || "Failed to update assessment", Toast.LONG);
    } finally {
      setEditAssessmentLoading(false);
    }
  };

  const openEditAssessmentModal = async (assessment: any) => {
    setSelectedAssessmentForModal(assessment);
    setEditAssessmentTitle(assessment.title);
    setEditAssessmentDescription(assessment.description);
    setEditAssessmentCategory(assessment.category?._id || "");
    if (assessment.dueDate?.date) {
      const due = new Date(assessment.dueDate.date);
      if (assessment.dueDate.time) {
        const [h, m] = assessment.dueDate.time.split(":");
        due.setHours(parseInt(h), parseInt(m));
      }
      setEditAssessmentDueDate(due);
    }
    try {
      const res = await getAssessmentCategories(courseId);
      setAssessmentCategories(
        res.categories.map((cat: any) => ({
          id: cat._id,
          title: cat.name,
          weight: cat.weight.toString(),
        }))
      );
    } catch (error) {
      /* ignore */
    }
    const quarterId =
      assessment.quarter || chapterDetails?.quarter || selectedQuarterId;
    if (quarterId) {
      setEditQuarterId(quarterId);
      await fetchQuarterDatesForEdit(quarterId);
    }
    setShowAssessmentDetailsModal(false);
    setShowEditAssessmentModal(true);
  };

  const fetchQuarterDatesForEdit = async (quarterId: string) => {
    try {
      const api = await getApiInstance();
      const res = await api.get(`/api/quarter/getDatesofQuarter/${quarterId}`);
      setEditQuarterDates({
        startDate: res.data.startDate,
        endDate: res.data.endDate,
      });
    } catch (error) {
      /* ignore */
    }
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      await deletePage(pageId);
      Toast.show("Page deleted successfully.", Toast.LONG);
      if (chapterDetails?._id) {
        const updated = await getChapterDetailsWithLessons(chapterDetails._id);
        setChapterDetails(updated.chapter);
      }
      if (selectedQuarterId) {
        await refreshChaptersForQuarter(selectedQuarterId);
      }
    } catch (err: any) {
      Toast.show(err.message || "Failed to delete page.", Toast.LONG);
    }
  };

  const handleOpenLink = (url: string) => {
    if (url) Linking.openURL(url);
  };

  const handlePostComment = async () => {
    if (!comment.trim()) {
      Toast.show("Please enter a comment", Toast.SHORT);
      return;
    }
    setIsSubmittingComment(true);
    try {
      const response = await sendComment(course._id, comment.trim());
      const newComment = response.comment || response.data || response;
      if (newComment?._id) {
        setComments((prev) => [newComment, ...prev]);
        setComment("");
        setRefreshKey((prev) => prev + 1);
        Toast.show("Comment posted!", Toast.SHORT);
      } else {
        setRefreshKey((prev) => prev + 1);
        Toast.show("Failed to post comment", Toast.SHORT);
      }
    } catch (err: any) {
      Toast.show(err.message || "Failed to post comment.", Toast.LONG);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitRating = async () => {
    if (selectedStars === 0) {
      Toast.show("Please select a rating", Toast.SHORT);
      return;
    }
    setIsSubmittingRating(true);
    try {
      await createRating(course._id, selectedStars);
      Toast.show("Rating submitted successfully!", Toast.SHORT);
      setSelectedStars(0);
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      Toast.show(err.message || "Failed to submit rating", Toast.LONG);
    } finally {
      setIsSubmittingRating(false);
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
    setIsSavingSemester(true);
    try {
      await addSemesterToCourse(
        courseId,
        selectedSemester._id,
        selectedQuarter._id
      );
      Toast.show("Semester and quarter added to the course.", Toast.LONG);
      setShowAddSemesterModal(false);
      setSelectedSemester(null);
      setSelectedQuarter(null);
      await fetchCourseDetails();
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
    setLoadingSemesterQuarters(true);
    try {
      const res = await getQuartersForSemester(semester._id);
      const fetched = res.quarters || [];
      const assignedIds = Array.isArray(course?.quarter)
        ? course.quarter
            .map((q: any) => q?._id || q?.quarterId || q?.quarter || q)
            .filter(Boolean)
        : [];
      const quartersToShow =
        assignedIds.length > 0
          ? fetched.filter((q: any) => assignedIds.includes(q._id))
          : fetched;
      setSemesterQuarters(quartersToShow);
    } catch (error: any) {
      Toast.show(error.message || "Failed to fetch quarters.", Toast.LONG);
    } finally {
      setLoadingSemesterQuarters(false);
    }
  };

  const handleQuarterCardPress = async (quarter: any) => {
    setSelectedQuarterId(quarter._id);
    setShowQuartersModal(false);
    setShowChaptersForQuarterModal(true);
    await refreshChaptersForQuarter(quarter._id);
  };

  const handleChapterPress = async () => {
    console.log("this is the end, hold your breathe and count till death");
    setShowChaptersForQuarterModal(true);
    await refreshChaptersForCourse(courseId);
  };

  const handleCreateSemester = async () => {
    if (!semesterTitle.trim() || !semesterStartDate || !semesterEndDate) {
      Toast.show("Please fill all fields", Toast.LONG);
      return;
    }
    const lastEnd = getLastSemesterEndDate();
    if (lastEnd) {
      const start = new Date(parseDateFromInput(semesterStartDate));
      const last = new Date(lastEnd);
      if (start <= last) {
        Toast.show(
          "New semester must start after the last semester ends",
          Toast.LONG
        );
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
        parseDateFromInput(semesterStartDate).toISOString(),
        parseDateFromInput(semesterEndDate).toISOString()
      );
      Toast.show("Semester created successfully", Toast.LONG);
      setShowNewSemesterModal(false);
      setShowGradingPeriodsModal(true);
      setSemesterTitle("");
      setSemesterStartDate("");
      setSemesterEndDate("");
      await fetchGradingPeriods();
      await fetchCourseDetails();
    } catch (error: any) {
      Toast.show(error.message || "Failed to create semester", Toast.LONG);
    }
  };

  const handleEditSemester = async () => {
    if (!semesterTitle.trim() || !semesterStartDate || !semesterEndDate) {
      Toast.show("Please fill all fields", Toast.LONG);
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
        parseDateFromInput(semesterStartDate).toISOString(),
        parseDateFromInput(semesterEndDate).toISOString()
      );
      Toast.show("Semester updated successfully", Toast.LONG);
      setShowEditSemesterModal(false);
      setShowGradingPeriodsModal(true);
      setEditingSemester(null);
      setSemesterTitle("");
      setSemesterStartDate("");
      setSemesterEndDate("");
      await fetchGradingPeriods();
      await fetchCourseDetails();
    } catch (error: any) {
      Toast.show(error.message || "Failed to update semester", Toast.LONG);
    }
  };

  const handleCreateQuarter = async () => {
    if (!quarterTitle.trim() || !quarterStartDate || !quarterEndDate) {
      Toast.show("Please fill all fields", Toast.LONG);
      return;
    }
    const semester = selectedSemesterForQuarter;
    const semesterStart = new Date(semester.startDate);
    const semesterEnd = new Date(semester.endDate);
    const quarterStart = new Date(parseDateFromInput(quarterStartDate));
    const quarterEnd = new Date(parseDateFromInput(quarterEndDate));
    if (quarterStart < semesterStart || quarterEnd > semesterEnd) {
      Toast.show(
        "Quarter dates must be within the semester duration",
        Toast.LONG
      );
      return;
    }
    if (quarterStart >= quarterEnd) {
      Toast.show("End date must be after start date", Toast.LONG);
      return;
    }
    try {
      await createQuarter(
        semester._id,
        quarterTitle,
        parseDateFromInput(quarterStartDate).toISOString(),
        parseDateFromInput(quarterEndDate).toISOString()
      );
      Toast.show("Quarter created successfully", Toast.LONG);
      setShowNewQuarterModal(false);
      setShowGradingPeriodsModal(true);
      setSelectedSemesterForQuarter(null);
      setQuarterTitle("");
      setQuarterStartDate("");
      setQuarterEndDate("");
      await fetchGradingPeriods();
      await fetchCourseDetails();
    } catch (error: any) {
      Toast.show(error.message || "Failed to create quarter", Toast.LONG);
    }
  };

  const handleEditQuarter = async () => {
    if (!quarterTitle.trim() || !quarterStartDate || !quarterEndDate) {
      Toast.show("Please fill all fields", Toast.LONG);
      return;
    }
    const semester = gradingPeriods.find((s) =>
      s.quarters?.some((q: any) => q._id === editingQuarter._id)
    );
    if (!semester) {
      Toast.show("Semester not found", Toast.LONG);
      return;
    }
    const semesterStart = new Date(semester.startDate);
    const semesterEnd = new Date(semester.endDate);
    const quarterStart = new Date(parseDateFromInput(quarterStartDate));
    const quarterEnd = new Date(parseDateFromInput(quarterEndDate));
    if (quarterStart < semesterStart || quarterEnd > semesterEnd) {
      Toast.show(
        "Quarter dates must be within the semester duration",
        Toast.LONG
      );
      return;
    }
    if (quarterStart >= quarterEnd) {
      Toast.show("End date must be after start date", Toast.LONG);
      return;
    }
    try {
      await updateQuarter(
        editingQuarter._id,
        courseId,
        editingQuarter.semester,
        quarterTitle,
        parseDateFromInput(quarterStartDate).toISOString(),
        parseDateFromInput(quarterEndDate).toISOString()
      );
      Toast.show("Quarter updated successfully", Toast.LONG);
      setShowEditQuarterModal(false);
      setShowGradingPeriodsModal(true);
      setEditingQuarter(null);
      setQuarterTitle("");
      setQuarterStartDate("");
      setQuarterEndDate("");
      await fetchGradingPeriods();
      await fetchCourseDetails();
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
      await fetchGradingPeriods();
      await fetchCourseDetails();
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
      await fetchGradingPeriods();
      await fetchCourseDetails();
    } catch (error: any) {
      Toast.show(error.message || "Failed to update quarter", Toast.LONG);
    }
  };

  const openEditSemesterModal = (semester: any) => {
    setEditingSemester(semester);
    setSemesterTitle(semester.title);
    setSemesterStartDate(formatDateForInput(semester.startDate));
    setSemesterEndDate(formatDateForInput(semester.endDate));
    setShowGradingPeriodsModal(false);
    setShowEditSemesterModal(true);
  };

  const openEditQuarterModal = (quarter: any) => {
    setEditingQuarter(quarter);
    setQuarterTitle(quarter.title);
    setQuarterStartDate(formatDateForInput(quarter.startDate));
    setQuarterEndDate(formatDateForInput(quarter.endDate));
    setShowEditQuarterModal(true);
    setShowGradingPeriodsModal(false);
  };

  const openNewQuarterModal = (semester: any) => {
    setSelectedSemesterForQuarter(semester);
    setQuarterTitle("");
    setQuarterStartDate("");
    setQuarterEndDate("");
    setShowNewQuarterModal(true);
    setShowGradingPeriodsModal(false);
  };

  const toggleStudent = (studentId: string) => {
    const newSet = new Set(expandedStudents);
    if (newSet.has(studentId)) newSet.delete(studentId);
    else newSet.add(studentId);
    setExpandedStudents(newSet);
  };

  const toggleSemester = (semesterId: string) => {
    const newSet = new Set(expandedSemesters);
    if (newSet.has(semesterId)) newSet.delete(semesterId);
    else newSet.add(semesterId);
    setExpandedSemesters(newSet);
  };

  const toggleQuarter = (quarterId: string) => {
    const newSet = new Set(expandedQuarters);
    if (newSet.has(quarterId)) newSet.delete(quarterId);
    else newSet.add(quarterId);
    setExpandedQuarters(newSet);
  };

  const handleThumbnailUpload = () => {
    const options = {
      mediaType: "photo" as const,
      quality: 0.8 as const,
      includeBase64: false,
    };
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorMessage || !response.assets?.[0])
        return;
      uploadThumbnail(response.assets[0]);
    });
  };

  const uploadThumbnail = async (asset: any) => {
    setThumbnailUploading(true);
    setThumbnailError(null);
    try {
      await updateCourseThumbnail(courseId, asset);
      setCourse((prev: any) => ({
        ...prev,
        thumbnail: {
          url: asset.uri,
          filename: asset.fileName || "thumbnail.jpg",
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

  const handleFilePickForLessonCreation = async () => {
    try {
      const result = await pick({
        type: [types.pdf],
        copyTo: "cachesDirectory",
      });
      if (result?.length) {
        const file = result[0];
        const sizeMB = file.size ? file.size / (1024 * 1024) : 0;
        if (sizeMB > 5) {
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
      Toast.show("Error picking file", Toast.LONG);
    }
  };

  const handleFilePickForAddFiles = async () => {
    try {
      const result = await pick({
        type: [types.pdf],
        copyTo: "cachesDirectory",
      });
      if (result?.length) {
        const file = result[0];
        const sizeMB = file.size ? file.size / (1024 * 1024) : 0;
        if (sizeMB > 5) {
          Toast.show("File size must be less than 5MB", Toast.LONG);
          return;
        }
        const newFile = {
          uri: file.uri,
          fileName: file.name || file.uri.split("/").pop(),
          fileSize: file.size,
          type: "application/pdf",
        };
        const updated = [...selectedFiles, newFile];
        const total = updated.reduce((sum, f) => sum + (f.fileSize || 0), 0);
        if (total > MAX_PDF_SIZE_BYTES) {
          Toast.show(
            `Total file size cannot exceed ${MAX_PDF_SIZE_MB}MB`,
            Toast.LONG
          );
          return;
        }
        setSelectedFiles(updated);
        setTotalFileSize(total);
      }
    } catch (error) {
      // ignore
    }
  };

  const handleRemoveSelectedFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    const total = newFiles.reduce((sum, f) => sum + (f.fileSize || 0), 0);
    setTotalFileSize(total);
  };

  // ---- Dropdown handlers ----
  const handlePlusButtonPress = () => {
    // if (!showPlusDropdown && plusButtonRef.current) {
    //   plusButtonRef.current.measure(
    //     (
    //       fx: number,
    //       fy: number,
    //       width: number,
    //       height: number,
    //       px: number,
    //       py: number
    //     ) => {
    //       setDropdownPosition({ x: px, y: py + height });
    //       setShowPlusDropdown(true);
    //     }
    //   );
    // } else {
    //   setShowPlusDropdown(false);
    // }
    setShowPlusDropdown((prev) => !prev);
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
        setShowChapterDetailsModal(false);
        if (chapterDetails) {
          const semesterId =
            selectedQuarter?.semester || course?.semester?.[0]?._id;
          // Using any to bypass type restriction for lessonId
          (navigation as any).navigate("CreateAssessment", {
            courseId,
            chapterId: chapterDetails._id,
            semesterId: semesterId || undefined,
            quarterId: selectedQuarterId || undefined,
            refreshAssessments: () =>
              handleViewChapterDetails(chapterDetails._id),
            navigateBack: () => {
              setShowChapterDetailsModal(true);
              navigation.goBack();
            },
          });
        } else {
          Toast.show("Please select a chapter and quarter first", Toast.LONG);
        }
        break;
      case "page":
        if (chapterDetails && course?._id) {
          setShowChapterDetailsModal(false);
          (navigation as any).navigate("ChapterPages", {
            courseId: course._id,
            chapterId: chapterDetails._id,
            navigateBack: () => {
              navigation.goBack();
              setShowChapterDetailsModal(true);
            },
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
            navigateBack: () => {
              navigation.goBack();
              setShowChapterDetailsModal(true);
            },
          });
        } else {
          Toast.show("Please open a chapter first", Toast.LONG);
        }
        break;
      default:
        break;
    }
  };

  const handleLessonsDropdownOption = (option: string) => {
    setShowLessonsPlusDropdown(false);
    const semesterId = selectedQuarter?.semester || course?.semester?.[0]?._id;
    switch (option) {
      case "assessment":
        setShowChapterDetailsModal(false);
        if (currentLessonForAssessment) {
          // Use any to include lessonId
          (navigation as any).navigate("CreateAssessment", {
            courseId,
            chapterId: chapterDetails._id,
            lessonId: currentLessonForAssessment._id,
            semesterId: semesterId || undefined,
            quarterId: selectedQuarterId || undefined,
            refreshAssessments: () =>
              handleViewChapterDetails(chapterDetails._id),
            navigateBack: () => {
              setShowChapterDetailsModal(true);
              navigation.goBack();
            },
          });
        } else {
          Toast.show("Please select a lesson and quarter first", Toast.LONG);
        }
        break;
      case "page":
        if (currentLessonForAssessment && course?._id) {
          setShowChapterDetailsModal(false);
          (navigation as any).navigate("ChapterPages", {
            courseId: course._id,
            chapterId: chapterDetails._id,
            lessonId: currentLessonForAssessment._id,
            navigateBack: () => {
              setShowChapterDetailsModal(true);
              navigation.goBack();
            },
          });
        } else {
          Toast.show("Please select a lesson first", Toast.LONG);
        }
        break;
      case "discussion":
        if (chapterDetails && currentLessonForAssessment) {
          setShowChapterDetailsModal(false);
          (navigation as any).navigate("ChapterDiscussions", {
            chapterId: chapterDetails._id,
            courseId: course._id,
            semesterId: semesterId || "",
            quarterId: selectedQuarterId || undefined,
            lessonId: currentLessonForAssessment._id,
            navigateBack: () => {
              setShowChapterDetailsModal(true);
              navigation.goBack();
            },
          });
        } else {
          Toast.show("Please select a lesson first", Toast.LONG);
        }
        break;
      default:
        break;
    }
  };

  // ---- Stable handler refs for ChapterDetailsModal ----
  // These handlers close over state that changes on nearly every render of
  // this (very large) component, so passing them directly as props would
  // give ChapterDetailsModal a new function reference every time and defeat
  // its React.memo (causing the modal's lesson/assessment list to re-render
  // - and stutter - on any unrelated state change elsewhere on this page).
  // Routing calls through a ref keeps the prop identity stable while still
  // always invoking the latest version of each handler (no stale closures).
  const handleBackToQuarters = () => {
    course?.semesterbased && setShowQuartersModal(true);
  };

  const handleDeleteChapterPress = (chapter: any) => {
    setChapterToDelete(chapter);
    setShowChaptersForQuarterModal(false);
    setShowDeleteChapterModal(true);
  };

  const chapterModalHandlersRef = useRef({
    handleEditChapter,
    handleAddLesson,
    handlePlusButtonPress,
    handleLessonsPlusButtonPress,
    handleDropdownOption,
    handleLessonsDropdownOption,
    handleEditLesson,
    handleDeleteLessonFromChapter,
    handleDeleteFile,
    handleAddFilesToLesson,
    handleOpenLink,
    handleDeleteAssessmentDirect,
    handleBackToQuarters,
    handleViewChapterDetails,
    handleDeleteChapterPress,
  });
  chapterModalHandlersRef.current = {
    handleEditChapter,
    handleAddLesson,
    handlePlusButtonPress,
    handleLessonsPlusButtonPress,
    handleDropdownOption,
    handleLessonsDropdownOption,
    handleEditLesson,
    handleDeleteLessonFromChapter,
    handleDeleteFile,
    handleAddFilesToLesson,
    handleOpenLink,
    handleDeleteAssessmentDirect,
    handleBackToQuarters,
    handleViewChapterDetails,
    handleDeleteChapterPress,
  };

  const stableOnCloseChapterDetailsModal = useCallback(
    () => setShowChapterDetailsModal(false),
    []
  );
  const stableOnAssessmentDetailsModalOpen = useCallback(
    () => setShowAssessmentDetailsModal(true),
    []
  );
  const stableOnChaptersForQuarterModalOpen = useCallback(
    () => setShowChaptersForQuarterModal(true),
    []
  );
  const stableOnEditChapter = useCallback(
    () => chapterModalHandlersRef.current.handleEditChapter(),
    []
  );
  const stableOnAddLesson = useCallback(
    () => chapterModalHandlersRef.current.handleAddLesson(),
    []
  );
  const stableOnPlusButtonPress = useCallback(
    () => chapterModalHandlersRef.current.handlePlusButtonPress(),
    []
  );
  const stableOnLessonsPlusButtonPress = useCallback(
    (lesson: any) =>
      chapterModalHandlersRef.current.handleLessonsPlusButtonPress(lesson),
    []
  );
  const stableOnDropdownOption = useCallback(
    (option: string) =>
      chapterModalHandlersRef.current.handleDropdownOption(option),
    []
  );
  const stableOnLessonsDropdownOption = useCallback(
    (option: string) =>
      chapterModalHandlersRef.current.handleLessonsDropdownOption(option),
    []
  );
  const stableOnEditLesson = useCallback(
    (lesson: any) => chapterModalHandlersRef.current.handleEditLesson(lesson),
    []
  );
  const stableOnDeleteLessonFromChapter = useCallback(
    (lessonId: string) =>
      chapterModalHandlersRef.current.handleDeleteLessonFromChapter(lessonId),
    []
  );
  const stableOnDeleteFile = useCallback(
    (lessonId: string, fileId: string) =>
      chapterModalHandlersRef.current.handleDeleteFile(lessonId, fileId),
    []
  );
  const stableOnAddFilesToLesson = useCallback(
    (lessonId: string) =>
      chapterModalHandlersRef.current.handleAddFilesToLesson(lessonId),
    []
  );
  const stableOnOpenLink = useCallback(
    (url: string) => chapterModalHandlersRef.current.handleOpenLink(url),
    []
  );
  const stableOnDeleteAssessmentDirect = useCallback(
    (assessmentId: string) =>
      chapterModalHandlersRef.current.handleDeleteAssessmentDirect(
        assessmentId
      ),
    []
  );
  const stableOnCloseChaptersForQuarterModal = useCallback(
    () => setShowChaptersForQuarterModal(false),
    []
  );
  const stableOnBackToQuarters = useCallback(
    () => chapterModalHandlersRef.current.handleBackToQuarters(),
    []
  );
  const stableOnCreateChapter = useCallback(() => {
    setShowChaptersForQuarterModal(false);
    setShowCreateChapterModal(true);
  }, []);
  const stableOnViewChapterDetails = useCallback(
    (chapterId: string) =>
      chapterModalHandlersRef.current.handleViewChapterDetails(chapterId),
    []
  );
  const stableOnDeleteChapterPress = useCallback(
    (chapter: any) =>
      chapterModalHandlersRef.current.handleDeleteChapterPress(chapter),
    []
  );

  // ---- Render ----
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
      style={{ flex: 1, backgroundColor: "#fff" }}
      // activeOpacity={1}
      // onPress={() => {
      //   setShowPlusDropdown(false);
      //   setShowLessonsPlusDropdown(false);
      // }}
    >
      {/* Header */}
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

      {/* Confirmation Modals */}
      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Are you sure?"
        message="This will permanently delete the course and all related data. Are you sure?"
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={loading}
      />
      <ConfirmationModal
        visible={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        title="Confirm Archive"
        message="Are you sure you want to archive this course? This action can be reversed later."
        confirmText="Yes Archive"
        variant="warning"
        onConfirm={handleArchiveCourse}
      />
      <ConfirmationModal
        visible={showUnarchiveModal}
        onClose={() => setShowUnarchiveModal(false)}
        title="Confirm Unarchive"
        message="Are you sure you want to unarchive this course? This will make the course available again."
        confirmText="Yes Unarchive"
        variant="success"
        onConfirm={handleUnarchiveCourse}
      />
      <ConfirmationModal
        visible={showDeleteChapterModal}
        onClose={() => setShowDeleteChapterModal(false)}
        title="Are you absolutely sure?"
        message="This action cannot be undone. This will permanently delete the chapter."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDeleteChapter}
        loading={deleteChapterLoading}
        error={deleteChapterError}
      />
      <ConfirmationModal
        visible={showDeleteLessonModal}
        onClose={() => setShowDeleteLessonModal(false)}
        title="Are you absolutely sure?"
        message="This action cannot be undone. This will permanently delete the lesson."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDeleteLesson}
        loading={deleteLessonLoading}
        error={deleteLessonError}
      />
      <ConfirmationModal
        visible={showDeleteAssessmentModal}
        onClose={() => setShowDeleteAssessmentModal(false)}
        title="Delete Assessment?"
        message="Are you sure you want to permanently delete this assessment?"
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDeleteAssessment}
        loading={deleteAssessmentLoading}
        error={deleteAssessmentError}
      />

      <CreateChapterModal
        visible={showCreateChapterModal}
        onClose={() => {
          setShowCreateChapterModal(false);
          setShowChaptersForQuarterModal(true);
        }}
        courseId={courseId}
        selectedQuarterId={selectedQuarterId}
        course={course}
        onCreated={async () => {
          if (course?.semesterbased && selectedQuarterId) {
            await refreshChaptersForQuarter(selectedQuarterId);
          } else {
            await refreshChaptersForCourse(courseId);
          }
          setShowChaptersForQuarterModal(true);
        }}
      />

      <AddAssessmentCategoryModal
        visible={showAddNewAssessmentCategoryModal}
        onClose={() => setShowAddNewAssessmentCategoryModal(false)}
        courseId={courseId}
        onCreated={fetchAssessmentCategories}
      />

      {/* Main ScrollView */}
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
              <SimpleIcon name="camera" size={20} color="#fff" />
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
            onPress={loadGradeScale}
            style={[
              styles.topActionButton,
              { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc" },
            ]}
          >
            <Text style={[styles.topActionButtonText, { color: "#000" }]}>
              Manage GradeScale
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Coupons", { courseId })}
            style={[
              styles.topActionButton,
              { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc" },
            ]}
          >
            <Text style={[styles.topActionButtonText, { color: "#000" }]}>
              Coupons
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={loadGPA}
            style={[
              styles.topActionButton,
              { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc" },
            ]}
          >
            <Text style={[styles.topActionButtonText, { color: "#000" }]}>
              Manage GPA
            </Text>
          </TouchableOpacity>
          {course.semesterbased && (
            <TouchableOpacity
              onPress={() => setShowGradingPeriodsModal(true)}
              style={[
                styles.topActionButton,
                {
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#ccc",
                },
              ]}
            >
              <Text style={[styles.topActionButtonText, { color: "#000" }]}>
                Manage semesters & Quarters
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={loadStandardGradeScale}
            style={[
              styles.topActionButton,
              { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc" },
            ]}
          >
            <Text style={[styles.topActionButtonText, { color: "#000" }]}>
              Standard GradeScale
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ScheduleMeeting", { courseId: course._id })
            }
            style={[
              styles.topActionButton,
              {
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#ccc",
              },
            ]}
          >
            <VideoIcon />
            <Text style={[styles.topActionButtonText, { color: "#2238c7" }]}>
              Schedule Meeting
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              setShowGradebookModal(true);
              setGradebookLoading(true);
              try {
                const data = await getCourseGradebook(course._id);
                setGradebookData(data);
              } catch (error: any) {
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
            onPress={() => {
              setEditCourseTitle(course.courseTitle || "");
              setEditCoursePrice(course?.price?.toString() || "");
              setEditCourseCategory(course.category?._id || "");
              setEditCourseSubcategory(course.subcategory?._id || "");
              setEditCourseLanguage(course.language || "");
              setEditCourseDescription(course.courseDescription || "");
              setEditTeachingPoints(course.teachingPoints || []);
              setEditRequirements(course.requirements || []);
              setShowEditCourseModal(true);
              if (course.category?._id) fetchSubcategories(course.category._id);
            }}
            style={[styles.topActionButton, { backgroundColor: "#10B144" }]}
          >
            <Text style={styles.topActionButtonText}>Edit Course</Text>
          </TouchableOpacity>
          {course?.syllabus?.url && (
            <TouchableOpacity
              onPress={() => Linking.openURL(course.syllabus.url)}
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

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[styles.title, { flex: 1 }]}>
            {course.courseTitle?.toUpperCase()}
          </Text>
          {user?.email !== "testaccount@yopmail.com" && (
            <Text style={{ fontSize: 22, color: "#10B144", lineHeight: 26 }}>
              ${course?.price}
            </Text>
          )}
        </View>

        <Text style={styles.chapterDetailsDescription}>
          {courseDescription}
          {isLong && (
            <Text
              onPress={() => setShowMore(!showMore)}
              style={{ color: "#10B144", fontWeight: "600" }}
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

        {course.semesterbased ? (
          course.semester && course.semester.length > 0 ? (
            <View style={styles.semesterSection}>
              {course.semester.map((sem: any, idx: number) => (
                <TouchableOpacity
                  key={sem._id}
                  style={styles.semesterCard}
                  onPress={() => handleSemesterPress(sem)}
                >
                  <Text style={styles.semesterTitle}>{`Semester ${idx + 1}: ${
                    sem.title
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
              <Text style={styles.semesterTitle}>
                No semesters found for this course.
              </Text>
            </View>
          )
        ) : (
          <View style={styles.semesterSection}>
            <TouchableOpacity
              style={styles.semesterCard}
              onPress={handleChapterPress}
            >
              <Text style={styles.semesterTitle}>Course Chapters</Text>
              <Text style={styles.semesterDates}>Chapters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.ratingSectionTitle}>Overall Course Rating</Text>
          <View style={styles.ratingCard}>
            <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
            <View style={styles.ratingStarsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Image
                  key={i}
                  source={require("../assets/star.png")}
                  style={{ marginRight: 2, width: 18, height: 18 }}
                />
              ))}
            </View>
            <Text
              style={styles.ratingCountText}
            >{`(${ratingCount} Ratings)`}</Text>
          </View>
        </View>

        {/* Comments */}
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

      {/* All other modals (rendered outside ScrollView) */}
      <GradingPeriodsModal
        visible={showGradingPeriodsModal}
        onClose={() => setShowGradingPeriodsModal(false)}
        insets={insets}
        loadingGradingPeriods={loadingGradingPeriods}
        gradingPeriods={gradingPeriods}
        handleToggleSemesterArchive={handleToggleSemesterArchive}
        handleToggleQuarterArchive={handleToggleQuarterArchive}
        openNewQuarterModal={openNewQuarterModal}
        openEditSemesterModal={openEditSemesterModal}
        openEditQuarterModal={openEditQuarterModal}
        setSemesterTitle={setSemesterTitle}
        setSemesterStartDate={setSemesterStartDate}
        setSemesterEndDate={setSemesterEndDate}
        setShowNewSemesterModal={setShowNewSemesterModal}
        setShowGradingPeriodsModal={setShowGradingPeriodsModal}
        formatDateForInput={formatDateForInput}
        styles={styles}
      />

      <NewSemesterModal
        visible={showNewSemesterModal}
        onClose={() => {
          setShowNewSemesterModal(false);
          setShowGradingPeriodsModal(true);
        }}
        onCreated={fetchGradingPeriods}
        lastSemesterEndDate={getLastSemesterEndDate()}
        formatDateForInput={formatDateForInput}
        parseDateFromInput={parseDateFromInput}
        handleCreateSemester={handleCreateSemester}
        showSemesterDatePicker={showSemesterDatePicker}
        setShowSemesterDatePicker={setShowSemesterDatePicker as any}
        semesterTitle={semesterTitle}
        setSemesterTitle={setSemesterTitle}
        semesterStartDate={semesterStartDate}
        setSemesterStartDate={setSemesterStartDate}
        semesterEndDate={semesterEndDate}
        setSemesterEndDate={setSemesterEndDate}
      />

      <EditSemesterModal
        visible={showEditSemesterModal}
        onClose={() => {
          setShowEditSemesterModal(false);
          setShowGradingPeriodsModal(true);
        }}
        onUpdated={fetchGradingPeriods}
        formatDateForInput={formatDateForInput}
        parseDateFromInput={parseDateFromInput}
        handleEditSemester={handleEditSemester}
        showSemesterDatePicker={showSemesterDatePicker}
        setShowSemesterDatePicker={setShowSemesterDatePicker as any}
        semesterTitle={semesterTitle}
        setSemesterTitle={setSemesterTitle}
        semesterStartDate={semesterStartDate}
        setSemesterStartDate={setSemesterStartDate}
        semesterEndDate={semesterEndDate}
        setSemesterEndDate={setSemesterEndDate}
      />

      <NewQuarterModal
        visible={showNewQuarterModal}
        onClose={() => {
          setShowNewQuarterModal(false);
          setShowGradingPeriodsModal(true);
        }}
        onCreated={fetchGradingPeriods}
        selectedSemesterForQuarter={selectedSemesterForQuarter}
        formatDateForInput={formatDateForInput}
        parseDateFromInput={parseDateFromInput}
        handleCreateQuarter={handleCreateQuarter}
        showQuarterDatePicker={showQuarterDatePicker}
        setShowQuarterDatePicker={setShowQuarterDatePicker as any}
        quarterTitle={quarterTitle}
        setQuarterTitle={setQuarterTitle}
        quarterStartDate={quarterStartDate}
        setQuarterStartDate={setQuarterStartDate}
        quarterEndDate={quarterEndDate}
        setQuarterEndDate={setQuarterEndDate}
      />

      <EditQuarterModal
        visible={showEditQuarterModal}
        onClose={() => {
          setShowEditQuarterModal(false);
          setShowGradingPeriodsModal(true);
        }}
        onUpdated={fetchGradingPeriods}
        formatDateForInput={formatDateForInput}
        parseDateFromInput={parseDateFromInput}
        handleEditQuarter={handleEditQuarter}
        showQuarterDatePicker={showQuarterDatePicker}
        setShowQuarterDatePicker={setShowQuarterDatePicker as any}
        quarterTitle={quarterTitle}
        setQuarterTitle={setQuarterTitle}
        quarterStartDate={quarterStartDate}
        setQuarterStartDate={setQuarterStartDate}
        quarterEndDate={quarterEndDate}
        setQuarterEndDate={setQuarterEndDate}
      />

      <ManageCategoriesModal
        visible={showManageCategoriesModal}
        onClose={() => setShowManageCategoriesModal(false)}
        courseId={courseId}
      />

      <AddSemesterModal
        visible={showAddSemesterModal}
        onClose={() => setShowAddSemesterModal(false)}
        selectedSemester={selectedSemester}
        selectedQuarter={selectedQuarter}
        setShowSemesterPicker={setShowSemesterPicker}
        setShowQuarterPicker={setShowQuarterPicker}
        loadingQuarters={loadingQuarters}
        isSavingSemester={isSavingSemester}
        handleAddSemesterToCourse={handleAddSemesterToCourse}
        styles={styles}
      />

      <SemesterPickerModal
        visible={showSemesterPicker}
        onClose={() => setShowSemesterPicker(false)}
        loadingSemesters={loadingSemesters}
        allSemesters={allSemesters}
        handleSemesterSelect={handleSemesterSelect}
        styles={styles}
      />

      <QuarterPickerModal
        visible={showQuarterPicker}
        onClose={() => setShowQuarterPicker(false)}
        quarters={quarters}
        course={course}
        handleQuarterSelect={handleQuarterSelect}
        styles={styles}
      />

      <QuartersModal
        visible={showQuartersModal}
        onClose={() => setShowQuartersModal(false)}
        loadingSemesterQuarters={loadingSemesterQuarters}
        semesterQuarters={semesterQuarters}
        handleQuarterCardPress={handleQuarterCardPress}
        formatDateWithOrdinal={formatDateWithOrdinal}
        styles={styles}
      />

      <ChaptersForQuarterModal
        visible={showChaptersForQuarterModal}
        onClose={stableOnCloseChaptersForQuarterModal}
        onBackToQuarters={stableOnBackToQuarters}
        onCreateChapter={stableOnCreateChapter}
        loadingChaptersForQuarter={loadingChaptersForQuarter}
        chaptersForQuarter={chaptersForQuarter}
        chaptersMessage={chaptersMessage}
        onViewChapterDetails={stableOnViewChapterDetails}
        onDeleteChapter={stableOnDeleteChapterPress}
      />

      <AssessmentDetailsModal
        visible={showAssessmentDetailsModal}
        onClose={() => setShowAssessmentDetailsModal(false)}
        onBackToChapter={() => setShowChapterDetailsModal(true)}
        onEdit={openEditAssessmentModal}
        selectedAssessmentForModal={selectedAssessmentForModal}
        expandedMcq={expandedMcq}
        setExpandedMcq={setExpandedMcq}
        insets={insets}
        styles={styles}
      />

      <EditAssessmentModal
        visible={showEditAssessmentModal}
        onClose={() => setShowEditAssessmentModal(false)}
        onBackToDetails={() => setShowAssessmentDetailsModal(true)}
        editAssessmentTitle={editAssessmentTitle}
        setEditAssessmentTitle={setEditAssessmentTitle}
        editAssessmentDescription={editAssessmentDescription}
        setEditAssessmentDescription={setEditAssessmentDescription}
        editAssessmentCategory={editAssessmentCategory}
        setEditAssessmentCategory={setEditAssessmentCategory}
        assessmentCategories={assessmentCategories}
        showEditCategoryMenu={showEditCategoryMenu}
        setShowEditCategoryMenu={setShowEditCategoryMenu}
        editAssessmentDueDate={editAssessmentDueDate}
        setEditAssessmentDueDate={setEditAssessmentDueDate}
        tempEditDate={tempEditDate}
        setTempEditDate={setTempEditDate}
        showEditDatePicker={showEditDatePicker}
        setShowEditDatePicker={setShowEditDatePicker}
        showEditTimePicker={showEditTimePicker}
        setShowEditTimePicker={setShowEditTimePicker}
        editAssessmentLoading={editAssessmentLoading}
        handleEditAssessment={handleEditAssessment}
        insets={insets}
        styles={styles}
      />

      <GradebookModal
        visible={showGradebookModal}
        onClose={() => setShowGradebookModal(false)}
        gradebookLoading={gradebookLoading}
        gradebookData={gradebookData}
        gradebookError={gradebookError}
        expandedStudents={expandedStudents}
        expandedSemesters={expandedSemesters}
        expandedQuarters={expandedQuarters}
        onToggleStudent={toggleStudent}
        onToggleSemester={toggleSemester}
        onToggleQuarter={toggleQuarter}
        // styles={styles}
      />

      <EditCourseModal
        visible={showEditCourseModal}
        onClose={() => setShowEditCourseModal(false)}
        editCourseTitle={editCourseTitle}
        onEditCourseTitleChange={setEditCourseTitle}
        editCoursePrice={editCoursePrice}
        onEditCoursePriceChange={setEditCoursePrice}
        editCourseCategory={editCourseCategory}
        editCourseSubcategory={editCourseSubcategory}
        onEditCourseSubcategoryChange={setEditCourseSubcategory}
        editCourseLanguage={editCourseLanguage}
        onEditCourseLanguageChange={setEditCourseLanguage}
        editCourseDescription={editCourseDescription}
        onEditCourseDescriptionChange={setEditCourseDescription}
        editTeachingPoints={editTeachingPoints}
        onEditTeachingPointsChange={setEditTeachingPoints}
        editRequirements={editRequirements}
        onEditRequirementsChange={setEditRequirements}
        subcategories={subcategories}
        subcategoriesLoading={subcategoriesLoading}
        showSubcategoryDropdown={showSubcategoryDropdown}
        onShowSubcategoryDropdownChange={setShowSubcategoryDropdown}
        showLanguageDropdown={showLanguageDropdown}
        onShowLanguageDropdownChange={setShowLanguageDropdown}
        editCourseLoading={editCourseLoading}
        editCourseError={editCourseError}
        onSave={async () => {
          setEditCourseLoading(true);
          setEditCourseError(null);
          try {
            await editCourseBasics(course._id, {
              courseTitle: editCourseTitle,
              category: editCourseCategory,
              price: editCoursePrice,
              subcategory: editCourseSubcategory,
              language: editCourseLanguage,
              courseDescription: editCourseDescription,
              teachingPoints: JSON.stringify(editTeachingPoints),
              requirements: JSON.stringify(editRequirements),
            });
            Toast.show("Course updated successfully", Toast.LONG);
            setShowEditCourseModal(false);
            await fetchCourseDetails();
          } catch (err: any) {
            setEditCourseError(err.message || "Failed to update course");
          } finally {
            setEditCourseLoading(false);
          }
        }}
        // styles={styles}
      />

      <ChapterDetailsModal
        // ref={plusButtonRef}
        visible={showChapterDetailsModal}
        onClose={stableOnCloseChapterDetailsModal}
        chapterDetails={chapterDetails}
        chapterDetailsLoading={chapterDetailsLoading}
        chapterDetailsError={chapterDetailsError}
        showPlusDropdown={showPlusDropdown}
        showLessonsPlusDropdown={showLessonsPlusDropdown}
        currentLessonForAssessment={currentLessonForAssessment}
        onEditChapter={stableOnEditChapter}
        onAddLesson={stableOnAddLesson}
        onPlusButtonPress={stableOnPlusButtonPress}
        onLessonsPlusButtonPress={stableOnLessonsPlusButtonPress}
        onDropdownOption={stableOnDropdownOption}
        onLessonsDropdownOption={stableOnLessonsDropdownOption}
        onEditLesson={stableOnEditLesson}
        onDeleteLessonFromChapter={stableOnDeleteLessonFromChapter}
        onDeleteFile={stableOnDeleteFile}
        onAddFilesToLesson={stableOnAddFilesToLesson}
        onOpenLink={stableOnOpenLink}
        onDeleteAssessmentDirect={stableOnDeleteAssessmentDirect}
        onSelectAssessmentForModal={setSelectedAssessmentForModal}
        onAssessmentDetailsModalOpen={stableOnAssessmentDetailsModalOpen}
        onChaptersForQuarterModalOpen={stableOnChaptersForQuarterModalOpen}
      />

      <LessonCreationModal
        visible={showLessonCreationModal}
        onClose={() => setShowLessonCreationModal(false)}
        onBackToChapter={() => setShowChapterDetailsModal(true)}
        lessonCreationTitle={lessonCreationTitle}
        setLessonCreationTitle={setLessonCreationTitle}
        lessonCreationDescription={lessonCreationDescription}
        setLessonCreationDescription={setLessonCreationDescription}
        lessonCreationYoutubeLink={lessonCreationYoutubeLink}
        setLessonCreationYoutubeLink={setLessonCreationYoutubeLink}
        lessonCreationOtherLink={lessonCreationOtherLink}
        setLessonCreationOtherLink={setLessonCreationOtherLink}
        lessonCreationFiles={lessonCreationFiles}
        handleFilePickForLessonCreation={handleFilePickForLessonCreation}
        handleRemoveFile={() => {}}
        lessonCreationError={lessonCreationError}
        lessonCreationLoading={lessonCreationLoading}
        handleCreateLesson={handleCreateLesson}
        styles={styles}
      />

      <EditChapterModal
        visible={showEditChapterModal}
        onClose={() => {
          setShowEditChapterModal(false);
          setShowChapterDetailsModal(true);
        }}
        chapterDetails={chapterDetails}
        onUpdated={handleChapterUpdated}
      />

      <LessonEditModal
        visible={showLessonEditModal}
        onClose={() => setShowLessonEditModal(false)}
        onBackToChapter={() => setShowChapterDetailsModal(true)}
        lessonEditTitle={lessonEditTitle}
        setLessonEditTitle={setLessonEditTitle}
        lessonEditDescription={lessonEditDescription}
        setLessonEditDescription={setLessonEditDescription}
        lessonEditYoutubeLink={lessonEditYoutubeLink}
        setLessonEditYoutubeLink={setLessonEditYoutubeLink}
        lessonEditOtherLink={lessonEditOtherLink}
        setLessonEditOtherLink={setLessonEditOtherLink}
        lessonEditError={lessonEditError}
        lessonEditLoading={lessonEditLoading}
        handleUpdateLesson={handleUpdateLesson}
        insets={insets}
        styles={styles}
      />

      <AddFilesModal
        visible={showAddFilesModal}
        onClose={() => setShowAddFilesModal(false)}
        onBackToChapter={() => setShowChapterDetailsModal(true)}
        handleFilePickForAddFiles={handleFilePickForAddFiles}
        selectedFiles={selectedFiles}
        handleRemoveSelectedFile={handleRemoveSelectedFile}
        totalFileSize={totalFileSize}
        addFilesError={addFilesError}
        handleAddFiles={handleAddFiles}
        addFilesLoading={addFilesLoading}
        styles={styles}
      />

      <GradeScaleManagementModal
        visible={showGradeScaleManagement}
        onClose={() => setShowGradeScaleManagement(false)}
        onManageGradeScale={() => {
          setShowGradeScaleManagement(false);
          setShowGradeScaleModal(true);
        }}
        showGradeScaleManagementLoader={showGradeScaleManagementLoader}
        gradeScale={gradeScale}
      />

      <GradeScaleModal
        visible={showGradeScaleModal}
        onClose={() => {
          setShowGradeScaleModal(false);
          setShowGradeScaleManagement(true);
        }}
        onSave={async (newScales) => {
          try {
            await gradingScale(courseId, newScales);
            Toast.show("Successfully created grade scale", Toast.LONG);
            setShowGradeScaleModal(false);
            await loadGradeScale();
          } catch (err) {
            Toast.show("Failed to create grade scale", Toast.LONG);
            setShowGradeScaleModal(false);
            setShowGradeScaleManagement(true);
          }
        }}
      />

      <GPAManagementModal
        visible={showGPAManagement}
        onClose={() => setShowGPAManagement(false)}
        onManageGPA={() => {
          setShowGPAManagement(false);
          setShowGPAModal(true);
        }}
        showGPAManagementLoader={showGPAManagementLoader}
        GPA={GPA}
        error={gpaError}
        onRetry={retryLoadGPA}
      />

      <GPAModal
        visible={showGPAModal}
        onClose={() => {
          setShowGPAModal(false);
          setShowGPAManagement(true);
        }}
        onSave={async (newScales) => {
          try {
            await gpaScale(courseId, newScales);
            Toast.show("Successfully created gpa scale", Toast.LONG);
            setShowGPAModal(false);
            await loadGPA();
          } catch (err) {
            Toast.show("Failed to create gpa scale", Toast.LONG);
            setShowGPAModal(false);
            setShowGPAManagement(true);
          }
        }}
      />
    </View>
  );
};

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", padding: 16 },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },
//   image: { width: "100%", height: 180, borderRadius: 8, marginBottom: 16 },
//   thumbnailContainer: { position: "relative", marginBottom: 16 },
//   thumbnailUploadButton: {
//     position: "absolute",
//     bottom: 8,
//     right: 8,
//     backgroundColor: "rgba(0, 0, 0, 0.6)",
//     borderRadius: 20,
//     width: 40,
//     height: 40,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
//   uploadedText: { color: "#888", fontSize: 12 },
//   updatedText: { color: "#888", fontSize: 12 },
//   title: { fontSize: 26, fontWeight: "bold", color: "#222" },
//   infoCard: {
//     backgroundColor: "#fdf6f0",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 8,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   infoLabel: { fontWeight: "bold", color: "#5e35b1", marginRight: 8, fontSize: 15 },
//   infoValue: { color: "#333", fontSize: 15 },
//   section: { marginTop: 18, marginBottom: 8 },
//   ratingSectionTitle: { fontSize: 22, fontWeight: "bold", color: "#111", marginBottom: 12 },
//   ratingCard: {
//     backgroundColor: "#EAFBF2",
//     borderRadius: 16,
//     padding: 24,
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   ratingNumber: { fontSize: 48, fontWeight: "bold", color: "#111", marginBottom: 6 },
//   ratingStarsRow: { flexDirection: "row", justifyContent: "center" },
//   ratingCountText: { color: "#A0AEC0", fontSize: 16, marginTop: 14, fontWeight: "500" },
//   commentsSectionTitle: { fontSize: 22, fontWeight: "bold", color: "#111", marginBottom: 12 },
//   commentInputBox: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     padding: 16,
//     marginBottom: 16,
//   },
//   commentInput: { minHeight: 60, fontSize: 16, color: "#222", padding: 0, textAlignVertical: "top" },
//   postCommentButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#10B144",
//     borderRadius: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//   },
//   postCommentButtonDisabled: { backgroundColor: "#A0E7B2" },
//   postCommentButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   noCommentsText: { color: "#A0AEC0", fontSize: 16, textAlign: "center", marginTop: 32, fontWeight: "500" },
//   errorText: { color: "red", fontSize: 16 },
//   topActionButtonsContainer: { flexDirection: "column", marginVertical: 10 },
//   topActionButton: { marginVertical: 5, paddingVertical: 12, borderRadius: 8, alignItems: "center", justifyContent: "center" },
//   topActionButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold", textAlign: "center" },
//   semesterSection: { marginTop: 10 },
//   semesterCard: {
//     backgroundColor: "#f8f9fa",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#e9ecef",
//     padding: 16,
//     marginBottom: 10,
//   },
//   semesterTitle: { fontSize: 16, fontWeight: "bold", color: "#212529" },
//   semesterDates: { fontSize: 14, color: "#6c757d", marginTop: 4 },
//   chapterDetailsDescription: { fontSize: 16, color: "#6b7280", lineHeight: 24 },
// });

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: 180, borderRadius: 8, marginBottom: 16 },
  thumbnailContainer: { position: "relative", marginBottom: 16 },
  thumbnailUploadButton: {
    position: "absolute",
    bottom: 22,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    resizeMode: "cover",
  },
  cameraIconText: { fontSize: 20, color: "#fff" },
  backIconText: { fontSize: 28, color: "#fff", fontWeight: "bold" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  uploadedText: { color: "#888", fontSize: 12 },
  updatedText: { color: "#888", fontSize: 12 },
  title: { fontSize: 26, fontWeight: "bold", color: "#222" },
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
  topActionButtonsContainer: { flexDirection: "column", marginVertical: 10 },
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
  modalText: { fontSize: 16, color: "#666", marginBottom: 20, lineHeight: 22 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#f5f5f5" },
  cancelButtonText: { color: "#666", fontWeight: "bold" },
  deleteConfirmButton: { backgroundColor: "#ff4444" },
  deleteConfirmButtonText: { color: "#fff", fontWeight: "bold" },
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
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalBody: { flex: 1 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  uploadButton: {
    backgroundColor: "#10B144",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
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
  categoriesListContainer: { marginBottom: 20 },
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
  categoryName: { fontSize: 14 },
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
  addNewCategoryTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  inputLabel: {
    fontSize: 14,
    color: "#495057",
    marginBottom: 8,
    fontWeight: "600",
  },
  // textInput: {
  //   backgroundColor: "#fff",
  //   borderWidth: 1,
  //   borderColor: "#ced4da",
  //   borderRadius: 4,
  //   padding: 10,
  //   fontSize: 14,
  //   marginBottom: 15,
  // color: '#000'
  // },
  addButton: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    alignSelf: "flex-end",
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  totalWeightContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#dee2e6",
    marginTop: 20,
  },
  totalWeightText: { fontSize: 16, fontWeight: "bold" },
  totalWeightValue: { fontSize: 16, fontWeight: "bold", color: "#10B144" },
  addSemesterButton: {
    backgroundColor: "#10B144",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  addSemesterButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  semesterSection: {
    //  backgroundColor: "pink",
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
  semesterTitle: { fontSize: 16, fontWeight: "bold", color: "#212529" },
  semesterDates: { fontSize: 14, color: "#6c757d", marginTop: 4 },
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
  dropdownText: { fontSize: 16 },
  saveChangesButton: {
    backgroundColor: "#1E293B",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  saveChangesButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  cancelProfileButton: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cancelProfileButtonText: { color: "#333", fontSize: 16, fontWeight: "bold" },
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
  disabledPickerItem: { backgroundColor: "#f0f0f0" },
  disabledButton: { opacity: 0.7 },
  quartersModalContainer: { flex: 1, backgroundColor: "white", padding: 16 },
  quartersModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: Platform.OS === "ios" ? 40 : 10,
  },
  quartersModalTitle: { fontSize: 28, fontWeight: "bold" },
  quarterCard: {
    backgroundColor: "#eef2f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  quarterTitle: { fontSize: 18, fontWeight: "bold", color: "#000" },
  quarterDates: { fontSize: 14, color: "#6c757d", marginTop: 4 },
  chaptersModalContainer: { flex: 1, backgroundColor: "white", padding: 16 },
  chaptersModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: Platform.OS === "ios" ? 40 : 10,
  },
  chaptersModalTitle: { fontSize: 28, fontWeight: "bold" },
  chaptersContent: { paddingHorizontal: 8, flex: 1 },
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
  createChapterButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  chapterItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  createChapterModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  inputGroup: { marginBottom: 16 },
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
  createChapterModalButtonPrimary: { backgroundColor: "#00C853" },
  createChapterModalButtonSecondary: { borderWidth: 1, borderColor: "#ccc" },
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
  chapterNumberText: { color: "#b26a00", fontWeight: "bold", fontSize: 15 },
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
  chapterActionButtonText: { fontSize: 14, fontWeight: "bold", marginLeft: 6 },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  lessonItemText: { flex: 1, fontSize: 16, color: "#333" },
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
  pdfFileRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  pdfFileText: { flex: 1, fontSize: 16 },
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
  addFileButtonText: { fontSize: 16, fontWeight: "600" },
  fileSizeText: { fontSize: 14, color: "#666", marginBottom: 4 },
  pdfErrorText: { fontSize: 14, color: "#dc2626", marginBottom: 16 },
  lessonsChip: {
    backgroundColor: "#eef2ff",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  lessonsChipText: { color: "#4338ca", fontWeight: "bold", fontSize: 14 },
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
  lessonNumberText: { color: "#0284c7", fontWeight: "bold", fontSize: 14 },
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
  resourceButtonsContainer: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  resourceButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  resourceButtonText: { fontSize: 14, fontWeight: "600" },
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
  assessmentContent: { flex: 1 },
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

  // ---- Assessment Details Modal ----
  assessmentDetailsHeader: {
    backgroundColor: "#10B144",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  assessmentDetailsBackButton: { flexDirection: "row", alignItems: "center" },
  assessmentDetailsBackText: { color: "#fff", fontSize: 18, marginLeft: 8 },
  assessmentDetailsEditButton: { padding: 8 },
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
  assessmentDetailsCategoryText: { fontSize: 14, color: "#6b7280" },
  assessmentDetailsDueDateContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  assessmentDetailsDueDateLabel: { fontSize: 16, color: "#374151" },
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
  assessmentDetailsDescriptionText: { fontSize: 16, color: "#0369a1" },
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
  assessmentDetailsMcqTitle: { fontSize: 16, color: "#000" },
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
  assessmentDetailsBulletPoint: { fontSize: 16, color: "#000", marginRight: 8 },
  assessmentDetailsOptionText: { fontSize: 16, color: "#000", flex: 1 },
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

  // ---- Edit Assessment ----
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
  editAssessmentCategoryButtonText: { fontSize: 16, color: "#000" },
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
  mcqTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  mcqContent: { backgroundColor: "#f8f9fa", borderRadius: 8, padding: 16 },
  questionText: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  bulletPoint: { fontSize: 16, marginRight: 8 },
  optionText: { fontSize: 16, color: "#333" },

  // ---- Ratings & Comments ----
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
    marginBottom: 6,
  },
  ratingStarsRow: { flexDirection: "row", justifyContent: "center" },
  ratingCountText: {
    color: "#A0AEC0",
    fontSize: 16,
    marginTop: 14,
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
    color: "#000",
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
  postCommentButtonDisabled: { backgroundColor: "#A0E7B2" },
  postCommentButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  noCommentsText: {
    color: "#A0AEC0",
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
    fontWeight: "500",
  },

  // ---- Chapter Cards ----
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
  chapterCardDescription: { fontSize: 14, color: "#666", marginBottom: 16 },
  chapterCardStats: { flexDirection: "row", marginBottom: 16, gap: 16 },
  chapterStatItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  chapterStatText: { fontSize: 14, color: "#666" },
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
  chapterViewButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  // ---- Chapter Details Modal ----
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
  chapterDetailsActions: { flexDirection: "row", gap: 8 },
  chapterDetailsActionButton: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: "#10B144",
    justifyContent: "center",
    alignItems: "center",
  },
  plusButtonContainer: { position: "relative" },
  // dropdownMenu: {
  //   position: "absolute",
  //   top: 40,
  //   right: 0,
  //   backgroundColor: "#fff",
  //   borderRadius: 12,
  //   paddingVertical: 8,
  //   paddingHorizontal: 4,
  //   minWidth: 180,
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 8,
  //   elevation: 5,
  //   zIndex: 99999999999999999,
  // },
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
  lessonsPlusButtonContainer: { position: "relative" },
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
  chapterDetailsDescription: { fontSize: 16, color: "#6b7280", lineHeight: 24 },
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
  lessonsTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937", flex: 1 },
  lessonsCount: {
    backgroundColor: "#6b7280",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lessonsCountText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  chapterLessonsList: { gap: 12 },
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
  noLessonsContainer: { alignItems: "center", paddingVertical: 40 },
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
  addLessonButton: { alignSelf: "flex-start" },
  addLessonButtonText: { color: "#10B144", fontSize: 16, fontWeight: "600" },

  // ---- Full Screen Modals ----
  fullScreenModalContainer: { flex: 1, backgroundColor: "#f5f5f5" },
  fullScreenModalContent: { flex: 1, padding: 20, paddingTop: 60 },
  fullScreenModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: { padding: 8, borderRadius: 8, backgroundColor: "#f0f9ff" },
  fullScreenModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    flex: 1,
  },

  // ---- Lesson Creation ----
  lessonFormInstruction: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 24,
    lineHeight: 24,
  },
  lessonFormField: { marginBottom: 24 },
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
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#000",
  },
  characterCount: { fontSize: 12, color: "#6b7280", marginLeft: 8 },
  lessonDescriptionInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#000",
    minHeight: 120,
  },
  lessonLinkInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#000",
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
  filePickerButtonText: { fontSize: 16, color: "#6b7280" },
  fileList: { marginBottom: 12 },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: { flex: 1, fontSize: 14, color: "#374151", marginLeft: 8 },
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
  lessonFileSizeText: { fontSize: 12, color: "#6b7280" },
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
  lessonCancelButtonText: { fontSize: 16, fontWeight: "600", color: "#374151" },
  lessonSaveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#374151",
    alignItems: "center",
  },
  lessonSaveButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  lessonDisabledButton: { opacity: 0.6 },
  lessonErrorText: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: 8,
    textAlign: "center",
  },

  // ---- Lesson Card ----
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
  lessonCardNumberText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  lessonCardActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  lessonActionIcon: { padding: 4 },
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
  lessonCardDescription: { fontSize: 14, color: "#6b7280", lineHeight: 20 },
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
  filesTitle: { fontSize: 14, fontWeight: "600", color: "#374151" },
  lessonAddFileButton: {
    backgroundColor: "#10B144",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lessonAddFileButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  fileDate: { fontSize: 12, color: "#6b7280", marginLeft: 8 },
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
  resourcesList: { flexDirection: "row", gap: 8 },
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

  // ---- Edit Chapter ----
  editChapterForm: { flex: 1, padding: 20 },
  editChapterField: { marginBottom: 20 },
  editChapterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  editChapterTitleContainer: { position: "relative" },
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
  editChapterDescriptionContainer: { position: "relative" },
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
  editChapterSaveButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  editChapterDisabledButton: { opacity: 0.6 },
  editChapterErrorText: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: 8,
    textAlign: "center",
  },

  closeButton: { padding: 4 },

  // ---- Lesson Edit ----
  lessonEditForm: { flex: 1, padding: 20 },
  lessonEditField: { marginBottom: 20 },
  lessonEditLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  lessonEditTitleContainer: { position: "relative" },
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
  lessonEditDescriptionContainer: { position: "relative" },
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
  lessonEditSaveButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  lessonEditDisabledButton: { opacity: 0.6 },
  lessonEditErrorText: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: 8,
    textAlign: "center",
  },

  // ---- Add Files ----
  addFilesContent: { padding: 20 },
  addFilesInstruction: { fontSize: 14, color: "#6b7280", marginBottom: 4 },
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
  fileInputSubtext: { fontSize: 14, color: "#6b7280" },
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
  addFilesAddButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  addFilesDisabledButton: { opacity: 0.6 },
  addFilesErrorText: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: 8,
    textAlign: "center",
  },
  fileItemContent: { flex: 1, flexDirection: "row", alignItems: "center" },
  noFilesText: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },

  // ---- Lesson Assessments / Pages (commented in older) ----
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
    shadowOffset: { width: 0, height: 1 },
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
  assessmentBadgeText: { fontSize: 12, color: "#fff", fontWeight: "500" },
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
  assessmentDescription: { fontSize: 14, color: "#374151" },
  noAssessmentsText: {
    color: "#9ca3af",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
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
    shadowOffset: { width: 0, height: 1 },
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
  pageBadgeText: { fontSize: 12, color: "#fff", fontWeight: "500" },
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
  pageDescription: { fontSize: 14, color: "#374151" },
  noPagesText: {
    color: "#9ca3af",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },

  // ---- Grade Scale & GPA Tables ----
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerText: { fontSize: 15, fontWeight: "600", color: "#6B7280" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  gradeBadge: {
    backgroundColor: "#6EE7B7",
    borderRadius: 10,
    height: 40,
    flex: 0.8,
    marginHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  gradeText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  rangeText: { fontSize: 16, fontWeight: "500", color: "#111" },
  progressWrapper: { justifyContent: "center" },
  progressBackground: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B144",
    borderRadius: 10,
  },
  manageButton: {
    backgroundColor: "#10B144",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  manageButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  // ---- Grading Periods Modal ----
  gradingPeriodsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  gradingPeriodsModalContent: { flex: 1, backgroundColor: "#fff", padding: 10 },
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
  gradingPeriodsBackText: { marginLeft: 4, fontSize: 16, color: "#000" },
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
  gradingPeriodsList: { flex: 1, padding: 16 },
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
  gradingPeriodInfo: { flex: 1 },
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
  gradingPeriodDates: { fontSize: 14, color: "#6b7280" },
  gradingPeriodActions: { flexDirection: "row", alignItems: "center", gap: 8 },
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
  gradingPeriodItemDisabled: { opacity: 0.8, backgroundColor: "#f9fafb" },
  gradingPeriodTextDisabled: { color: "#9ca3af" },
  gradingPeriodButtonDisabled: { opacity: 0.8 },
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
  gradingPeriodQuarterItem: { marginTop: 8 },

  // ---- Semester / Quarter Modals ----
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
  semesterModalInfo: { fontSize: 14, color: "#6b7280", marginBottom: 16 },
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
  semesterModalInputText: { fontSize: 16, color: "#000" },
  semesterModalPlaceholder: { fontSize: 16, color: "#9ca3af" },
  semesterModalContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  semesterModalButton: {
    backgroundColor: "#374151",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  semesterModalButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  // ---- Edit Category Dropdown ----
  editCategoryDropdownMenu: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
    maxHeight: 180,
    marginTop: 6,
  },
  editCategoryDropdownItem: { paddingHorizontal: 12, paddingVertical: 10 },
  editCategoryDropdownItemActive: { backgroundColor: "#eef2ff" },

  // ---- Edit Course Modal styles (required by EditCourseModal) ----
  editCourseModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editCourseModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  editCourseModalCloseButton: { padding: 4 },
  editCourseModalLabel: { fontWeight: "bold", marginBottom: 4 },
  editCourseModalDropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editCourseModalDropdownText: { color: "#333" },
  editCourseModalDropdownPlaceholder: { color: "#999" },
  editCourseModalDropdownOverlay: {
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
  },
  editCourseModalDropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  editCourseModalDropdownItemActive: { backgroundColor: "#e3f2fd" },
  editCourseModalDropdownItemText: { color: "#333" },
  editCourseModalDropdownItemTextActive: {
    color: "#1976d2",
    fontWeight: "bold",
  },
  editCourseModalDropdownItemTextInactive: { fontWeight: "normal" },
  editCourseModalLanguageDropdownOverlay: {
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
  },
  editCourseModalSectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
  },
  editCourseModalEntryLabel: { fontSize: 14, color: "#666", marginBottom: 4 },
  editCourseModalEntryRow: { flexDirection: "row", alignItems: "flex-start" },
  editCourseModalCharacterCount: { fontSize: 12, color: "#999", marginTop: 4 },
  editCourseModalRemoveButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 2,
  },
  editCourseModalRemoveButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  editCourseModalAddButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  editCourseModalAddButtonText: { color: "white", fontWeight: "bold" },
  editCourseModalErrorText: { color: "red", marginVertical: 8 },
  editCourseModalNoSubcategoriesText: {
    padding: 12,
    color: "#666",
    textAlign: "center",
  },

  // ---- Gradebook Modal styles (required by GradebookModal) ----
  gradebookModalContainer: { flex: 1, backgroundColor: "#fff", padding: 0 },
  gradebookModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingTop: Platform.OS === "ios" ? 40 : 16,
  },
  gradebookModalTitle: { fontSize: 28, fontWeight: "bold", color: "#1E293B" },
  gradebookLoadingContainer: { marginVertical: 40 },
  gradebookErrorText: { color: "red", textAlign: "center", marginVertical: 20 },
  gradebookContentContainer: { padding: 16 },
  gradebookCard: {
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
  },
  gradebookTableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 12,
    marginBottom: 12,
  },
  gradebookHeaderText: { fontWeight: "bold", fontSize: 16, color: "#6b7280" },
  gradebookStudentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  gradebookStudentInfo: { flex: 2, flexDirection: "row", alignItems: "center" },
  gradebookExpandIcon: {
    fontSize: 16,
    marginRight: 8,
    color: "#6b7280",
    fontWeight: "bold",
  },
  gradebookStudentName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
  },
  gradebookGradeText: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    color: "#1E293B",
  },
  gradebookLetterGradeContainer: { flex: 1, alignItems: "center" },
  gradebookLetterGradeBadge: {
    backgroundColor: "#dbeafe",
    borderColor: "#93c5fd",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gradebookLetterGradeText: {
    color: "#1E293B",
    fontWeight: "bold",
    fontSize: 14,
  },
  gradebookGpaText: {
    flex: 1,
    textAlign: "right",
    fontSize: 16,
    color: "#1E293B",
  },
  gradebookStudentExpanded: {
    backgroundColor: "#f9fafb",
    paddingLeft: 24,
    paddingVertical: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
  },
  gradebookPerformanceTitle: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  gradebookSemesterItem: { marginBottom: 8 },
  gradebookSemesterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  gradebookSemesterTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  gradebookSemesterExpanded: {
    marginTop: 8,
    marginLeft: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#d1d5db",
  },
  gradebookQuarterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  gradebookQuarterTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  gradebookQuarterGrade: { fontSize: 12, color: "#6b7280", marginRight: 8 },
  gradebookQuarterBadge: {
    backgroundColor: "#dbeafe",
    borderColor: "#93c5fd",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  gradebookQuarterBadgeText: {
    color: "#1E293B",
    fontWeight: "bold",
    fontSize: 11,
  },
  gradebookQuarterGpa: { fontSize: 12, color: "#6b7280" },
  gradebookQuarterExpanded: {
    marginTop: 8,
    marginLeft: 12,
    paddingLeft: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  gradebookAssessmentHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  gradebookAssessmentHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  gradebookAssessmentRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  gradebookAssessmentText: { flex: 1, fontSize: 12, color: "#374151" },
  gradebookNoDataText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 8,
  },
  gradebookNoSemestersText: {
    fontSize: 12,
    color: "#9ca3af",
    paddingVertical: 8,
  },
  gradebookDirectAssessments: {
    marginTop: 8,
    marginLeft: 12,
    paddingLeft: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
});
export default CourseDetailsPage;
