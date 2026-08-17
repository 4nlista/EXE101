const mongoose = require('mongoose');

// Schema chuyên ngành (do Admin quản lý CRUD)
const majorSchema = new mongoose.Schema(
  {
    // Mã chuyên ngành (ví dụ: "SE", "IA")
    code: {
      type: String,
      required: true,
      unique: true
    },
    // Tên chuyên ngành (ví dụ: "Kỹ thuật phần mềm")
    name: {
      type: String,
      required: true,
      unique: true
    },
    // Mô tả chuyên ngành
    description: {
      type: String
    },
    // Trạng thái hiển thị (Admin có thể ẩn chuyên ngành)
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Major = mongoose.model('Major', majorSchema);

module.exports = Major;
