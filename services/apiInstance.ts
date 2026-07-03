// services/apiInstance.ts
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStoredBaseUrl } from "../utils/storage";

// Types for runtime customization overrides
interface CustomInstanceOptions {
  timeout?: number;
  useApiSuffix?: boolean; // Controls whether to append '/api' to the URL
  enableTiming?: boolean; // Opt-in performance logging per-file
}

// Global cache variables to keep simplicity and performance alive
let cachedInstance: AxiosInstance | null = null;
let cachedBaseUrl: string | null = null;
let cachedOptionsKey: string = "";

export const getApiInstance = async (
  options: CustomInstanceOptions = {}
): Promise<AxiosInstance> => {
  // 1. Fallback Defaults
  const timeout = options.timeout ?? 30000; // Defaults to 30s if not specified
  const useApiSuffix = options.useApiSuffix ?? true; // Most services need /api
  const enableTiming = options.enableTiming ?? false;

  // 2. Resolve Base URL
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    throw new Error("No base URL configured. Please select a school first.");
  }

  // 3. Construct the actual target endpoint path
  const finalBaseUrl = useApiSuffix ? `${baseUrl}/api` : baseUrl;

  // 4. Generate a unique cache signature for these specific parameters
  const currentOptionsKey = `${finalBaseUrl}_${timeout}_${enableTiming}`;

  // If base URL and parameters match the cache, return it instantly
  if (cachedInstance && cachedOptionsKey === currentOptionsKey) {
    return cachedInstance;
  }

  // 5. Instantiation Layout Configuration
  const instance = axios.create({
    baseURL: finalBaseUrl,
    timeout: timeout,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // 6. Global Request Interceptor (Handles Authorization Header Injection)
  instance.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (enableTiming) {
        const label = `⏱️ Axios [${config.method?.toUpperCase()}] ${
          config.url
        }`;
        (config as any).metadata = { startTime: performance.now(), label };
        console.time(label);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 7. Global Response Interceptor
  instance.interceptors.response.use(
    (response) => {
      const metadata = (response.config as any).metadata;
      if (metadata) console.timeEnd(metadata.label);
      return response;
    },
    async (error) => {
      const metadata = (error.config as any).metadata;
      if (metadata) console.timeEnd(metadata.label);

      if (error.response?.status === 401) {
        // Global Error Handling (e.g., Auth Broadcast Event / Clean Token Storage)
        // You can add custom logic here
      }
      return Promise.reject(error);
    }
  );

  // 8. Update Cache Reference State
  cachedInstance = instance;
  cachedOptionsKey = currentOptionsKey;

  return instance;
};
