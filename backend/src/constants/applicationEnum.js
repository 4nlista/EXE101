// Trạng thái hồ sơ ứng tuyển
const APPLICATION_STATUS = {
  PENDING: 'pending',     // Chưa xử lý - đang chờ duyệt
  APPROVED: 'approved',   // Đã duyệt - chấp nhận ứng viên
  REJECTED: 'rejected'    // Đã từ chối ứng viên
};

module.exports = { APPLICATION_STATUS };
