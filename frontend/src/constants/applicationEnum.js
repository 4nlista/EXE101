// Trạng thái hồ sơ ứng tuyển
export const APPLICATION_STATUS = {
  PENDING: 'pending',     // Chưa xử lý - đang chờ duyệt
  APPROVED: 'approved',   // Đã duyệt - chấp nhận ứng viên
  REJECTED: 'rejected',   // Đã từ chối ứng viên
  INVITED: 'invited',     // Được mời tham gia dự án
  EXPIRED: 'expired',     // Đã hết hạn (quá deadline dự án)
  CANCELLED: 'cancelled'  // Dự án đã bị hủy
};

// Cấu hình nhãn và kiểu hiển thị StatusBadge cho từng trạng thái ứng tuyển
export const APPLICATION_STATUS_BADGE = {
  [APPLICATION_STATUS.PENDING]: { variant: 'warning', text: 'Đang xử lý' },
  [APPLICATION_STATUS.APPROVED]: { variant: 'success', text: 'Đã duyệt' },
  [APPLICATION_STATUS.REJECTED]: { variant: 'danger', text: 'Từ chối' },
  [APPLICATION_STATUS.INVITED]: { variant: 'primary', text: 'Được mời' },
  [APPLICATION_STATUS.EXPIRED]: { variant: 'secondary', text: 'Đã hết hạn' },
  [APPLICATION_STATUS.CANCELLED]: { variant: 'secondary', text: 'Đã hủy' }
};

// Các hành động xử lý đơn ứng tuyển (dành cho Ứng viên và Chủ dự án)
export const APPLICATION_ACTION = {
  APPLY: 'apply',         // Ứng viên nộp hồ sơ
  APPROVE: 'approve',     // Chủ dự án duyệt đơn
  REJECT: 'reject',       // Chủ dự án từ chối đơn
  INVITE: 'invite',       // Chủ dự án gửi lời mời
  CANCEL: 'cancel',       // Ứng viên tự hủy đơn
  ACCEPT: 'accept',       // Ứng viên chấp nhận lời mời tham gia
  DECLINE: 'decline',     // Ứng viên từ chối lời mời tham gia
  AI_MATCH: 'ai_match'    // Đánh giá hồ sơ bằng AI
};

// Các hành động xác nhận thao tác trong trang Quản lý dự án (Modal Action Types)
export const PROJECT_MANAGE_ACTION = {
  APPROVE: 'approve',             // Duyệt đơn ứng viên
  REJECT: 'reject',               // Từ chối đơn ứng viên
  INVITE: 'invite',               // Mời ứng viên
  KICK: 'kick',                   // Xóa thành viên khỏi nhóm
  CHANGE_STATUS: 'change_status'  // Thay đổi trạng thái dự án
};
