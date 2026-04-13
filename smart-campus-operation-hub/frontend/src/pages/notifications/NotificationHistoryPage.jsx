import { useState, useEffect } from 'react';
import { Check, Trash2, Clock, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../api/notificationApi';
import { Link } from 'react-router-dom';

export default function NotificationHistoryPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filter, setFilter] = useState('ALL'); // ALL, READ, UNREAD
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const pageSize = 10;

  useEffect(() => {
    fetchNotifications();
  }, [page, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(page, pageSize, filter === 'READ', filter === 'UNREAD');
      const data = response.data.data;
      setNotifications(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      setTotalElements(prev => prev - 1);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      await Promise.all(selectedNotifications.map(id => deleteNotification(id)));
      setNotifications(prev => prev.filter(notif => !selectedNotifications.includes(notif.id)));
      setSelectedNotifications([]);
      setTotalElements(prev => prev - selectedNotifications.length);
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationLink = (notification) => {
    if (notification.referenceType === 'BOOKING') {
      return `/bookings/${notification.referenceId}`;
    } else if (notification.referenceType === 'TICKET') {
      return `/tickets/${notification.referenceId}`;
    }
    return null;
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notification History</h1>
        <p className="text-gray-600 mt-2">View and manage all your notifications</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Notifications</option>
              <option value="UNREAD">Unread Only</option>
              <option value="READ">Read Only</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkDelete}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <Trash2 size={16} />
                <span>Delete Selected ({selectedNotifications.length})</span>
              </button>
            </div>
          )}

          {/* Mark All Read */}
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Check size={16} />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <>
            {/* Select All Checkbox */}
            <div className="p-4 border-b border-gray-200">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Select all ({notifications.length} notifications)
                </span>
              </label>
            </div>

            {/* Notifications */}
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => {
                const link = getNotificationLink(notification);
                const NotificationWrapper = link ? Link : 'div';

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <NotificationWrapper
                          to={link}
                          onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                          className="block"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={`text-sm font-medium text-gray-900 ${
                                !notification.isRead ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <Clock size={12} className="mr-1" />
                                {formatTimeAgo(notification.createdAt)}
                                {notification.referenceType && (
                                  <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full">
                                    {notification.referenceType}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </NotificationWrapper>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalElements)} of {totalElements} notifications
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(prev => Math.max(0, prev - 1))}
                    disabled={page === 0}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={page === totalPages - 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
