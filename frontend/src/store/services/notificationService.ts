import axios from 'axios';
import { Notification } from '../../types/notification';
import { getToken } from '../../utils/getToken';

const API_BASE_URL = 'http://localhost:5097/api/notification'; // corretto: senza la 's'

// Crea istanza axios per le notifiche
const notificationApi = axios.create({
  baseURL: API_BASE_URL
});

// Interceptor per aggiungere automaticamente il token
notificationApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const notificationService = {
  // Ottieni tutte le notifiche dell'utente
  async getNotifications(): Promise<Notification[]> {
    const response = await notificationApi.get('/');
    return response.data;
  },

  // Ottieni il conteggio delle notifiche non lette
  async getUnreadCount(): Promise<number> {
    const response = await notificationApi.get('/unread-count');
    return response.data;
  },
  // Segna una notifica come letta
  async markAsRead(notificationId: number): Promise<void> {
    await notificationApi.put(`/${notificationId}/mark-read`);
  },

  // Segna tutte le notifiche come lette
  async markAllAsRead(): Promise<void> {
    await notificationApi.put('/mark-all-read');
  },

  // Elimina una notifica
  async deleteNotification(notificationId: number): Promise<void> {
    await notificationApi.delete(`/${notificationId}`);
  },

  // Elimina tutte le notifiche lette
  async deleteAllNotifications(): Promise<void> {
    await notificationApi.delete('/read');
  }
};

export default notificationService;
