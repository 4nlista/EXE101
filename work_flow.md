# Báo cáo Tài liệu Dự án: UniVerse AI

## 1. Giới thiệu Tổng quan

**UniVerse AI** là một nền tảng kết nối nhân sự và dự án công nghệ, được thiết kế để giải quyết bài toán tìm kiếm đồng đội, cộng tác viên và cơ hội việc làm. Nền tảng hướng đến hai nhóm đối tượng chính: **Sinh viên** (cần tìm người làm đồ án, bài tập lớn, nghiên cứu khoa học) và **Người đi làm/Freelancer** (tìm kiếm cơ hội việc làm part-time, freelance, hoặc tìm co-founder cho startup).

Đặc biệt, hệ thống tích hợp công nghệ AI (AI Hub) để hỗ trợ phân tích độ phù hợp của ứng viên và tối ưu hóa quá trình ghép nhóm.

## 2. Các Vai trò (Roles) trong hệ thống

Hệ thống phân chia người dùng thành 2 nhóm đối tượng chính với các luồng trải nghiệm (UX) và bộ lọc riêng biệt:

### 2.1. Sinh viên (Students)

- **Mục tiêu:** Tìm kiếm đồng đội làm bài tập lớn, đồ án tốt nghiệp, đồ án môn học hoặc tìm nhóm nghiên cứu khoa học.
- **Đặc điểm:** Quan tâm đến trường đại học, chuyên ngành, và mục tiêu điểm số.

### 2.2. Người đi làm / Freelancer (Professionals)

- **Mục tiêu:** Tìm kiếm cơ hội việc làm (freelance, part-time), tham gia startup, hoặc tìm cộng sự có chuyên môn cao.
- **Đặc điểm:** Quan tâm đến mức lương, số năm kinh nghiệm, lĩnh vực chuyên môn và vai trò cụ thể.

## 3. Luồng Hoạt động (User Flow)

### 3.1: Đăng ký & Định danh (Onboarding)

- Người dùng tạo tài khoản mới qua hệ thống xác thực.
- Thiết lập hồ sơ (Profile Setup): Chọn vai trò (Sinh viên hay Người đi làm), cập nhật kỹ năng chuyên môn (Skills), định hướng mục tiêu (Goals) và thông tin tổ chức/trường học.

### 3.2: Khám phá Bảng tin (Project Feed)

- Người dùng truy cập trang **Bảng tin dự án (/feed)**.
- Giao diện chia làm 2 phần chính:
  - **Cột trái (Sidebar Filter):** Chứa công cụ bộ lọc thông minh (được ghim cố định - sticky). Thay đổi bộ lọc theo tab "Sinh viên" hoặc "Người đi làm".
  - **Cột phải (Project List):** Danh sách các dự án. Các dự án có thể được gắn tag ưu tiên (VIP, PREMIUM).

### 3.3: Đăng tải Dự án mới (Create Post)

- Người dùng nhấn nút **+ Tạo bài đăng**.
- Form nhập liệu thông minh tự động thay đổi theo đối tượng (VD: Hỏi "Mục tiêu điểm" đối với Sinh viên, hoặc "Mức lương" đối với Người đi làm).
- Trường *Chuyên ngành/Lĩnh vực* được thiết kế dạng Multi-select Checkbox Dropdown (Many-to-Many).
- Người dùng có thể chọn Gói đăng tin (Miễn phí, VIP, Premium) để đẩy bài lên top.

### 3.4: Xem chi tiết & Ứng tuyển

- Nhấn vào một dự án để xem **Chi tiết Dự án**: Hiển thị mô tả, yêu cầu, quyền lợi, số lượng thành viên, và thông tin người đăng (Tác giả).
- Người dùng có thể "Lưu" dự án hoặc nhấn "Ứng tuyển/Kết nối" để gửi yêu cầu tham gia dự án.

### 3.5: Quản lý Tin nhắn & Kết nối (Messaging)

- Sau khi ứng tuyển hoặc kết nối, người dùng trao đổi qua tính năng **Tin nhắn (/messages)**.
- Quản lý các hộp thoại cá nhân, trao đổi công việc, chốt yêu cầu hoặc mời vào dự án.
- Tích hợp gửi file, thông báo thời gian thực khi có người phản hồi.

### 3.6: Quản lý Dự án cá nhân (Manage Projects)

- Trang **Quản lý Dự án (/manage)** cho phép người dùng xem các dự án mình đã tạo.
- Theo dõi danh sách ứng viên (Candidates) đã nộp đơn cho từng dự án, xem tỷ lệ phù hợp (Match %).
- Tính năng phân trang (Pagination) cho danh sách ứng viên, duyệt hoặc từ chối thành viên.

### 3.7: AI Hub & Tiện ích mở rộng

- Trang **AI Hub (/ai)**: Nơi tích hợp các tiện ích AI, ví dụ như tự động sinh mô tả dự án từ vài từ khóa, hoặc phân tích kỹ năng để gợi ý dự án phù hợp nhất.

## 4. Mô tả Các Chức năng Cốt lõi (Core Features)

1. **Hệ thống Phân luồng UI/UX Thông minh:** Điều chỉnh động (dynamic rendering) các trường thông tin, form đăng bài, và bộ lọc dựa trên đối tượng mục tiêu.
2. **Bộ lọc Đa chiều (Multi-dimension Filters):** Cho phép lọc và kết hợp nhiều tiêu chí, thiết kế theo dạng Dropdown Checkbox gọn gàng, hỗ trợ Many-to-Many.
3. **Sticky Layout Tối ưu:** Sidebar bộ lọc luôn bám sát màn hình khi cuộn, loại bỏ thanh cuộn thừa, mang lại trải nghiệm chuyên nghiệp.
4. **Hệ thống Nhắn tin (Messaging System):** Kênh giao tiếp trực tiếp giữa chủ dự án và ứng viên, giúp chốt team nhanh chóng.
5. **Quản lý Ứng viên & Tỷ lệ Phù hợp (Match %):** Tính toán và hiển thị tỷ lệ % phù hợp của ứng viên dựa trên kỹ năng của họ so với yêu cầu dự án.
6. **Phân cấp Hiển thị Dự án (Monetization Packages):** Tích hợp tính năng gói đăng tin (Miễn phí, VIP, Premium) với các hiệu ứng UI (Gradient borders, Badges).

## 5. Kiến trúc Hệ thống & Cơ sở dữ liệu (Database)

Dự án sử dụng kiến trúc Backend Node.js với Database **MongoDB**. Cấu trúc các Collection chính:

- **`users` Collection:** Lưu trữ email, password mã hóa, role (admin/user), profileType (pro/stu), skills, goals.
- **`projects` Collection:** Lưu trữ thông tin dự án, ownerId, status, requiredRoles, package type (free/vip/premium) và danh sách thành viên hiện tại.
- **`connections` Collection:** Lưu trữ các yêu cầu kết nối, ứng tuyển tham gia dự án, và lịch sử tin nhắn (senderId, receiverId, message, status).
- 

*(Chi tiết các schema có thể tham khảo thêm tại file `database_design.md`)*
