import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredBaseUrl } from '../utils/storage';

const createApiInstance = async () => {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error('No base URL configured. Please select a school first.');
  }
  return axios.create({
    baseURL: baseUrl,
    timeout: 10000,
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

interface SupportData {
  fullName: string;
  email: string;
  feedback: string;
  // Additional fields that might be required
  subject?: string;
  message?: string;
  type?: string;
}

export const sendSupportMessage = async (supportData: SupportData) => {
  try {
    const baseUrl = await getStoredBaseUrl();
    if (!baseUrl) {
      throw new Error('No base URL configured. Please select a school first.');
    }

    console.log('Using base URL for support:', baseUrl);
    console.log('Sending support message:', supportData);

    // Prepare the data with additional fields that might be expected
    const requestData = {
      fullName: supportData.fullName,
      email: supportData.email,
      feedback: supportData.feedback,
      // Add additional fields that might be expected
      subject: `Support Request from ${supportData.fullName}`,
      message: supportData.feedback,
      type: 'support',
      timestamp: new Date().toISOString(),
    };

    console.log('Request data being sent:', requestData);

    // Try different possible endpoints for support
    const possibleEndpoints = [
      '/api/support/send',
      '/api/contact/send',
      '/api/help/send',
      '/api/feedback/send',
      '/api/message/send',
      '/api/contact',
      '/api/help',
      '/api/feedback'
    ];

    // Also try the original URL you mentioned
    const originalSupportUrl = 'https://api.acewallscholarslearningonline.com/api/support/send';

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        
        // Try with authentication first
        try {
          const api = await createApiInstance();
          addAuthInterceptor(api);
          
          const response = await api.post(endpoint, requestData);
          console.log(`Support message response (${endpoint} with auth):`, response.data);
          return response.data;
        } catch (authError: any) {
          console.log(`Auth attempt failed for ${endpoint}, trying without authentication...`);
          
          // Try without authentication
          const response = await axios.post(`${baseUrl}${endpoint}`, requestData, {
            timeout: 10000,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          });
          
          console.log(`Support message response (${endpoint} without auth):`, response.data);
          return response.data;
        }
      } catch (endpointError: any) {
        console.log(`Endpoint ${endpoint} failed:`, endpointError.message);
        continue; // Try next endpoint
      }
    }
    
    // Try the original URL you mentioned
    try {
      console.log(`Trying original URL: ${originalSupportUrl}`);
      const response = await axios.post(originalSupportUrl, requestData, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Support message response (original URL):', response.data);
      return response.data;
    } catch (originalError: any) {
      console.log('Original URL failed:', originalError.message);
    }
    
    // If all endpoints fail, throw an error
    throw new Error('No working support endpoint found. Please contact your administrator to set up the support API.');
  } catch (error: any) {
    console.error('Error sending support message:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      request: error.request,
      config: error.config,
    });
    
    if (axios.isAxiosError(error)) {
      console.error('Support API error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.status === 500) {
        throw new Error('Server error: Failed to send support email. This might be due to server email configuration issues. Please try again later or contact your administrator.');
      } else if (error.response?.status === 404) {
        throw new Error('Support service not found. Please check your school configuration.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to send support message');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error(`Error setting up the request: ${error.message}`);
    }
  }
};
