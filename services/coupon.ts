// services/coupon.ts
import { getApiInstance } from "./apiInstance";

export interface Coupon {
  _id: string;
  name: string;
  code: string;
  discountType: "percentage" | "fixed";
  percentageOff?: number;
  amountOff?: number;        // matches web version
  maxRedemptions: number;
  usedCount?: number;
  expiresAt?: string;
  isActive: boolean;
  course: string;
}

export interface CreateCouponPayload {
  name: string;
  code: string;
  discountType: "percentage" | "fixed";
  percentageOff?: number;
  amountOff?: number;        // matches web version
  maxRedemptions?: number;
  expiresAt?: string;
}

export const fetchCouponsByCourse = async (
  courseId: string
): Promise<Coupon[]> => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/coupon/getBycourse/${courseId}`);
    return response.data.coupons;
  } catch (error: any) {
    console.error("Failed to fetch coupons:", error);
    throw new Error(error?.message || "Failed to fetch coupons");
  }
};

export const createCouponsByCourse = async (
  courseId: string,
  payload: CreateCouponPayload
) => {
  try {
    const api = await getApiInstance();
    const response = await api.post("/api/coupon/createCoupon", {
      ...payload,
      courseId,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to create coupon:", error);
    throw new Error(error?.message || "Failed to create coupon");
  }
};

export const updateCouponStatus = async (
  couponId: string,
  isActive: boolean
) => {
  try {
    const api = await getApiInstance();
    const response = await api.patch(`/api/coupon/updateCoupon/${couponId}`, {
      isActive,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to update coupon status:", error);
    throw new Error(error?.message || "Failed to update coupon status");
  }
};