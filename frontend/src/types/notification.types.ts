export interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface NotificationResponse {
  success: boolean;
  message?: string;
  data: Notification[];
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

