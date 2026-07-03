// services/course.ts
import { getApiInstance } from "./apiInstance";

// Legacy helpers used by discussion.ts, page.ts, socialPosts.ts, aiAssestant.ts, etc.
// Auth is handled globally inside getApiInstance. useApiSuffix:false keeps /api/... paths working.
export const createApiInstance = async () =>
  getApiInstance({ useApiSuffix: false });

export const addAuthInterceptor = (api: any) => api;

// ============================================================
// TYPES
// ============================================================
interface Thumbnail {
  url: string;
  filename: string;
}

interface Category {
  _id: string;
  title: string;
}

interface Subcategory {
  _id: string;
  title: string;
  category: string;
}

interface CourseData {
  courseTitle: string;
  category: string;
  semesterbased: boolean;
  subcategory?: string;
  language: string;
  courseDescription: string;
  thumbnail: Thumbnail;
  teachingPoints: string[];
  requirements: string[];
  published?: boolean;
  semester?: string[];
  quarter?: string[];
  syllabus?: any;
  price: string;
}

interface CourseResponse {
  courses: any[];
  message: string;
}

// ============================================================
// COURSE CREATE (used by CreateCoursePage – thumbnail, teachingPoints, requirements)
// ============================================================
export const createCourse = async (courseData: CourseData) => {
  try {
    const api = await getApiInstance();
    const formData = new FormData();

    if (courseData.thumbnail.url) {
      const imageUri = courseData.thumbnail.url;
      const filename = courseData.thumbnail.filename || "thumbnail.jpg";
      const extension = filename.split(".").pop() || "jpg";
      const type = `image/${extension}`;
      formData.append("thumbnail", {
        uri: imageUri,
        type,
        name: filename,
      } as any);
    }

    formData.append("courseTitle", courseData.courseTitle);
    formData.append("category", courseData.category);
    if (courseData.subcategory) {
      formData.append("subcategory", courseData.subcategory);
    }
    formData.append("language", courseData.language.toLowerCase());
    formData.append("courseDescription", courseData.courseDescription);
    formData.append(
      "teachingPoints",
      JSON.stringify(courseData.teachingPoints)
    );
    formData.append("requirements", JSON.stringify(courseData.requirements));
    formData.append("semesterbased", String(courseData.semesterbased));
    formData.append("price", courseData.price);

    if (courseData.semester && courseData.semester.length > 0) {
      formData.append("semester", JSON.stringify(courseData.semester));
    }
    if (courseData.quarter && courseData.quarter.length > 0) {
      formData.append("quarter", JSON.stringify(courseData.quarter));
    }

    if (courseData.syllabus) {
      formData.append("syllabus", {
        uri: courseData.syllabus.uri,
        type: courseData.syllabus.type || "application/pdf",
        name:
          courseData.syllabus.name ||
          courseData.syllabus.uri.split("/").pop() ||
          "syllabus.pdf",
      } as any);
    }

    const response = await api.post("/course/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const api = await getApiInstance();
    const response = await api.get<{ categories: Category[]; message: string }>(
      "/category/get"
    );
    return { success: true, data: response.data.categories };
  } catch (error) {
    throw error;
  }
};

export const getSubcategories = async (categoryId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get<{
      subcategories: Subcategory[];
      message: string;
    }>(`/category/subcategories/${categoryId}`);
    return { success: true, data: response.data.subcategories };
  } catch (error) {
    throw error;
  }
};

