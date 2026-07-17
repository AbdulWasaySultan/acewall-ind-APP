import { getApiInstance } from "./apiInstance";

// Send a comment to a course
export const sendComment = async (courseId: string, comment: string) => {
  try {
    const api = await getApiInstance();
    // addAuthInterceptor(api);

    // ✅ Correct: No duplicate /api/
    const response = await api.post(`/api/comment/sendComment/${courseId}`, {
      text: comment,
    });
    return response.data;
  } catch (error: any) {
    console.log("Error sending comment:", error);
    throw new Error(error.response?.data?.message || "Failed to send comment");
  }
};

// Get all comments for a course
export const getComments = async (courseId: string) => {
  try {
    const api = await getApiInstance();
    // addAuthInterceptor(api);
    // ✅ Correct: No duplicate /api/
    const response = await api.get(`/api/comment/${courseId}`);
    return response.data;
  } catch (error: any) {
    console.log("Error fetching comments:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch comments"
    );
  }
};
