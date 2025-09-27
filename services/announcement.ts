import axios from 'axios';
import { getStoredBaseUrl, getStoredUserData } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        console.error('Error getting token:', error);
        return config;
      }
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );
  return api;
};

export const createAnnouncement = async ({ title, courseId, message }: { title: string; courseId: string; message: string }) => {
  try {
    const api = await createApiInstance();
    console.log('Base URL:', api.defaults.baseURL);
    console.log('Full URL:', api.defaults.baseURL + '/api/announcements/createannouncement');
    const user = await getStoredUserData();
    const teacherId = user?.user?._id;
    if (!teacherId) throw new Error('No teacher ID found');
    const payload = { title, courseId, message, teacherId };
    const response = await api.post('/api/announcements/createannouncement', payload);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create announcement');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

export const getAnnouncementsByTeacher = async () => {
  try {
    const api = await createApiInstance();
    const user = await getStoredUserData();
    console.log(user)
    const teacherId = user?.user?._id;
    console.log(teacherId);
    if (!teacherId) throw new Error('No teacher ID found');
    console.log('Base URL:', api.defaults.baseURL);
    console.log('Full URL:', api.defaults.baseURL + `/api/announcements/getbyteacher/${teacherId}`);
    const response = await api.get(`/api/announcements/getbyteacher/${teacherId}`);
    return response.data;
  } catch (error: any) {
    console.log(error)
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch announcements');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

export const deleteAnnouncement = async (announcementId: string) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.delete(`/api/announcements/${announcementId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to delete announcement');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

export const getAnnouncementsByStudent = async (studentId: string) => {
  try {
    const api = await createApiInstance();
    const response = await api.get(`/api/announcements/getbystudent/${studentId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch student announcements');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
}; 