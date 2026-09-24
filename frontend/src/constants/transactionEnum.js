// Trạng thái giao dịch thanh toán
export const TRANSACTION_STATUS = {
  PENDING: 'pending',   // Đang chờ xử lý thanh toán
  SUCCESS: 'success',   // Thanh toán thành công
  FAILED: 'failed',     // Thanh toán thất bại
  REFUNDED: 'refunded'  // Đã hoàn tiền
};

// Phương thức thanh toán
export const PAYMENT_METHOD = {
  SEPAY: 'sepay'    // Thanh toán qua VietQR SePay
};
