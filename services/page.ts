import { createApiInstance, addAuthInterceptor } from './course';

export const getPagesForChapter = async (courseId: string, chapterId: string) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.get(`/api/pages/${courseId}/chapter/${chapterId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch pages');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

export const createPageForChapter = async (
  courseId: string,
  chapterId: string,
  {
    title,
    description,
    image,
    files,
  }: { title: string; description: string; image?: any | null; files?: any[] }
) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);

    if (image && image.uri) {
      formData.append('image', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || image.uri.split('/').pop() || 'image.jpg',
      } as any);
    }

    if (Array.isArray(files)) {
      files.forEach((f) => {
        formData.append('files', {
          uri: f.uri,
          type: f.type || 'application/pdf',
          name: f.name || f.fileName || f.uri.split('/').pop() || 'file.pdf',
        } as any);
      });
    }

    const response = await api.post(`/api/pages/createpage/${courseId}/chapter/${chapterId}`,(formData as any),{
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create page');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

export const deletePage = async (pageId: string) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.delete(`/api/pages/deletepage/${pageId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to delete page');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

// Lesson-specific page functions
export const getPagesForLesson = async (courseId: string, lessonId: string) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.get(`/api/pages/${courseId}/lesson/${lessonId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch pages');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

export const createPageForLesson = async (
  courseId: string,
  lessonId: string,
  {
    title,
    description,
    image,
    files,
  }: { title: string; description: string; image?: any | null; files?: any[] }
) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);

    if (image && image.uri) {
      formData.append('image', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || image.uri.split('/').pop() || 'image.jpg',
      } as any);
    }

    if (Array.isArray(files)) {
      files.forEach((f) => {
        formData.append('files', {
          uri: f.uri,
          type: f.type || 'application/pdf',
          name: f.name || f.fileName || f.uri.split('/').pop() || 'file.pdf',
        } as any);
      });
    }

    const response = await api.post(`/api/pages/createpage/${courseId}/lesson/${lessonId}`, (formData as any), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create page');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};


