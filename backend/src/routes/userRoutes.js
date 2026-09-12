const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middlewares/authMiddleware');

// [PUT] Cập nhật thiết lập hồ sơ 4 bước
// Yêu cầu phải đăng nhập (có Token hợp lệ) -> dùng verifyToken
router.put('/onboarding', verifyToken, profileController.updateOnboardingProfile);

module.exports = router;
