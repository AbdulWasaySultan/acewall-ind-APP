// supportService.ts
import { getApiInstance } from "./apiInstance";
import { parseApiError } from "../utils/apiError";

export interface SupportData {
  fullName: string;
  email: string;
  feedback: string;
  subject?: string;
}

export const sendSupportMessage = async (supportData: SupportData) => {
  try {
    // Validate input
    if (!supportData.fullName || !supportData.email || !supportData.feedback) {
      throw new Error("All fields are required");
    }

    // Get API instance (auth is handled automatically)
    const api = await getApiInstance();

    // Prepare clean data - only send what's needed
    const requestData = {
      fullName: supportData.fullName.trim(),
      email: supportData.email.trim().toLowerCase(),
      feedback: supportData.feedback.trim(),
      subject:
        supportData.subject || `Support Request from ${supportData.fullName}`,
    };

    console.log("Sending support message:", requestData);

    // Send to the correct endpoint
    const response = await api.post("/api/support/send", requestData);

    console.log("Support message sent successfully:", response.data);
    return response.data;
  } catch (error) {
    throw parseApiError(error, "Failed to send support message");
  }
};
