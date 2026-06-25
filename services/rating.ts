// ratingService.ts
import { getApiInstance } from './apiInstance';

// Shared error handler
const handleApiError = (error: any, defaultMessage: string) => {
  console.error(`${defaultMessage}:`, error);
  
  if (error.response) {
    throw new Error(error.response.data.message || defaultMessage);
  } else if (error.request) {
    throw new Error('No response from server. Please check your internet connection.');
  } else {
    throw new Error(`Error setting up the request: ${error.message}`);
  }
};

export const isCourseRated = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/rating/isRated/${courseId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to check if course is rated');
  }
};

export const getCourseRating = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/rating/course/${courseId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch course rating');
  }
};

export const createRating = async (courseId: string, star: number) => {
  try {
    // Validate input
    if (star < 1 || star > 5) {
      throw new Error('Rating must be between 1 and 5 stars');
    }
    
    const api = await getApiInstance();
    const response = await api.post(`/rating/create/${courseId}`, { star });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to create rating');
  }
};