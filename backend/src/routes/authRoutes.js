const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// [POST] Đăng nhập
router.post('/login', authController.login);

// [POST] Đăng ký (Tạo OTP)
router.post('/register', authController.register);

// [POST] Xác thực OTP (Tạo User)
router.post('/verify-otp', authController.verifyOtp);

// [POST] Đăng nhập bằng Google
router.post('/login-google', authController.loginGoogle);

// [POST] Quên mật khẩu (Gửi OTP về email)
router.post('/forgot-password', authController.forgotPassword);

// [POST] Xác thực OTP quên mật khẩu
router.post('/verify-forgot-otp', authController.verifyForgotOtp);

// [POST] Đặt lại mật khẩu mới
router.post('/reset-password', authController.resetPassword);

module.exports = router;
