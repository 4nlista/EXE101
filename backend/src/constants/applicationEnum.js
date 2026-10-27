// Trạng thái hồ sơ ứng tuyển
const APPLICATION_STATUS = {
  PENDING: 'pending',     // Chưa xử lý - đang chờ duyệt
  APPROVED: 'approved',   // Đã duyệt - chấp nhận ứng viên
  REJECTED: 'rejected',   // Đã từ chối ứng viên
  INVITED: 'invited',     // Được mời tham gia dự án
  EXPIRED: 'expired',     // Đã hết hạn (quá deadline dự án)
  CANCELLED: 'cancelled'  // Dự án đã bị hủy
};

// Các hành động xử lý đơn ứng tuyển
const APPLICATION_ACTION = {
  APPLY: 'apply',         // Ứng viên nộp hồ sơ
  APPROVE: 'approve',     // Duyệt đơn ứng viên
  REJECT: 'reject',       // Từ chối đơn ứng viên
  INVITE: 'invite',       // Gửi lời mời tham gia
  CANCEL: 'cancel',       // Hủy đơn ứng tuyển
  ACCEPT: 'accept',       // Chấp nhận lời mời tham gia
  DECLINE: 'decline',     // Từ chối lời mời tham gia
  AI_MATCH: 'ai_match'    // Đánh giá độ phù hợp bằng AI
};

module.exports = { APPLICATION_STATUS, APPLICATION_ACTION };
