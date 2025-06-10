
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  data?: {
    userId?: number;
    requestId?: number;
    userName?: string;
    userAvatar?: string;
  };
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export interface CreateNotificationPayload {
  type: string;
  title: string;
  message: string;
  data?: Notification['data'];
}
