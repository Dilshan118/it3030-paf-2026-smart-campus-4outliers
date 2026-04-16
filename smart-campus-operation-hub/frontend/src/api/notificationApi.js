// MEMBER 4: Notification API calls
import api from './axiosConfig';

// Get paginated notifications
export const getNotifications = (page = 0, size = 20) => {
  return api.get('/notifications', {
    params: { page, size }
  });
};

// Get unread notification count
export const getUnreadCount = () => {
  return api.get('/notifications/unread-count');
};

// Mark notification as read
export const markAsRead = (id) => {
  return api.patch(`/notifications/${id}/read`);
};

// Mark all notifications as read
export const markAllAsRead = () => {
  return api.patch('/notifications/read-all');
};

// Delete notification
export const deleteNotification = (id) => {
  return api.delete(`/notifications/${id}`);
};

// Get notification preferences
export const getPreferences = () => {
  return api.get('/notifications/preferences');
};

// Update notification preferences
export const updatePreferences = (data) => {
  return api.put('/notifications/preferences', data);
};
