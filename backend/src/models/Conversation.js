const mongoose = require('mongoose');
const { CONVERSATION_TYPE } = require('../constants/messageEnum');

// Schema thành viên cuộc trò chuyện
const participantSchema = new mongoose.Schema(
  {
    // ID người dùng
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Đã tắt thông báo chưa (ẩn icon số thông báo)
    isMuted: {
      type: Boolean,
      default: false
    },
    // Thời điểm tham gia
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

// Schema tin nhắn cuối cùng (preview nhanh)
const lastMessageSchema = new mongoose.Schema(
  {
    // Nội dung tin nhắn
    content: {
      type: String
    },
    // Người gửi
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Thời điểm gửi
    sentAt: {
      type: Date
    }
  },
  { _id: false }
);

// Schema cuộc trò chuyện (cá nhân 1-1 và nhóm)
const conversationSchema = new mongoose.Schema(
  {
    // 'personal' (1 vs 1) | 'group' (nhóm >= 3 người)
    type: {
      type: String,
      enum: Object.values(CONVERSATION_TYPE),
      required: true
    },
    // Tên nhóm chat (chỉ dùng khi type = 'group')
    name: {
      type: String
    },
    // Danh sách thành viên cuộc trò chuyện
    participants: [participantSchema],
    // Người tạo nhóm (chỉ dùng khi type = 'group')
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Nhóm chat gắn liền với dự án nào (tùy chọn)
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    // Tin nhắn cuối cùng (để hiển thị preview nhanh)
    lastMessage: lastMessageSchema
  },
  { timestamps: true }
);

// Index: tìm cuộc trò chuyện theo thành viên
conversationSchema.index({ 'participants.userId': 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
