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
    // Thuộc chuyên ngành nào (nhiều chuyên ngành nếu là môn dùng chung)
    majorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Major'
      }
    ],
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
