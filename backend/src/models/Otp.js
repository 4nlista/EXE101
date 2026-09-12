const mongoose = require('mongoose');

// Schema mã OTP xác thực email
const otpSchema = new mongoose.Schema(
  {
    // Email nhận OTP
    email: {
      type: String,
      required: true
    },
    // Mã OTP (4 số cho quên mật khẩu, 6 số cho đăng ký)
    code: {
      type: String,
      required: true
    },
    // Phân loại OTP: 'register' | 'forgot'
    type: {
      type: String,
      enum: ['register', 'forgot'],
      default: 'register'
    },
    // Thời điểm hết hạn (createdAt + 5 phút)
    expiresAt: {
      type: Date,
      required: true
    },
    // Đã sử dụng chưa (tránh dùng lại)
    isUsed: {
      type: Boolean,
      default: false
    },
    // Đã xác thực thành công chưa (dành cho forgot password)
    // Chỉ khi isVerified = true mới được gọi API reset-password
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// TTL Index: MongoDB tự động xóa OTP hết hạn
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
