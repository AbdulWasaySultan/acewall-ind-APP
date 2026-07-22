// gradebookService.ts
import { getApiInstance } from "./apiInstance";

// Types...
export interface Course {
  _id: string;
  courseTitle: string;
  description?: string;
  thumbnail?: { url: string };
  category?: string;
  subcategory?: string;
}

export interface Student {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  Bio?: string | null;
  profileImg?: { url?: string; filename?: string; publicId?: string } | null;
  gender?: string;
  email: string;
  createdAt: string;
  courses: Course[];
}

export interface DirectAssessment {
  assessmentId: string;
  assessmentTitle: string;
  categoryId: string;
  categoryName: string;
  maxPoints: number;
  studentPoints: number;
  isDiscussion: boolean;
}

export interface DirectAssessments {
  grade: number;
  letterGrade: string;
  assessments: DirectAssessment[];
}

export interface CourseGradebook {
  studentId: string;
  course: {
    _id: string;
    courseTitle: string;
    thumbnail?: { url: string; filename: string };
    courseDescription?: string;
  };
  courseName: string;
  grade: number;
  letterGrade: string;
  totalAssessments: number;
  page: number;
  limit: number;
  totalPages: number;
  directAssessments: DirectAssessments;
}

// Error handler
const handleApiError = (error: any, defaultMessage: string) => {
  console.error(`${defaultMessage}:`, error);

  if (error.response) {
    throw new Error(error.response.data?.message || defaultMessage);
  } else if (error.request) {
    throw new Error(
      "No response from server. Please check your internet connection."
    );
  } else {
    throw new Error(`Error: ${error.message}`);
  }
};

export const getAllStudentsWithCourses = async (): Promise<Student[]> => {
  try {
    const api = await getApiInstance(); // Interceptor already handles auth
    const response = await api.get("/api/course/getallCoursesforTeacher");

    // Validate response
    if (!response.data?.students) {
      throw new Error("Invalid response format");
    }

    return response.data.students;
  } catch (error) {
    handleApiError(error, "Failed to fetch students with courses");
    return []; // This line won't execute due to throw, but keeps TypeScript happy
  }
};

export const getCourseGradebook = async (
  studentId: string,
  courseId: string
): Promise<CourseGradebook> => {
  try {
    const api = await getApiInstance(); // Interceptor already handles auth
    const response = await api.get(
      `/api/gradebook/getGradebook/${studentId}/${courseId}`
    );

    // Validate response
    if (!response.data) {
      throw new Error("Invalid response format");
    }

    return response.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch course gradebook");
    throw error; // Re-throw for component-level handling
  }
};
