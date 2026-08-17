const mongoose = require('mongoose');

// Schema lượt thả tim (like) bài đăng dự án
const likeSchema = new mongoose.Schema(
  {
    // Người thả tim
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Bài đăng dự án được thả tim
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    }
  },
  { timestamps: true }
);

// Index: mỗi user chỉ like 1 lần cho mỗi dự án
likeSchema.index({ userId: 1, projectId: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