export const getSemesters = async () => {
  try {
    const api = await getApiInstance();
    const response = await api.get("/semester/get");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getQuartersBySemesters = async (semesterIds: string[]) => {
  try {
    const api = await getApiInstance();
    const response = await api.post("/quarter/getquarters", {
      semesters: semesterIds,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const archiveCourse = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(`/course/archive/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const unarchiveCourse = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(`/course/archive/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllCourses = async (
  search?: string
): Promise<CourseResponse> => {
  try {
    const api = await getApiInstance();
    const url = search
      ? `/course/getindividualcourse?published=true&isVerified=approved&search=${encodeURIComponent(search)}`
      : `/course/getindividualcourse?published=true&isVerified=approved`;
    const response = await api.get<CourseResponse>(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTeacherCourses = async (
  published: boolean,
  isVerified: string,
  search?: string
): Promise<CourseResponse> => {
  try {
    const api = await getApiInstance();
    const searchParam = search ? encodeURIComponent(search) : "";
    const url =
      isVerified === "pending" || isVerified === "rejected"
        ? `/course/getindividualcourse?isVerified=${isVerified}&search=${searchParam}`
        : `/course/getindividualcourse?published=${published}&isVerified=${isVerified}&search=${searchParam}`;
    const response = await api.get<CourseResponse>(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCourseDetails = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/course/details/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCourse = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.delete(`/course/delete/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editCourseBasics = async (
  courseId: string,
  data: {
    courseTitle: string;
    category: string;
    subcategory: string;
    price: string;
    language: string;
    courseDescription: string;
    teachingPoints: string;
    requirements: string;
  }
) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(`/course/editCourseBasics/${courseId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCourseThumbnail = async (courseId: string, thumbnail: any) => {
  try {
    const api = await getApiInstance();
    const formData = new FormData();
    formData.append("thumbnail", {
      uri: thumbnail.uri,
      type: thumbnail.type || "image/jpeg",
      name:
        thumbnail.fileName ||
        thumbnail.uri.split("/").pop() ||
        "thumbnail.jpg",
    } as any);
    const response = await api.put(`/course/thumbnail/${courseId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCoursesBySubcategory = async (
  subcategoryId: string,
  search?: string
) => {
  try {
    const api = await getApiInstance();
    const url = `/course/${subcategoryId}${
      search ? `?search=${encodeURIComponent(search)}` : "?search="
    }`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================================
// CHAPTERS & LESSONS
// ============================================================
export const createChapter = async (
  courseId: string,
  title: string,
  description: string,
  quarterId: string | null
) => {
  try {
    const api = await getApiInstance();
    const url = `/chapter/create/${courseId}`;
    const body: any = { title, description };
    if (quarterId) {
      body.quarter = quarterId;
    }
    const response = await api.post(url, body);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteChapter = async (chapterId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.delete(`/chapter/${chapterId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editChapter = async (
  chapterId: string,
  title: string,
  description: string
) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(`/chapter/edit/${chapterId}`, {
      title,
      description,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChapterDetailsWithLessons = async (chapterId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(
      `/chapter/chapter/chapter&lessons/${chapterId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createLesson = async (
  chapterId: string,
  title: string,
  description: string,
  youtubeLinks: string,
  otherLink: string,
  pdfFiles: any[]
) => {
  try {
    const api = await getApiInstance();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("youtubeLinks", youtubeLinks);
    formData.append("otherLink", otherLink);
    formData.append("chapter", chapterId);
    pdfFiles.forEach((file) => {
      formData.append("pdfFiles", {
        uri: file.uri,
        type: file.type || "application/pdf",
        name: file.name || file.uri.split("/").pop() || "file.pdf",
      } as any);
    });
    const response = await api.post("/lesson/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteLesson = async (lessonId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.delete(`/lesson/${lessonId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editLesson = async (
  lessonId: string,
  title: string,
  description: string,
  youtubeLinks: string,
  otherLink: string
) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(`/lesson/edit/${lessonId}`, {
      title,
      description,
      youtubeLinks,
      otherLink,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addMoreFilesToLesson = async (lessonId: string, pdfFiles: any[]) => {
  try {
    const api = await getApiInstance();
    const formData = new FormData();
    pdfFiles.forEach((file) => {
      formData.append("pdfFiles", {
        uri: file.uri,
        type: file.type || "application/pdf",
        name: file.fileName || file.uri.split("/").pop() || "file.pdf",
      } as any);
    });
    const response = await api.put(`/lesson/addMoreFiles/${lessonId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteLessonFile = async (lessonId: string, fileId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.delete(`/lesson/delete/${lessonId}/${fileId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================================
// ASSESSMENTS
// ============================================================
export const createAssessmentCategory = async (
  courseId: string,
  name: string,
  weight: number
) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/assessmentCategory/${courseId}`, {
      name,
      weight,
      course: courseId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAssessmentCategories = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/assessmentCategory/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAssessmentCategory = async (
  courseId: string,
  categoryId: string,
  weight: number
) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(
      `/assessmentCategory/${courseId}/${categoryId}`,
      { weight }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAssessmentCategory = async (categoryId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.delete(`/assessmentCategory/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAssessment = async (assessmentId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.delete(`/assessment/delete/${assessmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editAssessment = async (
  assessmentId: string,
  payload: {
    title: string;
    description: string;
    category: string;
    dueDate: string;
  }
) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(
      `/assessment/editAssessment/${assessmentId}`,
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllAssessmentsByTeacher = async () => {
  try {
    const api = await getApiInstance();
    const response = await api.get("/assessment/allAssessmentByTeacher");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAssessmentSubmissionsForTeacher = async (
  assessmentId: string
) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(
      `/assessmentSubmission/submission_for_Teacher/${assessmentId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSubmissionDetails = async (submissionId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(
      `/assessmentSubmission/submission/${submissionId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitGrades = async (
  submissionId: string,
  grades: { [answerId: string]: { awardedPoints: number; maxPoints: number } }
) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(
      `/assessmentSubmission/teacherGrading/${submissionId}`,
      grades
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitAssessment = async (
  assessmentId: string,
  title: string,
  description: string,
  dueDate: string,
  questions: any[],
  file?: any,
  questionId?: string
) => {
  try {
    const api = await getApiInstance();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("course", assessmentId);

    if (file && questionId) {
      formData.append("files", {
        uri: file.uri,
        type: file.type || "application/octet-stream",
        name: file.fileName || file.uri.split("/").pop() || "file",
      } as any);
      formData.append("questionId", questionId);
    } else {
      formData.append("questions", JSON.stringify(questions));
      questions.forEach((question, index) => {
        formData.append(`answers[${index}][questionId]`, question.questionId);
        formData.append(
          `answers[${index}][selectedAnswer]`,
          question.selectedAnswer
        );
      });
    }

    const response = await api.post(
      `/assessmentSubmission/submission/${assessmentId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllAssessmentForStudent = async () => {
  try {
    const api = await getApiInstance();
    const response = await api.get("/assessment/getAllassessmentforStudent");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStudentAssessmentDetails = async (assessmentId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/assessment/${assessmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================================
// STUDENT COURSE / ENROLLMENT
// ============================================================
export const getCourseById = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/course/get/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStudentEnrolledCourses = async (searchQuery: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(
      `/enrollment/studentCourses?search=${searchQuery}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStudentEnrolledCourseDetails = async (enrollmentId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(
      `/enrollment/studentCourseDetails/${enrollmentId}`
    );
    return response.data?.enrolledCourse || null;
  } catch (error) {
    throw error;
  }
};

export const getEnrollStatus = async (enrollmentId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/enrollment/isEnrolled/${enrollmentId}`);
    return response.data?.enrolled || null;
  } catch (error) {
    throw error;
  }
};

export const enrollInCourse = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/enrollment/create/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const unenrollFromCourse = async (
  enrollmentId: string,
  courseId: string
) => {
  try {
    const api = await getApiInstance();
    const response = await api.delete(`/enrollment/unenroll/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createStripeCheckoutSession = async (
  courseId: string,
  studentId: string
) => {
  try {
    const api = await getApiInstance();
    const response = await api.post("/stripe/create-checkout-session-mobile", {
      courseId,
      studentId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================================
// SEMESTERS & QUARTERS
// ============================================================
export const addSemesterToCourse = async (
  courseId: string,
  semesterId: string,
  quarterId: string
) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(
      `/semester/selectingNewSemesterwithQuarter/${courseId}`,
      { semester: [semesterId], quarter: [quarterId] }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSemestersOfCourse = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/semester/getSemesterOfCourse/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createSemester = async (
  courseId: string,
  title: string,
  startDate: string,
  endDate: string
) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/semester/create/${courseId}`, {
      title,
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSemester = async (
  semesterId: string,
  courseId: string,
  title: string,
  startDate: string,
  endDate: string
) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(`/semester/editSemester/${semesterId}`, {
      title,
      course: courseId,
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleSemesterArchive = async (
  semesterId: string,
  isArchived: boolean
) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(
      `/admin/updateSemArchiveStatus/${semesterId}`,
      { isArchived }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getQuartersForSemester = async (semesterId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/quarter/get/${semesterId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createQuarter = async (
  semesterId: string,
  title: string,
  startDate: string,
  endDate: string
) => {
  try {
    const api = await getApiInstance();
    const response = await api.post("/quarter/create", {
      title,
      semester: semesterId,
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateQuarter = async (
  quarterId: string,
  courseId: string,
  semesterId: string,
  title: string,
  startDate: string,
  endDate: string
) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(`/quarter/editQuarter/${quarterId}`, {
      title,
      course: courseId,
      semester: semesterId,
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleQuarterArchive = async (
  quarterId: string,
  isArchived: boolean
) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(
      `/admin/updateQtrArchiveStatus/${quarterId}`,
      { isArchived }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChaptersForQuarter = async (
  courseId: string,
  quarterId: string
) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/chapter/${courseId}/${quarterId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChaptersByQuarter = async (
  courseId: string,
  quarterId: string
) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/chapter/${courseId}/${quarterId}`);
    return response.data;
  } catch (error: any) {
    if (
      error.response?.status === 404 ||
      error.response?.data?.message === "No chapters found for this quarter"
    ) {
      return { chapters: [], message: "No chapters found for this quarter" };
    }
    throw error;
  }
};

export const getChaptersForCourses = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/chapter/chapterofCourse/${courseId}`);
    return response.data;
  } catch (error: any) {
    if (
      error.response?.status === 404 ||
      error.response?.data?.message === "No chapters found for this course"
    ) {
      return { chapters: [], message: "No chapters found for this course" };
    }
    throw error;
  }
};

export const getChapterDetailsForStudent = async (chapterId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/enrollment/getChapter/${chapterId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChapterDiscussionsForStudent = async (chapterId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/discussion/chapter/${chapterId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLessonDiscussionsForStudent = async (lessonId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/discussion/lesson/${lessonId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChapterPagesForStudent = async (chapterId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/pages/getChapterPages/${chapterId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLessonPagesForStudent = async (lessonId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/pages/getLessonPages/${lessonId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================================
// DISCUSSION (student – used by DiscussionStudent.tsx)
// ============================================================
export const getStudentDiscussion = async (discussionId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/discussion/${discussionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCommentForDiscussionStudent = async (
  discussionId: string,
  page = 1,
  limit = 5
) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(
      `/discussionComment/get/${discussionId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendComment = async (discussionId: string, comment: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(
      `/discussionComment/sendComment/${discussionId}`,
      { text: comment }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const isCommentedInDiscussion = async (discussionId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(
      `/discussionComment/isCommentedInDiscussion/${discussionId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getReplyCount = async (commentId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/replyDiscussion/replycount/${commentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendReply = async (commentId: string, reply: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/replyDiscussion/send/${commentId}`, {
      text: reply,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getReplies = async (commentId: string, page = 1, limit = 5) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(
      `/replyDiscussion/get/${commentId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================================
// STUDENT PAGES
// ============================================================
export const getStudentPages = async (studentId: string) => {
  try {
    const api = await getApiInstance();
    const res = await api.get("/pages/studentpages", {
      params: { studentId },
    });
    return res.data?.pages || [];
  } catch (error) {
    throw error;
  }
};

export const getStudentCourses = async () => {
  try {
    const api = await getApiInstance();
    const res = await api.get("/enrollment/studentCourses");
    return res.data?.enrolledCourses || [];
  } catch (error) {
    throw error;
  }
};

// ============================================================
// GRADEBOOK / GPA
// ============================================================
export const getGradeScale = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const res = await api.get(`/gradebook/getGradingScale/${courseId}`);
    return res.data?.scale || [];
  } catch (error) {
    throw error;
  }
};

export const gradingScale = async (courseId: string, data: any) => {
  try {
    const api = await getApiInstance();
    const res = await api.post(`/gradebook/gradingScale/${courseId}`, {
      scale: data,
    });
    return res.data?.scale || [];
  } catch (error) {
    throw error;
  }
};

export const getGPA = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const res = await api.get(`/gpa/get/${courseId}`);
    return res.data?.grade || [];
  } catch (error) {
    throw error;
  }
};

export const gpaScale = async (courseId: string, data: any) => {
  try {
    const api = await getApiInstance();
    const gpaData = data.map((elem: any) => ({
      gpa: elem.gpa,
      minPercentage: elem.minPercentage,
      maxPercentage: elem.maxPercentage,
    }));
    const res = await api.post(`/gpa/setGPAscale/${courseId}`, {
      gpaScale: gpaData,
    });
    return res.data?.scale || [];
  } catch (error) {
    throw error;
  }
};

// ============================================================
// PROBABLY SCHOOL APP ONLY / NOT IMPORTED IN IND APP
// (comment out if not needed)
// ============================================================

/*
export const getPublishedCourses = async (search?: string) => {
  try {
    const api = await getApiInstance();
    const baseUrl = `/course/getindividualcourse?published=true&isVerified=approved`;
    const url = search ? `${baseUrl}&search=${encodeURIComponent(search)}` : baseUrl;
    const response = await api.get(url);
    return response.data;
  } catch (error) { throw error; }
};

export const getCoursesByCategory = async (categoryId: string, search?: string) => {
  try {
    const api = await getApiInstance();
    const url = `/course/category/${categoryId}${search ? `?search=${encodeURIComponent(search)}` : ""}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) { throw error; }
};

export const getAssessmentSubmissions = async (assessmentId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/assessmentSubmission/submission_for_Teacher/${assessmentId}`);
    return response.data;
  } catch (error) { throw error; }
};

export const updateCourse = async (courseId: string, courseData: any) => {
  try {
    const api = await getApiInstance();
    const formData = new FormData();
    Object.keys(courseData).forEach((key) => {
      if (key === "syllabus" && courseData.syllabus) {
        formData.append("syllabus", courseData.syllabus);
      } else if (courseData[key] !== null && courseData[key] !== undefined) {
        if (Array.isArray(courseData[key])) {
          formData.append(key, JSON.stringify(courseData[key]));
        } else if (typeof courseData[key] === "object") {
          formData.append(key, JSON.stringify(courseData[key]));
        } else {
          formData.append(key, String(courseData[key]));
        }
      }
    });
    const response = await api.put(`/course/${courseId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) { throw error; }
};

export const updateSemesterArchiveStatus = async (semesterId: string, isArchived: boolean) => {
  try {
    const api = await getApiInstance();
    const response = await api.patch(`/semester/${semesterId}/archive`, { isArchived });
    return response.data;
  } catch (error) { throw error; }
};

export const getCourseEnrollments = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/course/${courseId}/enrollments`);
    return response.data;
  } catch (error) { throw error; }
};

export const getCourseForStudentPreview = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/course/getstdprew/${courseId}`);
    return response.data;
  } catch (error) { throw error; }
};

export const getAssessmentsByLesson = async (lessonId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/assessment/lesson/${lessonId}`);
    return response.data;
  } catch (error) { throw error; }
};

export const createAssessment = async (
  courseId: string,
  title: string,
  description: string,
  categoryId: string,
  dueDate: string,
  questions: any[],
  file?: any,
  lessonId?: string,
  chapterId?: string
) => {
  try {
    const api = await getApiInstance();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", categoryId);
    if (lessonId) formData.append("lesson", lessonId);
    else if (chapterId) {
      formData.append("chapter", chapterId);
      formData.append("course", courseId);
    } else formData.append("course", courseId);
    formData.append("questions", JSON.stringify(questions));
    if (file) {
      formData.append("files", {
        uri: file.uri,
        type: file.type || "application/octet-stream",
        name: file.fileName || file.uri.split("/").pop() || "file",
      } as any);
    }
    const response = await api.post("/assessment/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) { throw error; }
};
*/
