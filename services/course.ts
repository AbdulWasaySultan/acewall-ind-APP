// // courseApi.ts

// import axios from "axios";
// import { getStoredBaseUrl } from "../utils/storage";
// import { getApiInstance } from "../services/apiInstance";

// // Types
// interface CourseResponse {
//   success: boolean;
//   data: any[];
//   message?: string;
// }

// interface CourseData {
//   title: string;
//   description: string;
//   price: number;
//   semester: string[];
//   quarter: string[];
//   syllabus?: File | null;
//   category?: string;
//   subcategory?: string;
//   [key: string]: any;
// }

// // ============================================
// // 1. GET ALL PUBLISHED COURSES (FIXED)
// // ============================================
// export const getPublishedCourses = async (search?: string) => {
//   try {
//     const api = await getApiInstance();
//     console.log("📊 Fetching courses with search:", search);

//     // ✅ FIXED: Only one ? in the URL
//     const baseUrl = `/course/getindividualcourse?published=true&isVerified=approved`;
//     const url = search
//       ? `${baseUrl}&search=${encodeURIComponent(search)}`
//       : baseUrl;

//     console.log("🔗 Full URL:", url);
//     const response = await api.get<CourseResponse>(url);
//     return response.data;
//   } catch (error: any) {
//     console.error("❌ Error fetching courses:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data?.message || "Failed to fetch courses"
//       );
//     } else if (error.request) {
//       throw new Error("No response from server. Please check your connection.");
//     } else {
//       throw new Error("Failed to fetch courses");
//     }
//   }
// };

// // ============================================
// // 2. GET COURSES BY SUBCATEGORY (FIXED)
// // ============================================
// export const getCoursesBySubcategory = async (
//   subcategoryId: string,
//   search?: string
// ) => {
//   try {
//     const api = await getApiInstance();
//     // ✅ FIXED: Only one declaration and clean URL construction
//     const url = `/course/${subcategoryId}${
//       search ? `?search=${encodeURIComponent(search)}` : ""
//     }`;
//     console.log("📊 Fetching courses by subcategory:", url);
//     const response = await api.get(url);
//     return response.data;
//   } catch (error: any) {
//     console.error("❌ Error fetching courses by subcategory:", error);
//     if (error.response) {
//       throw new Error(
//         `Server error: ${
//           error.response.data?.message || error.response.statusText
//         }`
//       );
//     } else if (error.request) {
//       throw new Error("No response from server. Please check your connection.");
//     } else {
//       throw new Error("Failed to fetch courses by subcategory");
//     }
//   }
// };

// // ============================================
// // 3. GET COURSES BY CATEGORY (FIXED)
// // ============================================
// export const getCoursesByCategory = async (
//   categoryId: string,
//   search?: string
// ) => {
//   try {
//     const api = await getApiInstance();
//     // ✅ FIXED: Only one declaration and clean URL construction
//     const url = `/course/category/${categoryId}${
//       search ? `?search=${encodeURIComponent(search)}` : ""
//     }`;
//     console.log("📊 Fetching courses by category:", url);
//     const response = await api.get(url);
//     return response.data;
//   } catch (error: any) {
//     console.error("❌ Error fetching courses by category:", error);
//     if (error.response) {
//       throw new Error(
//         `Server error: ${
//           error.response.data?.message || error.response.statusText
//         }`
//       );
//     } else if (error.request) {
//       throw new Error("No response from server. Please check your connection.");
//     } else {
//       throw new Error("Failed to fetch courses by category");
//     }
//   }
// };

// // ============================================
// // 4. GET ASSESSMENT SUBMISSIONS (FIXED)
// // ============================================
// export const getAssessmentSubmissions = async (assessmentId: string) => {
//   try {
//     const api = await getApiInstance();
//     console.log(
//       "📊 Fetching assessment submissions for teacher from: /assessmentSubmission/submission_for_Teacher/" +
//         assessmentId
//     );
//     const response = await api.get(
//       `/assessmentSubmission/submission_for_Teacher/${assessmentId}`
//     );
//     return response.data;
//   } catch (error: any) {
//     console.error("❌ Error fetching submission details:", error);
//     if (error.response) {
//       throw new Error(
//         `Server error: ${
//           error.response.data?.message || error.response.statusText
//         }`
//       );
//     } else if (error.request) {
//       throw new Error("No response from server. Please check your connection.");
//     } else {
//       throw new Error("Failed to fetch submission details");
//     }
//   }
// };

// // ============================================
// // 5. CREATE COURSE (FIXED FORM DATA)
// // ============================================
// export const createCourse = async (courseData: CourseData) => {
//   try {
//     const api = await getApiInstance();
//     const formData = new FormData();

//     // Append all course data to FormData
//     Object.keys(courseData).forEach((key) => {
//       if (key === "syllabus") {
//         // ✅ FIXED: Append file directly, not as object
//         if (courseData.syllabus) {
//           formData.append("syllabus", courseData.syllabus);
//         }
//       } else if (courseData[key] !== null && courseData[key] !== undefined) {
//         // Handle arrays and objects
//         if (Array.isArray(courseData[key])) {
//           formData.append(key, JSON.stringify(courseData[key]));
//         } else if (typeof courseData[key] === "object") {
//           formData.append(key, JSON.stringify(courseData[key]));
//         } else {
//           formData.append(key, String(courseData[key]));
//         }
//       }
//     });

