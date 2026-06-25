import { getApiInstance } from "./apiInstance";

// const createApiInstance = async () => {
//   const baseUrl = await getStoredBaseUrl();
//   if (!baseUrl) {
//     throw new Error('No base URL configured. Please select a school first.');
//   }
//   const instance = axios.create({
//     baseURL: `${baseUrl}/api`,
//     headers: { 'Content-Type': 'application/json' },
//   });

//   instance.interceptors.request.use(
//     async (config) => {
//       const token = await AsyncStorage.getItem('token');
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//       return config;
//     },
//     (error) => {
//       return Promise.reject(error);
//     }
//   );
//   return instance;
// };

// Add a helper for consistent error handling
const handleApiError = (error: any, defaultMessage: string) => {
  console.error(`${defaultMessage}:`, error);
  if (error.response) {
    throw new Error(error.response.data.message || defaultMessage);
  } else if (error.request) {
    throw new Error(
      "No response from server. Please check your internet connection."
    );
  } else {
    throw new Error(`Error setting up the request: ${error.message}`);
  }
};

export const getMessages = async (conversationId: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/messeges/get/${conversationId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch messages");
  }
};

export const getConversations = async () => {
  try {
    const api = await getApiInstance();
    const response = await api.get("/conversation/get");
    // console.log(response)
    return response.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch conversations");
  }
};

export const sendMessage = async (conversationId: string, text: string) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/messeges/create/${conversationId}`, {
      text,
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "Failed to send message");
  }
};
