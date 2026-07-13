import { getApiInstance } from "./apiInstance";

const api = await getApiInstance();

export interface Coupon {
  _id: string;
  name: string;
  code: string;
  discountType: "percentage" | "fixed";
  percentageOff?: number;
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
  fixedAmount?: number;
  maxRedemptions?: number;
  expiresAt?: string;
}

export const fetchCouponsByCourse = async (
  courseId: string
): Promise<Coupon[]> => {
  const response = await api.get(`/coupon/getBycourse/${courseId}`);
  return response.data.coupons; // ✅ important fix
};

export const createCoupon = async (
  courseId: string,
  payload: CreateCouponPayload
) => {
  const response = await api.post("/coupon/createCoupon", {
    ...payload,
    courseId,
  });
  return response.data;
};

export const updateCouponStatus = async (
  couponId: string,
  isActive: boolean
) => {
  const response = await api.patch(`/coupon/updateCoupon/${couponId}`, {
    isActive,
  });
  return response.data;
};
