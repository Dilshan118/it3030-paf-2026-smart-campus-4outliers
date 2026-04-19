// MEMBER 4: Notification API calls
import api from './axiosConfig';

// Get paginated notifications
export const getNotifications = (page = 0, size = 20) =>
  api.get('/notifications', { params: { page, size } }).then(res => res.data);

// Get unread notification count
export const getUnreadCount = () =>
  api.get('/notifications/unread-count').then(res => res.data);

// Mark notification as read
export const markAsRead = (id) =>
  api.patch(`/notifications/${id}/read`).then(res => res.data);

// Mark all notifications as read
export const markAllAsRead = () =>
  api.patch('/notifications/read-all').then(res => res.data);

// Delete notification
export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`).then(res => res.data);

// Get notification preferences
export const getPreferences = () =>
  api.get('/notifications/preferences').then(res => res.data);

// Update notification preferences
export const updatePreferences = (data) =>
  api.put('/notifications/preferences', data).then(res => res.data);
