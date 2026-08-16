// Import YOUR configured API instance instead of raw axios
import api from './api'; 
import type { NotificationResponse, UnreadCountResponse } from '../types/notification.types';

const ENDPOINT = '/notifications'; 

export const getMyNotifications = async () => {
  const response = await api.get<NotificationResponse>(ENDPOINT);
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get<UnreadCountResponse>(`${ENDPOINT}/unread`);
  return response.data;
};

export const markAsRead = async (id: string) => {
  const response = await api.patch(`${ENDPOINT}/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.patch(`${ENDPOINT}/read-all`);
  return response.data;
};