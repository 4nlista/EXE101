const mongoose = require('mongoose');

// Schema Chuyên ngành (phụ thuộc vào Ngành - Department)
const majorSchema = new mongoose.Schema(
  {
    // Thuộc ngành nào (khóa ngoại)
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    // Tên chuyên ngành (ví dụ: "Kỹ thuật phần mềm")
    name: {
      type: String,
      required: true
    },
    // Trạng thái hiển thị
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index: tìm chuyên ngành theo ngành cha
majorSchema.index({ departmentId: 1 });

const Major = mongoose.model('Major', majorSchema);

module.exports = Major;
