# UniVerse AI - Database Design (MongoDB)

Tài liệu này mô tả cấu trúc các Collection và các trường dữ liệu (Schema) dự kiến sẽ được sử dụng trong Backend (Node.js + Express + Mongoose) cho dự án UniVerse AI.

---

## Quy ước chung

- `ObjectId` = MongoDB tự sinh `_id`
- `ref: 'CollectionName'` = khóa ngoại tham chiếu sang collection khác
- `timestamps: true` = Mongoose tự động tạo `createdAt` và `updatedAt`
- Các trường có dấu `*` = bắt buộc (required)

---

## Bảng Enum (Tách riêng)

Dưới đây là danh sách tất cả các giá trị Enum được sử dụng trong hệ thống, tách riêng để dễ quản lý và tái sử dụng.

```javascript
// ==================== ROLE ENUMS ====================

// Mã số vai trò mặc định trong hệ thống (Tương ứng với trường code trong collection `roles`)
const ROLE_CODE = {
  ADMIN: 0,           // Quản trị viên
  USER: 1             // Sinh viên (Student) - mặc định
  // Mở rộng sau: MENTOR: 2, MODERATOR: 3...
};

// ==================== USER ENUMS ====================

// Trạng thái hoạt động tài khoản (Number)
const IS_ACTIVE = {
  OFFLINE: 0,         // Tài khoản không hoạt động (Offline)
  ONLINE: 1,          // Tài khoản đang hoạt động (Online)
  LOCKED: 2           // Tài khoản bị khóa bởi Admin
};

// ==================== PROJECT HISTORY ENUMS ====================

// Loại dự án trong lịch sử dự án cá nhân
const PROJECT_HISTORY_TYPE = {
  PERSONAL: 'personal',  // Dự án cá nhân
  GROUP: 'group'          // Dự án nhóm
};

// Vai trò trong dự án (lịch sử)
const PROJECT_HISTORY_ROLE = {
  LEADER: 'leader',     // Trưởng nhóm
  MEMBER: 'member'      // Thành viên
};

// ==================== SUBSCRIPTION ENUMS ====================

// Gói đăng ký người dùng
const PACKAGE_TYPE = {
  FREE: 'free',         // Gói thường - 0k : tính năng cơ bản
  VIP: 'vip',           // Gói VIP - 59k/tháng : tạo bài đăng + tài liệu
  PREMIUM: 'premium'    // Gói Premium - 139k/tháng : toàn quyền AI
};

// Trạng thái subscription
const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',       // Đang hoạt động
  EXPIRED: 'expired',     // Đã hết hạn
  CANCELLED: 'cancelled'  // Đã hủy
};

// ==================== PROJECT ENUMS ====================

// Trạng thái bài đăng dự án
const PROJECT_STATUS = {
  OPEN: 'open',     // Đang mở tuyển thành viên (nhận hồ sơ ứng tuyển)
  CLOSED: 'closed'  // Đã đóng (đủ slot hoặc hết deadline → tự động closed)
};

// ==================== APPLICATION ENUMS ====================

// Trạng thái hồ sơ ứng tuyển
const APPLICATION_STATUS = {
  PENDING: 'pending',     // Chưa xử lý - đang chờ duyệt
  APPROVED: 'approved',   // Đã duyệt - chấp nhận ứng viên
  REJECTED: 'rejected'    // Đã từ chối ứng viên
};

// ==================== FRIENDSHIP ENUMS ====================

// Trạng thái lời mời kết bạn
const FRIENDSHIP_STATUS = {
  PENDING: 'pending',     // Đang chờ người kia duyệt
  ACCEPTED: 'accepted',   // Đã chấp nhận - chính thức là bạn bè
  REJECTED: 'rejected'    // Đã từ chối lời mời
};

// ==================== MESSAGE ENUMS ====================

// Loại cuộc trò chuyện
const CONVERSATION_TYPE = {
  PERSONAL: 'personal',   // Chat cá nhân 1 vs 1
  GROUP: 'group'           // Chat nhóm (từ 3 người trở lên)
};

// Loại tin nhắn
const MESSAGE_TYPE = {
  TEXT: 'text',           // Tin nhắn văn bản
  IMAGE: 'image',         // Tin nhắn hình ảnh
  FILE: 'file'            // Tin nhắn đính kèm file
};

// ==================== TRANSACTION ENUMS ====================

// Trạng thái giao dịch thanh toán
const TRANSACTION_STATUS = {
  PENDING: 'pending',     // Đang chờ xử lý thanh toán
  SUCCESS: 'success',     // Thanh toán thành công
  FAILED: 'failed'        // Thanh toán thất bại
};

// Phương thức thanh toán
const PAYMENT_METHOD = {
  VNPAY: 'vnpay'          // Thanh toán qua VNPay (hỗ trợ 40+ ngân hàng VN, Visa, MasterCard, QR)
};

// ==================== NOTIFICATION ENUMS ====================

// Loại thông báo
const NOTIFICATION_TYPE = {
  APPLICATION: 'application',       // Có người nộp hồ sơ vào dự án của bạn
  APPROVED: 'approved',             // Hồ sơ ứng tuyển của bạn được duyệt
  REJECTED: 'rejected',             // Hồ sơ ứng tuyển của bạn bị từ chối
  FRIEND_REQUEST: 'friend_request', // Có người gửi lời mời kết bạn
  FRIEND_ACCEPTED: 'friend_accepted', // Lời mời kết bạn được chấp nhận
  MESSAGE: 'message',               // Có tin nhắn mới
  REMIND: 'remind',                 // Nhắc nhở (bài đăng còn 3 ngày hết hạn)
  SUBSCRIPTION: 'subscription',     // Liên quan đến gói đăng ký (sắp hết hạn, gia hạn...)
  SYSTEM: 'system'                  // Thông báo hệ thống từ Admin
};
```

