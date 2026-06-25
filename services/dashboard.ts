import axios from "axios";
import { getStoredBaseUrl, getStoredUserId } from "../utils/storage";

// Types
export interface DashboardStats {
  courses: number;
  students: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export interface RecentSale {
  id: string;
  studentName: string;
  courseName: string;
  timestamp: string;
}

export interface CourseThumbnail {
  url: string;
  filename: string;
}

export interface PublishedCourse {
  thumbnail: CourseThumbnail;
  _id: string;
  courseTitle: string;
  category: string;
  courseDescription: string;
  createdAt: string;
}

export interface CourseStatsResponse {
  published: PublishedCourse[];
  unpublished: number;
  publishedCount: number;
  approved: number;
  pending: number;
  rejected: number;
  total: number;
  message: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

// Create axios instance for dashboard API
const createDashboardApiInstance = async () => {
  const baseUrl = await getStoredBaseUrl();
  console.log("Dashboard API Base URL:", baseUrl);
  if (!baseUrl) {
    throw new Error("No base URL configured. Please select a school first.");
  }
  const api = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  console.log("Created API instance with config:", {
    baseURL: baseUrl,
    timeout: 10000,
    headers: api.defaults.headers,
  });
  console.log("API instance:", api);

  // --- ADD TIMING INTERCEPTORS HERE ---
  api.interceptors.request.use((config) => {
    // Generate a unique label for this specific request path
    const label = `⏱️ Axios [${config.method?.toUpperCase()}] ${config.url}`;
    (config as any).metadata = { startTime: performance.now(), label };
    console.time(label);
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      const metadata = (response.config as any).metadata;
      if (metadata) {
        console.timeEnd(metadata.label);
      }
      return response;
    },
    (error) => {
      const metadata = (error.config as any).metadata;
      if (metadata) {
        console.timeEnd(metadata.label);
      }
      return Promise.reject(error);
    }
  );
  return api;
};

// API calls
export const dashboardService = {
  // Get teacher dashboard stats
  getTeacherStats: async (): Promise<DashboardStats> => {
    try {
      console.log("Fetching teacher stats...");
      const api = await createDashboardApiInstance();
      const userId = await getStoredUserId();
      if (!userId) {
        console.error("No user ID found. User might not be logged in.");
        return { courses: 0, students: 0 };
      }

      // Single network request hit
      const response = await api.get("/api/course/getallCoursesforTeacher");

      // Pluck both datasets directly out of the single payload response
      const teacher = response.data.courses || [];
      const students = response.data.students || [];

      // Transform the responses to match DashboardStats interface
      const stats: DashboardStats = {
        courses: teacher.length,
        students: students.length,
      };

      console.log("Dashboard stats:", stats);
      return stats;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching teacher stats:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        });
      }
      // Return zero stats instead of throwing error
      return { courses: 0, students: 0 };
    }
  },

  // Get recent activity
  getRecentActivity: async (): Promise<RecentActivity[]> => {
    try {
      const api = await createDashboardApiInstance();
      const userId = await getStoredUserId();

      if (!userId) {
        console.error("No user ID found. User might not be logged in.");
        return [];
      }

      // Get comments
      const commentsResponse = await api.get(
        `/api/comment/teacher/${userId}/comments`
      );
      const comments = commentsResponse.data.comments.map((comment: any) => ({
        id: comment._id,
        type: "comment",
        message: `${comment.createdby.firstName} ${comment.createdby.lastName} commented on ${comment.course.basics.courseTitle}`,
        timestamp: comment.createdAt,
      }));

      // Get announcements
      const announcementsResponse = await api.get(
        `/api/announcements/getbyteacher/${userId}`
      );
      const announcements = announcementsResponse.data.announcements.map(
        (announcement: any) => ({
          id: announcement._id,
          type: "announcement",
          message: `New announcement: ${announcement.title}`,
          timestamp: announcement.createdAt,
        })
      );

      // Get assessments
      const assessmentsResponse = await api.get(
        "/api/assessment/allAssessmentByTeacher"
      );
      const assessments = assessmentsResponse.data.map((assessment: any) => ({
        id: assessment._id,
        type: "assessment",
        message: `New assessment created: ${assessment.title}`,
        timestamp: assessment.createdAt,
      }));

      // Combine all activities and sort by timestamp
      const allActivities = [...comments, ...announcements, ...assessments]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 10); // Get only the 10 most recent activities

      return allActivities;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching recent activity:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
      }
      // Return empty array instead of throwing error to prevent UI from breaking
      return [];
    }
  },

  // Get recent sales
  getRecentSales: async (): Promise<RecentSale[]> => {
    try {
      const api = await createDashboardApiInstance();
      const userId = await getStoredUserId();

      if (!userId) {
        console.error("No user ID found. User might not be logged in.");
        return [];
      }

      // Get all courses created by the teacher
      const coursesResponse = await api.get(
        "/api/course/getallcoursesforteacher"
      );
      const teacherCourses = coursesResponse.data.courses;
      const courseIds = teacherCourses.map((course: any) => course._id);

      // Get all purchases for these courses
      const purchasesResponse = await api.get("/api/purchase/courses");
      const purchases = purchasesResponse.data.purchasedCourses.filter(
        (purchase: any) => courseIds.includes(purchase.course._id)
      );

      // Transform purchases into RecentSale format
      const recentSales = purchases.map((purchase: any) => ({
        id: purchase._id,
        studentName: `${purchase.student.firstName} ${purchase.student.lastName}`,
        courseName: purchase.course.courseTitle,
        timestamp: purchase.createdAt,
      }));

      // Sort by timestamp and get most recent
      return recentSales
        .sort(
          (a: RecentSale, b: RecentSale) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 10); // Get only the 10 most recent sales
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching recent sales:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
      }
      // Return empty array instead of throwing error to prevent UI from breaking
      return [];
    }
  },

  getStudentsCount: async (): Promise<number> => {
    try {
      console.log(
        "Fetching student count from /api/course/getallCoursesforTeacher..."
      );
      const api = await createDashboardApiInstance();
      const response = await api.get("/api/course/getallCoursesforTeacher");

      console.log("Students API response:", response.data);

      // Check if response has students array
      if (response.data && Array.isArray(response.data.students)) {
        const totalStudents = response.data.students.length;
        console.log("Total students fetched:", totalStudents);
        return totalStudents;
      }

      // Fallback: check if there's a totalCount field
      if (response.data && typeof response.data.totalCount === "number") {
        console.log(
          "Total students from totalCount:",
          response.data.totalCount
        );
        return response.data.totalCount;
      }

      console.log("No students found in response");
      return 0;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching student count:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
      }
      return 0; // Return 0 on error
    }
  },

  // Get recent courses
  getRecentCourses: async (): Promise<CourseStatsResponse | null> => {
    try {
      const api = await createDashboardApiInstance();
      console.log(
        "Calling API endpoint:",
        "/api/course/getTeacherCoursesForDesboard"
      );
      const response = await api.get(
        "/api/course/getTeacherCoursesForDesboard"
      );
      console.log("Recent courses response:", response.data);

      if (!response.data || typeof response.data !== "object") {
        console.log("No courses found in response or invalid format");
        return null;
      }

      return response.data as CourseStatsResponse;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching recent courses:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
      }
      return null; // Return empty array instead of throwing error
    }
  },

  // Get student announcements
  getStudentAnnouncements: async (): Promise<Announcement[]> => {
    try {
      const api = await createDashboardApiInstance();
      const studentId = await getStoredUserId();
      console.log("Student ID for announcements:", studentId);

      // if (!studentId) {
      //   console.error('No student ID found');
      //   return [];
      // }

      const response = await api.get(
        `/api/announcements/getbystudent/${studentId}`
      );
      console.log("Student announcements response:", response.data);

      // Response: { success: true, announcements: [] }
      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.announcements)
      ) {
        return response.data.announcements.map((a: any) => ({
          id: a._id || a.id || "",
          title: a.title || "",
          content: a.message || a.content || "",
          date: a.createdAt || a.date || "",
        }));
      }
      return [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching student announcements:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
      }
      return [];
    }
  },

  // Get student courses
  getStudentCourses: async (): Promise<any[]> => {
    try {
      const api = await createDashboardApiInstance();
      const response = await api.get("/api/enrollment/studentCourses");
      // Response: { message: 'Enrolled Courses', enrolledCourses: [] }
      if (response.data && Array.isArray(response.data.enrolledCourses)) {
        return response.data.enrolledCourses;
      }
      return [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching student courses:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
      }
      return [];
    }
  },
  fetchStaticRecentActivity: async (): Promise<any[]> => {
    try {
      const api = await createDashboardApiInstance();
      const response = await api.get("/api/comment/teacher/allComment");
      // Response: { message: 'Enrolled Courses', enrolledCourses: [] }
      if (
        response.data.recentComments &&
        Array.isArray(response.data.recentComments)
      ) {
        return response.data.recentComments;
      }
      return [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching student courses:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
      }
      return [];
    }
  },
};
