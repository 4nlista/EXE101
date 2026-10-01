const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Middleware protect để kiểm tra token
const { protect } = require('../middlewares/authMiddleware');

// Route test kết nối
router.get('/test', aiController.testConnection);

// Route đề xuất dự án (Dành cho VIP / PREMIUM)
router.post('/recommend-projects', protect, aiController.recommendProjects);

// Route phân tích độ phù hợp của ứng viên (Dành cho PREMIUM)
router.post('/match-applicant/:applicationId', protect, aiController.matchApplicant);

// Route Admin Chat (Dành cho Admin)
router.post('/admin-chat', protect, aiController.adminChat);

module.exports = router;
