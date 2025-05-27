// Declare static file modules
declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '*.webm' {
  const src: string;
  export default src;
}

declare module '*.ogg' {
  const src: string;
  export default src;
}

// Notification Typesexport interface Notification {  id?: string;  _id: string; // MongoDB ID  userId: string;  title: string;  message: string;  type: NotificationType;  priority: 'low' | 'medium' | 'high';  actionLink?: string;  metadata?: Record<string, any>;  scheduledFor?: string | null;  expiresAt?: string | null;  read: boolean;  active: boolean;  createdAt: string;  updatedAt: string;}
export interface Notification {
  _id: string; // MongoDB ID
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: 'low' | 'medium' | 'high';
  category?: NotificationCategory;
  actionLink?: string;
  metadata?: Record<string, any>;
  scheduledFor?: string | null;
  expiresAt?: string | null;
  read: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 
  | 'workout_reminder'
  | 'sleep_reminder'
  | 'goal_achieved'
  | 'water_reminder'
  | 'activity_reminder'
  | 'system'
  | 'custom';

// New type for notification categories
export type NotificationCategory =
  | 'achievement'
  | 'workout'
  | 'meal'
  | 'warning'
  | 'alert'
  | 'system'
  | 'info';

export interface NotificationCountResponse {
  count: number;
} 
