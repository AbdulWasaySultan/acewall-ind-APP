// services/apiInstance.ts
import axios, { AxiosInstance, AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStoredBaseUrl } from "../utils/storage";
import { Platform } from "react-native";
import Toast from "react-native-simple-toast";

// Safe timer helper: React Native JS runtime may not expose `performance.now()`.
const now = (): number =>
  typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();

// Types for runtime customization overrides
interface CustomInstanceOptions {
  timeout?: number;
  useApiSuffix?: boolean; // Controls whether to append '/api' to the URL
  enableTiming?: boolean; // Opt-in performance logging per-file
  forceHttps?: boolean; // Force HTTPS for production
  enableRetry?: boolean; // Enable retry on network errors
  maxRetries?: number; // Maximum number of retries
}

// Global cache variables to keep simplicity and performance alive
let cachedInstance: AxiosInstance | null = null;
let cachedOptionsKey: string = "";

// Error types for better handling
export enum ApiErrorType {
  NETWORK = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT_ERROR",
  SSL = "SSL_ERROR",
  AUTH = "AUTH_ERROR",
  SERVER = "SERVER_ERROR",
  CLIENT = "CLIENT_ERROR",
  UNKNOWN = "UNKNOWN_ERROR",
  HTTP_TO_HTTPS = "HTTP_TO_HTTPS_ERROR",
}

export interface ApiError {
  type: ApiErrorType;
  message: string;
  status?: number;
  originalError?: any;
  url?: string;
  method?: string;
}

