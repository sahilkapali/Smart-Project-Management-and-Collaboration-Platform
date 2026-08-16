import api from "./api";
import type {
  NotificationResponse,
  UnreadCountResponse,
} from "../types/notification.types";

const ENDPOINT = "/notifications";

// ==================== GET ALL NOTIFICATIONS ====================

export const getMyNotifications = async (): Promise<NotificationResponse> => {
  const response = await api.get<NotificationResponse>(ENDPOINT);
  return response.data;
};

// ==================== GET UNREAD COUNT ====================

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await api.get<UnreadCountResponse>(`${ENDPOINT}/unread`);
  return response.data;
};

// Helper returning raw count number for UI components
export const getUnreadNotificationsCount = async (): Promise<number> => {
  const response = await getUnreadCount();
  return response.data?.count ?? 0;
};

// ==================== MARK AS READ ====================

export const markAsRead = async (id: string) => {
  const response = await api.patch(`${ENDPOINT}/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.patch(`${ENDPOINT}/read-all`);
  return response.data;
};