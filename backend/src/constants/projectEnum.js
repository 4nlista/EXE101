// Trạng thái bài đăng dự án
const PROJECT_STATUS = {
  OPEN: 'open',             // Đang mở tuyển thành viên
  CLOSED: 'closed',         // Đã đóng (đủ slot hoặc hết deadline)
  IN_PROGRESS: 'in_progress', // Đang được tem thực hiện
  COMPLETED: 'completed',     // Kết thúc dự án để được đánh giá reviews
  CANCELLED: 'cancelled'      // Đã hủy (chỉ khi chưa có ai tham gia)
};

module.exports = { PROJECT_STATUS };