---

## 1. Collection `roles`

Lưu trữ danh sách vai trò người dùng trong hệ thống. Dễ dàng mở rộng vai trò mới mà không ảnh hưởng cấu trúc dữ liệu cũ.

```javascript
{
  _id: ObjectId,
  code: { type: Number, required: true, unique: true },              // * Mã số vai trò (0 = Admin, 1 = User...)
  name: { type: String, required: true },                             // * Tên hiển thị ("Admin", "User", "Mentor"...)
  description: { type: String },                                     // Mô tả vai trò
  isActive: { type: Boolean, default: true },                        // Trạng thái hoạt động

  createdAt: { type: Date },
  updatedAt: { type: Date }
}
// Options: { timestamps: true }
// Index: { code: 1 } (unique)
```

---

## 2. Collection `users`

Lưu trữ thông tin tài khoản, hồ sơ cá nhân, học tập và năng lực của người dùng.
- **`roleCode`**: Lưu số kiểu Number tham chiếu sang `roles.code` (0 = Admin, 1 = User).
- **`projectHistory`**: Nhúng trực tiếp trong user (vì dữ liệu nhỏ gọn 5-20 dự án, luôn truy cập cùng trang profile).
- **`currentPackage`**: Giữ làm trường cache (để kiểm tra quyền thần tốc ở các API mà không cần query thêm `subscriptions`).

