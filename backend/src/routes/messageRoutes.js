const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Các route yêu cầu đăng nhập
router.use(verifyToken);

// Khởi tạo hoặc lấy conversation 1-1
router.post('/init', messageController.initPersonalConversation);

// Lấy danh sách conversation của user
router.get('/conversations', messageController.getUserConversations);

// Lấy danh sách tin nhắn của 1 conversation
router.get('/:conversationId', messageController.getConversationMessages);

// Gửi tin nhắn
router.post('/:conversationId', messageController.sendMessage);

module.exports = router;
