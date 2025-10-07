// Notification types
export interface Notification {
  id: number;
  type: string; // 'service_request', 'reminder', 'warranty_expiry', etc.
  title: string;
  message: string;
  user_id?: number;
  recipient_roles?: string; // 'admin,manager'
  sender_id?: number;
  notifiable_type?: string;
  notifiable_id?: number;
  additional_data?: string; // key=value|key=value
  is_read: boolean;
  read_at?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_recurring: boolean;
  scheduled_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  user?: any;
  sender?: any;
}

export interface CreateNotificationData {
  type: string;
  title: string;
  message: string;
  user_id?: number;
  recipient_roles?: string;
  notifiable_type?: string;
  notifiable_id?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_at?: string;
  expires_at?: string;
}

