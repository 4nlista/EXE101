const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

// Áp dụng middleware xác thực token cho tất cả API thông báo
router.use(verifyToken);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
