# UniVerse AI

> Nền tảng kết nối nhân sự và dự án công nghệ dành cho sinh viên — Tìm đồng đội, ghép nhóm thông minh với sức mạnh AI.

---

## ▸ Giới thiệu

**UniVerse AI** là một nền tảng web giúp **sinh viên** dễ dàng tìm kiếm đồng đội, thành viên và cộng tác viên cho các dự án học tập như đồ án môn học, đồ án tốt nghiệp, bài tập lớn và nghiên cứu khoa học.

Điểm nổi bật của hệ thống là tích hợp **AI Hub** (sử dụng Gemini API) để phân tích độ phù hợp của ứng viên, tối ưu hóa quá trình ghép nhóm và hỗ trợ tìm kiếm tài liệu học tập.

---

## ▸ Tính năng chính

### ◆ Xác thực & Phân quyền

Hệ thống hỗ trợ đăng ký tài khoản qua Email với xác thực OTP, đăng nhập bằng Email/Mật khẩu hoặc liên kết Google, và chức năng quên mật khẩu với quy trình xác minh an toàn.

### ◆ Thiết lập hồ sơ cá nhân

Sau khi đăng ký, người dùng hoàn thiện hồ sơ qua 4 bước: thông tin cá nhân, thông tin học tập (ngành, chuyên ngành, kỳ học), hồ sơ năng lực (kỹ năng chính, lịch sử dự án) và điểm số GPA. Quy trình được thiết kế theo dạng Step Indicator trực quan.

### ◆ Bảng tin dự án

Trang khám phá các bài đăng tuyển thành viên với giao diện chia làm sidebar bộ lọc (ngành, mục tiêu điểm, trạng thái, thời gian) và danh sách dự án dạng card. Mỗi card hiển thị tên ngành, thời hạn, tiêu đề, mô tả ngắn gọn và số lượng tuyển.

### ◆ Đăng tải dự án mới

Người dùng có thể tạo bài đăng tuyển thành viên với đầy đủ thông tin: tiêu đề, tổng quan dự án, yêu cầu ứng viên, ngành, mục tiêu điểm, số lượng tuyển và hạn ứng tuyển.

### ◆ Xem chi tiết & Ứng tuyển

Xem toàn bộ thông tin chi tiết bài đăng và gửi hồ sơ ứng tuyển kèm theo CV (upload file tối đa 2MB) cùng ghi chú cá nhân đến chủ bài đăng.

### ◆ Tin nhắn & Kết nối

Hệ thống nhắn tin hỗ trợ chat cá nhân (1-1) và chat nhóm (từ 3 người trở lên). Người dùng có thể gửi tin nhắn trao đổi trong cuộc hội thoại.

### ◆ Cộng đồng

Tìm kiếm người dùng khác trong hệ thống, xem hồ sơ cá nhân, theo dõi và nhắn tin kết nối trực tiếp.

### ◆ Quản lý dự án cá nhân

Trang quản lý cho phép theo dõi các bài đăng đã tạo, xem danh sách ứng viên đã nộp đơn, tỷ lệ phù hợp (Match %), duyệt hoặc từ chối thành viên, và nhắn tin trực tiếp với ứng viên đã duyệt.

### ◆ AI Hub

Tích hợp box chat Gemini API để tự động sinh mô tả dự án từ từ khóa, phân tích kỹ năng và gợi ý dự án phù hợp, tìm danh sách người dùng phù hợp nhất với bài đăng.

### ◆ Nạp tiền & Gói dịch vụ

Tích hợp SePay thanh toán thật để phân cấp tài khoản:

- **Gói Thường (Miễn phí):** 
- **Gói VIP (59.000đ):** 
- **Gói Premium (139.000đ):** 

---

## ▸ Công nghệ sử dụng

**Frontend:** React 19, Vite 8, React Router DOM 7, Axios, Lucide React.

**Backend:** Node.js, Express JS, Mongoose 9, CORS, dotenv, Nodemon.

**Database:** MongoDB.

**Thanh toán:** SePay.

**AI:** Google Gemini API.

---

## ▸ Hướng dẫn cài đặt

### Cài đặt Backend

```bash
cd backend
npm install
npm start
```

### Cài đặt Frontend

```bash
cd frontend
npm install
npm run dev
```

> **Lưu ý:** Tạo file `.env` trong cả thư mục `frontend/` và `backend/` với các biến môi trường tương ứng trước khi chạy.

---

## ▸ Vai trò trong hệ thống

**Student (Sinh viên)** — Đối tượng chính của nền tảng. Sinh viên có thể tìm kiếm thành viên cùng mục tiêu, ứng tuyển dự án, tạo bài đăng tuyển thành viên, sử dụng AI Hub hỗ trợ.

**Admin (Quản trị viên)** — Quản lý toàn bộ hệ thống bao gồm quản trị người dùng, giám sát vận hành, thống kê doanh thu và dữ liệu, đảm bảo bảo mật thông tin.

## ▸ License

Dự án thuộc môn **EXE101-201** — FPT University.

<p align="center">
  Made with ♥ by <strong>UniVerse AI Team</strong>
</p>