export const getApiInstance = async (
  options: CustomInstanceOptions = {}
): Promise<AxiosInstance> => {
  // 1. Fallback Defaults
  const timeout = options.timeout ?? 30000;
  const useApiSuffix = options.useApiSuffix ?? true;
  const enableTiming = options.enableTiming ?? false;
  const forceHttps = options.forceHttps ?? false; // Default to false to avoid breaking changes
  const enableRetry = options.enableRetry ?? false;
  const maxRetries = options.maxRetries ?? 2;

  // 2. Resolve Base URL
  let baseUrl = await getStoredBaseUrl();

  if (!baseUrl) {
    // Use default based on platform (if you have a default)
    const defaultUrl = Platform.select({
      android: "http://10.0.2.2:3000", // Android emulator
      ios: "http://localhost:3000", // iOS simulator
      default: "http://localhost:3000",
    });

    console.warn(`⚠️ No base URL configured. Using default: ${defaultUrl}`);
    baseUrl = defaultUrl;
  }

  // 3. Optional: Force HTTPS (disabled by default to avoid breaking changes)
  if (forceHttps && baseUrl.startsWith("http://")) {
    const httpsUrl = baseUrl.replace("http://", "https://");
    console.warn(`⚠️ Converting HTTP to HTTPS: ${baseUrl} -> ${httpsUrl}`);

    // Update stored URL
    await AsyncStorage.setItem("baseUrl", httpsUrl);
    baseUrl = httpsUrl;
  }

  console.log(`🔗 API Base URL: ${baseUrl}`);

  // 4. Construct the actual target endpoint path
  const finalBaseUrl = useApiSuffix ? `${baseUrl}/api` : baseUrl;

  // 5. Generate a unique cache signature for these specific parameters
  const currentOptionsKey = `${finalBaseUrl}_${timeout}_${enableTiming}_${forceHttps}`;

  // If base URL and parameters match the cache, return it instantly
  if (cachedInstance && cachedOptionsKey === currentOptionsKey) {
    return cachedInstance;
  }

  // 6. Instantiation Layout Configuration
  const instance = axios.create({
    baseURL: finalBaseUrl,
    timeout: timeout,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // 7. Global Request Interceptor
  instance.interceptors.request.use(
    async (config) => {
      // Log request details
      console.log(
        `📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
      );

      // Add authorization token
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          // Clean token if it has quotes
          const cleanToken = token.replace(/^"|"$/g, "");
          config.headers.Authorization = `Bearer ${cleanToken}`;
        } else {
          console.warn("⚠️ No token found in storage");
        }
      } catch (tokenError) {
        console.error("❌ Error retrieving token:", tokenError);
      }

      // Add platform info for debugging
      config.headers["X-Platform"] = Platform.OS;
      config.headers["X-App-Version"] = "1.0.0";

      // Performance timing
      if (enableTiming) {
        const label = `⏱️ Axios [${config.method?.toUpperCase()}] ${
          config.url
        }`;
        (config as any).metadata = { startTime: now(), label };
        console.time(label);
      }

      return config;
    },
    (error) => {
      console.error("❌ Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  // 8. Global Response Interceptor with Enhanced Error Handling
  instance.interceptors.response.use(
    (response) => {
      const metadata = (response.config as any).metadata;
      if (metadata) {
        console.timeEnd(metadata.label);
        const duration = now() - metadata.startTime;
        console.log(
          `📥 ${response.status} ${response.config.url} (${duration.toFixed(
            0
          )}ms)`
        );
      } else {
        console.log(`📥 ${response.status} ${response.config.url}`);
      }
      return response;
    },
    async (error: AxiosError) => {
      // End timing if enabled
      const metadata = (error.config as any)?.metadata;
      if (metadata) {
        console.timeEnd(metadata.label);
      }

      // 8.1 Parse and categorize the error
      const apiError = parseApiError(error);

      // 8.2 Log detailed error information
      console.error("❌ API Error:", {
        type: apiError.type,
        message: apiError.message,
        status: apiError.status,
        url: apiError.url,
        method: apiError.method,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
      });

      // 8.3 Handle specific error types
      switch (apiError.type) {
        case ApiErrorType.AUTH:
          // Handle 401 Unauthorized
          console.warn("🔐 Authentication error - token may be expired");
          try {
            await AsyncStorage.removeItem("token");
            // You might want to emit an event or navigate to login
          } catch (clearError) {
            console.error("Failed to clear token:", clearError);
          }
          break;

        case ApiErrorType.NETWORK:
          console.warn("🌐 Network error - check internet connection");
          // Retry logic could be implemented here
          if (enableRetry && error.config) {
            const retryCount = (error.config as any).retryCount || 0;
            if (retryCount < maxRetries) {
              console.log(
                `🔄 Retrying request (${retryCount + 1}/${maxRetries})...`
              );
              (error.config as any).retryCount = retryCount + 1;
              // Add delay before retry (exponential backoff)
              const delay = Math.pow(2, retryCount) * 1000;
              await new Promise((resolve) => setTimeout(resolve, delay));
              return instance(error.config);
            }
          }
          break;

        case ApiErrorType.TIMEOUT:
          console.error("⏰ Request timeout - server is slow or unresponsive");
          break;

        case ApiErrorType.SERVER:
          console.error(
            `🖥️ Server error (${apiError.status}): ${apiError.message}`
          );
          break;

        case ApiErrorType.CLIENT:
          console.error(
            `👤 Client error (${apiError.status}): ${apiError.message}`
          );
          break;

        default:
          console.error("❌ Unknown error:", apiError.message);
      }

      // 8.4 Format error for easier handling in components
      const formattedError = {
        ...apiError,
        response: error.response?.data,
        originalError: error,
      };

      return Promise.reject(formattedError);
    }
  );

  // 9. Update Cache Reference State
  cachedInstance = instance;
  cachedOptionsKey = currentOptionsKey;

  return instance;
};

/**
 * Parse and categorize API errors
 */
function parseApiError(error: AxiosError): ApiError {
  const apiError: ApiError = {
    type: ApiErrorType.UNKNOWN,
    message: error.message || "Unknown error occurred",
    status: error.response?.status,
    url: error.config?.url,
    method: error.config?.method?.toUpperCase(),
    originalError: error,
  };

  // Network errors (no response)
  if (error.code === "ECONNABORTED") {
    apiError.type = ApiErrorType.TIMEOUT;
    apiError.message = "Request timed out. Please try again.";
  } else if (!error.response && error.request) {
    apiError.type = ApiErrorType.NETWORK;
    apiError.message = "Network error - Please check your internet connection.";
  }
  // Server responded with error status
  else if (error.response) {
    const status = error.response.status;
    const responseData = error.response.data as any;

    apiError.status = status;
    apiError.message =
      responseData?.message || error.message || "Server error occurred";

    if (status === 401 || status === 403) {
      apiError.type = ApiErrorType.AUTH;
      apiError.message =
        responseData?.message || "Authentication failed. Please login again.";
    } else if (status >= 500) {
      apiError.type = ApiErrorType.SERVER;
      apiError.message =
        responseData?.message || "Server error. Please try again later.";
    } else if (status >= 400) {
      apiError.type = ApiErrorType.CLIENT;
      apiError.message =
        responseData?.message || "Invalid request. Please check your input.";
    }
  }

  return apiError;
}

/**
 * Helper function to test API connectivity
 */
export const testApiConnection = async (
  showToast: boolean = true
): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log("🔍 Testing API connectivity...");
    const api = await getApiInstance({ enableTiming: true });
    console.log("✅ API Instance created with baseURL:", api.defaults.baseURL);

    // Try to fetch categories as a test
    const response = await api.get("/category/get");
    console.log("✅ API connection successful:", response.data);

    if (showToast) {
      Toast.show("✅ API Connected Successfully!", Toast.SHORT);
    }

    return {
      success: true,
      message: "API connection successful",
      details: {
        baseURL: api.defaults.baseURL,
        status: response.status,
        data: response.data,
      },
    };
  } catch (error: any) {
    console.error("❌ API connection test failed:", error);

    let errorMessage = "❌ API Connection Failed. ";

    if (error.type === ApiErrorType.NETWORK) {
      errorMessage += "Please check your internet connection.";
    } else if (error.type === ApiErrorType.TIMEOUT) {
      errorMessage += "Request timed out. Server is slow or unreachable.";
    } else {
      errorMessage += error.message || "Unknown error.";
    }

    if (showToast) {
      Toast.show(errorMessage, Toast.LONG);
    }

    return {
      success: false,
      message: errorMessage,
      details: error,
    };
  }
};

/**
 * Helper function to fix HTTP to HTTPS issue
 */
export const fixHttpsIssue = async (): Promise<boolean> => {
  try {
    const currentUrl = await AsyncStorage.getItem("baseUrl");
    if (!currentUrl) {
      console.warn("No stored URL found");
      return false;
    }

    if (currentUrl.startsWith("http://")) {
      const fixedUrl = currentUrl.replace("http://", "https://");
      await AsyncStorage.setItem("baseUrl", fixedUrl);
      console.log("✅ Fixed URL to HTTPS:", fixedUrl);

      // Clear cache
      cachedInstance = null;
      cachedOptionsKey = "";

      Toast.show("✅ API URL updated to HTTPS", Toast.SHORT);
      return true;
    }

    console.log("✅ URL already using HTTPS:", currentUrl);
    return true;
  } catch (error) {
    console.error("❌ Failed to fix HTTPS issue:", error);
    return false;
  }
};

// Export error types for use in components
export { ApiErrorType as any};
