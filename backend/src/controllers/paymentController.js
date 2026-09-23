const paymentService = require('../services/paymentService');

// POST /api/payment/create_payment
// Người dùng click mua gói -> Trả về mã QR
exports.createPaymentUrl = async (req, res, next) => {
  try {
    const data = await paymentService.createPaymentUrl(req);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// GET /api/payment/status/:orderId
// API để frontend gọi lặp lại (Polling) kiểm tra xem thanh toán xong chưa
exports.checkPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const data = await paymentService.checkPaymentStatus(orderId);
    res.status(200).json({ success: true, status: data.status });
  } catch (error) {
    next(error);
  }
};

// POST /api/payment/sepay_webhook
// API để SePay gọi tới mỗi khi nhận được tiền
exports.sepayWebhook = async (req, res) => {
  try {
    const apiKey = req.headers['authorization']?.split(' ')[1];
    
    // Nếu có cài API Key trong môi trường thì phải check xem SePay bắn có đúng Key không
    if (process.env.SEPAY_API_KEY && apiKey !== process.env.SEPAY_API_KEY) {
      return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
    }

    const result = await paymentService.sepayWebhook(req);
    // SePay yêu cầu trả HTTP Status 200 kèm JSON { success: true }
    res.status(200).json(result);
  } catch (error) {
    console.error('SePay Webhook Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// POST /api/payment/mock_payment
// API giả lập thanh toán thành công (Chỉ dùng cho môi trường Test/Dev)
exports.mockPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    
    // Lấy thông tin order
    const paymentService = require('../services/paymentService');
    const { Transaction } = require('../models');
    const transaction = await Transaction.findById(orderId);
    
    if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Giả mạo dữ liệu webhook
    const mockReq = {
      body: {
        transferAmount: transaction.amount,
        transferType: 'in',
        content: `EXE101 ${orderId}`,
        code: `MOCK_${Date.now()}`,
        transactionDate: new Date().toISOString()
      }
    };

    const result = await paymentService.sepayWebhook(mockReq);
    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};
