// supportService.ts
import { getApiInstance } from "./apiInstance";

export interface SupportData {
  fullName: string;
  email: string;
  feedback: string;
  subject?: string;
}

// Error handler
const handleApiError = (error: any, defaultMessage: string) => {
  console.error(`${defaultMessage}:`, error);

  if (error.response) {
    // Server responded with error
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      defaultMessage;
    throw new Error(message);
  } else if (error.request) {
    // No response from server
    throw new Error(
      "No response from server. Please check your internet connection."
    );
  } else {
    // Request setup error
    throw new Error(`Error: ${error.message}`);
  }
};

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
    handleApiError(error, "Failed to send support message");
  }
};