//     // Log FormData contents for debugging
//     console.log("📤 Sending FormData:");
//     for (let [key, value] of formData.entries()) {
//       console.log(
//         `  ${key}:`,
//         value instanceof File ? `File: ${value.name}` : value
//       );
//     }

//     const response = await api.post("/course/create", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     return response.data;
//   } catch (error: any) {
//     console.error("❌ Error creating course:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data?.message || "Failed to create course"
//       );
//     } else if (error.request) {
//       throw new Error("No response from server. Please check your connection.");
//     } else {
//       throw new Error("Failed to create course");
//     }
//   }
// };

// // ============================================
// // 6. UPDATE COURSE (FIXED)
// // ============================================
// export const updateCourse = async (
//   courseId: string,
//   courseData: Partial<CourseData>
// ) => {
//   try {
//     const api = await getApiInstance();
//     const formData = new FormData();

//     // Append all course data to FormData
//     Object.keys(courseData).forEach((key) => {
//       if (key === "syllabus") {
//         // ✅ FIXED: Append file directly
//         if (courseData.syllabus) {
//           formData.append("syllabus", courseData.syllabus);
//         }
//       } else if (courseData[key] !== null && courseData[key] !== undefined) {
//         if (Array.isArray(courseData[key])) {
//           formData.append(key, JSON.stringify(courseData[key]));
//         } else if (typeof courseData[key] === "object") {
//           formData.append(key, JSON.stringify(courseData[key]));
//         } else {
//           formData.append(key, String(courseData[key]));
//         }
//       }
//     });

//     console.log("📤 Updating course:", courseId);
//     const response = await api.put(`/course/${courseId}`, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     return response.data;
//   } catch (error: any) {
//     console.error("❌ Error updating course:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data?.message || "Failed to update course"
//       );
//     } else if (error.request) {
//       throw new Error("No response from server. Please check your connection.");
//     } else {
//       throw new Error("Failed to update course");
//     }
//   }
// };

// // ============================================
// // 7. DELETE COURSE
// // ============================================
// export const deleteCourse = async (courseId: string) => {
//   try {
//     const api = await getApiInstance();
//     console.log("🗑️ Deleting course:", courseId);
//     const response = await api.delete(`/course/${courseId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("❌ Error deleting course:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data?.message || "Failed to delete course"
//       );
//     } else if (error.request) {
//       throw new Error("No response from server. Please check your connection.");
//     } else {
//       throw new Error("Failed to delete course");
//     }
//   }
// };

// // ============================================
// // 8. UPDATE SEMESTER ARCHIVE STATUS (FIXED)
// // ============================================
// export const updateSemesterArchiveStatus = async (
//   semesterId: string,
//   isArchived: boolean
// ) => {
//   try {
//     const api = await getApiInstance();
//     console.log(
//       `📊 Updating semester ${semesterId} archive status to:`,
//       isArchived
//     );
//     const response = await api.patch(`/semester/${semesterId}/archive`, {
//       isArchived,
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error("❌ Error updating semester archive status:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data?.message ||
//           "Failed to update semester archive status"
//       );
//     } else if (error.request) {
//       throw new Error("No response from server. Please check your connection.");
//     } else {
//       throw new Error("Failed to update semester archive status");
//     }
//   }
// };

// // ============================================
// // 9. GET SINGLE COURSE DETAILS
// // ============================================
// export const getCourseDetails = async (courseId: string) => {
//   try {
//     const api = await getApiInstance();
//     console.log("📊 Fetching course details for:", courseId);
//     const response = await api.get(`/course/${courseId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("❌ Error fetching course details:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data?.message || "Failed to fetch course details"
//       );
//     } else if (error.request) {
//       throw new Error("No response from server. Please check your connection.");
//     } else {
//       throw new Error("Failed to fetch course details");
//     }
//   }
// };

// // ============================================
// // 10. GET COURSE ENROLLMENTS
// // ============================================
// export const getCourseEnrollments = async (courseId: string) => {
//   try {
//     const api = await getApiInstance();
//     console.log("📊 Fetching enrollments for course:", courseId);
//     const response = await api.get(`/course/${courseId}/enrollments`);
//     return response.data;
//   } catch (error: any) {
//     console.error("❌ Error fetching course enrollments:", error);
//     if (error.response) {
//       throw new Error(
//         error.response.data?.message || "Failed to fetch course enrollments"
//       );
//     } else if (error.request) {
//       throw new Error("No response from server. Please check your connection.");
//     } else {
//       throw new Error("Failed to fetch course enrollments");
//     }
//   }
// };

// // ============================================
// // EXPORT ALL FUNCTIONS
// // ============================================
// export default {
//   getPublishedCourses,
//   getCoursesBySubcategory,
//   getCoursesByCategory,
//   getAssessmentSubmissions,
//   createCourse,
//   updateCourse,
//   deleteCourse,
//   updateSemesterArchiveStatus,
//   getCourseDetails,
//   getCourseEnrollments,
// };

// services/course.ts

import axios from "axios";
import { getStoredBaseUrl } from "../utils/storage";
import { getApiInstance } from "./apiInstance";

// ============================================
// 1. CREATE COURSE
// ============================================
export const createCourse = async (courseData: any) => {
  try {
    const api = await getApiInstance();
    const formData = new FormData();

    // Append all fields to FormData
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

    const response = await api.post("/course/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error creating course:", error);
    throw error;
  }
};

// ============================================
// 2. GET CATEGORIES
// ============================================
export const getCategories = async () => {
  try {
    const api = await getApiInstance();
    const response = await api.get("/category");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    throw error;
  }
};

// ============================================
// 3. GET SUBCATEGORIES
// ============================================
export const getSubcategories = async (categoryId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/subcategory/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching subcategories:", error);
    throw error;
  }
};

