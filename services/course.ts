// services/course.ts
import { getApiInstance } from "./apiInstance";
import React, { useEffect } from "react";
import { SBLItem } from "../types/course";

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
  type?: string;
}

const IMAGE_MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
};

const resolveImageMimeType = (
  filename?: string | null,
  explicitType?: string | null,
  uri?: string | null
): string => {
  if (explicitType) {
    if (explicitType === "photo") return "image/jpeg";
    if (explicitType.includes("/")) {
      return explicitType === "image/jpg" ? "image/jpeg" : explicitType;
    }
  }

  const dataUriMatch = uri?.match(/^data:(image\/[^;]+);/i);
  if (dataUriMatch?.[1]) {
    const mime = dataUriMatch[1];
    return mime === "image/jpg" ? "image/jpeg" : mime;
  }

  const name = filename || uri?.split("/").pop()?.split("?")[0] || "";
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext && IMAGE_MIME_MAP[ext]) {
    return IMAGE_MIME_MAP[ext];
  }

  return "image/jpeg";
};

const resolveImageFilename = (
  mimeType: string,
  filename?: string | null,
  uri?: string | null
): string => {
  if (filename && filename.includes(".")) {
    return filename;
  }

  const uriName = uri?.split("/").pop()?.split("?")[0];
  if (uriName && uriName.includes(".")) {
    return uriName;
  }

  const ext = mimeType.split("/")[1] || "jpeg";
  const normalizedExt = ext === "jpeg" ? "jpg" : ext;
  return `thumbnail_${Date.now()}.${normalizedExt}`;
};

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
  paymentType?: string;
  offersCertificate?: boolean;
  offersTranscript?: boolean;
  passingPercentage?: string;
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
      const mimeType = resolveImageMimeType(
        courseData.thumbnail.filename,
        courseData.thumbnail.type,
        imageUri
      );
      const filename = resolveImageFilename(
        mimeType,
        courseData.thumbnail.filename,
        imageUri
      );
      formData.append("thumbnail", {
        uri: imageUri,
        type: mimeType,
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
    formData.append(
      "semesterbased",
      courseData.semesterbased ? "true" : "false"
    );
    formData.append("price", courseData.price ?? "");
    formData.append("paymentType", courseData.paymentType || "FREE");
    formData.append(
      "offersCertificate",
      String(courseData.offersCertificate ?? false)
    );
    formData.append(
      "offersTranscript",
      String(courseData.offersTranscript ?? false)
    );
    formData.append("passingPercentage", courseData.passingPercentage || "80");
    formData.append("published", String(courseData.published ?? false));
    formData.append("semester", JSON.stringify(courseData.semester || []));
    formData.append("quarter", JSON.stringify(courseData.quarter || []));

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

    const response = await api.post("/api/course/create", formData, {
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
      "/api/category/get"
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
    }>(`/api/category/subcategories/${categoryId}`);
    return { success: true, data: response.data.subcategories };
  } catch (error) {
    throw error;
  }
};

export const getSemesters = async () => {
  try {
    const api = await getApiInstance();
    const response = await api.get("/api/semester/get");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getQuartersBySemesters = async (semesterIds: string[]) => {
  try {
    const api = await getApiInstance();
    const response = await api.post("/api/quarter/getquarters", {
      semesters: semesterIds,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getQuarterDetails = async (quarterId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(
      `/api/quarter/getDatesofQuarter/${quarterId}`
    );
    // Normalize: the backend may return dates at the top level ({startDate, endDate})
    // or nested ({quarter: {startDate, endDate}}) — support both so callers can
    // always safely read data.quarter.startDate / data.quarter.endDate.
    const raw = response.data;
    const quarter = raw?.quarter ?? raw;
    return {
      quarter: {
        startDate: quarter?.startDate,
        endDate: quarter?.endDate,
      },
    };
  } catch (error) {
    throw error;
  }
};

export const archiveCourse = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(`/api/course/archive/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const unarchiveCourse = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(`/api/course/archive/${courseId}`);
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
      ? `/api/course/getindividualcourse?published=true&isVerified=approved&search=${encodeURIComponent(
          search
        )}`
      : `/api/course/getindividualcourse?published=true&isVerified=approved`;
    const response = await api.get<CourseResponse>(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add this after getAllCourses
export const getAllPublishedCourses = async (): Promise<CourseResponse> => {
  try {
    const api = await getApiInstance();
    const response = await api.get<CourseResponse>(
      "/api/course/getindividualcourse?published=true&isVerified=approved"
    );
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
        ? `/api/course/getindividualcourse?isVerified=${isVerified}&search=${searchParam}`
        : `/api/course/getindividualcourse?published=${published}&isVerified=${isVerified}&search=${searchParam}`;
    const response = await api.get<CourseResponse>(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCourseDetails = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/course/details/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCourse = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.delete(`/api/course/delete/${courseId}`);
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
    const response = await api.put(
      `/api/course/editCourseBasics/${courseId}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCourseThumbnail = async (
  courseId: string,
  thumbnail: any
) => {
  try {
    const api = await getApiInstance();
    const formData = new FormData();
    const mimeType = resolveImageMimeType(
      thumbnail.fileName,
      thumbnail.type,
      thumbnail.uri
    );
    formData.append("thumbnail", {
      uri: thumbnail.uri,
      type: mimeType,
      name: resolveImageFilename(mimeType, thumbnail.fileName, thumbnail.uri),
    } as any);
    const response = await api.put(
      `/api/course/thumbnail/${courseId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
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
    const url = `/api/course/${subcategoryId}${
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
    const url = `/api/chapter/create/${courseId}`;
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
    const response = await api.delete(`/api/chapter/${chapterId}`);
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
    const response = await api.put(`/api/chapter/edit/${chapterId}`, {
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
      `/api/chapter/chapter/chapter&lessons/${chapterId}`
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
    const response = await api.post("/api/lesson/create", formData, {
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
    const response = await api.delete(`/api/lesson/${lessonId}`);
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
    const response = await api.put(`/api/lesson/edit/${lessonId}`, {
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

export const addMoreFilesToLesson = async (
  lessonId: string,
  pdfFiles: any[]
) => {
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
    const response = await api.put(
      `/api/lesson/addMoreFiles/${lessonId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteLessonFile = async (lessonId: string, fileId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.delete(
      `/api/lesson/delete/${lessonId}/${fileId}`
    );
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
    const response = await api.post(`/api/assessmentCategory/${courseId}`, {
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
    const response = await api.get(`/api/assessmentCategory/${courseId}`);
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
      `/api/assessmentCategory/${courseId}/${categoryId}`,
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
    const response = await api.delete(`/api/assessmentCategory/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get SBL scale
export const getSBLScale = async (courseId: string) => {
  const api = await getApiInstance();
  const response = await api.get(`/api/standardGrading/get/${courseId}`);
  return response.data;
};

// Set/update SBL scale
export const setSBLScale = async (courseId: string, scale: SBLItem[]) => {
  const api = await getApiInstance();
  const response = await api.post(`/api/standardGrading/set/${courseId}`, {
    scale,
  });
  return response.data;
};

export const deleteAssessment = async (assessmentId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.delete(`/api/assessment/delete/${assessmentId}`);
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
      `/api/assessment/editAssessment/${assessmentId}`,
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
    const response = await api.get("/api/assessment/allAssessmentByTeacher");
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
      `/api/assessmentSubmission/submission_for_Teacher/${assessmentId}`
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
      `/api/assessmentSubmission/submission/${submissionId}`
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
      `/api/assessmentSubmission/teacherGrading/${submissionId}`,
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
      `/api/assessmentSubmission/submission/${assessmentId}`,
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
    const response = await api.get(
      "/api/assessment/getAllassessmentforStudent"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getStudentAssessmentDetails = async (assessmentId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/assessment/${assessmentId}`);
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
    const response = await api.get(`/api/course/get/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStudentEnrolledCourses = async (searchQuery: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(
      `/api/enrollment/studentCourses?search=${searchQuery}`
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
      `/api/enrollment/studentCourseDetails/${enrollmentId}`
    );
    return response.data?.enrolledCourse || null;
  } catch (error) {
    throw error;
  }
};

export const getEnrollStatus = async (enrollmentId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(
      `/api/enrollment/isEnrolled/${enrollmentId}`
    );
    return response.data?.enrolled || null;
  } catch (error) {
    throw error;
  }
};

export const enrollInCourse = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/api/enrollment/create/${courseId}`);
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
    const response = await api.delete(`/api/enrollment/unenroll/${courseId}`);
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
    const response = await api.post(
      "/api/stripe/create-checkout-session-mobile",
      {
        courseId,
        studentId,
      }
    );
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
      `/api/semester/selectingNewSemesterwithQuarter/${courseId}`,
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
    const response = await api.get(
      `/api/semester/getSemesterOfCourse/${courseId}`
    );
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
    const response = await api.post(`/api/semester/create/${courseId}`, {
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
    const response = await api.put(`/api/semester/editSemester/${semesterId}`, {
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
      `/api/admin/updateSemArchiveStatus/${semesterId}`,
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
    const response = await api.get(`/api/quarter/get/${semesterId}`);
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
    const response = await api.post("/api/quarter/create", {
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
    const response = await api.put(`/api/quarter/editQuarter/${quarterId}`, {
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
      `/api/admin/updateQtrArchiveStatus/${quarterId}`,
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
    const response = await api.get(`/api/chapter/${courseId}/${quarterId}`);
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
    const response = await api.get(`/api/chapter/${courseId}/${quarterId}`);
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
    const response = await api.get(`/api/chapter/chapterofCourse/${courseId}`);
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
    const response = await api.get(`/api/enrollment/getChapter/${chapterId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChapterDiscussionsForStudent = async (chapterId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/discussion/chapter/${chapterId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLessonDiscussionsForStudent = async (lessonId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/discussion/lesson/${lessonId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChapterPagesForStudent = async (chapterId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/pages/getChapterPages/${chapterId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLessonPagesForStudent = async (lessonId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/pages/getLessonPages/${lessonId}`);
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
    const response = await api.get(`/api/discussion/${discussionId}`);
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
      `/api/discussionComment/get/${discussionId}?page=${page}&limit=${limit}`
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
      `/api/discussionComment/sendComment/${discussionId}`,
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
      `/api/discussionComment/isCommentedInDiscussion/${discussionId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getReplyCount = async (commentId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(
      `/api/replyDiscussion/replycount/${commentId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendReply = async (commentId: string, reply: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/api/replyDiscussion/send/${commentId}`, {
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
      `/api/replyDiscussion/get/${commentId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const gradeDiscussionComment = async (
  discussionId: string,
  commentId: string,
  obtainedMarks: number
) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(
      `/api/discussionComment/gradeDiscussionofStd/${discussionId}/${commentId}`,
      { obtainedMarks }
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
    const res = await api.get("/api/pages/studentpages", {
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
    const res = await api.get("/api/enrollment/studentCourses");
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
    const res = await api.get(`/api/gradebook/getGradingScale/${courseId}`);
    return res.data?.scale || [];
  } catch (error) {
    throw error;
  }
};

export const gradingScale = async (courseId: string, data: any) => {
  try {
    const api = await getApiInstance();
    const res = await api.post(`/api/gradebook/gradingScale/${courseId}`, {
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
    const res = await api.get(`/api/gpa/get/${courseId}`);
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
    const res = await api.post(`/api/gpa/setGPAscale/${courseId}`, {
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
// import axios from "axios";
// import { getStoredBaseUrl } from "../utils/storage";
// import { getApiInstance } from "../services/apiInstance";
//
// // Create axios instance with default config
// // export const createApiInstance = async () => {
// //   const baseUrl = await getStoredBaseUrl();
// //   if (!baseUrl) {
// //     throw new Error("No base URL configured. Please select a school first.");
// //   }
// //   return axios.create({
// //     baseURL: baseUrl,
// //     headers: {
// //       "Content-Type": "application/json",
// //       Accept: "application/json",
// //     },
// //   });
// // };
//
// // Add request interceptor for authentication if needed
//
// interface Thumbnail {
//   url: string;
//   filename: string;
// }
//
// interface Category {
//   _id: string;
//   title: string;
// }
//
// interface Subcategory {
//   _id: string;
//   title: string;
//   category: string;
// }
//
// interface CourseData {
//   courseTitle: string;
//   category: string;
//   semesterbased: boolean;
//   subcategory?: string;
//   language: string;
//   courseDescription: string;
//   thumbnail: Thumbnail;
//   teachingPoints: string[];
//   requirements: string[];
//   published?: boolean;
//   semester?: string[];
//   quarter?: string[];
//   syllabus?: any;
//   price: string;
// }
//
// interface CourseResponse {
//   courses: Array<{
//     _id: string;
//     courseTitle: string;
//     category: {
//       _id: string;
//       title: string;
//     };
//     subcategory: string;
//     language: string;
//     courseDescription: string;
//     thumbnail: Thumbnail;
//     teachingPoints: string[];
//     requirements: string[];
//     createdby: {
//       _id: string;
//       firstName: string;
//       middleName: string;
//       lastName: string;
//     };
//     startingDate: string;
//     endingDate: string;
//     published: boolean;
//     status: string;
//     createdAt: string;
//     updatedAt: string;
//     __v: number;
//   }>;
//   message: string;
// }
//
// interface CourseListResponse {
//   success: boolean;
//   data: {
//     _id: string;
//     courseTitle: string;
//     category: string;
//     subcategory: string;
//     language: string;
//     courseDescription: string;
//     thumbnail: Thumbnail;
//     teachingPoints: string[];
//     requirements: string[];
//     createdby: string;
//     published: boolean;
//     createdAt: string;
//     updatedAt: string;
//   }[];
//   message: string;
// }
//
// export const createCourse = async (
//   courseData: CourseData
// ): Promise<CourseResponse> => {
//   try {
//     const api = await getApiInstance();
//     const formData = new FormData();
//
//     // Append the thumbnail
//     if (courseData.thumbnail.url) {
//       const imageUri = courseData.thumbnail.url;
//       const filename = courseData.thumbnail.filename || "thumbnail.jpg";
//
//       // Get the file extension from the filename or default to jpg
//       const extension = filename.split(".").pop() || "jpg";
//       const type = `image/${extension}`;
//
//       formData.append("thumbnail", {
//         uri: imageUri,
//         type,
//         name: filename,
//       } as any);
//     }
//
//     // Append other course data exactly as in the live payload
//     formData.append("courseTitle", courseData.courseTitle);
//     formData.append("category", courseData.category);
//     if ("subcategory" in courseData) {
//       formData.append("subcategory", courseData.subcategory);
//     }
//     formData.append("language", courseData.language.toLowerCase()); // Ensure lowercase
//     formData.append("courseDescription", courseData.courseDescription);
//     formData.append(
//       "teachingPoints",
//       JSON.stringify(courseData.teachingPoints)
//     );
//     formData.append("requirements", JSON.stringify(courseData.requirements));
//     formData.append("semesterbased", courseData.semesterbased);
//     formData.append("price", courseData.price);
//     // Add semester and quarter if provided
//     // if (courseData.semester && courseData.semester.length > 0) {
//     //   formData.append('semester', JSON.stringify(courseData.semester));
//     // }
//
//     // if (courseData.quarter && courseData.quarter.length > 0) {
//     //   formData.append('quarter', JSON.stringify(courseData.quarter));
//     // }
//
//     // Add syllabus if provided
//     if (courseData.syllabus) {
//       formData.append("syllabus", {
//         uri: courseData.syllabus.uri,
//         type: courseData.syllabus.type || "application/pdf",
//         name:
//           courseData.syllabus.name ||
//           courseData.syllabus.uri.split("/").pop() ||
//           "syllabus.pdf",
//       } as any);
//     }
//     console.log("Sending form data:", formData);
//
//     const response = await api.post<CourseResponse>(
//       "/course/create",
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );
//
//     return response.data;
//   } catch (error: any) {
//     console.error("Create course error:", error);
//     if (error.response) {
//       // The request was made and the server responded with a status code
//       // that falls out of the range of 2xx
//       console.error("Server response:", error.response.data);
//       throw new Error(error.response.data.message || "Failed to create course");
//     } else if (error.request) {
//       // The request was made but no response was received
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       // Something happened in setting up the request that triggered an Error
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const archiveCourse = async (courseId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.put(`/course/archive/${courseId}`);
//
//     return response.data;
//   } catch (error: any) {
//     console.error("Archive course error:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to archive course"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const unarchiveCourse = async (courseId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.put(`/course/archive/${courseId}`);
//
//     return response.data;
//   } catch (error: any) {
//     console.error("Unarchive course error:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to unarchive course"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const getCategories = async () => {
//   try {
//     const api = await getApiInstance();
//
//     console.log("Fetching categories from:", "/category/get");
//     const response = await api.get<{ categories: Category[]; message: string }>(
//       "/category/get"
//     );
//     console.log("Categories response:", response.data);
//     return {
//       success: true,
//       data: response.data.categories,
//     };
//   } catch (error: any) {
//     console.error("Get categories error:", error);
//     if (error.response) {
//       console.error("Error response:", error.response.data);
//       throw new Error(
//         error.response.data.message || "Failed to fetch categories"
//       );
//     } else if (error.request) {
//       console.error("No response received:", error.request);
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       console.error("Request setup error:", error.message);
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const getSubcategories = async (categoryId: string) => {
//   try {
//     const api = await getApiInstance();
//
//     console.log("Fetching subcategories for category:", categoryId);
//     const response = await api.get<{
//       subcategories: Subcategory[];
//       message: string;
//     }>(`/category/subcategories/${categoryId}`);
//     console.log("Subcategories response:", response.data);
//     return {
//       success: true,
//       data: response.data.subcategories,
//     };
//   } catch (error: any) {
//     console.error("Get subcategories error:", error);
//     if (error.response) {
//       console.error("Error response:", error.response.data);
//       throw new Error(
//         error.response.data.message || "Failed to fetch subcategories"
//       );
//     } else if (error.request) {
//       console.error("No response received:", error.request);
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       console.error("Request setup error:", error.message);
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const getAllCourses = async (
//   search?: string
// ): Promise<CourseResponse> => {
//   try {
//     const api = await getApiInstance();
//     console.log("Fetching courses from:", search);
//     const url = search
//       ? `/course/getindividualcourse?published=true&isVerified=approved?&search=${encodeURIComponent(
//           search
//         )}`
//       : `/course/getindividualcourse?published=true&isVerified=approved`;
//
//     const response = await api.get<CourseResponse>(url);
//     console.log(response);
//     return response.data;
//   } catch (error: any) {
//     console.error("Get all courses error:", error);
//     if (error.response) {
//       throw new Error(error.response.data.message || "Failed to fetch courses");
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const getTeacherCourses = async (
//   published: boolean,
//   isVerified: string,
//   search?: string
// ): Promise<CourseResponse> => {
//   try {
//     const api = await getApiInstance();
//     console.log(
//       "Fetching teacher courses with published:",
//       published,
//       "search:",
//       search
//     );
//
//     const searchParam = search ? encodeURIComponent(search) : "";
//     const url =
//       isVerified === "pending" || isVerified === "rejected"
//         ? `/course/getindividualcourse?isVerified=${isVerified}&search=${searchParam}`
//         : `/course/getindividualcourse?published=${published}&isVerified=${isVerified}&search=${searchParam}`;
//
//     const response = await api.get<CourseResponse>(url);
//     return response.data;
//   } catch (error: any) {
//     console.error("Get teacher courses error:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to fetch teacher courses"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const getCourseDetails = async (courseId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/course/details/${courseId}`);
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to fetch course details"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const deleteCourse = async (courseId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.delete(`/course/delete/${courseId}`);
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(error.response.data.message || "Failed to delete course");
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const createChapter = async (
//   courseId: string,
//   title: string,
//   description: string,
//   quarterId: string | null
// ) => {
//   if (!title || !description) {
//     throw new Error("Both title and description are required");
//   }
//   try {
//     const api = await getApiInstance();
//     let url = `/chapter/create/${courseId}`;
//     let body = { title, description };
//     if (quarterId) {
//       body = { ...body, quarter: quarterId };
//     }
//     console.log(body, url);
//     const response = await api.post(url, body);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error creating chapter:", error);
//     if (error.response) {
//       console.error("Backend error response:", error.response.data);
//       throw new Error(
//         error.response.data.message || "Failed to create chapter"
//       );
//     } else if (error.request) {
//       console.error("No response from server:", error.request);
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       console.error("Request setup error:", error.message);
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const deleteChapter = async (chapterId: string) => {
//   console.log(chapterId);
//   try {
//     const api = await getApiInstance();
//     const response = await api.delete(`/chapter/${chapterId}`);
//     return response.data;
//   } catch (error: any) {
//     console.log(error);
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to delete chapter"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const createAssessmentCategory = async (
//   courseId: string,
//   name: string,
//   weight: number
// ) => {
//   if (weight <= 0) {
//     throw new Error("Weight must be greater than 0");
//   }
//
//   try {
//     console.log("Creating API instance...");
//     const api = await getApiInstance();
//     console.log("API instance created successfully");
//
//     console.log("Adding auth interceptor...");
//     console.log("Auth interceptor added successfully");
//
//     const requestData = {
//       name,
//       weight,
//       course: courseId,
//     };
//     console.log("Request data:", JSON.stringify(requestData, null, 2));
//
//     console.log("Making POST request to:", `/assessmentCategory/${courseId}`);
//     const response = await api.post(
//       `/assessmentCategory/${courseId}`,
//       requestData
//     );
//     console.log("Response received:", JSON.stringify(response.data, null, 2));
//
//     // Check if response has data
//     if (!response.data) {
//       throw new Error("No data received from server");
//     }
//
//     // Return the response data directly
//     return response.data;
//   } catch (error: any) {
//     console.error("Detailed error in createAssessmentCategory:", {
//       message: error.message,
//       stack: error.stack,
//       response: error.response?.data,
//       request: error.request,
//       config: error.config,
//     });
//
//     if (error.response) {
//       console.error("Server error response:", error.response.data);
//       throw new Error(
//         error.response.data.message || "Failed to create assessment category"
//       );
//     } else if (error.request) {
//       console.error("No response received:", error.request);
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       console.error("Request setup error:", error.message);
//       throw new Error(`Error setting up the request: ${error.message}`);
//     }
//   }
// };
//
// export const getAssessmentCategories = async (courseId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/assessmentCategory/${courseId}`);
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to fetch assessment categories"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const createAssessment = async (
//   courseId: string,
//   title: string,
//   description: string,
//   categoryId: string,
//   dueDate: string,
//   questions: any[],
//   file?: any, // Optional file object from react-native-image-picker
//   lessonId?: string,
//   chapterId?: string
// ) => {
//   try {
//     const api = await getApiInstance();
//
//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("description", description);
//     formData.append("category", categoryId);
//
//     if (lessonId) {
//       formData.append("lesson", lessonId);
//     } else if (chapterId) {
//       formData.append("chapter", chapterId);
//       formData.append("course", courseId);
//     } else {
//       formData.append("course", courseId);
//     }
//
//     formData.append("questions", JSON.stringify(questions));
//
//     if (file) {
//       formData.append("files", {
//         uri: file.uri,
//         type: file.type || "application/octet-stream",
//         name: file.fileName || file.uri.split("/").pop() || "file",
//       } as any);
//     }
//
//     console.log("Sending assessment creation request:", formData);
//
//     const response = await api.post("/assessment/create", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//     console.log("Assessment creation response:", response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error creating assessment:", {
//       message: error.message,
//       stack: error.stack,
//       response: error.response?.data,
//       request: error.request,
//       config: error.config,
//     });
//
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to create assessment"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error(`Error setting up the request: ${error.message}`);
//     }
//   }
// };
// export const submitAssessment = async (
//   assessmentId: string,
//   title: string,
//   description: string,
//   dueDate: string,
//   questions: any[],
//   file?: any, // Optional file object from react-native-image-picker
//   questionId?: string
// ) => {
//   try {
//     const api = await getApiInstance();
//
//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("description", description);
//     formData.append("course", assessmentId);
//
//     if (file && questionId) {
//       formData.append("files", {
//         uri: file.uri,
//         type: file.type || "application/octet-stream",
//         name: file.fileName || file.uri.split("/").pop() || "file",
//       } as any);
//       formData.append("questionId", questionId);
//     } else {
//       formData.append("questions", JSON.stringify(questions));
//       questions.forEach((question, index) => {
//         formData.append(`answers[${index}][questionId]`, question.questionId);
//         formData.append(
//           `answers[${index}][selectedAnswer]`,
//           question.selectedAnswer
//         );
//       });
//     }
//
//     console.log("submitting assessment creation request:", formData);
//
//     const response = await api.post(
//       `/assessmentSubmission/submission/${assessmentId}`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );
//     console.log("Assessment submitted response:", response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error submitting assessment:", {
//       message: error.message,
//       stack: error.stack,
//       response: error.response?.data,
//       request: error.request,
//       config: error.config,
//     });
//
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to submit assessment"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error(`Error setting up the request: ${error.message}`);
//     }
//   }
// };
//
// export const deleteAssessment = async (assessmentId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.delete(`/assessment/delete/${assessmentId}`);
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to delete assessment"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const editAssessment = async (
//   assessmentId: string,
//   payload: {
//     title: string;
//     description: string;
//     category: string;
//     dueDate: string;
//   }
// ) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.put(
//       `/assessment/editAssessment/${assessmentId}`,
//       payload
//     );
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to edit assessment"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const createLesson = async (
//   chapterId: string,
//   title: string,
//   description: string,
//   youtubeLinks: string,
//   otherLink: string,
//   pdfFiles: any[]
// ) => {
//   try {
//     const api = await getApiInstance();
//
//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("description", description);
//     formData.append("youtubeLinks", youtubeLinks);
//     formData.append("otherLink", otherLink);
//     formData.append("chapter", chapterId);
//
//     pdfFiles.forEach((file) => {
//       formData.append("pdfFiles", {
//         uri: file.uri,
//         type: file.type || "application/pdf",
//         name: file.name || file.uri.split("/").pop() || "file.pdf",
//       } as any);
//     });
//
//     console.log("Sending lesson creation request:", formData);
//
//     const response = await api.post("/lesson/create", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//     console.log("Lesson creation response:", response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error creating lesson:", {
//       message: error.message,
//       stack: error.stack,
//       response: error.response?.data,
//       request: error.request,
//       config: error.config,
//     });
//
//     if (error.response) {
//       throw new Error(error.response.data.message || "Failed to create lesson");
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error(`Error setting up the request: ${error.message}`);
//     }
//   }
// };
//
// export const deleteLesson = async (lessonId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.delete(`/lesson/${lessonId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error deleting lesson:", error);
//     if (error.response) {
//       throw new Error(error.response.data.message || "Failed to delete lesson");
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const getAllAssessmentsByTeacher = async () => {
//   try {
//     const api = await getApiInstance();
//     console.log(
//       "Fetching all assessments by teacher from: /assessment/allAssessmentByTeacher"
//     );
//     const response = await api.get("/assessment/allAssessmentByTeacher");
//     console.log("All assessments by teacher response:", response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("Get all assessments by teacher error:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to fetch assessments by teacher"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const getAssessmentSubmissionsForTeacher = async (
//   assessmentId: string
// ) => {
//   try {
//     const api = await getApiInstance();
//     console.log(
//       "Fetching assessment submissions for teacher from: /assessmentSubmission/submission_for_Teacher/" +
//         assessmentId
//     );
//     const response = await api.get(
//       `/assessmentSubmission/submission_for_Teacher/${assessmentId}`
//     );
//     console.log("Assessment submissions response:", response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("Get assessment submissions error:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to fetch assessment submissions"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const getCoursesBySubcategory = async (
//   subcategoryId: string,
//   search?: string
// ) => {
//   console.log(subcategoryId);
//   try {
//     const api = await getApiInstance();
//     const url = `/course/${subcategoryId}${
//       search ? `?search=${encodeURIComponent(search)}` : "?search="
//     }`;
//     console.log("Fetching courses by subcategory:", url);
//     const response = await api.get(url);
//     return response.data;
//   } catch (error: any) {
//     console.error("Get courses by subcategory error:", error);
//     if (error.response) {
//       throw new Error(error.response.data.message || "Failed to fetch courses");
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const getCoursesByCategory = async (
//   categoryId: string,
//   search?: string
// ) => {
//   console.log("Fetching courses by category:", categoryId);
//   try {
//     const api = await getApiInstance();
//     const url = `/course/category/${categoryId}${
//       search ? `?search=${encodeURIComponent(search)}` : "?search="
//     }`;
//     console.log("Fetching courses by category:", url);
//     const response = await api.get(url);
//     return response.data;
//   } catch (error: any) {
//     console.error("Get courses by category error:", error);
//     if (error.response) {
//       throw new Error(error.response.data.message || "Failed to fetch courses");
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// /**
//  * Fetch a course by its ID from a full URL (for student view)
//  */
// export const getCourseById = async (courseId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/course/get/${courseId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching course by ID:", error);
//     throw new Error(error.response?.data?.message || "Failed to fetch course");
//   }
// };
// export const getStudentDiscussion = async (discussionId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/discussion/${discussionId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching discussion of student by ID:", error);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch discussion of student"
//     );
//   }
// };
// export const getCommentForDiscussionStudent = async (
//   discussionId: string,
//   page = 1,
//   limit = 5
// ) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(
//       `/discussionComment/get/${discussionId}?page=${page}&limit=${limit}`
//     );
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching comments for discussion:", error);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch comments"
//     );
//   }
// };
// export const sendComment = async (discussionId: string, comment: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.post(
//       `/discussionComment/sendComment/${discussionId}`,
//       { text: comment }
//     );
//     return response.data;
//   } catch (error: any) {
//     console.error("Error sending comment:", error);
//     throw new Error(error.response?.data?.message || "Failed to send comment");
//   }
// };
//
// // Add to course.ts - For course-level comments
//
// /**
//  * Get all comments for a course
//  */
// export const getCourseComments = async (courseId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/course/comments/${courseId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching course comments:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to fetch course comments"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// /**
//  * Post a comment on a course
//  */
// export const sendCourseComment = async (courseId: string, comment: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.post(`/course/comment/${courseId}`, {
//       text: comment,
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error("Error sending course comment:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to send course comment"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const isCommentedInDiscussion = async (discussionId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(
//       `/discussionComment/isCommentedInDiscussion/${discussionId}`
//     );
//     return response.data;
//   } catch (error: any) {
//     console.error("Error checking if commented:", error);
//     throw new Error(
//       error.response?.data?.message || "Failed to check comment status"
//     );
//   }
// };
//
// export const getReplyCount = async (commentId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/replyDiscussion/replycount/${commentId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching reply count:", error);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch reply count"
//     );
//   }
// };
//
// export const sendReply = async (commentId: string, reply: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.post(`/replyDiscussion/send/${commentId}`, {
//       text: reply,
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error("Error sending reply:", error);
//     throw new Error(error.response?.data?.message || "Failed to send reply");
//   }
// };
//
// export const getReplies = async (commentId: string, page = 1, limit = 5) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(
//       `/replyDiscussion/get/${commentId}?page=${page}&limit=${limit}`
//     );
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching replies:", error);
//     throw new Error(error.response?.data?.message || "Failed to fetch replies");
//   }
// };
// /**
//  * Fetch course for student preview
//  */
// export const getCourseForStudentPreview = async (courseId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/course/getstdprew/${courseId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching course for student preview:", error);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch course for preview"
//     );
//   }
// };
//
// /**
//  * Fetch quarters for a semester
//  */
// export const getQuartersForSemester = async (semesterId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/quarter/get/${semesterId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching quarters:", error);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch quarters"
//     );
//   }
// };
//
// /**
//  * Fetch chapters for a quarter
//  */
// export const getChaptersForQuarter = async (
//   courseId: string,
//   quarterId: string
// ) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/chapter/${courseId}/${quarterId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching chapters:", error);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch chapters"
//     );
//   }
// };
//
// /**
//  * Fetch chapter details for student preview
//  */
//
// export const getChapterDetailsForStudent = async (chapterId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/enrollment/getChapter/${chapterId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching chapter details:", error);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch chapter details"
//     );
//   }
// };
// export const getChapterDiscussionsForStudent = async (chapterId: string) => {
//   try {
//     console.log(chapterId);
//     const api = await getApiInstance();
//     const response = await api.get(`/discussion/chapter/${chapterId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching chapter discussions:", error);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch chapter discussions"
//     );
//   }
// };
// export const getLessonDiscussionsForStudent = async (lessonId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/discussion/lesson/${lessonId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching lesson discussions:", error);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch lesson discussions"
//     );
//   }
// };
// export const getChapterPagesForStudent = async (chapterId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/pages/getChapterPages/${chapterId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching chapter pages:", error);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch chapter pages"
//     );
//   }
// };
// export const getLessonPagesForStudent = async (lessonId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/pages/getLessonPages/${lessonId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching lesson pages:", error);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch lesson pages"
//     );
//   }
// };
//
// export const getStudentEnrolledCourses = async (searchQuery: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(
//       `/enrollment/studentCourses?search=${searchQuery}`
//     );
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching enrolled courses:", error);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch enrolled courses"
//     );
//   }
// };
// export const getStudentAssessmentDetails = async (assessmentId: string) => {
//   try {
//     const api = await getApiInstance();
//     console.log(api);
//     console.log(assessmentId);
//     const response = await api.get(`/assessment/${assessmentId}`);
//     console.log(response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching assessment details:", error);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch assessment details"
//     );
//   }
// };
//
// export const updateAssessmentCategory = async (
//   courseId: string,
//   categoryId: string,
//   weight: number
// ) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.put(
//       `/assessmentCategory/${courseId}/${categoryId}`,
//       { weight }
//     );
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to update assessment category"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
// export const createStripeCheckoutSession = async (
//   courseId: string,
//   studentId: string
// ) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.post("/stripe/create-checkout-session-mobile", {
//       courseId,
//       studentId,
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error("Error creating Stripe checkout session:", error);
//     throw new Error(
//       error.response?.data?.message || "Failed to create checkout session"
//     );
//   }
// };
//
// export const enrollInCourse = async (courseId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.post(`/enrollment/create/${courseId}`);
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to update assessment category"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const deleteAssessmentCategory = async (categoryId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.delete(`/assessmentCategory/${categoryId}`);
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to delete assessment category"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const getSemesters = async () => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get("/semester/get");
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       console.log(error.response.data);
//       throw new Error(
//         error.response.data.message || "Failed to fetch semesters"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const getQuartersBySemesters = async (semesterIds: string[]) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.post("/quarter/getquarters", {
//       semesters: semesterIds,
//     });
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to fetch quarters"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const addSemesterToCourse = async (
//   courseId: string,
//   semesterId: string,
//   quarterId: string
// ) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.post(
//       `/semester/selectingNewSemesterwithQuarter/${courseId}`,
//       {
//         semester: [semesterId],
//         quarter: [quarterId],
//       }
//     );
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to add semester to course"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// // Get semesters of a course
// export const getSemestersOfCourse = async (courseId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/semester/getSemesterOfCourse/${courseId}`);
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to fetch semesters"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// // Create semester
// export const createSemester = async (
//   courseId: string,
//   title: string,
//   startDate: string,
//   endDate: string
// ) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.post(`/semester/create/${courseId}`, {
//       title,
//       startDate,
//       endDate,
//     });
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to create semester"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// // Update semester
// export const updateSemester = async (
//   semesterId: string,
//   courseId: string,
//   title: string,
//   startDate: string,
//   endDate: string
// ) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.put(`/semester/editSemester/${semesterId}`, {
//       title,
//       course: courseId,
//       startDate,
//       endDate,
//     });
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to update semester"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// // Toggle archive status for semester
// export const toggleSemesterArchive = async (
//   semesterId: string,
//   isArchived: boolean
// ) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.put(
//       `/admin/updateSemArchiveStatus/${semesterId}`,
//       {
//         isArchived,
//       }
//     );
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message ||
//           "Failed to update semester archive status"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// // Create quarter
// export const createQuarter = async (
//   semesterId: string,
//   title: string,
//   startDate: string,
//   endDate: string
// ) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.post(`/quarter/create`, {
//       title,
//       semester: semesterId,
//       startDate,
//       endDate,
//     });
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to create quarter"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// // Update quarter
// export const updateQuarter = async (
//   quarterId: string,
//   courseId: string,
//   semesterId: string,
//   title: string,
//   startDate: string,
//   endDate: string
// ) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.put(`/quarter/editQuarter/${quarterId}`, {
//       title,
//       course: courseId,
//       semester: semesterId,
//       startDate,
//       endDate,
//     });
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to update quarter"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// // Toggle archive status for quarter
// export const toggleQuarterArchive = async (
//   quarterId: string,
//   isArchived: boolean
// ) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.put(
//       `admin/updateQtrArchiveStatus/${quarterId}`,
//       {
//         isArchived,
//       }
//     );
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to update quarter archive status"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const getChaptersByQuarter = async (
//   courseId: string,
//   quarterId: string
// ) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/chapter/${courseId}/${quarterId}`);
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       // Handle 404 or "No chapters found" case gracefully
//       if (
//         error.response.status === 404 ||
//         error.response.data?.message === "No chapters found for this quarter"
//       ) {
//         return {
//           chapters: [],
//           message: "No chapters found for this quarter",
//         };
//       }
//       throw new Error(
//         error.response.data.message || "Failed to fetch chapters for quarter"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
// export const getChaptersForCourses = async (courseId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/chapter/chapterofCourse/${courseId}`);
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       // Handle 404 or "No chapters found" case gracefully
//       if (
//         error.response.status === 404 ||
//         error.response.data?.message === "No chapters found for this course"
//       ) {
//         return {
//           chapters: [],
//           message: "No chapters found for this course",
//         };
//       }
//       throw new Error(
//         error.response.data.message || "Failed to fetch chapters for course"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const getAssessmentsByLesson = async (lessonId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/assessment/lesson/${lessonId}`);
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       console.error(
//         `Error fetching assessments for lesson ${lessonId}:`,
//         error.response.data
//       );
//       throw new Error(
//         error.response.data.message || "Failed to fetch assessments"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server when fetching assessments. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request for fetching assessments");
//     }
//   }
// };
// export const getAllAssessmentForStudent = async () => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/assessment/getAllassessmentforStudent`);
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to fetch all assessments"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server when fetching all assessments. Please check your internet connection."
//       );
//     } else {
//       throw new Error(
//         "Error setting up the request for fetching all assessments"
//       );
//     }
//   }
// };
//
// export const getStudentEnrolledCourseDetails = async (enrollmentId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(
//       `/enrollment/studentCourseDetails/${enrollmentId}`
//     );
//     // Return only the enrolledCourse object for easier consumption
//     return response.data?.enrolledCourse || null;
//   } catch (error: any) {
//     console.error(
//       "Error fetching enrolled course details:",
//       error.response?.data
//     );
//     if (error.response) {
//       // The request was made and the server responded with a status code
//       // that falls out of the range of 2xx
//       console.error(
//         "Error fetching enrolled course details:",
//         error.response.data
//       );
//       throw new Error(
//         error.response.data.message || "Failed to fetch enrolled course details"
//       );
//     } else if (error.request) {
//       // The request was made but no response was received
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       // Something happened in setting up the request that triggered an Error
//       throw new Error("Error: " + error.message);
//     }
//   }
// };
//
// export const getEnrollStatus = async (enrollmentId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(`/enrollment/isEnrolled/${enrollmentId}`);
//     return response.data?.enrolled || null;
//   } catch (error: any) {
//     console.error("Error fetching enrolled status:", error.response?.data);
//     if (error.response) {
//       console.error("Error fetching enrolled status:", error.response.data);
//       throw new Error(
//         error.response.data.message || "Failed to fetch enrolled status"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error: " + error.message);
//     }
//   }
// };
//
// export const unenrollFromCourse = async (
//   enrollmentId: string,
//   courseId: string
// ) => {
//   try {
//     const api = await getApiInstance();
//     console.log("/enrollment/unenroll/", enrollmentId);
//     const response = await api.delete(`/enrollment/unenroll/${courseId}`);
//     console.log(response);
//     return response.data;
//   } catch (error: any) {
//     console.error("Unenroll from course error:", error);
//     if (error.response) {
//       console.error("Server response:", error.response.data);
//       throw new Error(
//         error.response.data.message || "Failed to unenroll from course"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Failed to unenroll from course");
//     }
//   }
// };
//
// export const editCourseBasics = async (
//   courseId: string,
//   data: {
//     courseTitle: string;
//     category: string;
//     subcategory: string;
//     price: string;
//     language: string;
//     courseDescription: string;
//     teachingPoints: string;
//     requirements: string;
//   }
// ) => {
//   try {
//     const api = await getApiInstance();
//     console.log(data);
//     const response = await api.put(
//       `/course/editCourseBasics/${courseId}`,
//       data
//     );
//     console.log("this is my response", response);
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(error.response.data.message || "Failed to update course");
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const updateCourseThumbnail = async (
//   courseId: string,
//   thumbnail: any
// ) => {
//   try {
//     const api = await getApiInstance();
//
//     const formData = new FormData();
//     formData.append("thumbnail", {
//       uri: thumbnail.uri,
//       type: thumbnail.type || "image/jpeg",
//       name:
//         thumbnail.fileName || thumbnail.uri.split("/").pop() || "thumbnail.jpg",
//     } as any);
//
//     const response = await api.put(`/course/thumbnail/${courseId}`, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//
//     return response.data;
//   } catch (error: any) {
//     console.error("Update thumbnail error:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to update thumbnail"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// // Get individual submission details
// export const getSubmissionDetails = async (submissionId: string) => {
//   try {
//     const baseUrl = await getStoredBaseUrl();
//     if (!baseUrl) {
//       throw new Error("No base URL configured. Please select a school first.");
//     }
//
//     const response = await axios.get(
//       `${baseUrl}/assessmentSubmission/submission/${submissionId}`,
//       {
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         timeout: 10000,
//       }
//     );
//
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching submission details:", error);
//     if (error.response) {
//       throw new Error(
//         `Server error: ${
//           error.response.data?.message || error.response.statusText
//         }`
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const submitGrades = async (
//   submissionId: string,
//   grades: { [answerId: string]: { awardedPoints: number; maxPoints: number } }
// ) => {
//   try {
//     const api = await getApiInstance();
//     console.log("Submitting grades for submission:", submissionId);
//     const response = await api.put(
//       `/assessmentSubmission/teacherGrading/${submissionId}`,
//       grades
//     );
//     console.log("Grades submitted response:", response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("Submit grades error:", error);
//     if (error.response) {
//       throw new Error(error.response.data.message || "Failed to submit grades");
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const getChapterDetailsWithLessons = async (chapterId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.get(
//       `/chapter/chapter/chapter&lessons/${chapterId}`
//     );
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching chapter details with lessons:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to fetch chapter details"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const editChapter = async (
//   chapterId: string,
//   title: string,
//   description: string
// ) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.put(`/chapter/edit/${chapterId}`, {
//       title,
//       description,
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error("Error editing chapter:", error);
//     if (error.response) {
//       throw new Error(error.response.data.message || "Failed to edit chapter");
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const editLesson = async (
//   lessonId: string,
//   title: string,
//   description: string,
//   youtubeLinks: string,
//   otherLink: string
// ) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.put(`/lesson/edit/${lessonId}`, {
//       title,
//       description,
//       youtubeLinks,
//       otherLink,
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error("Error editing lesson:", error);
//     if (error.response) {
//       throw new Error(error.response.data.message || "Failed to edit lesson");
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const addMoreFilesToLesson = async (
//   lessonId: string,
//   pdfFiles: any[]
// ) => {
//   try {
//     const api = await getApiInstance();
//     const formData = new FormData();
//     pdfFiles.forEach((file) => {
//       formData.append("pdfFiles", {
//         uri: file.uri,
//         type: file.type || "application/pdf",
//         name: file.fileName || file.uri.split("/").pop() || "file.pdf",
//       } as any);
//     });
//     console.log(formData);
//     const response = await api.put(
//       `/lesson/addMoreFiles/${lessonId}`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );
//     return response.data;
//   } catch (error: any) {
//     console.error("Error adding files to lesson:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to add files to lesson"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
//
// export const deleteLessonFile = async (lessonId: string, fileId: string) => {
//   try {
//     const api = await getApiInstance();
//     const response = await api.delete(`/lesson/delete/${lessonId}/${fileId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error deleting lesson file:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data.message || "Failed to delete lesson file"
//       );
//     } else if (error.request) {
//       throw new Error(
//         "No response from server. Please check your internet connection."
//       );
//     } else {
//       throw new Error("Error setting up the request");
//     }
//   }
// };
// export const getStudentPages = async (studentId: string) => {
//   try {
//     const api = await getApiInstance();
//     const res = await api.get(`/pages/studentpages`, {
//       params: { studentId },
//     });
//     // API returns { pages: [...] }
//     return res.data?.pages || [];
//   } catch (error: any) {
//     console.error(
//       "[v0] getStudentPages error:",
//       error?.response?.data || error?.message
//     );
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch student pages"
//     );
//   }
// };
//
// export const getStudentCourses = async () => {
//   try {
//     const api = await getApiInstance();
//     const res = await api.get(`/enrollment/studentCourses`);
//     // API returns { enrolledCourses: [{ _id, course: { _id, courseTitle }}, ...] }
//     return res.data?.enrolledCourses || [];
//   } catch (error: any) {
//     console.error(
//       "[v0] getStudentCourses error:",
//       error?.response?.data || error?.message
//     );
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch student courses"
//     );
//   }
// };
// export const getGradeScale = async (courseId: string) => {
//   try {
//     const api = await getApiInstance();
//     const res = await api.get(`/gradebook/getGradingScale/${courseId}`);
//     // API returns { enrolledCourses: [{ _id, course: { _id, courseTitle }}, ...] }
//     return res.data?.scale || [];
//   } catch (error: any) {
//     console.error("Gradescale error:", error?.response?.data || error?.message);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch grade scale"
//     );
//   }
// };
// export const getGPA = async (courseId: string) => {
//   try {
//     const api = await getApiInstance();
//     const res = await api.get(`/gpa/get/${courseId}`);
//     // API returns { enrolledCourses: [{ _id, course: { _id, courseTitle }}, ...] }
//     return res.data?.grade || [];
//   } catch (error: any) {
//     console.error("Gradescale error:", error?.response?.data || error?.message);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch grade scale"
//     );
//   }
// };
// export const gradingScale = async (courseId: string, data: any) => {
//   try {
//     const api = await getApiInstance();
//     const res = await api.post(`/gradebook/gradingScale/${courseId}`, {
//       scale: data,
//     });
//     // API returns { enrolledCourses: [{ _id, course: { _id, courseTitle }}, ...] }
//     return res.data?.scale || [];
//   } catch (error: any) {
//     console.error("Gradescale error:", error?.response?.data || error?.message);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch grade scale"
//     );
//   }
// };
// export const gpaScale = async (courseId: string, data: any) => {
//   try {
//     const api = await getApiInstance();
//     const gpaData = data.map((elem: any) => {
//       return {
//         gpa: elem.gpa,
//         minPercentage: elem.minPercentage,
//         maxPercentage: elem.maxPercentage,
//       };
//     });
//     console.log(gpaData);
//     const res = await api.post(`/gpa/setGPAscale/${courseId}`, {
//       gpaScale: gpaData,
//     });
//     return res.data?.scale || [];
//   } catch (error: any) {
//     console.error("Gradescale error:", error?.response?.data || error?.message);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch grade scale"
//     );
//   }
// };
