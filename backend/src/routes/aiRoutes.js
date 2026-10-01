const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Middleware verifyToken để kiểm tra token
const { verifyToken } = require('../middlewares/authMiddleware');

// Route test kết nối
router.get('/test', aiController.testConnection);

// Route đề xuất dự án (Dành cho VIP / PREMIUM)
router.post('/recommend-projects', verifyToken, aiController.recommendProjects);

// Route phân tích độ phù hợp của ứng viên (Dành cho PREMIUM)
router.post('/match-applicant/:applicationId', verifyToken, aiController.matchApplicant);

// Route Admin Chat (Dành cho Admin)
router.post('/admin-chat', verifyToken, aiController.adminChat);

module.exports = router;
