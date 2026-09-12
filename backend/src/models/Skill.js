const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    // Trạng thái được duyệt để hiển thị gợi ý chung cho tất cả mọi người
    isApproved: {
      type: Boolean,
      default: false
    },
    // Tần suất sử dụng (số người dùng)
    usageCount: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;
