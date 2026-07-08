import { Platform } from "react-native";
import { getApiInstance } from "./apiInstance";

interface AIMessagePayload {
  question: string;
  difficulty?: string;
  context?: string;
  file?: any;
  sessionType?: string;
  model?: string;
}

export const sendAIMessage = async (payload: AIMessagePayload) => {
  try {
    const api = await getApiInstance();

    const formData = new FormData();
    formData.append("question", payload.question);

    if (payload.difficulty) formData.append("difficulty", payload.difficulty);
    if (payload.context) formData.append("context", payload.context);
    if (payload.sessionType)
      formData.append("sessionType", payload.sessionType);
    if (payload.model) formData.append("model", payload.model);

    // ── File ──────────────────────────────────────────────────────────────
    if (payload.file) {
      console.log("=== FILE DETAILS ===");
      console.log("uri:", payload.file.uri);
      console.log("type:", payload.file.type);
      console.log("name:", payload.file.name);

      // ✅ Fix — normalize URI for Android
      const fileUri =
        Platform.OS === "android"
          ? payload.file.uri // keep as-is — content:// URI
          : payload.file.uri.replace("file://", "");

      const fileName =
        payload.file.name ||
        payload.file.fileName ||
        `file_${Date.now()}.${payload.file.type?.split("/")[1] ?? "pdf"}`;

      formData.append("file", {
        uri: fileUri,
        type: payload.file.type || "application/pdf",
        name: fileName,
      } as any);

      console.log("✅ File appended:", fileName);
    } else {
      console.log(" No file in payload");
    }

    console.log("=== AI REQUEST ===");
    console.log("question:", payload.question);
    console.log("difficulty:", payload.difficulty);
    console.log("hasFile:", !!payload.file);

    const response = await api.post("/aichat/askupdated", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("=== AI RESPONSE ===", response.data);
    return response.data;
  } catch (error: any) {
    console.log("=== AI ERROR ===");
    console.log("status:", error.response?.status);
    console.log("data:", JSON.stringify(error.response?.data));
    console.log("message:", error.message);

    if (error.response)
      throw new Error(
        error.response.data.message || "Failed to get AI response"
      );
    else if (error.request) throw new Error("No response from server.");
    else throw new Error("Error setting up the request");
  }
};

// ----------------- get chatHistory --------------------
export const getChatHistory = async () => {
  try {
    const api = await getApiInstance();
    const response = await api.get("/aichat/getChatHistory");
    console.log("===--- CHAT HISTORY ===", response.data);
    return response.data;
  } catch (error: any) {
    if (error.response)
      throw new Error(error.response.data.message || "Failed to fetch history");
    else if (error.request) throw new Error("No response from server.");
    else throw new Error("Error setting up the request");
  }
};

// import { Platform } from "react-native";
// import { getApiInstance } from "./apiInstance";

// interface AIMessagePayload {
//   question: string;
//   difficulty?: string;
//   context?: string;
//   file?: any;
//   sessionType?: string;
//   model?: string;
// }

// export const sendAIMessage = async (payload: AIMessagePayload) => {
//   try {
//     const api = await getApiInstance();

//     // ✅ Log the base URL to verify it's set
//     console.log("=== API BASE URL ===", api.defaults.baseURL);

//     const formData = new FormData();
//     formData.append("question", payload.question);

//     if (payload.difficulty) formData.append("difficulty", payload.difficulty);
//     if (payload.context) formData.append("context", payload.context);
//     if (payload.sessionType)
//       formData.append("sessionType", payload.sessionType);
//     if (payload.model) formData.append("model", payload.model);

//     // ── File Handling ──
//     if (payload.file) {
//       console.log("=== FILE DETAILS ===");
//       console.log("uri:", payload.file.uri);
//       console.log("type:", payload.file.type);
//       console.log("name:", payload.file.name);

//       // ✅ FIX: Properly handle file for React Native
//       const fileUri = payload.file.uri;
//       const fileName =
//         payload.file.name || payload.file.fileName || `file_${Date.now()}.pdf`;
//       const fileType = payload.file.type || "application/pdf";

//       // ✅ For React Native, the file object needs to be structured correctly
//       const fileObject = {
//         uri: fileUri,
//         type: fileType,
//         name: fileName,
//       };

//       formData.append("file", fileObject as any);

//       console.log("✅ File appended:", fileName);
//     }

//     console.log("=== AI REQUEST ===");
//     console.log("question:", payload.question);
//     console.log("difficulty:", payload.difficulty);
//     console.log("hasFile:", !!payload.file);

//     // ✅ Make the request with proper headers
//     const response = await api.post("/aichat/askupdated", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//         Accept: "application/json",
//       },
//       timeout: 30000, // 30 second timeout for AI responses
//     });

//     console.log("=== AI RESPONSE ===", response.data);
//     return response.data;
//   } catch (error: any) {
//     console.log("=== AI ERROR ===");
//     console.log("status:", error.response?.status);
//     console.log("data:", error.response?.data);
//     console.log("message:", error.message);
//     console.log("config:", error.config);

//     // ✅ Better error messages
//     if (error.response) {
//       // Server responded with error
//       const message =
//         error.response.data?.message ||
//         error.response.data?.error ||
//         "Failed to get AI response";
//       throw new Error(message);
//     } else if (error.request) {
//       // Request made but no response
//       throw new Error("No response from server. Please check your connection.");
//     } else {
//       // Request setup error
//       throw new Error("Error setting up the request: " + error.message);
//     }
//   }
// };

// // ── get chatHistory ──
// export const getChatHistory = async () => {
//   try {
//     const api = await getApiInstance();
//     console.log("=== FETCHING CHAT HISTORY ===");
//     console.log("Base URL:", api.defaults.baseURL);

//     const response = await api.get("/aichat/getChatHistory");
//     console.log("=== CHAT HISTORY RESPONSE ===", response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("=== CHAT HISTORY ERROR ===", error);

//     if (error.response) {
//       throw new Error(
//         error.response.data?.message || "Failed to fetch history"
//       );
//     } else if (error.request) {
//       throw new Error("No response from server.");
//     } else {
//       throw new Error("Error setting up the request: " + error.message);
//     }
//   }
// };
