// Gói đăng ký người dùng
const PACKAGE_TYPE = {
  FREE: 'free',         // Gói thường - 0k
  VIP: 'vip',           // Gói VIP - 59k/tháng
  PREMIUM: 'premium'    // Gói Premium - 139k/tháng
};

// Trạng thái subscription
const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',       // Đang hoạt động
  EXPIRED: 'expired',     // Đã hết hạn
  CANCELLED: 'cancelled'  // Đã hủy
};

module.exports = { PACKAGE_TYPE, SUBSCRIPTION_STATUS };
