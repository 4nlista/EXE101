const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Route tạo ảnh QR (yêu cầu đăng nhập)
router.post('/create_payment', verifyToken, paymentController.createPaymentUrl);

// Route cho Client gọi ngầm kiểm tra trạng thái thanh toán (yêu cầu đăng nhập)
router.get('/status/:orderId', verifyToken, paymentController.checkPaymentStatus);

// Route Webhook cho SePay bắn về (không có Auth của user vì SePay gọi ẩn)
router.post('/sepay_webhook', paymentController.sepayWebhook);

// Route giả lập thanh toán (dành cho môi trường DEV/TEST)
router.post('/mock_payment', verifyToken, paymentController.mockPayment);

module.exports = router;
