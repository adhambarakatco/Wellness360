'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/contexts/notifications';

const NotificationPermission: React.FC = () => {
  const { requestNotificationPermission } = useNotifications();
  const [permissionStatus, setPermissionStatus] = useState<string | null>(
    typeof Notification !== 'undefined' ? Notification.permission : null
  );
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    try {
      setIsRequesting(true);
      const permission = await requestNotificationPermission();
      setPermissionStatus(permission || 'denied');
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  // Don't render anything if notifications aren't supported
  if (typeof Notification === 'undefined') {
    return null;
  }

  // Already granted - no need to show button
  if (permissionStatus === 'granted') {
    return null;
  }

  return (
    <div className="p-3 mb-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-sm">Enable Notifications</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Stay up to date with real-time notifications
          </p>
        </div>
        <button 
          className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={handleRequestPermission}
          disabled={isRequesting || permissionStatus === 'denied'}
        >
          {isRequesting ? 'Requesting...' : 'Enable'}
        </button>
      </div>
      {permissionStatus === 'denied' && (
        <p className="mt-2 text-xs text-red-500">
          Notifications are blocked. Please update your browser settings to enable them.
        </p>
      )}
    </div>
  );
};

export default NotificationPermission; 