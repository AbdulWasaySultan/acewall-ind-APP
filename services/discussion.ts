import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApiInstance, addAuthInterceptor } from './course';

export const getDiscussionsForChapter = async (chapterId: string) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.get(`/api/discussion/chapter/${chapterId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch discussions');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

export const getDiscussionsForLesson = async (lessonId: string) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.get(`/api/discussion/lesson/${lessonId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch discussions');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

export const getAssessmentCategoriesForCourse = async (courseId: string) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.get(`/api/assessmentCategory/${courseId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch categories');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

export const createDiscussionForChapter = async (payload: {
  course: string;
  topic: string;
  description: string;
  category: string;
  type: 'chapter';
  dueDate: { date: string; time: string; dateTime: string };
  totalMarks: number;
  semester?: string;
  quarter?: string;
  chapter: string;
  file?: any;
}) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const formData = new FormData();
    formData.append('course', payload.course);
    formData.append('topic', payload.topic);
    formData.append('description', payload.description);
    formData.append('category', payload.category);
    formData.append('type', payload.type);
    formData.append('dueDate', JSON.stringify(payload.dueDate));
    formData.append('totalMarks', String(payload.totalMarks));
    if (payload.semester) formData.append('semester', payload.semester);
    if (payload.quarter) formData.append('quarter', payload.quarter);
    formData.append('chapter', payload.chapter);
    if (payload.file) {
      formData.append('files', {
        uri: payload.file.uri,
        type: payload.file.type || 'application/octet-stream',
        name: payload.file.fileName || payload.file.name || payload.file.uri.split('/').pop() || 'file',
      } as any);
    }
    const response = await api.post('/api/discussion/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create discussion');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

export const createDiscussionForLesson = async (payload: {
  course: string;
  topic: string;
  description: string;
  category: string;
  type: 'lesson';
  dueDate: { date: string; time: string; dateTime: string };
  totalMarks: number;
  semester?: string;
  quarter?: string;
  lesson: string;
  file?: any;
}) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const formData = new FormData();
    formData.append('course', payload.course);
    formData.append('topic', payload.topic);
    formData.append('description', payload.description);
    formData.append('category', payload.category);
    formData.append('type', payload.type);
    formData.append('dueDate', JSON.stringify(payload.dueDate));
    formData.append('totalMarks', String(payload.totalMarks));
    if (payload.semester) formData.append('semester', payload.semester);
    if (payload.quarter) formData.append('quarter', payload.quarter);
    formData.append('lesson', payload.lesson);
    if (payload.file) {
      formData.append('files', {
        uri: payload.file.uri,
        type: payload.file.type || 'application/octet-stream',
        name: payload.file.fileName || payload.file.name || payload.file.uri.split('/').pop() || 'file',
      } as any);
    }
    const response = await api.post('/api/discussion/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create discussion');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

interface DiscussionData {
  courseId?: string | null;
  topic: string;
  description: string;
  type: 'course' | 'public';
  file?: any; // This will need to be handled carefully with react-native-document-picker or similar
}

export const createDiscussion = async (discussionData: DiscussionData) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);

    const formData = new FormData();
    formData.append('topic', discussionData.topic);
    formData.append('description', discussionData.description);
    formData.append('type', discussionData.type);
    if (discussionData.courseId) {
      formData.append('courseId', discussionData.courseId);
    }
    if (discussionData.file) {
      formData.append('files', {
        uri: discussionData.file.uri,
        type: discussionData.file.type || 'application/octet-stream',
        name: discussionData.file.fileName || discussionData.file.uri.split('/').pop() || 'file',
      } as any);
    }

    console.log('Sending discussion creation request:', formData);

    const response = await api.post('/api/discussion/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Discussion creation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating discussion:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      request: error.request,
      config: error.config,
    });
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create discussion');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error(`Error setting up the request: ${error.message}`);
    }
  }
};

export const getAllDiscussions = async () => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const user = await AsyncStorage.getItem('userData')

    const path = JSON.parse(user).user.role === "student" ? '/studentDiscussion' : '/all'
    console.log("Fetching all discussions from: /api/discussion/all");
    const response = await api.get(`/api/discussion/${path}`);
    console.log("All discussions response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get all discussions error:", error);
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to fetch discussions");
    } else if (error.request) {
      throw new Error("No response from server. Please check your internet connection.");
    } else {
      throw new Error("Error setting up the request");
    }
  }
};

export const getDiscussionDetails = async (discussionId: string) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.get(`/api/discussion/${discussionId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch discussion details');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

export const getDiscussionComments = async (discussionId: string, page = 1, limit = 5) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.get(`/api/discussionComment/get/${discussionId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch discussion comments');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

export const sendDiscussionComment = async (discussionId: string, text: string) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.post(`/api/discussionComment/sendComment/${discussionId}`, { text });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to send comment');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
}; 