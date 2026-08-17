const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../constants/applicationEnum');

// Schema hồ sơ ứng tuyển vào dự án
const applicationSchema = new mongoose.Schema(
  {
    // Bài đăng dự án ứng tuyển
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    // Người nộp hồ sơ (ứng viên)
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Đường link file CV đã upload (max 2MB)
    cvFileUrl: {
      type: String
    },
    // Ghi chú của ứng viên khi nộp hồ sơ
    note: {
      type: String
    },
    // Tỷ lệ phù hợp (%) - AI tính toán
    matchPercent: {
      type: Number,
      min: 0,
      max: 100
    },
    // 'pending' | 'approved' | 'rejected'
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.PENDING
    }
  },
  { timestamps: true }
);

// Index: mỗi user chỉ nộp 1 lần cho mỗi dự án
applicationSchema.index({ projectId: 1, applicantId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
