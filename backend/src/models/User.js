const mongoose = require('mongoose');
const { IS_ACTIVE, PROJECT_HISTORY_TYPE, PROJECT_HISTORY_ROLE } = require('../constants/userEnum');
const { PACKAGE_TYPE } = require('../constants/subscriptionEnum');

// Schema thông tin tài khoản, hồ sơ cá nhân, học tập và năng lực
const userSchema = new mongoose.Schema(
  {
    // ===== THÔNG TIN TÀI KHOẢN =====

    // Email đăng nhập (unique)
    email: {
      type: String,
      required: true,
      unique: true
    },
    // Mật khẩu đã mã hóa (bcrypt) - null nếu đăng nhập Google
    password: {
      type: String
    },
    // ID tài khoản Google (đăng nhập Google OAuth)
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    // Vai trò: 0 = Admin | 1 = User (mặc định) - tham chiếu sang roles.code
    roleCode: {
      type: Number,
      ref: 'Role',
      default: 1
    },
    // 0: Offline | 1: Online | 2: Bị khóa
    isActive: {
      type: Number,
      enum: Object.values(IS_ACTIVE),
      default: IS_ACTIVE.ONLINE
    },
    // Đã hoàn thành thiết lập hồ sơ 4 bước chưa
    onboardingCompleted: {
      type: Boolean,
      default: false
    },

    // ===== BƯỚC 1: THÔNG TIN CÁ NHÂN =====

    // Họ và Tên đầy đủ
    name: {
      type: String,
      match: [/^[\p{L}\s]+$/u, 'Họ và tên chỉ được chứa chữ cái và khoảng trắng']
    },
    // URL ảnh đại diện
    avatar: {
      type: String
    },
    // Số điện thoại
    phone: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^0\d{9}$/, 'Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số']
    },
    // Ngày sinh
    dob: {
      type: Date,
      validate: {
        validator: function(value) {
          return value <= new Date();
        },
        message: 'Ngày sinh không được ở trong tương lai'
      }
    },
    // Địa chỉ
    address: {
      type: String
    },

    // ===== BƯỚC 2: THÔNG TIN HỌC TẬP =====

    // Kỳ đang học (1 - 9)
    semester: {
      type: Number,
      min: 1,
      max: 9
    },
    // Ngành (tham chiếu collection departments)
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    // Chuyên ngành (chỉ hiện khi Kỳ >= 5)
    majorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Major'
    },

    // ===== BƯỚC 3: HỒ SƠ NĂNG LỰC =====

    // Kỹ năng chính - Many2Many
    mainSkills: [{
      type: String
    }],
    // Lịch sử dự án (liên kết đến ProjectHistory)
    projectHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectHistory'
    }],

    // Mục tiêu điểm số (GPA) (kéo range 0.0 - 4.0)
    gradeGoal: {
      type: Number,
      min: 0,
      max: 4.0
    },

    // ===== CÀI ĐẶT QUYỀN RIÊNG TƯ =====
    // true = công khai (hiển thị cho người khác xem), false = ẩn
    privacySettings: {
      email: { type: Boolean, default: false }, // Mặc định ẩn email
      phone: { type: Boolean, default: false }, // Mặc định ẩn SĐT
      dob: { type: Boolean, default: true },
      address: { type: Boolean, default: true },
      semester: { type: Boolean, default: true },
      departmentId: { type: Boolean, default: true },
      majorId: { type: Boolean, default: true },
      mainSkills: { type: Boolean, default: true },
      projectHistory: { type: Boolean, default: true },
      gradeGoal: { type: Boolean, default: true }
    },

    // ===== VÍ & QUYỀN LỢI =====

    // Gói hiện tại: 'free' | 'vip' | 'premium' (trường cache từ subscriptions)
    currentPackage: {
      type: String,
      enum: Object.values(PACKAGE_TYPE),
      default: PACKAGE_TYPE.FREE
    },
    // Số dư ví (đơn vị: VND)
    walletBalance: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
