const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middlewares/authMiddleware');
const uploadCloud = require('../utils/uploadCloud');

// [PUT] Cập nhật thiết lập hồ sơ 4 bước
// Yêu cầu phải đăng nhập (có Token hợp lệ) -> dùng verifyToken
router.put('/onboarding', verifyToken, uploadCloud.single('avatar'), profileController.updateOnboardingProfile);

module.exports = router;
