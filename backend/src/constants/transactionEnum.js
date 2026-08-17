// Trạng thái giao dịch thanh toán
const TRANSACTION_STATUS = {
  PENDING: 'pending',   // Đang chờ xử lý thanh toán
  SUCCESS: 'success',   // Thanh toán thành công
  FAILED: 'failed'      // Thanh toán thất bại
};

// Phương thức thanh toán
const PAYMENT_METHOD = {
  VNPAY: 'vnpay'    // Thanh toán qua VNPay
};

module.exports = { TRANSACTION_STATUS, PAYMENT_METHOD };
