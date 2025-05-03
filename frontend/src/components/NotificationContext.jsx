import React, { createContext, useContext, useEffect } from 'react';
import { showCustomToast } from './CustomToast';
import { Toaster } from 'react-hot-toast';
import { fetchWebsiteNotification, seenWebsiteNotification } from '../lib/api/ApiExtra';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export default function NotificationProvider({ children }) {

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          return; // Exit if the user is not logged in
        }

        const res = await fetchWebsiteNotification();
        if (res.data && res.data.notifications && res.data.notifications.length > 0) {
          const notificationIds = res.data.notifications.map(notification => notification._id);
          /* const userId = res.data.notifications[0].user_id;  */

          res.data.notifications.forEach(notification => {
            showCustomToast(notification.log_message);
          });

          await seenWebsiteNotification(notificationIds);
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
}
