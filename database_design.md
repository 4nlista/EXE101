# UniVerse AI - Database Design (MongoDB)

Tài liệu này mô tả cấu trúc các Collection và các trường dữ liệu (Schema) dự kiến sẽ được sử dụng trong Backend (Node.js + Express + Mongoose) cho dự án UniVerse AI.

## 1. Collection `users`

Lưu trữ thông tin người dùng, tài khoản và hồ sơ cá nhân.

```javascript
{
  _id: ObjectId,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Đã mã hóa (bcrypt)
  
  // Phân quyền
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // Thông tin cơ bản
  name: { type: String },
  avatar: { type: String }, // URL ảnh
  phone: { type: String },
  dob: { type: Date },
  address: { type: String },
  
  // Định danh chuyên môn
  profileType: { type: String, enum: ['pro', 'stu'] }, // pro: Người đi làm/Freelancer, stu: Sinh viên
  organization: { type: String }, // Công ty / Trường học
  specialtyRole: { type: String }, // Vị trí (Frontend, Backend, Design...)
  skills: [{ type: String }], // Mảng các kỹ năng (React, Figma...)
  
  // Mục tiêu
  goals: [{ type: String }], // Mảng các ID mục tiêu (Tìm dự án, mentor,...)
  
  // Trạng thái tài khoản
  onboardingCompleted: { type: Boolean, default: false }, // Đã điền xong profile hay chưa
  status: String, enum ['ACTIVE', 'INACTIVE', 'LOCKED']
  createdAt: Date,
  updatedAt: Date
}
```

## 2. Collection `projects`

Lưu trữ thông tin các dự án, ý tưởng, đồ án do người dùng đăng tải để tìm kiếm thành viên.

```javascript
{
  _id: ObjectId,
  title: { type: String, required: true },
  description: { type: String },
  ownerId: { type: ObjectId, ref: 'User', required: true }, // Người tạo dự án
  
  status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' },
  
  requiredRoles: [{ type: String }], // Các vị trí đang cần tìm (Backend, Designer...)
  requiredSkills: [{ type: String }], // Các kỹ năng yêu cầu
  location: String, // địa điểm làm việc cùng nhau nếu có
  members: [{
    userId: { type: ObjectId, ref: 'User' },
    role: { type: String }, // Vai trò trong dự án
    joinedAt: { type: Date, default: Date.now }
  }],
  
  createdAt: Date,
  updatedAt: Date
}
```

## 3. Collection `connections` (Kết nối / Lời mời)

Quản lý các lời mời ghép nhóm, tin nhắn liên hệ hoặc yêu cầu tham gia dự án giữa các người dùng.

```javascript
{
  _id: ObjectId,
  senderId: { type: ObjectId, ref: 'User', required: true }, // Người gửi yêu cầu
  receiverId: { type: ObjectId, ref: 'User', required: true }, // Người nhận yêu cầu
  projectId: { type: ObjectId, ref: 'Project' }, // (Tùy chọn) Yêu cầu liên quan đến dự án nào
  
  type: { type: String, enum: ['project_invite', 'join_request', 'connect'] },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  message: { type: String }, // Lời nhắn gửi kèm
  
  createdAt: Date,
  updatedAt: Date
}
```

---

### Các đầu việc tiếp theo cho Backend:

1. **Thiết lập thư mục Backend**: Tạo các folder `models`, `controllers`, `routes`, `middlewares`, `config`.
2. **Khởi tạo Mongoose Models**: Dịch các Schema trên thành code Mongoose thực tế.
3. **Phát triển API Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me` (dùng JWT để xác thực).
4. **Phát triển API User**: Cập nhật thông tin `ProfileSetupModal` vào cơ sở dữ liệu (`/api/users/profile`).
5. **Cập nhật lại Frontend**: Chuyển các hàm mock (`login`, `register` trong `AuthContext`) sang gọi API thực tế bằng `axios`.
