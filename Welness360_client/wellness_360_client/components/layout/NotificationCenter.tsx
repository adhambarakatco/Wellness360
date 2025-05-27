'use client';

import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, X, Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/contexts/notifications';


export default function NotificationCenter() {
  
  // Wrap the hook usage in try/catch to prevent breaking the component
  let notificationData: any = { 
    notifications: [], 
    unreadCount: 0, 
    loading: true, 
    error: null,
    fetchNotifications: async () => {},
    markAsRead: async () => false,
    markAllAsRead: async () => false,
    deleteNotification: async () => false
  };

  try {
    notificationData = useNotifications();
  } catch (error) {
    console.error("Error using notifications hook:", error);
  }
  
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = notificationData;
  
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Add an effect to fetch notifications when component mounts
  useEffect(() => {
    // Fetch notifications when component mounts (use default pagination)
    fetchNotifications();
  }, [fetchNotifications]);
  
  // Handle click outside to close notifications panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle notification open/close
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Refresh notifications when opening
      fetchNotifications();
    }
  };
  
  // Handle marking notification as read
  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const success = await markAsRead(id);
  };
  
  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };
  
  // Handle deleting a notification
  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await deleteNotification(id);
  };
  
  // Determine category color
  const getCategoryColor = (notification: any) => {
    // Use category if available
    if (notification.category) {
      switch (notification.category) {
        case 'achievement':
          return 'bg-green-500';
        case 'meal':
          return 'bg-green-500';
        case 'workout':
          return 'bg-green-500';
        case 'warning':
          return 'bg-green-500';
        case 'alert':
          return 'bg-green-500';
        default:
          return 'bg-green-500';
      }
    }
    
    // Fall back to priority
    switch (notification.priority) {
      case 'high': 
        return 'bg-green-500';
      case 'medium':
        return 'bg-green-400';
      default:
        return 'bg-green-300';
    }
  };
  
  // Determine icon based on notification type/category
  const getNotificationIcon = (notification: any) => {
    // First check category
    if (notification.category) {
      switch (notification.category) {
        case 'achievement':
          return '🏆';
        case 'workout':
          return '🏃';
        case 'meal':
          return '🍎';
        case 'warning':
          return '⚠️';
        case 'alert':
          return '🔔';
      }
    }
    
    // Fall back to type
    switch (notification.type) {
      case 'workout_reminder':
        return '🏋️';
      case 'sleep_reminder':
        return '😴';
      case 'goal_achieved':
        return '🎯';
      case 'water_reminder':
        return '💧';
      case 'activity_reminder':
        return '🏃';
      case 'system':
        return '🔔';
      default:
        return '📝';
    }
  };
  
  // Render a single notification item
  const renderNotificationItem = (notification: any) => {
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
    const categoryColor = getCategoryColor(notification);
    const icon = getNotificationIcon(notification);
    
    // Create notification content
    const NotificationContent = () => (
      <div 
        className={`p-4 border-b border-black/20 hover:bg-black/40 transition-all ${
          !notification.read ? 'bg-black/50' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 flex items-center justify-center text-lg rounded-full bg-black/60 border border-green-500/30">
              {icon}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-medium text-white pr-1 truncate">{notification.title}</h4>
              <span className={`flex-shrink-0 w-2 h-2 mt-1.5 rounded-full ${!notification.read ? categoryColor : 'bg-transparent'}`}></span>
            </div>
            
            <p className="text-xs text-gray-300 mb-2 line-clamp-2">{notification.message}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="italic">{timeAgo}</span>
              
              <div className="flex -space-x-1">
                {!notification.read && (
                  <button 
                    onClick={(e) => handleMarkAsRead(notification._id, e)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-green-400 hover:bg-black/50 transition-all"
                    title="Mark as read"
                    type="button"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={(e) => handleDeleteNotification(notification._id, e)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-red-400 hover:bg-black/50 transition-all"
                  title="Delete notification"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    
    // Wrap with div instead of Link to disable navigation while keeping UI intact
    return notification.actionLink ? (
      <div className="relative">
        <div 
          className="block cursor-pointer"
          onClick={(e) => {
            // If clicking on one of the buttons, don't do anything special
            if ((e.target as HTMLElement).closest('button')) {
              return;
            }
            // Otherwise just mark as read without navigating
            if (!notification.read) {
              markAsRead(notification._id);
            }
          }}
        >
          <NotificationContent />
        </div>
      </div>
    ) : (
      <div>
        <NotificationContent />
      </div>
    );
  };

  return (
    <div className="relative" ref={notificationRef}>
      {/* Notification Bell Button */}
      <button
        onClick={toggleNotifications}
        className="relative p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-green-500 text-white rounded-full text-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-black/95 backdrop-blur-sm border border-green-500/20 rounded-lg shadow-xl z-50 max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-green-500/20 bg-black/70">
            <h3 className="text-sm font-medium text-white flex items-center">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-green-500 text-xs rounded-full px-2 py-0.5 text-black font-semibold">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs flex items-center text-gray-300 hover:text-green-400 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Notification List */}
          <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-green-500/30 scrollbar-track-transparent">
            {loading ? (
              <div className="p-8 flex justify-center items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-green-500"></div>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification: any) => (
                <React.Fragment key={notification._id}>
                  {renderNotificationItem(notification)}
                </React.Fragment>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                <div className="mb-2 text-2xl">📭</div>
                <p>No notifications to display</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-2 border-t border-green-500/20 bg-black/70 text-center">
            <button 
              className="w-full py-1.5 px-3 text-xs text-gray-300 hover:text-green-400 hover:bg-black/70 rounded transition-colors flex items-center justify-center"
              onClick={() => setIsOpen(false)}
            >
              <span>Close notifications</span>
              <X className="ml-1 w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 