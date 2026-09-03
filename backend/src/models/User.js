const mongoose = require('mongoose');
const { IS_ACTIVE, PROJECT_HISTORY_TYPE, PROJECT_HISTORY_ROLE } = require('../constants/userEnum');
const { PACKAGE_TYPE } = require('../constants/subscriptionEnum');

// Schema lịch sử dự án (nhúng trực tiếp trong user)
const projectHistorySchema = new mongoose.Schema(
  {
    // Loại dự án: 'personal' | 'group'
    type: {
      type: String,
      enum: Object.values(PROJECT_HISTORY_TYPE)
    },
    // Tên dự án
    projectName: {
      type: String,
      required: true
    },
    // Mô tả dự án
    description: {
      type: String
    },
    // Ngày bắt đầu
    startDate: {
      type: Date
    },
    // Ngày kết thúc
    endDate: {
      type: Date
    },
    // Vai trò: 'leader' | 'member' (chỉ hiện khi type = 'group')
    role: {
      type: String,
      enum: Object.values(PROJECT_HISTORY_ROLE)
    },
    // Nhiệm vụ cụ thể (chỉ hiện khi type = 'group')
    task: {
      type: String
    }
  },
  { _id: true }
);

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
      type: String
    },
    // URL ảnh đại diện
    avatar: {
      type: String
    },
    // Số điện thoại
    phone: {
      type: String
    },
    // Ngày sinh
    dob: {
      type: Date
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
    // Lịch sử dự án đã tham gia (nhúng trực tiếp)
    projectHistory: [projectHistorySchema],

    // ===== BƯỚC 4: MỤC TIÊU =====

    // Mục tiêu điểm số (kéo range 0.0 - 4.0)
    gradeGoal: {
      type: Number,
      min: 0,
      max: 4.0
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
