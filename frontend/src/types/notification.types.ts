// src/types/notification.types.ts

// ============================================================
// NOTIFICATION TYPES
// ============================================================

export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_UPDATED"
  | "COMMENT_ADDED"
  | "DEADLINE_APPROACHING"
  | "MEMBER_ADDED"
  | "MEETING_INVITATION"
  | "SYSTEM_ALERT";

// ============================================================
// RELATED ENTITY TYPES
// ============================================================

export type NotificationEntityType =
  | "TASK"
  | "PROJECT"
  | "COMMENT"
  | "TEAM"
  | "MEETING";

// ============================================================
// SENDER
// ============================================================

export interface NotificationSender {
  _id: string;

  name?: string;

  firstName?: string;

  lastName?: string;

  email?: string;

  avatar?: string;

  profileImage?: {
    path?: string;
    publicId?: string;
  };
}

// ============================================================
// MAIN NOTIFICATION
// ============================================================

export interface AppNotification {
  _id: string;

  recipient: string;

  sender?: NotificationSender | null;

  type: NotificationType;

  message: string;

  isRead: boolean;

  relatedEntityId?: string;

  relatedEntityType?: NotificationEntityType;

  createdAt: string;

  updatedAt: string;
}

// ============================================================
// BACKWARD COMPATIBILITY
// ============================================================

export type Notification = AppNotification;

// ============================================================
// GET NOTIFICATIONS
// ============================================================

export interface GetNotificationsResponse {
  success: boolean;

  data: AppNotification[];

  message?: string;
}

// ============================================================
// UNREAD COUNT
// ============================================================

export interface GetUnreadCountResponse {
  success: boolean;

  data: {
    count: number;
  };

  message?: string;
}

// ============================================================
// MARK ONE AS READ
// ============================================================

export interface MarkNotificationReadResponse {
  success: boolean;

  data: AppNotification;

  message?: string;
}

// ============================================================
// MARK ALL AS READ
// ============================================================

export interface MarkAllNotificationsReadResponse {
  success: boolean;

  message: string;

  data?: {
    modifiedCount?: number;
  };
}

// ============================================================
// DELETE ONE
// Reserved for future backend CRUD
// ============================================================

export interface DeleteNotificationResponse {
  success: boolean;

  message: string;
}

// ============================================================
// CLEAR ALL
// Reserved for future backend CRUD
// ============================================================

export interface ClearAllNotificationsResponse {
  success: boolean;

  message: string;
}
