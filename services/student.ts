import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredBaseUrl } from '../utils/storage';

// Types
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
  profileImg?: string | null;
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

// Create axios instance with default config
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

// Add request interceptor for authentication if needed
const addAuthInterceptor = (api: any) => {
  api.interceptors.request.use(
    async (config: any) => {
      try {
        // Get token from AsyncStorage
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

export const getAllStudentsWithCourses = async (): Promise<Student[]> => {
  const api = await createApiInstance();
  addAuthInterceptor(api);
  const response = await api.get('/api/course/getallCoursesforTeacher');
  return response.data.students;
};

export const getCourseGradebook = async (studentId: string, courseId: string): Promise<CourseGradebook> => {
  const api = await createApiInstance();
  addAuthInterceptor(api);
  const response = await api.get(`/api/gradebook/getGradebook/${studentId}/${courseId}`);
  return response.data;
}; 