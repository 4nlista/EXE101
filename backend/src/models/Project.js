const mongoose = require('mongoose');
const { PROJECT_STATUS } = require('../constants/projectEnum');

// Schema chi tiết vị trí tuyển
const positionDetailSchema = new mongoose.Schema(
  {
    // Số lượng (Integer >= 1)
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    // Tên vị trí (ví dụ: "Designer", "Frontend", "Tester")
    positionName: {
      type: String,
      required: true
    }
  },
  { _id: true }
);

// Schema thành viên đã duyệt vào dự án
const memberSchema = new mongoose.Schema(
  {
    // ID thành viên
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Vai trò / vị trí trong dự án
    role: {
      type: String
    },
    // Thời điểm tham gia
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

// Schema bài đăng dự án
const projectSchema = new mongoose.Schema(
  {
    // ===== THÔNG TIN BÀI ĐĂNG =====

    // Người tạo bài đăng (chủ dự án / leader)
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Tiêu đề dự án
    title: {
      type: String,
      required: true
    },
    // Tổng quan dự án
    description: {
      type: String,
      required: true
    },
    // Yêu cầu ứng viên
    candidateRequirements: {
      type: String,
      required: true
    },

    // ===== PHÂN LOẠI =====

    // Ngành liên quan - Many2Many
    departmentIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    }],
    // Mục tiêu điểm dự án (range 0 - 10)
    gradeTarget: {
      type: Number,
      min: 0,
      max: 10
    },

    // ===== TUYỂN THÀNH VIÊN =====

    // Tổng số lượng tuyển (Integer >= 1)
    maxMembers: {
      type: Number,
      required: true,
      min: 1
    },
    // Chi tiết số lượng theo từng vị trí
    positionDetails: [positionDetailSchema],
    // Hạn ứng tuyển (ngày hết hạn đóng tuyển)
    deadline: {
      type: Date
    },

    // ===== TRẠNG THÁI =====

    // 'open' (đang tuyển) | 'closed' (đã đóng)
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.OPEN
    },

    // ===== THÀNH VIÊN ĐÃ DUYỆT =====

    // Danh sách thành viên đã được duyệt vào dự án
    members: [memberSchema]
  },
  { timestamps: true }
);

// Index: tìm bài đăng theo chủ dự án, trạng thái, deadline
projectSchema.index({ ownerId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ deadline: 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
