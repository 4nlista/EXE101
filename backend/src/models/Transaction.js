const mongoose = require('mongoose');
const { TRANSACTION_STATUS, PAYMENT_METHOD } = require('../constants/transactionEnum');

// Schema lịch sử giao dịch nạp tiền qua VNPay
const transactionSchema = new mongoose.Schema(
  {
    // Người thực hiện giao dịch
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Số tiền giao dịch (VND)
    amount: {
      type: Number,
      required: true
    },
    // Phương thức thanh toán
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.SEPAY
    },
    // Mã giao dịch từ SePay (Reference Code ngân hàng)
    sepayTransactionId: {
      type: String
    },
    // Liên kết với gói đăng ký nào (tùy chọn)
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription'
    },
    // Mô tả giao dịch (ví dụ: "Nạp tiền mua gói VIP")
    description: {
      type: String
    },
    // 'pending' | 'success' | 'failed' | 'refunded'
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.PENDING
    },
    // Ghi chú của Admin (Dùng để note lịch sử xử lý hoàn tiền, lỗi...)
    adminNote: {
      type: String
    }
  },
  { timestamps: true }
);

// Index: tìm giao dịch theo user và mã SePay
transactionSchema.index({ userId: 1 });
transactionSchema.index({ sepayTransactionId: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
