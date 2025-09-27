import { getStoredBaseUrl } from './storage';

// API Configuration
export const getApiUrl = async (): Promise<string> => {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error('No base URL configured. Please select a school first.');
  }
  return `${baseUrl}/api`;
};

// Other configuration constants can be added here
export const CONFIG = {
  getApiUrl,
  // Add other config values as needed
}; 