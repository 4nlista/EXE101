// Trạng thái giao dịch thanh toán
const TRANSACTION_STATUS = {
  PENDING: 'pending',   // Đang chờ xử lý thanh toán
  SUCCESS: 'success',   // Thanh toán thành công
  FAILED: 'failed',     // Thanh toán thất bại
  REFUNDED: 'refunded'  // Đã hoàn tiền (xử lý thủ công)
};

// Phương thức thanh toán
const PAYMENT_METHOD = {
  SEPAY: 'sepay'    // Thanh toán chuyển khoản qua mã VietQR (SePay)
};

module.exports = { TRANSACTION_STATUS, PAYMENT_METHOD };
