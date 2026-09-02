const mongoose = require('mongoose');

// Schema Ngành (do Admin quản lý CRUD)
const departmentSchema = new mongoose.Schema(
  {
    // Tên ngành (ví dụ: "Công nghệ thông tin")
    name: {
      type: String,
      required: true,
      unique: true
    },
    // Mô tả ngành
    description: {
      type: String
    },
    // Trạng thái hiển thị (Admin có thể ẩn ngành)
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
