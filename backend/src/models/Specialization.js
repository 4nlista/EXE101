const mongoose = require('mongoose');

// Schema chuyên ngành hẹp (phụ thuộc vào chuyên ngành)
const specializationSchema = new mongoose.Schema(
  {
    // Thuộc chuyên ngành nào (khóa ngoại)
    majorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Major',
      required: true
    },
    // Tên chuyên ngành hẹp (ví dụ: "NodeJS", "Topic on Java")
    name: {
      type: String,
      required: true
    },
    // Mô tả chuyên ngành hẹp
    description: {
      type: String
    },
    // Trạng thái hiển thị
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index: tìm chuyên ngành hẹp theo chuyên ngành cha
specializationSchema.index({ majorId: 1 });

const Specialization = mongoose.model('Specialization', specializationSchema);

module.exports = Specialization;
