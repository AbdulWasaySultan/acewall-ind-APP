// ratingService.ts
import { getApiInstance } from './apiInstance';
import { ToastAndroid } from 'react-native';
import { parseApiError } from '../utils/apiError';

export const isCourseRated = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/rating/isRated/${courseId}`);
    return response.data;
  } catch (error) {
    throw parseApiError(error, 'Failed to check if course is rated');
  }
};

export const getCourseRating = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/rating/course/${courseId}`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || '';
    if (errorMessage.toLowerCase().includes('no ratings found')) {
      // Graceful fallback – no rating yet
      return { averageStar: 0, count: 0 };
    }
    // All other errors: throw a user-friendly message
    throw parseApiError(error, 'Failed to fetch course rating');
  }
};

export const createRating = async (courseId: string, star: number) => {
  try {
    // Validate input
    if (star < 1 || star > 5) {
      throw new Error('Rating must be between 1 and 5 stars');
    }
    
    const api = await getApiInstance();
    const response = await api.post(`/api/rating/create/${courseId}`, { star });
    return response.data;
  } catch (error) {
    throw parseApiError(error, 'Failed to create rating');
  }
};