```javascript
{
  _id: ObjectId,

  // ===== THÔNG TIN TÀI KHOẢN =====
  email: { type: String, required: true, unique: true },           // * Email đăng nhập (unique)
  password: { type: String },                                       // Mật khẩu đã mã hóa (bcrypt) - null nếu đăng nhập bằng Google
  googleId: { type: String, unique: true, sparse: true },           // ID tài khoản Google (dùng cho đăng nhập Google OAuth)
  roleCode: { type: Number, ref: 'Role', default: 1 },              // Vai trò: 0 = Admin | 1 = User (mặc định) | tham chiếu sang roles.code
  isActive: { type: Number, enum: IS_ACTIVE, default: 1 },          // 0: Offline | 1: Online | 2: Bị khóa
  onboardingCompleted: { type: Boolean, default: false },           // Đã hoàn thành thiết lập hồ sơ 4 bước chưa

  // ===== BƯỚC 1: THÔNG TIN CÁ NHÂN =====
  name: { type: String },                                           // Họ và Tên đầy đủ
  avatar: { type: String },                                         // URL ảnh đại diện
  phone: { type: String },                                          // Số điện thoại
  dob: { type: Date },                                              // Ngày sinh
  address: { type: String },                                        // Địa chỉ

  // ===== BƯỚC 2: THÔNG TIN HỌC TẬP =====
  semester: { type: Number, min: 1, max: 9 },                       // Kỳ đang học (1 - 9)
  majorId: { type: ObjectId, ref: 'Major' },                        // Chuyên ngành (tham chiếu collection majors)
  specializationId: { type: ObjectId, ref: 'Specialization' },      // Chuyên ngành hẹp (chỉ hiện khi Kỳ >= 5)

  // ===== BƯỚC 3: HỒ SƠ NĂNG LỰC =====
  mainSkills: [{ type: String }],                                    // Kỹ năng chính - Many2Many (Lập trình, Thiết kế, Marketing, Kinh doanh, Bảo mật, Quản lý, Khác...)
  strengths: { type: String },                                      // Điểm mạnh (người dùng tự nhập mô tả)
  weaknesses: { type: String },                                     // Điểm yếu (người dùng tự nhập mô tả)
  projectHistory: [{                                                 // Lịch sử dự án đã tham gia (nhúng trực tiếp)
    type: { type: String, enum: PROJECT_HISTORY_TYPE },              //   - Loại: 'personal' | 'group'
    projectName: { type: String, required: true },                   //   - Tên dự án
    description: { type: String },                                   //   - Mô tả dự án
    startDate: { type: Date },                                       //   - Ngày bắt đầu
    endDate: { type: Date },                                         //   - Ngày kết thúc
    role: { type: String, enum: PROJECT_HISTORY_ROLE },              //   - Vai trò: 'leader' | 'member' (chỉ hiện khi type = 'group')
    task: { type: String }                                           //   - Nhiệm vụ cụ thể (chỉ hiện khi type = 'group')
  }],

  // ===== BƯỚC 4: MỤC TIÊU =====
  gradeGoal: { type: Number, min: 0, max: 4.0 },                    // Mục tiêu điểm số (kéo range 0.0 - 4.0)

  // ===== VÍ & QUYỀN LỢI =====
  currentPackage: { type: String, enum: PACKAGE_TYPE, default: 'free' }, // Gói hiện tại: 'free' | 'vip' | 'premium' (trường cache từ subscriptions)
  walletBalance: { type: Number, default: 0 },                      // Số dư ví (đơn vị: VND)

  // ===== TIMESTAMPS =====
  createdAt: { type: Date },                                        // Ngày tạo tài khoản
  updatedAt: { type: Date }                                         // Ngày cập nhật gần nhất
}
// Options: { timestamps: true }
```

---

## 3. Collection `otps`

Lưu trữ mã OTP xác thực email khi đăng ký tài khoản hoặc quên mật khẩu. Mã có thời hạn 5 phút.

```javascript
{
  _id: ObjectId,
  email: { type: String, required: true },                           // * Email nhận OTP
  code: { type: String, required: true },                            // * Mã OTP 6 số
  expiresAt: { type: Date, required: true },                         // * Thời điểm hết hạn (createdAt + 5 phút)
  isUsed: { type: Boolean, default: false },                         // Đã sử dụng chưa (tránh dùng lại)

  createdAt: { type: Date }                                          // Ngày tạo OTP
}
// Options: { timestamps: true }
// Index: { expiresAt: 1 } với TTL để MongoDB tự xóa OTP hết hạn
```

---

## 4. Collection `majors`

Danh sách các Chuyên ngành do Admin quản lý (CRUD). Ví dụ: Kỹ thuật phần mềm, Thiết kế đồ họa, An toàn thông tin...

```javascript
{
  _id: ObjectId,
  name: { type: String, required: true, unique: true },              // * Tên chuyên ngành (ví dụ: "Kỹ thuật phần mềm")
  description: { type: String },                                     // Mô tả chuyên ngành
  isActive: { type: Boolean, default: true },                        // Trạng thái hiển thị (Admin có thể ẩn chuyên ngành)

  createdAt: { type: Date },
  updatedAt: { type: Date }
}
// Options: { timestamps: true }
```

---

## 5. Collection `specializations`

Danh sách các Chuyên ngành hẹp, phụ thuộc vào Chuyên ngành. Ví dụ: Chuyên ngành "Kỹ thuật phần mềm" có chuyên ngành hẹp: NodeJS, Topic on Java, Kỹ sư cầu nối Nhật Bản...

