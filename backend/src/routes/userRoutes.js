const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

// [PUT] Cập nhật thiết lập hồ sơ 4 bước
// Yêu cầu phải đăng nhập (có Token hợp lệ) -> dùng verifyToken
router.put('/profile/setup', verifyToken, userController.setupProfile);

module.exports = router;
