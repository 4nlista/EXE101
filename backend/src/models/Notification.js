const mongoose = require('mongoose');
const { NOTIFICATION_TYPE } = require('../constants/notificationEnum');

// Schema thông báo cho người dùng
const notificationSchema = new mongoose.Schema(
  {
    // Người nhận thông báo
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Loại thông báo
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true
    },
    // Tiêu đề thông báo
    title: {
      type: String,
      required: true
    },
    // Nội dung chi tiết
    content: {
      type: String
    },
    // ID tham chiếu (projectId, applicationId, conversationId, friendshipId...)
    referenceId: {
      type: mongoose.Schema.Types.ObjectId
    },
    // Tên model tham chiếu ('Project', 'Application', 'Conversation', 'Friendship'...)
    referenceModel: {
      type: String
    },
    // Đã đọc chưa
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Index: tìm thông báo theo user, trạng thái đọc, sắp xếp mới nhất
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const socket = require('../socket');

// Sau khi tạo hoặc cập nhật thông báo, emit sự kiện real-time
notificationSchema.post('save', function(doc) {
  // Gửi sự kiện qua socket (không chặn luồng lưu dữ liệu)
  try {
    socket.emitToUser(doc.userId.toString(), 'new_notification', doc);
  } catch (error) {
    console.error('Lỗi khi bắn socket notification:', error);
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
