import axios from 'axios';
import { Platform } from 'react-native';
import { getStoredBaseUrl, setStoredUserData, setUserToken } from '../utils/storage';

// Default API URL for school search
// Use hosted API to avoid localhost/ATS issues on iOS
const getLocalBaseUrl = () => {
  return 'https://admin-panel-server-lac.vercel.app/api';
};

// Create axios instance for local API (school search)
const localApi = axios.create({
  baseURL: getLocalBaseUrl(),
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Create axios instance for auth API
const createAuthApiInstance = async () => {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error('No auth base URL selected');
  }
  return axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });
};

// Create axios instance for school-specific APIs
const createSchoolApiInstance = async () => {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error('No school base URL selected');
  }
  return axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });
};

export interface School {
  _id: string;
  schoolName: string;
  baseUrl: string;
  createdAt: string;
  __v: number;
}

// Local API call for searching schools
export const searchSchools = async (query: string): Promise<School[]> => {
  try {
    const response = await localApi.get('/schools/search', {
      params: { name: query }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Search error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params
        }
      });
    }
    throw error;
  }
};

// Auth API call for login
export const login = async (email: string, password: string) => {
  try {
    const baseUrl = await getStoredBaseUrl();
    if (!baseUrl) {
      throw new Error('No base URL configured. Please select a school first.');
    }

    const authApi = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    console.log('Login API URL:', authApi.defaults.baseURL+'/api/auth/login');
    const response = await authApi.post('/api/auth/login', { email, password });
    console.log(response.data)
    if (response.data && response.data.token) {
      await setUserToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Login error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.status === 404) {
        throw new Error('Authentication service not found. Please check your school configuration.');
      }
    }
    throw error;
  }
};

export const signup = async (userData: any) => {
  try {
    const baseUrl = await getStoredBaseUrl();
    if (!baseUrl) {
      throw new Error('No base URL configured. Please select a school first.');
    }

    console.log('Using base URL:', baseUrl);

    const authApi = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    console.log('Login API URL:', authApi.defaults.baseURL+'/api/auth/register');
    const response = await authApi.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Signup error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.status === 404) {
        throw new Error('Authentication service not found. Please check your school configuration.');
      }
    }
    throw error;
  }
};

