const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // Dự án liên quan
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    // Người đánh giá (ẩn danh với người được đánh giá)
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Người được đánh giá
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Số sao đánh giá (1-5)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    // Đánh dấu review tự động bởi hệ thống (auto 5 sao sau 7 ngày)
    isAutoRated: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Ràng buộc: 1 reviewer chỉ đánh giá 1 reviewee trong 1 project
reviewSchema.index({ projectId: 1, reviewerId: 1, revieweeId: 1 }, { unique: true });

// Index phục vụ truy vấn rating theo user
reviewSchema.index({ revieweeId: 1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
