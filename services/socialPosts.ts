import { createApiInstance, addAuthInterceptor } from './course';



//------------- create post ----------------------------
//  Add postType parameter
export const createSocialPost = async (text: string, assets?: any[]) => {
  console.log('Creating post with text:', text, assets);
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);

    const formData = new FormData();
    formData.append('text', text);  // ← was 'content'

    // ── Supports multiple assets (images or videos) ──
    if (assets && assets.length > 0) {
      assets.forEach((asset) => {
        formData.append('assets', {   // ← was 'image'
          uri:  asset.uri,
          type: asset.type  || 'image/jpeg',
          name: asset.name  || asset.fileName || `asset_${Date.now()}`,
        } as any);
      });
    }

    console.log('FormData prepared:', formData);
    const response = await api.post('/api/posts/ ', formData, {
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
}


//------------- fetch posts --------------------------------
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


  //------------- fetch posts --------------------------------

export const likePost = async (postId: string) => {
  console.log("postId:",postId)
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.post(`/api/postlike/like/${postId}`);
    console.log(`Post ${postId} like response:`, response.data);
    return response.data;
  } catch (error: any) {
    if (error.response) throw new Error(error.response.data.message || 'Failed to like post');
    else if (error.request) throw new Error('No response from server.');
    else throw new Error('Error setting up the request');
  }
};


//-------------------------check if post is liked ----------------------------------------
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
//-------------------------add comment to post ----------------------------------------
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


  //-------------------------get comments for a post ----------------------------------------
export const getPostComments = async (postId: string) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.get(`/api/postComment/getPostComment/${postId}`);
    console.log(`Comments for post ${postId}:`, response.data);
    return response.data; // { comments: [] }
  } catch (error: any) {
    if (error.response) throw new Error(error.response.data.message || 'Failed to fetch comments');
    else if (error.request) throw new Error('No response from server.');
    else throw new Error('Error setting up the request');
  }
};



// ── get comment count --------------- ──
export const getLikeCount = async (postId: string) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.get(`/api/postlike/isPostLiked/${postId}`);
    console.log(`Like count for post ${postId}:`, response.data);
    return response.data; // { totalLikes, userReaction }
  } catch {
    return { totalLikes: 0, userReaction: null };
  }
};


//-------------- get comment count ---------------
export const getCommentCount = async (postId: string) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.get(`/api/postComment/getPostComment/${postId}`);
    console.log(`Comment count for post ${postId}:`, response.data);
    return response.data; // { comments: [], totalComments: 1 }
  } catch {
    return { totalComments: 0, comments: [] };
  }
};

//----------------- get specific user posts --------------
export const getUserPosts = async (userId: string) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.get(`/api/posts/specificUserPosts/${userId}`);
    console.log(`Usersssssss ${userId} posts:`, response.data);
    return response.data;
  } catch (error: any) {
    if (error.response) throw new Error(error.response.data.message || 'Failed to fetch user posts');
    else if (error.request) throw new Error('No response from server.');
    else throw new Error('Error setting up the request');
  }
};


//----------------- delete post --------------
export const deletePost = async (postId: string) => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.delete(`/api/posts/deletePost/${postId}`);
    console.log(`Post ${postId} deleted:`, response.data);
    return response.data;
  } catch (error: any) {
    if (error.response) throw new Error(error.response.data.message || 'Failed to delete post');
    else if (error.request) throw new Error('No response from server.');
    else throw new Error('Error setting up the request');
  }
};
