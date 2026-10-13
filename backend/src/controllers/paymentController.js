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

// GET /api/payment/transaction/:orderId
exports.getTransactionInfo = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id || req.user._id;
    const data = await paymentService.getTransactionInfo(orderId, userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// POST /api/payment/cancel
exports.cancelPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id || req.user._id;
    const result = await paymentService.cancelPayment(orderId, userId);
    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

// GET /api/payment/my-transactions
// Lấy lịch sử giao dịch thành công của user
exports.getMyTransactions = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const userId = req.user.id || req.user._id;
    const transactions = await paymentService.getMyTransactions(userId, from, to);
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

// POST /api/payment/sepay_webhook
// API để SePay gọi tới mỗi khi nhận được tiền
exports.sepayWebhook = async (req, res) => {
  try {
    // Ghi log an toàn: Chỉ ghi nhận các thông tin cơ bản, tuyệt đối không in Authorization header hay req.body (chứa số dư tài khoản accumulated)
    console.log(`🔔 [SePay Webhook] Nhận yêu cầu: Gateway=${req.body?.gateway || 'N/A'}, Amount=${req.body?.transferAmount || 0}`);

    // Lấy API key từ các kiểu header phổ biến (Apikey, Bearer, raw key hoặc x-api-key)
    const authHeader = req.headers['authorization'] || req.headers['x-api-key'] || '';
    let incomingKey = authHeader.trim();
    if (incomingKey.toLowerCase().startsWith('apikey ') || incomingKey.toLowerCase().startsWith('bearer ')) {
      incomingKey = incomingKey.split(' ')[1]?.trim();
    }

    // Nếu trên server có cấu hình SEPAY_API_KEY
    if (process.env.SEPAY_API_KEY && process.env.SEPAY_API_KEY.trim()) {
      const expectedKey = process.env.SEPAY_API_KEY.trim();
      // Nếu SePay có gửi key nhưng không khớp (không in raw secret key ra log để bảo mật)
      if (incomingKey && incomingKey !== expectedKey) {
        console.warn('❌ [SePay Webhook] Từ chối: API Key không khớp hoặc không hợp lệ!');
        return res.status(401).json({ success: false, message: 'Unauthorized Webhook: API Key không khớp' });
      }
    }

    const result = await paymentService.sepayWebhook(req);
    // SePay yêu cầu trả HTTP Status 200 kèm JSON { success: true }
    console.log('✅ [SePay Webhook] Xử lý thành công:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ [SePay Webhook Error]:', error);
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
    const Transaction = require('../models/Transaction');
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
