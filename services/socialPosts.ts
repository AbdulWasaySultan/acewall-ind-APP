import { createApiInstance, addAuthInterceptor } from './course';



//------------- create post ----------------------------
//  Add postType parameter
export const createSocialPost = async (
  text: string,
  assets?: any[],
  postType: string = 'public',
  courseId?: string
) => {
  console.log('Creating post:', { text, assets, postType, courseId });
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);

    const formData = new FormData();
    formData.append('text', text);
    formData.append('postType', postType);

    if (postType === 'course' && courseId) {
      formData.append('courseId', courseId);
    }

    // ── Multiple assets — images AND videos ──
    if (assets && assets.length > 0) {
      assets.forEach((asset) => {

        //  Detect mime type from extension or use provided type
        const getMimeType = (asset: any): string => {
          if (asset.type) {
            // react-native-image-picker gives 'photo' or 'video' — convert to mime
            if (asset.type === 'video') return 'video/mp4';
            if (asset.type === 'photo') return 'image/jpeg';
            // already a proper mime type like 'image/jpeg' or 'video/mp4'
            if (asset.type.includes('/')) return asset.type;
          }
          // fallback — detect from file extension
          const name = asset.name || asset.fileName || asset.uri || '';
          const ext  = name.split('.').pop()?.toLowerCase();
          const mimeMap: Record<string, string> = {
            mp4:  'video/mp4',
            mov:  'video/quicktime',
            avi:  'video/x-msvideo',
            mkv:  'video/x-matroska',
            jpg:  'image/jpeg',
            jpeg: 'image/jpeg',
            png:  'image/png',
            gif:  'image/gif',
            webp: 'image/webp',
          };
          return mimeMap[ext ?? ''] ?? 'application/octet-stream';
        };

        const mimeType = getMimeType(asset);
        const fileName = asset.name
          || asset.fileName
          || `asset_${Date.now()}.${mimeType.split('/')[1]}`;

        formData.append('assets', {
          uri:  asset.uri,
          type: mimeType,   //  correct mime type for image or video
          name: fileName,
        } as any);

        console.log(`Asset appended: ${fileName} (${mimeType})`);
      });
    }

    console.log('FormData prepared:', formData);
    const response = await api.post('/api/posts/', formData, {
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
