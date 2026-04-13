import { createApiInstance, addAuthInterceptor } from './course';



//========== create post ==========================
export const createSocialPost = async (content: string, image?: any) => {
    console.log('Creating post with content:', content, image);
  try {
    const api = await createApiInstance();
    console.log(content, image);
    addAuthInterceptor(api);

    const formData = new FormData();
    formData.append('content', content);

    if (image) {
      formData.append('image', {
        uri:  image.uri,
        type: image.type  || 'image/jpeg',
        name: image.name  || image.fileName || `photo_${Date.now()}.jpg`,
      } as any);
    }

    const response = await api.post('/api/posts/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Post created:', response.data);

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create post');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};


//=========== fetch posts ==========================
export const fetchAllPosts = async (page = 1, limit = 10) => {
    try {
      const api = await createApiInstance();
      addAuthInterceptor(api);
      const response = await api.get(`/api/posts/getPosts?page=${page}&limit=${limit}`);
      console.log('Fetched posts:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response) throw new Error(error.response.data.message || 'Failed to fetch posts');
      else if (error.request) throw new Error('No response from server.');
      else throw new Error('Error setting up the request');
    }
  };

export const likePost = async (postId: string) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.post(`/api/postlike/like/${postId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) throw new Error(error.response.data.message || 'Failed to like post');
    else if (error.request) throw new Error('No response from server.');
    else throw new Error('Error setting up the request');
  }
};


//=========== check if post is liked ==========================
export const isPostLiked = async (postId: string) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.get(`/api/postlike/isPostLiked/${postId}`);
    console.log(`Post ${postId} like status:`, response.data);
    return response.data; // { isLiked: boolean }
  } catch (error: any) {
    if (error.response) throw new Error(error.response.data.message || 'Failed to check like status');
    else if (error.request) throw new Error('No response from server.');
    else throw new Error('Error setting up the request');
  }
};
//=========== add comment to post ==========================
export const addComment = async (postId: string, text: string) => {
    try {
      const api = await createApiInstance();
      addAuthInterceptor(api);
      const response = await api.post(`/api/postComment/sendComment/${postId}`, { text }); 
      console.log(`Comment added to post ${postId}:`, response.data);
      return response.data;
    } catch (error: any) {
      if (error.response) throw new Error(error.response.data.message || 'Failed to add comment');
      else if (error.request) throw new Error('No response from server.');
      else throw new Error('Error setting up the request');
    }
  };