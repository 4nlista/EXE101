const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Các route yêu cầu đăng nhập
router.use(verifyToken);

// Khởi tạo hoặc lấy conversation 1-1
router.post('/init', messageController.initPersonalConversation);

// Lấy tổng số lượng tin nhắn chưa đọc
router.get('/unread-count', messageController.getTotalUnreadCount);

// Lấy danh sách conversation của user
router.get('/conversations', messageController.getUserConversations);

// Lấy danh sách tin nhắn của 1 conversation
router.get('/:conversationId', messageController.getConversationMessages);

// Gửi tin nhắn
router.post('/:conversationId', messageController.sendMessage);

// Thu hồi tin nhắn
router.put('/:id/revoke', messageController.revokeMessage);

// Xóa đoạn chat (ẩn với user)
router.put('/conversations/:id/clear', messageController.clearConversation);

// Đánh dấu đã xem toàn bộ tin nhắn
router.put('/conversations/:id/read', messageController.markConversationAsRead);

module.exports = router;