```javascript
{
  _id: ObjectId,
  majorId: { type: ObjectId, ref: 'Major', required: true },         // * Thuộc chuyên ngành nào (khóa ngoại)
  name: { type: String, required: true },                             // * Tên chuyên ngành hẹp (ví dụ: "NodeJS", "Topic on Java")
  description: { type: String },                                     // Mô tả chuyên ngành hẹp
  isActive: { type: Boolean, default: true },                        // Trạng thái hiển thị

  createdAt: { type: Date },
  updatedAt: { type: Date }
}
// Options: { timestamps: true }
// Index: { majorId: 1 }
```

---

## 6. Collection `projects`

Lưu trữ thông tin các bài đăng dự án do sinh viên tạo để tìm kiếm thành viên.

**Quy tắc tự động đóng (`status: 'closed'`):** Bài đăng sẽ tự động chuyển sang `closed` khi:
- Số ứng viên được duyệt (`approved`) đạt đủ `maxMembers`, HOẶC
- Ngày hiện tại vượt quá `deadline` (dù chưa đủ slot)

```javascript
{
  _id: ObjectId,

  // ===== THÔNG TIN BÀI ĐĂNG =====
  ownerId: { type: ObjectId, ref: 'User', required: true },          // * Người tạo bài đăng (chủ dự án / leader)
  title: { type: String, required: true },                            // * Tiêu đề dự án (giới hạn số lượng từ)
  description: { type: String, required: true },                      // * Tổng quan dự án (giới hạn tối đa x từ)
  candidateRequirements: { type: String, required: true },            // * Yêu cầu ứng viên (mô tả yêu cầu)

  // ===== PHÂN LOẠI =====
  majorIds: [{ type: ObjectId, ref: 'Major' }],                      // Chuyên ngành liên quan - Many2Many (dropdown nhiều lựa chọn)
  gradeTarget: { type: Number, min: 0, max: 10 },                    // Mục tiêu điểm dự án (range 0 - 10)

  // ===== TUYỂN THÀNH VIÊN =====
  maxMembers: { type: Number, required: true, min: 1 },              // * Tổng số lượng tuyển (Integer >= 1)
  positionDetails: [{                                                 // Chi tiết số lượng theo từng vị trí
    quantity: { type: Number, required: true, min: 1 },               //   - Số lượng (Integer >= 1)
    positionName: { type: String, required: true }                    //   - Tên vị trí (ví dụ: "Designer", "Frontend", "Tester")
  }],
  deadline: { type: Date },                                           // Hạn ứng tuyển (ngày hết hạn đóng tuyển)

  // ===== TRẠNG THÁI =====
  status: { type: String, enum: PROJECT_STATUS, default: 'open' },   // 'open' (đang tuyển) | 'closed' (đã đóng)

  // ===== THÀNH VIÊN ĐÃ DUYỆT =====
  members: [{                                                         // Danh sách thành viên đã được duyệt vào dự án
    userId: { type: ObjectId, ref: 'User' },                          //   - ID thành viên
    role: { type: String },                                           //   - Vai trò / vị trí trong dự án
    joinedAt: { type: Date, default: Date.now }                       //   - Thời điểm tham gia
  }],

  // ===== TIMESTAMPS =====
  createdAt: { type: Date },                                          // Ngày đăng bài
  updatedAt: { type: Date }
}
// Options: { timestamps: true }
// Index: { ownerId: 1 }, { status: 1 }, { deadline: 1 }
```

---

## 7. Collection `applications`

Lưu trữ hồ sơ ứng tuyển khi sinh viên nộp đơn xin tham gia dự án.

```javascript
{
  _id: ObjectId,
  projectId: { type: ObjectId, ref: 'Project', required: true },     // * Bài đăng dự án ứng tuyển
  applicantId: { type: ObjectId, ref: 'User', required: true },      // * Người nộp hồ sơ (ứng viên)
  cvFileUrl: { type: String },                                       // Đường link file CV đã upload (max 2MB)
  note: { type: String },                                            // Ghi chú của ứng viên khi nộp hồ sơ
  matchPercent: { type: Number, min: 0, max: 100 },                  // Tỷ lệ phù hợp (%) - AI tính toán dựa trên profile ứng viên vs yêu cầu dự án
  status: { type: String, enum: APPLICATION_STATUS, default: 'pending' }, // 'pending' | 'approved' | 'rejected'

  createdAt: { type: Date },                                          // Thời điểm nộp hồ sơ (hiển thị DD/MM/YYYY HH:mm)
  updatedAt: { type: Date }
}
// Options: { timestamps: true }
// Index: { projectId: 1, applicantId: 1 } (unique - mỗi user chỉ nộp 1 lần/dự án)
```