// ============================================
// 4. GET SEMESTERS
// ============================================
export const getSemesters = async () => {
  try {
    const api = await getApiInstance();
    const response = await api.get("/semester");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching semesters:", error);
    throw error;
  }
};

// ============================================
// 5. GET QUARTERS BY SEMESTERS
// ============================================
export const getQuartersBySemesters = async (semesterIds: string[]) => {
  try {
    const api = await getApiInstance();
    const response = await api.post("/quarter/by-semesters", { semesterIds });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching quarters:", error);
    throw error;
  }
};

// ============================================
// 6. GET ALL PUBLISHED COURSES (FIXED)
// ============================================
export const getPublishedCourses = async (search?: string) => {
  try {
    const api = await getApiInstance();
    console.log("📊 Fetching courses with search:", search);

    // ✅ FIXED: Only one ? in the URL
    const baseUrl = `/course/getindividualcourse?published=true&isVerified=approved`;
    const url = search
      ? `${baseUrl}&search=${encodeURIComponent(search)}`
      : baseUrl;

    console.log("🔗 Full URL:", url);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    throw error;
  }
};

// ============================================
// 7. GET COURSES BY SUBCATEGORY (FIXED)
// ============================================
export const getCoursesBySubcategory = async (
  subcategoryId: string,
  search?: string
) => {
  try {
    const api = await getApiInstance();
    // ✅ FIXED: Only one declaration and clean URL construction
    const url = `/course/${subcategoryId}${
      search ? `?search=${encodeURIComponent(search)}` : ""
    }`;
    console.log("📊 Fetching courses by subcategory:", url);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching courses by subcategory:", error);
    throw error;
  }
};

// ============================================
// 8. GET COURSES BY CATEGORY (FIXED)
// ============================================
export const getCoursesByCategory = async (
  categoryId: string,
  search?: string
) => {
  try {
    const api = await getApiInstance();
    // ✅ FIXED: Only one declaration and clean URL construction
    const url = `/course/category/${categoryId}${
      search ? `?search=${encodeURIComponent(search)}` : ""
    }`;
    console.log("📊 Fetching courses by category:", url);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching courses by category:", error);
    throw error;
  }
};

// ============================================
// 9. GET ASSESSMENT SUBMISSIONS (FIXED)
// ============================================
export const getAssessmentSubmissions = async (assessmentId: string) => {
  try {
    const api = await getApiInstance();
    console.log(
      "📊 Fetching assessment submissions for teacher from: /assessmentSubmission/submission_for_Teacher/" +
        assessmentId
    );
    const response = await api.get(
      `/assessmentSubmission/submission_for_Teacher/${assessmentId}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching submission details:", error);
    throw error;
  }
};

// ============================================
// 10. UPDATE SEMESTER ARCHIVE STATUS (FIXED)
// ============================================
export const updateSemesterArchiveStatus = async (
  semesterId: string,
  isArchived: boolean
) => {
  try {
    const api = await getApiInstance();
    console.log(
      `📊 Updating semester ${semesterId} archive status to:`,
      isArchived
    );
    const response = await api.patch(`/semester/${semesterId}/archive`, {
      isArchived,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error updating semester archive status:", error);
    throw error;
  }
};

// ============================================
// 11. GET SINGLE COURSE DETAILS
// ============================================
export const getCourseDetails = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    console.log("📊 Fetching course details for:", courseId);
    const response = await api.get(`/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching course details:", error);
    throw error;
  }
};

// ============================================
// 12. UPDATE COURSE
// ============================================
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

    console.log("📤 Updating course:", courseId);
    const response = await api.put(`/course/${courseId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error updating course:", error);
    throw error;
  }
};

// ============================================
// 13. DELETE COURSE
// ============================================
export const deleteCourse = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    console.log("🗑️ Deleting course:", courseId);
    const response = await api.delete(`/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    throw error;
  }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
export default {
  createCourse,
  getCategories,
  getSubcategories,
  getSemesters,
  getQuartersBySemesters,
  getPublishedCourses,
  getCoursesBySubcategory,
  getCoursesByCategory,
  getAssessmentSubmissions,
  updateSemesterArchiveStatus,
  getCourseDetails,
  updateCourse,
  deleteCourse,
};
