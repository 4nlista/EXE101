const Notification = require('../models/Notification');

// Lấy danh sách thông báo của User
const getNotifications = async (userId, limit = 20, skip = 0, filter = 'ALL') => {
  const query = { userId };
  
  if (filter === 'UNREAD') {
    query.isRead = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Notification.countDocuments(query);
  
  return {
    notifications,
    total,
    hasMore: total > skip + notifications.length
  };
};

// Đếm số lượng thông báo chưa đọc
const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ userId, isRead: false });
  return count;
};

// Đánh dấu 1 thông báo đã đọc
const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { returnDocument: 'after' }
  );
  
  if (!notification) {
    throw new Error('Không tìm thấy thông báo');
  }
  
  return notification;
};

// Đánh dấu tất cả thông báo đã đọc
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
  
  return result;
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
