const mongoose = require('mongoose');

// Schema vai trò người dùng trong hệ thống
const roleSchema = new mongoose.Schema(
  {
    // Mã số vai trò (0 = Admin, 1 = User...)
    code: {
      type: Number,
      required: true,
      unique: true
    },
    // Tên hiển thị ("Admin", "User", "Mentor"...)
    name: {
      type: String,
      required: true
    },
    // Mô tả vai trò
    description: {
      type: String
    },
    // Trạng thái hoạt động
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index: tìm vai trò theo mã số nhanh
roleSchema.index({ code: 1 }, { unique: true });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
