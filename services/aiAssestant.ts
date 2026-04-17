import { Platform } from "react-native";
import { addAuthInterceptor, createApiInstance } from "./course";

interface AIMessagePayload {
  question:     string;
  difficulty?:  string;
  context?:     string;
  file?:        any;
  sessionType?: string;
  model?:       string;
}

export const sendAIMessage = async (payload: AIMessagePayload) => {
    try {
      const api = await createApiInstance();
      addAuthInterceptor(api);

      const formData = new FormData();
      formData.append('question', payload.question);

      if (payload.difficulty)  formData.append('difficulty',  payload.difficulty);
      if (payload.context)     formData.append('context',     payload.context);
      if (payload.sessionType) formData.append('sessionType', payload.sessionType);
      if (payload.model)       formData.append('model',       payload.model);

      // ── File ──────────────────────────────────────────────────────────────
      if (payload.file) {
        console.log('=== FILE DETAILS ===');
        console.log('uri:',  payload.file.uri);
        console.log('type:', payload.file.type);
        console.log('name:', payload.file.name);
      
        // ✅ Fix — normalize URI for Android
        const fileUri = Platform.OS === 'android'
          ? payload.file.uri  // keep as-is — content:// URI
          : payload.file.uri.replace('file://', '');
      
        const fileName = payload.file.name
          || payload.file.fileName
          || `file_${Date.now()}.${payload.file.type?.split('/')[1] ?? 'pdf'}`;
      
        formData.append('file', {
          uri:  fileUri,
          type: payload.file.type || 'application/pdf',
          name: fileName,
        } as any);
      
        console.log('✅ File appended:', fileName);
      } else {
        console.log(' No file in payload');
      }

      console.log('=== AI REQUEST ===');
      console.log('question:',   payload.question);
      console.log('difficulty:', payload.difficulty);
      console.log('hasFile:',    !!payload.file);

      const response = await api.post('/api/aichat/askupdated', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('=== AI RESPONSE ===', response.data);
      return response.data;

    } catch (error: any) {
      console.log('=== AI ERROR ===');
      console.log('status:',  error.response?.status);
      console.log('data:',    JSON.stringify(error.response?.data));
      console.log('message:', error.message);

      if (error.response) throw new Error(error.response.data.message || 'Failed to get AI response');
      else if (error.request) throw new Error('No response from server.');
      else throw new Error('Error setting up the request');
    }
};



// ----------------- get chatHistory --------------------
export const getChatHistory = async () => {
  try {
    const api = await createApiInstance();
    addAuthInterceptor(api);
    const response = await api.get('/api/aichat/getChatHistory');
    console.log('===--- CHAT HISTORY ===', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response) throw new Error(error.response.data.message || 'Failed to fetch history');
    else if (error.request) throw new Error('No response from server.');
    else throw new Error('Error setting up the request');
  }
};