const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// [POST] Đăng nhập
router.post('/login', authController.login);

// [POST] Đăng ký (Tạo OTP)
router.post('/register', authController.register);

// [POST] Xác thực OTP (Tạo User)
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;
