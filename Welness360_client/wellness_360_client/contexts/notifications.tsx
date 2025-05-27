'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Notification, NotificationCountResponse } from '@/types/custom';
import { io, Socket } from 'socket.io-client';
import { ToastProvider, useToast } from '@/components/ui/Toast';

// Define context interfaces
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  deleteAllNotifications: () => Promise<boolean>;
  createNotification: (data: Partial<Notification>) => Promise<boolean>;
  requestNotificationPermission: () => Promise<NotificationPermission | null>;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

// Cache timeout (5 minutes)
const CACHE_TIMEOUT = 5 * 60 * 1000;

// Socket.io connection URL - use a function to get it safely on the client side
const getSocketUrl = () => {
  if (typeof window === 'undefined') return null;
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("NEXT_PUBLIC_API_URL is not defined");
    return null;
  }
  
  return apiUrl;
};

// Create context with undefined initial value
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// We'll wrap our provider to include toast functionality
export const NotificationProviderWithToast: React.FC<NotificationProviderProps> = ({ children }) => {
  return (
    <ToastProvider>
      <NotificationProviderInner>{children}</NotificationProviderInner>
    </ToastProvider>
  );
};

// Inner provider that can use the toast context
const NotificationProviderInner: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isClientSide, setIsClientSide] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  const { showToast } = useToast();

  // Refs for caching and throttling
  const lastFetchTime = useRef<number>(0);
  const fetchPromise = useRef<Promise<void> | null>(null);
  const lastCountFetchTime = useRef<number>(0);
  const fetchCountPromise = useRef<Promise<void> | null>(null);
  const fetchInProgress = useRef<boolean>(false);

  // Handle client-side only code
  useEffect(() => {
    setIsClientSide(true);
  }, []);

  // Connect to Socket.io for real-time notifications
  useEffect(() => {
    if (!isClientSide) return; // Skip on server-side rendering
    
    let socketInstance: Socket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    
    // Check if user is authenticated by calling our API endpoint
    const checkAuthentication = async () => {
      try {
        const response = await fetch('/api/auth/socket');
        if (!response.ok) return null;
        
        const data = await response.json();
        if (!data.authenticated || !data.userId) return null;
        
        return data.userId;
      } catch (err) {
        console.error("Error checking authentication:", err);
        return null;
      }
    };

    // Connect to socket if user is authenticated
    const connectToSocket = async () => {
      const userId = await checkAuthentication();
      if (!userId) return;
      
      const apiUrl = getSocketUrl();
      if (!apiUrl) return;

      const connectSocket = () => {
        try {
          // Clear any previous connection
          if (socketInstance) {
            socketInstance.disconnect();
          }
          
          // Create new connection with auto-reconnect options
          socketInstance = io(apiUrl, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 10000,
            transports: ['websocket', 'polling']
          });
          
          // Connection handlers
          socketInstance.on('connect', () => {
            setReconnectAttempts(0);
            
            // Authenticate with user ID from our API
            if (userId && socketInstance) {
              socketInstance.emit('authenticate', { userId });
            }
            
            if (socketInstance) {
              setSocket(socketInstance);
            }
          });
          
          // Handle notifications
          socketInstance.on('receive-notification', (notification) => {
            // Add to notifications list
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show browser notification if supported and permission granted
            if ('Notification' in window && window.Notification.permission === 'granted') {
              new window.Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico'
              });
            }
            
            // Show toast notification
            showToast({
              title: notification.title || 'New Notification',
              message: notification.message || '',
              type: getNotificationType(notification),
              category: notification.category || notification.type,
              icon: getNotificationIcon(notification),
              duration: 5000 // 5 seconds
            });
          });
          
          // Handle errors
          socketInstance.on('connect_error', (error) => {
            console.error("Socket.io connection error:", error);
            setError('Socket.io connection error');
          });
          
          socketInstance.on('disconnect', (reason) => {
            setSocket(null);
            
            if (reason === 'io server disconnect' && socketInstance) {
              // The server has forcefully disconnected the socket
              socketInstance.connect();
            }
          });
          
        } catch (err) {
          console.error("Error creating Socket.io connection:", err);
          // Attempt to reconnect after delay
          reconnectTimeout = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectSocket();
          }, 5000);
        }
      };
      
      connectSocket();
    };
    
    connectToSocket();
    
    return () => {
      if (socketInstance) {
        // Properly disconnect from Socket.io
        try {
          socketInstance.offAny(); // Remove all listeners
          socketInstance.disconnect();
        } catch (err) {
          console.error("Error disconnecting Socket.io:", err);
        }
      }
      
      // Clear any pending reconnect attempts
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      
      // Reset state
      setSocket(null);
      setReconnectAttempts(0);
    };
  }, [isClientSide, showToast]); // Added showToast to dependencies

  // Helper function to determine notification type for toast
  const getNotificationType = (notification: Notification) => {
    // If no category specified, try to determine from notification type
    if (!notification.category) {
      // Map notification types to toast types
      switch (notification.type) {
        case 'goal_achieved':
          return 'success';
        case 'workout_reminder':
        case 'sleep_reminder':
        case 'water_reminder':
        case 'activity_reminder':
          return 'info';
        case 'system':
          return 'warning';
        default:
          return 'info';
      }
    }
    
    // Map notification categories to toast types
    switch (notification.category) {
      case 'achievement':
        return 'success';
      case 'warning':
        return 'warning';
      case 'alert':
        return 'error';
      default:
        return 'info';
    }
  };

  // Helper function to get notification icon
  const getNotificationIcon = (notification: Notification) => {
    // If no category specified, try to determine from notification type
    if (!notification.category) {
      // Map notification types to icons
      switch (notification.type) {
        case 'goal_achieved':
          return <span role="img" aria-label="trophy">🏆</span>;
        case 'workout_reminder':
          return <span role="img" aria-label="exercise">🏃</span>;
        case 'water_reminder':
          return <span role="img" aria-label="water">💧</span>;
        case 'sleep_reminder':
          return <span role="img" aria-label="sleep">😴</span>;
        case 'activity_reminder':
          return <span role="img" aria-label="activity">⚡</span>;
        case 'system':
          return <span role="img" aria-label="system">🔧</span>;
        default:
          return <span role="img" aria-label="notification">📬</span>;
      }
    }
    
    // You can return different icons based on notification type
    switch (notification.category) {
      case 'achievement':
        return <span role="img" aria-label="trophy">🏆</span>;
      case 'workout':
        return <span role="img" aria-label="exercise">🏃</span>;
      case 'meal':
        return <span role="img" aria-label="food">🍎</span>;
      case 'warning':
        return <span role="img" aria-label="warning">⚠️</span>;
      case 'alert':
        return <span role="img" aria-label="alert">🔔</span>;
      default:
        return <span role="img" aria-label="notification">📬</span>;
    }
  };

  // Fetch all notifications with optional pagination and caching
  const fetchNotifications = useCallback(async (page?: number, limit?: number) => {
    // If a fetch is already in progress, return the existing promise
    if (fetchInProgress.current && fetchPromise.current) {
      return fetchPromise.current;
    }
    
    // Check if we have recently fetched data and can use cache
    const now = Date.now();
    if (now - lastFetchTime.current < CACHE_TIMEOUT && notifications.length > 0) {
      return Promise.resolve();
    }
    
    // Set flag to prevent concurrent fetches
    fetchInProgress.current = true;
    setLoading(true);
    setError(null);
    
    // Create a new fetch promise and store it
    fetchPromise.current = (async () => {
      try {
        // Build query params for pagination only
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page.toString());
        if (limit) queryParams.append('limit', limit.toString());
        
        const response = await fetch(`/api/notifications?${queryParams.toString()}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch notifications');
        }
        
        const result = await response.json();
        setNotifications(result.data);
        
        // Update cache timestamp
        lastFetchTime.current = Date.now();
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching notifications');
      } finally {
        setLoading(false);
        fetchInProgress.current = false;
        fetchPromise.current = null;
      }
    })();
    
    return fetchPromise.current;
  }, [notifications.length]);

  // Fetch unread notification count with caching
  const fetchUnreadCount = useCallback(async () => {
    // If a fetch is already in progress, return the existing promise
    if (fetchCountPromise.current) {
      return fetchCountPromise.current;
    }
    
    // Check if we have recently fetched data and can use cache
    const now = Date.now();
    if (now - lastCountFetchTime.current < CACHE_TIMEOUT) {
      return Promise.resolve();
    }
    
    // Create a new fetch promise and store it
    fetchCountPromise.current = (async () => {
      try {
        const response = await fetch('/api/notifications/unread-count');
        
        if (!response.ok) {
          throw new Error('Failed to fetch unread count');
        }
        
        const result = await response.json();
        setUnreadCount((result.data as NotificationCountResponse).count);
        
        // Update cache timestamp
        lastCountFetchTime.current = Date.now();
      } catch (err) {
        console.error('Failed to fetch notification count:', err);
      } finally {
        fetchCountPromise.current = null;
      }
    })();
    
    return fetchCountPromise.current;
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    try {
      if (!id) return false;
      
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to mark notification as read');
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Reset cache to ensure fresh data on next fetch
      lastCountFetchTime.current = 0;
      
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      // Reset cache to ensure fresh data on next fetch
      lastCountFetchTime.current = 0;
      
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, []);

  // Delete a notification
  const deleteNotification = useCallback(async (id: string): Promise<boolean> => {
    try {
      if (!id) return false;
      
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete notification');
      }
      
      // Update local state
      const deletedNotification = notifications.find(n => n._id === id);
      
      setNotifications(prev => prev.filter(notification => notification._id !== id));
      
      // Update unread count if the deleted notification was unread
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        // Reset cache to ensure fresh data on next fetch
        lastCountFetchTime.current = 0;
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, [notifications]);

  // Delete all notifications
  const deleteAllNotifications = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete all notifications');
      }
      
      // Update local state
      setNotifications([]);
      setUnreadCount(0);
      
      // Reset cache to ensure fresh data on next fetch
      lastFetchTime.current = 0;
      lastCountFetchTime.current = 0;
      
      return true;
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      return false;
    }
  }, []);

  // Create a notification (for testing)
  const createNotification = useCallback(async (data: Partial<Notification>): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create notification');
      }
      
      // Reset cache to ensure fresh data on next fetch
      lastFetchTime.current = 0;
      lastCountFetchTime.current = 0;
      
      // Refresh notifications list
      await fetchNotifications();
      
      return true;
    } catch (err) {
      console.error('Error creating notification:', err);
      return false;
    }
  }, [fetchNotifications]);

  // Request notification permission (triggered by user interaction)
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission | null> => {
    if (!isClientSide || !('Notification' in window)) {
      return null;
    }

    try {
      const permission = await window.Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return null;
    }
  }, [isClientSide]);

  // Initial data loading - only fetch once on component mount
  useEffect(() => {
    if (isClientSide) {
      // Only fetch if we haven't already
      const fetchInitialData = async () => {
        // Fetch in sequence to avoid race conditions
        await fetchNotifications();
        await fetchUnreadCount();
      };
      fetchInitialData();
    }
    // We deliberately exclude fetchNotifications and fetchUnreadCount from dependencies
    // to prevent refetching when these functions change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClientSide]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    createNotification,
    requestNotificationPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Update the export to use the wrapper
export const NotificationProvider = NotificationProviderWithToast;

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 