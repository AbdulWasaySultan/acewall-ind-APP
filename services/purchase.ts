import { getApiInstance } from "./apiInstance";

export interface Purchase {
  _id: string;
  course?: {
    _id: string;
    courseTitle: string;
    thumbnail?: { url: string };
    price?: number;
  };
  teacher?: {
    name: string;
    email: string;
  };
  stripeInvoiceId?: string;
  paymentIntentId?: string;
  currency: string;
  amount: number;
  paymentType: "SUBSCRIPTION" | "ONETIME" | string;
  invoicePdf?: string | null;
  receiptUrl?: string | null;
  createdAt: string;
}

// Matches web's purchasesPage.jsx exactly — GET stripe/getPurchases, no
// params (server scopes to req.user._id), already sorted newest-first.
export const getPurchases = async (): Promise<{
  success: boolean;
  data: Purchase[];
}> => {
  try {
    const api = await getApiInstance();
    const response = await api.get("/api/stripe/getPurchases");
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || "Failed to fetch purchase history");
    } else if (error.request) {
      throw new Error("No response from server. Please check your internet connection.");
    } else {
      throw new Error("Error setting up the request");
    }
  }
};
