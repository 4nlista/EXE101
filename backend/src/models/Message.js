const mongoose = require('mongoose');
const { MESSAGE_TYPE } = require('../constants/messageEnum');

// Schema tin nhắn trong cuộc trò chuyện
const messageSchema = new mongoose.Schema(
  {
    // Thuộc cuộc trò chuyện nào
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    // Người gửi tin nhắn
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // 'text' | 'image' | 'file'
    type: {
      type: String,
      enum: Object.values(MESSAGE_TYPE),
      default: MESSAGE_TYPE.TEXT
    },
    // Nội dung tin nhắn (text hoặc URL ảnh/file)
    content: {
      type: String
    },
    // Tên file gốc (khi type = 'file')
    fileName: {
      type: String
    },
    // Dung lượng file (bytes)
    fileSize: {
      type: Number
    },
    // Đánh dấu đã xóa (soft delete)
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Index: sắp xếp tin nhắn mới nhất theo cuộc trò chuyện
messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
