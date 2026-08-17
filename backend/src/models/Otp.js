const mongoose = require('mongoose');

// Schema mã OTP xác thực email
const otpSchema = new mongoose.Schema(
  {
    // Email nhận OTP
    email: {
      type: String,
      required: true
    },
    // Mã OTP 6 số
    code: {
      type: String,
      required: true
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
    }
  },
  { timestamps: true }
);

// TTL Index: MongoDB tự động xóa OTP hết hạn
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
