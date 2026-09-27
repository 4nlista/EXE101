const notificationService = require('../services/notificationService');

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;
    const filter = req.query.filter || 'ALL'; // 'ALL' or 'UNREAD'
    
    const data = await notificationService.getNotifications(userId, limit, skip, filter);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const count = await notificationService.getUnreadCount(userId);
    res.status(200).json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;
    const notification = await notificationService.markAsRead(userId, id);
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const result = await notificationService.markAllAsRead(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
