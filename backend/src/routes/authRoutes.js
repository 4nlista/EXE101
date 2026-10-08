const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// [POST] Đăng nhập
router.post('/login', authController.login);

// [POST] Đăng ký (Tạo OTP)
router.post('/register', authController.register);

// [POST] Xác thực OTP (Tạo User)
router.post('/verify-otp', authController.verifyOtp);

// Bắt lỗi khi gọi nhầm method GET thay vì POST cho xác thực OTP
router.get('/verify-otp', (req, res) => {
  res.status(405).json({
    success: false,
    message: 'Endpoint này chỉ hỗ trợ phương thức POST để xác thực OTP.'
  });
});

// [POST] Đăng nhập bằng Google
router.post('/login-google', authController.loginGoogle);

// [POST] Quên mật khẩu (Gửi OTP về email)
router.post('/forgot-password', authController.forgotPassword);

// [POST] Xác thực OTP quên mật khẩu
router.post('/verify-forgot-otp', authController.verifyForgotOtp);

// Bắt lỗi khi gọi nhầm method GET cho xác thực OTP quên mật khẩu
router.get('/verify-forgot-otp', (req, res) => {
  res.status(405).json({
    success: false,
    message: 'Endpoint này chỉ hỗ trợ phương thức POST để xác thực OTP.'
  });
});

// [POST] Đặt lại mật khẩu mới
router.post('/reset-password', authController.resetPassword);

// [PUT] Đổi mật khẩu
router.put('/change-password', verifyToken, authController.changePassword);

module.exports = router;