---

## 8. Collection `friendships`

Quản lý quan hệ kết bạn 2 chiều giữa các người dùng. Ai gửi lời mời trước cũng được, người kia duyệt thì chính thức là bạn bè.

```javascript
{
  _id: ObjectId,
  requesterId: { type: ObjectId, ref: 'User', required: true },      // * Người gửi lời mời kết bạn
  receiverId: { type: ObjectId, ref: 'User', required: true },       // * Người nhận lời mời kết bạn
  status: { type: String, enum: FRIENDSHIP_STATUS, default: 'pending' }, // 'pending' | 'accepted' | 'rejected'

  createdAt: { type: Date },                                          // Thời điểm gửi lời mời
  updatedAt: { type: Date }                                           // Thời điểm duyệt/từ chối
}
// Options: { timestamps: true }
// Index: { requesterId: 1, receiverId: 1 } (unique - tránh gửi trùng lời mời)
```

---

## 9. Collection `likes`

Lưu trữ lượt thả tim (like) bài đăng dự án của người dùng. Dùng để theo dõi bài đăng quan tâm và nhận thông báo nhắc nhở khi bài đăng sắp hết hạn.

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },           // * Người thả tim
  projectId: { type: ObjectId, ref: 'Project', required: true },     // * Bài đăng dự án được thả tim

  createdAt: { type: Date }
}
// Options: { timestamps: true }
// Index: { userId: 1, projectId: 1 } (unique - mỗi user chỉ like 1 lần/dự án)
```

---

## 10. Collection `conversations`

Quản lý các cuộc trò chuyện (cá nhân 1-1 và nhóm).

```javascript
{
  _id: ObjectId,
  type: { type: String, enum: CONVERSATION_TYPE, required: true },   // * 'personal' (1 vs 1) | 'group' (nhóm >= 3 người)
  name: { type: String },                                            // Tên nhóm chat (chỉ dùng khi type = 'group')
  participants: [{                                                    // Danh sách thành viên cuộc trò chuyện
    userId: { type: ObjectId, ref: 'User', required: true },          //   - ID người dùng
    isMuted: { type: Boolean, default: false },                       //   - Đã tắt thông báo chưa (ẩn icon số thông báo)
    joinedAt: { type: Date, default: Date.now }                       //   - Thời điểm tham gia
  }],
  createdBy: { type: ObjectId, ref: 'User' },                        // Người tạo nhóm (chỉ dùng khi type = 'group' - thường là leader dự án)
  projectId: { type: ObjectId, ref: 'Project' },                     // (Tùy chọn) Nhóm chat gắn liền với dự án nào
  lastMessage: {                                                      // Tin nhắn cuối cùng (để hiển thị preview nhanh)
    content: { type: String },                                        //   - Nội dung tin nhắn
    senderId: { type: ObjectId, ref: 'User' },                        //   - Người gửi
    sentAt: { type: Date }                                            //   - Thời điểm gửi
  },

  createdAt: { type: Date },
  updatedAt: { type: Date }
}
// Options: { timestamps: true }
// Index: { 'participants.userId': 1 }
```

---

## 11. Collection `messages`

Lưu trữ toàn bộ tin nhắn trong các cuộc trò chuyện. Hỗ trợ gửi text, hình ảnh và file đính kèm.

```javascript
{
  _id: ObjectId,
  conversationId: { type: ObjectId, ref: 'Conversation', required: true }, // * Thuộc cuộc trò chuyện nào
  senderId: { type: ObjectId, ref: 'User', required: true },              // * Người gửi tin nhắn
  type: { type: String, enum: MESSAGE_TYPE, default: 'text' },            // 'text' | 'image' | 'file'
  content: { type: String },                                               // Nội dung tin nhắn (text hoặc URL ảnh/file)
  fileName: { type: String },                                              // Tên file gốc (khi type = 'file')
  fileSize: { type: Number },                                              // Dung lượng file (bytes)
  isDeleted: { type: Boolean, default: false },                            // Đánh dấu đã xóa (soft delete)

  createdAt: { type: Date }                                                // Thời điểm gửi tin nhắn
}
// Options: { timestamps: true }
// Index: { conversationId: 1, createdAt: -1 } (sắp xếp tin nhắn mới nhất)
```

---

## 12. Collection `subjects`

Danh sách các môn học trong trường. Liên kết với tài liệu môn học (Document Feed).

```javascript
{
  _id: ObjectId,
  code: { type: String, required: true, unique: true },               // * Mã môn học (ví dụ: "PRF192", "SWP391")
  name: { type: String, required: true },                              // * Tên môn học (ví dụ: "Programming Fundamentals")
  description: { type: String },                                      // Mô tả môn học
  majorId: { type: ObjectId, ref: 'Major' },                          // Thuộc chuyên ngành nào (nếu có - một số môn dùng chung)
  semester: { type: Number, min: 1, max: 9 },                         // Kỳ học của môn (1 - 9)
  isActive: { type: Boolean, default: true },                         // Trạng thái hiển thị

  createdAt: { type: Date },
  updatedAt: { type: Date }
}
// Options: { timestamps: true }
```

---

## 13. Collection `documents`

Lưu trữ tài liệu học tập được upload bởi User VIP/Premium. Upload là hiển thị công khai ngay, không cần Admin duyệt. Admin chỉ có quyền xóa tài liệu vi phạm nếu cần.

```javascript
{
  _id: ObjectId,
  subjectId: { type: ObjectId, ref: 'Subject', required: true },     // * Thuộc môn học nào
  uploaderId: { type: ObjectId, ref: 'User', required: true },       // * Người upload tài liệu (VIP/Premium)
  title: { type: String, required: true },                            // * Tiêu đề tài liệu
  description: { type: String },                                      // Mô tả nội dung tài liệu
  fileUrl: { type: String, required: true },                          // * Đường link file tài liệu (lưu trên cloud storage)
  fileName: { type: String },                                         // Tên file gốc
  fileSize: { type: Number },                                         // Dung lượng file (bytes)

  createdAt: { type: Date },
  updatedAt: { type: Date }
}
// Options: { timestamps: true }
// Index: { subjectId: 1 }
```

---

## 14. Collection `subscriptions`

Quản lý gói đăng ký (VIP / Premium) của người dùng. Tính theo tháng, tự động gia hạn. Đây là collection quyết định quyền lợi hiện tại của user - Backend query subscription có `status: 'active'` để xác định gói đang dùng, đồng thời đồng bộ trạng thái vào trường cache `currentPackage` bên `users`.

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },            // * Người dùng đăng ký gói
  packageType: { type: String, enum: PACKAGE_TYPE, required: true },  // * Loại gói: 'vip' | 'premium'
  price: { type: Number, required: true },                             // * Giá gói (VND): 59000 | 139000
  startDate: { type: Date, required: true },                           // * Ngày bắt đầu hiệu lực
  endDate: { type: Date, required: true },                             // * Ngày hết hạn (startDate + 30 ngày)
  autoRenew: { type: Boolean, default: true },                         // Tự động gia hạn khi hết hạn
  status: { type: String, enum: SUBSCRIPTION_STATUS, default: 'active' }, // 'active' | 'expired' | 'cancelled'

  createdAt: { type: Date },
  updatedAt: { type: Date }
}
// Options: { timestamps: true }
// Index: { userId: 1, status: 1 }
```

