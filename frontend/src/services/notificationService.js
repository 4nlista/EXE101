import axiosClient from '../utils/axiosClient';

const notificationService = {
  getNotifications: (params) => {
    return axiosClient.get('/notifications', { params });
  },

  getUnreadCount: () => {
    return axiosClient.get('/notifications/unread-count');
  },

  markAsRead: (id) => {
    return axiosClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: () => {
    return axiosClient.patch('/notifications/read-all');
  }
};

export default notificationService;
