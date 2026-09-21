// Loại thông báo
const NOTIFICATION_TYPE = {
  APPLICATION: 'application',           // Có người nộp hồ sơ vào dự án của bạn
  APPROVED: 'approved',                 // Hồ sơ ứng tuyển được duyệt
  REJECTED: 'rejected',                 // Hồ sơ ứng tuyển bị từ chối
  FRIEND_REQUEST: 'friend_request',     // Có người gửi lời mời kết bạn
  FRIEND_ACCEPTED: 'friend_accepted',   // Lời mời kết bạn được chấp nhận
  MESSAGE: 'message',                   // Có tin nhắn mới
  REMIND: 'remind',                     // Nhắc nhở (bài đăng còn 3 ngày hết hạn)
  SUBSCRIPTION: 'subscription',         // Liên quan đến gói đăng ký
  SYSTEM: 'system',                     // Thông báo hệ thống từ Admin
  INVITATION: 'invitation',             // Được mời tham gia dự án
  INVITATION_ACCEPTED: 'invitation_accepted', // Ứng viên chấp nhận lời mời tham gia
  MEMBER_KICKED: 'member_kicked'        // Bị kick khỏi dự án
};

module.exports = { NOTIFICATION_TYPE };
