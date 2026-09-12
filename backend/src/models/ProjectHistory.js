const mongoose = require('mongoose');
const { PROJECT_HISTORY_TYPE, PROJECT_HISTORY_ROLE } = require('../constants/userEnum');

const projectHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Loại dự án: 'personal' | 'group'
    type: {
      type: String,
      enum: Object.values(PROJECT_HISTORY_TYPE),
      required: true
    },
    // Tên dự án
    projectName: {
      type: String,
      required: true
    },
    // Mô tả khái quát dự án
    description: {
      type: String
    },
    // Ngày bắt đầu
    startDate: {
      type: Date
    },
    // Ngày kết thúc
    endDate: {
      type: Date
    },
    // Vai trò: 'leader' | 'member' (chỉ lưu/hiện khi type = 'group')
    role: {
      type: String,
      enum: Object.values(PROJECT_HISTORY_ROLE)
    },
    // Nhiệm vụ cụ thể (chỉ lưu/hiện khi type = 'group')
    task: {
      type: String
    }
  },
  { timestamps: true }
);

const ProjectHistory = mongoose.model('ProjectHistory', projectHistorySchema);

module.exports = ProjectHistory;
