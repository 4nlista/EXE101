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
      default: PAYMENT_METHOD.VNPAY
    },
    // Mã giao dịch từ VNPay (dùng để đối soát)
    vnpayTransactionId: {
      type: String
    },
    // Mã phản hồi từ VNPay
    vnpayResponseCode: {
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
    // 'pending' | 'success' | 'failed'
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.PENDING
    }
  },
  { timestamps: true }
);

// Index: tìm giao dịch theo user và mã VNPay
transactionSchema.index({ userId: 1 });
transactionSchema.index({ vnpayTransactionId: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
