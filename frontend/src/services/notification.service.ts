// src/services/notification.service.ts

import api from "./api";

import type {
  AppNotification,
  GetNotificationsResponse,
  GetUnreadCountResponse,
  MarkNotificationReadResponse,
  MarkAllNotificationsReadResponse,
} from "../types/notification.types";

// ============================================================
// GET MY NOTIFICATIONS
// ============================================================

export const getMyNotifications = async (): Promise<AppNotification[]> => {
  const response = await api.get<GetNotificationsResponse>("/notifications");

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to load notifications.");
  }

  return Array.isArray(response.data.data) ? response.data.data : [];
};

// ============================================================
// GET UNREAD COUNT
// ============================================================

export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await api.get<GetUnreadCountResponse>(
    "/notifications/unread-count",
  );

  if (!response.data.success) {
    throw new Error(
      response.data.message || "Failed to load unread notification count.",
    );
  }

  return response.data.data?.count ?? 0;
};

// ============================================================
// MARK ONE NOTIFICATION AS READ
// ============================================================

export const markNotificationAsRead = async (
  notificationId: string,
): Promise<AppNotification> => {
  const response = await api.patch<MarkNotificationReadResponse>(
    `/notifications/${notificationId}/read`,
  );

  if (!response.data.success) {
    throw new Error(
      response.data.message || "Failed to mark notification as read.",
    );
  }

  return response.data.data;
};

// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================

export const markAllNotificationsAsRead = async (): Promise<void> => {
  const response = await api.patch<MarkAllNotificationsReadResponse>(
    "/notifications/read-all",
  );

  if (!response.data.success) {
    throw new Error(
      response.data.message || "Failed to mark all notifications as read.",
    );
  }
};
