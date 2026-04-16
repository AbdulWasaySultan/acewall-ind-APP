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
  
      if (payload.file) {
        formData.append('file', {
          uri:  payload.file.uri,
          type: payload.file.type || 'application/octet-stream',
          name: payload.file.name || payload.file.fileName || 'file',
        } as any);
      }
  
      // Log exactly what's being sent
      console.log('=== AI REQUEST ===');
      console.log('URL: aichat/askupdated');
      console.log('question:', payload.question);
      console.log('difficulty:', payload.difficulty);
  
      const response = await api.post('/api/aichat/askupdated', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log('=== AI RESPONSE ===', response.data);
      return response.data;
  
    } catch (error: any) {
      // Log the full error details
      console.log('=== AI ERROR ===');
      console.log('status:',   error.response?.status);
      console.log('data:',     JSON.stringify(error.response?.data));
      console.log('message:',  error.message);
      console.log('full error:', error);
  
      if (error.response) throw new Error(error.response.data.message || 'Failed to get AI response');
      else if (error.request) throw new Error('No response from server.');
      else throw new Error('Error setting up the request');
    }
  };