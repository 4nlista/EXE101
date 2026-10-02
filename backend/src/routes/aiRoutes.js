const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Middleware verifyToken để kiểm tra token
const { verifyToken } = require('../middlewares/authMiddleware');

const aiChatController = require('../controllers/aiChatController');

// Route test kết nối
router.get('/test', aiController.testConnection);

// ROUTE MỚI: AI CHAT SESSION có lưu các TAB lịch sử cuộc trò chuyện
router.get('/sessions', verifyToken, aiChatController.getSessions);
router.post('/sessions', verifyToken, aiChatController.createSession);
router.get('/sessions/:sessionId', verifyToken, aiChatController.getSessionById);
router.delete('/sessions/:sessionId', verifyToken, aiChatController.deleteSession);
router.post('/sessions/:sessionId/messages', verifyToken, aiChatController.sendMessage);

// Route đề xuất dự án (Dành cho VIP / PREMIUM) - SẼ SỚM BỎ ĐI
router.post('/recommend-projects', verifyToken, aiController.recommendProjects);

// Route phân tích độ phù hợp của ứng viên (Dành cho PREMIUM)
router.post('/match-applicant/:applicationId', verifyToken, aiController.matchApplicant);

// Route Admin Chat (Dành cho Admin)
router.post('/admin-chat', verifyToken, aiController.adminChat);

module.exports = router;