---

## 15. Collection `transactions`

Lưu trữ lịch sử giao dịch nạp tiền qua VNPay.

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },            // * Người thực hiện giao dịch
  amount: { type: Number, required: true },                            // * Số tiền giao dịch (VND)
  paymentMethod: { type: String, enum: PAYMENT_METHOD, default: 'vnpay' }, // Phương thức thanh toán
  vnpayTransactionId: { type: String },                                // Mã giao dịch từ VNPay (dùng để đối soát)
  vnpayResponseCode: { type: String },                                 // Mã phản hồi từ VNPay
  subscriptionId: { type: ObjectId, ref: 'Subscription' },            // (Tùy chọn) Liên kết với gói đăng ký nào
  description: { type: String },                                       // Mô tả giao dịch (ví dụ: "Nạp tiền mua gói VIP")
  status: { type: String, enum: TRANSACTION_STATUS, default: 'pending' }, // 'pending' | 'success' | 'failed'

  createdAt: { type: Date },
  updatedAt: { type: Date }
}
// Options: { timestamps: true }
// Index: { userId: 1 }, { vnpayTransactionId: 1 }
```

---

## 16. Collection `notifications`

Lưu trữ thông báo cho người dùng (ứng tuyển, duyệt hồ sơ, kết bạn, nhắc nhở deadline...).

**Quy tắc nhắc nhở (REMIND):** Hệ thống tự động gửi thông báo nhắc nhở **1 lần duy nhất** khi bài đăng còn **3 ngày** nữa là hết hạn:
- Gửi cho **tất cả user đã thả tim** bài đăng đó: *"Dự án XYZ bạn quan tâm chỉ còn 3 ngày, hãy nhanh tay nộp hồ sơ!"*
- Gửi cho **chủ bài đăng**: *"Bài đăng XYZ của bạn còn 3 ngày nữa là hết hạn."*

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },            // * Người nhận thông báo
  type: { type: String, enum: NOTIFICATION_TYPE, required: true },    // * Loại thông báo
  title: { type: String, required: true },                             // * Tiêu đề thông báo
  content: { type: String },                                           // Nội dung chi tiết
  referenceId: { type: ObjectId },                                     // ID tham chiếu (projectId, applicationId, conversationId, friendshipId...)
  referenceModel: { type: String },                                    // Tên model tham chiếu ('Project', 'Application', 'Conversation', 'Friendship'...)
  isRead: { type: Boolean, default: false },                           // Đã đọc chưa

  createdAt: { type: Date }
}
// Options: { timestamps: true }
// Index: { userId: 1, isRead: 1, createdAt: -1 }
```

