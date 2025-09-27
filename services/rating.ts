import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredBaseUrl } from '../utils/storage';

const createApiInstance = async () => {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error('No base URL configured. Please select a school first.');
  }
  const instance = axios.create({
    baseURL: `${baseUrl}/api`,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  return instance;
};

export const isCourseRated = async (courseId: string) => {
  const api = await createApiInstance();
  const response = await api.get(`/rating/isRated/${courseId}`);
  return response.data;
};

export const getCourseRating = async (courseId: string) => {
  const api = await createApiInstance();
  const response = await api.get(`/rating/course/${courseId}`);
  return response.data;
};

export const createRating = async (courseId: string, star: number) => {
  const api = await createApiInstance();
  const response = await api.post(`/rating/create/${courseId}`, { star });
  return response.data;
};
