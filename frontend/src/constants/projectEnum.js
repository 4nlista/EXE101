// Trạng thái bài đăng dự án
export const PROJECT_STATUS = {
  OPEN: 'open',             // Đang mở tuyển thành viên
  CLOSED: 'closed',         // Đã đóng (đủ slot hoặc hết deadline)
  IN_PROGRESS: 'in_progress', // Đang thực hiện
  COMPLETED: 'completed',     // Kết thúc dự án
  CANCELLED: 'cancelled'      // Đã hủy (chỉ khi chưa có ai tham gia)
};