---

## Tổng kết - Sơ đồ quan hệ giữa các Collection

```
roles ──────── code ── users (vai trò người dùng theo số 0, 1...)
                       ├──── otps (xác thực OTP)
                       ├──── subscriptions (gói đăng ký - quyết định quyền lợi)
                       ├──── transactions (lịch sử giao dịch VNPay)
                       ├──── notifications (thông báo + nhắc nhở)
                       ├──── friendships (kết bạn 2 chiều)
                       ├──── likes (thả tim bài đăng → nhận remind)
                       ├──── documents (upload tài liệu VIP/Premium)
                       ├──── applications (nộp hồ sơ ứng tuyển)
                       ├──── conversations ── messages (tin nhắn cá nhân + nhóm)
                       └──── projects (bài đăng dự án → auto closed khi đủ slot hoặc hết deadline)

majors ──── specializations (chuyên ngành → chuyên ngành hẹp)
subjects ── documents (môn học → tài liệu)
```

---

## Các đầu việc tiếp theo cho Backend

1. **Khởi tạo Mongoose Models**: Dịch các Schema trên thành code Mongoose trong thư mục `models/`.
2. **Phát triển API Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/google`, `/api/auth/forgot-password`, `/api/auth/verify-otp`.
3. **Phát triển API User Profile**: `/api/users/profile` - Cập nhật thông tin hồ sơ 4 bước.
4. **Phát triển API Roles & Permissions**: Quản lý vai trò (Admin CRUD role nếu cần mở rộng).
5. **Phát triển API Projects**: CRUD bài đăng dự án, bộ lọc, phân trang. Cron job kiểm tra deadline để auto-close + gửi remind khi còn 3 ngày.
6. **Phát triển API Applications**: Nộp hồ sơ, duyệt/từ chối ứng viên. Auto-close project khi đủ slot.
7. **Phát triển API Friendships**: Gửi/duyệt/từ chối lời mời kết bạn, danh sách bạn bè.
8. **Phát triển API Messaging**: Tạo cuộc trò chuyện, gửi/nhận tin nhắn (tích hợp Socket.IO cho real-time).
9. **Phát triển API Subscriptions**: Mua gói, kiểm tra gói hiện tại, tự động gia hạn.
10. **Tích hợp VNPay**: API thanh toán và callback xử lý kết quả.
11. **Phát triển API Documents**: Upload tài liệu môn học (VIP/Premium), Admin xóa vi phạm.
12. **Phát triển API Admin**: Dashboard, quản lý user, thống kê, quản lý chuyên ngành/môn học.
13. **Cron Jobs**: Kiểm tra deadline bài đăng (auto-close), gửi remind khi còn 3 ngày, kiểm tra subscription hết hạn.
