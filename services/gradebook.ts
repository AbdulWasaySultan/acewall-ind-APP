import { getApiInstance } from "./apiInstance";

export const getOverallGradeReport = async () => {
  try {
    const api = await getApiInstance();
    const response = await api.get('/api/gradebook/getStudentGradebooksFormatted');
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch overall grade report');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

// Fetch a student's performance analytics for a specific course
export const getCourseAnalytics = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/gradebook/course-analytics/${courseId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch course analytics');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

export interface TeacherStudentAnalytics {
  studentId: string;
  courseName: string;
  summary: {
    currentPercentage: number;
    totalAssessments: number;
    pointsEarned: number;
    pointsPossible: number;
  };
  insights: {
    trendStatus: "increasing" | "decreasing";
    percentageChange: number;
    recentAverage: number;
    overallAverage: number;
    projectedFinalScore: number;
    sampleSize: number;
    weakestCategory: { name: string; average: number; gap: number } | null;
  } | null;
  charts: {
    lineChart: { name: string; score: number }[];
    categoryPerformance: { category: string; average: number; count: number }[];
  };
}

// Fetch a single student's per-course analytics drill-down (teacher view).
// Backend returns several fields as toFixed(1) strings — normalized to
// numbers here so downstream UI doesn't need to remember which is which.
export const getTeacherStudentAnalytics = async (
  courseId: string,
  studentId: string
): Promise<TeacherStudentAnalytics> => {
  try {
    const api = await getApiInstance();
    const response = await api.get(
      `/api/gradebook/getTeacherStudentAnalytics/${courseId}/${studentId}`
    );
    const data = response.data;

    const insights = data.insights
      ? {
          trendStatus: data.insights.trendStatus,
          percentageChange: parseFloat(data.insights.percentageChange) || 0,
          recentAverage: parseFloat(data.insights.recentAverage) || 0,
          overallAverage: parseFloat(data.insights.overallAverage) || 0,
          projectedFinalScore: parseFloat(data.insights.projectedFinalScore) || 0,
          sampleSize: data.insights.sampleSize ?? 0,
          weakestCategory: data.insights.weakestCategory
            ? {
                name: data.insights.weakestCategory.name,
                average: parseFloat(data.insights.weakestCategory.average) || 0,
                gap: parseFloat(data.insights.weakestCategory.gap) || 0,
              }
            : null,
        }
      : null;

    return {
      studentId: data.studentId,
      courseName: data.courseName,
      summary: {
        currentPercentage: parseFloat(data.summary?.currentPercentage) || 0,
        totalAssessments: data.summary?.totalAssessments ?? 0,
        pointsEarned: data.summary?.pointsEarned ?? 0,
        pointsPossible: data.summary?.pointsPossible ?? 0,
      },
      insights,
      charts: {
        lineChart: (data.charts?.lineChart || []).map((item: any) => ({
          name: item.name,
          score: parseFloat(item.score) || 0,
        })),
        categoryPerformance: data.charts?.categoryPerformance || [],
      },
    };
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch student analytics"
      );
    } else if (error.request) {
      throw new Error(
        "No response from server. Please check your internet connection."
      );
    } else {
      throw new Error("Error setting up the request");
    }
  }
};

// Fetch gradebook for a specific course
export const getCourseGradebook = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(
      `/api/gradebook/getGradebooksOfCourseFormatted/${courseId}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch course gradebook');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
}; 