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

// Fetch gradebook for a specific course
export const getCourseGradebook = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/gradebook/course/${courseId}`);
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