import api from './client';

const extractData = <T>(responseData: unknown): T => {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return ((responseData as { data?: T }).data ?? responseData) as T;
  }

  return responseData as T;
};

export const notificationsApi = {
  getVapidPublicKey: async (): Promise<string> => {
    const response = await api.get('/notifications/vapid-public-key');
    const payload = extractData<{ publicKey?: string }>(response.data);
    return payload.publicKey || '';
  },

  subscribe: async (subscription: PushSubscriptionJSON): Promise<void> => {
    await api.post('/notifications/subscribe', { subscription });
  },

  unsubscribe: async (endpoint: string): Promise<void> => {
    await api.post('/notifications/unsubscribe', { endpoint });
  },

  sendTest: async (): Promise<void> => {
    await api.post('/notifications/test');
  },
};

export default notificationsApi;
