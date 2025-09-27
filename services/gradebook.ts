import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredBaseUrl } from '../utils/storage';

const createApiInstance = async () => {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error('No base URL configured. Please select a school first.');
  }
  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
};

const addAuthInterceptor = (api: any) => {
  api.interceptors.request.use(
    async (config: any) => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      } catch (error) {
        return config;
      }
    },
    (error: any) => Promise.reject(error)
  );
  return api;
};

export const getOverallGradeReport = async () => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.get('/api/gradebook/getOverallGradeReport');
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
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.get(`/api/gradebook/course/${courseId}`);
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