import { getApiInstance } from './apiInstance';

export const createConversation = async (memberId: string) => {
  const api = await getApiInstance();
  const response = await api.post('/conversation/create', { memberId });
  return response.data;
};

export const getConversations = async () => {
  const api = await getApiInstance();
  const response = await api.get('/conversation/get');
  return response.data;
}; 