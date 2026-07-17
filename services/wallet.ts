import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStoredBaseUrl } from "../utils/storage";
import { getApiInstance } from "./apiInstance";

// const createApiInstance = async () => {
//   const baseUrl = await getStoredBaseUrl();
//   if (!baseUrl) {
//     throw new Error('No base URL configured. Please select a school first.');
//   }
//   //not a request just
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

export interface PaymentStats {
  stats: {
    totalRevenue: number;
    totalEarnings: number;
    totalWithdrawals: number;
    currentBalance: number;
    todayRevenue: number;
  };
  revenueOverTime: any[];
  recentWithdrawals: Withdrawal[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalWithdrawalsCount: number;
  };
}

export interface Withdrawal {
  _id: string;
  amount: number;
  method: string;
  stripeAccountId?: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  updatedAt?: string;
}

// Get teacher payment stats
export const getTeacherPaymentStats = async (): Promise<PaymentStats> => {
  try {
    const api = await getApiInstance();
    const response = await api.get("/api/teacher/teacher-payment-stats");
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch payment stats"
      );
    } else if (error.request) {
      throw new Error(
        "No response from server. Please check your internet connection."
      );
    } else {
      throw new Error("Error setting up the request");
    }
  }
};

// Get teacher payment stats with pagination
export const getTeacherPaymentStatsWithPagination = async (
  page: number = 1,
  pageSize: number = 16
): Promise<PaymentStats> => {
  try {
    const api = await getApiInstance();
    const response = await api.get(
      `/api/teacher/teacher-payment-stats?page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch payment stats"
      );
    } else if (error.request) {
      throw new Error(
        "No response from server. Please check your internet connection."
      );
    } else {
      throw new Error("Error setting up the request");
    }
  }
};

// Submit withdrawal request
export const submitWithdrawal = async (
  amount: number,
  method: string,
  stripeAccountId: string
): Promise<any> => {
  try {
    const api = await getApiInstance();
    const response = await api.post("/api/teacher/withdraw", {
      amount,
      method,
      stripeAccountId,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to submit withdrawal request"
      );
    } else if (error.request) {
      throw new Error(
        "No response from server. Please check your internet connection."
      );
    } else {
      throw new Error("Error setting up the request");
    }
  }
};