export const verifyOtpAndSignup = async (data: { email: string; otp: string }) => {
  const baseUrl = await getStoredBaseUrl();
    if (!baseUrl) {
      throw new Error('No base URL configured. Please select a school first.');
    }
  try {
    const response = await axios.post(`${baseUrl}/api/auth/verifyOTP`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resendOTP = async (data: { email: string }) => {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error('No base URL configured. Please select a school first.');
  }
  try {
    const response = await axios.post(`${baseUrl}/api/auth/resendOTP`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkAuth = async () => {
  try {
    const baseUrl = await getStoredBaseUrl();
    if (!baseUrl) {
      throw new Error('No base URL configured. Please select a school first.');
    }

    const authApi = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    const response = await authApi.get('/api/auth/checkAuth');
    console.log(response.data)
    if (response.data && response.data.user) {
      await setStoredUserData(response.data.user);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Check auth error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
    }
    throw error;
  }
};

export interface UpdateUserProfileData {
  firstName: string;
  middleName: string;
  lastName: string;
  Bio: string;
  pronoun?: string |null;
  gender?: string | null 
  email: string;
  phone: string;
  homeAddressLine1: string;
  homeAddressLine2: string;
  homeCity: string;
  homeState: string;
  homeZip: string;
  mailingAddressLine1: string;
  mailingAddressLine2: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  profileImage?: string;
}

export const updateUserProfile = async (userData: UpdateUserProfileData) => {
  try {
    const baseUrl = await getStoredBaseUrl();
    if (!baseUrl) {
      throw new Error('No base URL configured. Please select a school first.');
    }

    console.log('Update profile API URL:', baseUrl + '/api/auth/updateuser');
    console.log('Update profile data:', userData);

    const response = await axios.put(`${baseUrl}/api/auth/updateuser`, userData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.log(error)
    if (axios.isAxiosError(error)) {
      console.error('Update profile error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.status === 404) {
        throw new Error('Profile update service not found. Please check your school configuration.');
      }
    }
    throw error;
  }
};

export const getUserInfo = async () => {
  try {
    const baseUrl = await getStoredBaseUrl();
    if (!baseUrl) {
      throw new Error('No base URL configured. Please select a school first.');
    }
    const authApi = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    const response = await authApi.get('/api/auth/getUserInfo');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Get user info error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
    }
    throw error;
  }
};

export const uploadProfileImage = async (imageUri: string) => {
  try {
    const baseUrl = await getStoredBaseUrl();
    if (!baseUrl) {
      throw new Error('No base URL configured. Please select a school first.');
    }

    const formData = new FormData();
    // Extract filename and type from uri
    const uriParts = imageUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    const fileType = fileName.split('.').pop();
    const mimeType = fileType ? `image/${fileType === 'jpg' ? 'jpeg' : fileType}` : 'image/jpeg';

    formData.append('profileImg', {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    } as any);

    const response = await axios.put(`${baseUrl}/api/auth/updateProfileImg`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
    });

    // After upload, get updated user info
    const updatedUserInfo = await getUserInfo();
    return updatedUserInfo;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Upload profile image error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      if (error.response?.status === 404) {
        throw new Error('Profile image upload service not found. Please check your school configuration.');
      }
    }
    throw error;
  }
};

export const forgotPassword = async (email: string) => {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error('No base URL configured. Please select a school first.');
  }
  try {
    const response = await axios.post(`${baseUrl}/api/auth/forgotPassword`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyForgotPassOTP = async (email: string, otp: string) => {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error('No base URL configured. Please select a school first.');
  }
  try {
    const response = await axios.post(`${baseUrl}/api/auth/verifyForgotPassOTP`, { email, otp });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email: string, newPassword: string) => {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error('No base URL configured. Please select a school first.');
  }
  try {
    const response = await axios.post(`${baseUrl}/api/auth/resetPassword`, { email, newPassword });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update Password with OTP
export const updatePasswordOTP = async (oldPassword: string, newPassword: string, confirmPassword: string) => {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error('No base URL configured. Please select a school first.');
  }
  try {
    const response = await axios.post(`${baseUrl}/api/auth/updatePasswordOTP`, {
      oldPassword,
      newPassword,
      confirmPassword
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update Email with OTP
export const updateEmailOTP = async (newEmail: string) => {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error('No base URL configured. Please select a school first.');
  }
  try {
    const response = await axios.post(`${baseUrl}/api/auth/updateEmailOTP`, {
      newEmail
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update Phone with OTP
export const updatePhoneOTP = async (newPhone: string) => {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error('No base URL configured. Please select a school first.');
  }
  try {
    const response = await axios.post(`${baseUrl}/api/auth/updatePhoneOTP`, {
      newPhone
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify OTP and update Email
export const updateEmail = async (email: string, otp: string) => {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error('No base URL configured. Please select a school first.');
  }
  try {
    const response = await axios.put(`${baseUrl}/api/auth/updateEmail`, {
      email,
      otp
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify OTP and update Password
export const updatePassword = async (oldPassword: string, newPassword: string, confirmPassword: string, otp: string) => {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error('No base URL configured. Please select a school first.');
  }
  try {
    const response = await axios.put(`${baseUrl}/api/auth/updatePassword`, {
      oldPassword,
      newPassword,
      confirmPassword,
      otp
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify OTP and update Phone
export const updatePhone = async (newPhone: string, otp: string) => {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error('No base URL configured. Please select a school first.');
  }
  try {
    const response = await axios.put(`${baseUrl}/api/auth/updatePhone`, {
      newPhone,
      otp
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 