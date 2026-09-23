const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireAuth } = require('../middlewares/authMiddleware');

// Route tạo ảnh QR (yêu cầu đăng nhập)
router.post('/create_payment', requireAuth, paymentController.createPaymentUrl);

// Route cho Client gọi ngầm kiểm tra trạng thái thanh toán (yêu cầu đăng nhập)
router.get('/status/:orderId', requireAuth, paymentController.checkPaymentStatus);

// Route Webhook cho SePay bắn về (không có Auth của user vì SePay gọi ẩn)
router.post('/sepay_webhook', paymentController.sepayWebhook);

module.exports = router;
