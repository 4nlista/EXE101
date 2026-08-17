const mongoose = require('mongoose');

// Schema môn học trong trường
const subjectSchema = new mongoose.Schema(
  {
    // Mã môn học (ví dụ: "PRF192", "SWP391")
    code: {
      type: String,
      required: true,
      unique: true
    },
    // Tên môn học (ví dụ: "Programming Fundamentals")
    name: {
      type: String,
      required: true
    },
    // Mô tả môn học
    description: {
      type: String
    },
    // Thuộc chuyên ngành nào (nếu có - một số môn dùng chung)
    majorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Major'
    },
    // Kỳ học của môn (1 - 9)
    semester: {
      type: Number,
      min: 1,
      max: 9
    },
    // Trạng thái hiển thị
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
