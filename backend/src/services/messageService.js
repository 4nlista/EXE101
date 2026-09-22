const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { CONVERSATION_TYPE } = require('../constants/messageEnum');

// 1. Lấy danh sách cuộc trò chuyện của 1 user
const getUserConversations = async (userId) => {
  const conversations = await Conversation.find({ 'participants.userId': userId })
    .populate('participants.userId', 'name avatar') // Lấy thông tin người chat cùng
    .sort({ updatedAt: -1 });
  return conversations;
};

// 2. Lấy nội dung tin nhắn của 1 cuộc trò chuyện
const getConversationMessages = async (conversationId, userId, limit = 50, skip = 0) => {
  // Kiểm tra user có trong conversation không
  const conversation = await Conversation.findOne({
    _id: conversationId,
    'participants.userId': userId
  });

  if (!conversation) {
    throw new Error('Bạn không có quyền truy cập cuộc trò chuyện này');
  }

  const messages = await Message.find({ conversationId, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('senderId', 'name avatar');
    
  return messages.reverse(); // Trả về thứ tự cũ -> mới để hiển thị UI
};

// 3. Tìm hoặc tạo cuộc trò chuyện 1-1
const findOrCreatePersonalConversation = async (currentUserId, targetUserId) => {
  // Tìm xem có conversation 1-1 nào chứa cả 2 user chưa
  let conversation = await Conversation.findOne({
    type: CONVERSATION_TYPE.PERSONAL,
    $and: [
      { 'participants.userId': currentUserId },
      { 'participants.userId': targetUserId }
    ]
  }).populate('participants.userId', 'name avatar');

  if (!conversation) {
    // Chưa có thì tạo mới
    conversation = new Conversation({
      type: CONVERSATION_TYPE.PERSONAL,
      participants: [
        { userId: currentUserId },
        { userId: targetUserId }
      ]
    });
    await conversation.save();
    conversation = await Conversation.findById(conversation._id).populate('participants.userId', 'name avatar');
  }

  return conversation;
};

// 4. Gửi tin nhắn mới
const sendMessage = async (conversationId, senderId, content, type = 'text') => {
  // Kiểm tra quyền
  const conversation = await Conversation.findOne({
    _id: conversationId,
    'participants.userId': senderId
  });

  if (!conversation) {
    throw new Error('Bạn không có quyền gửi tin nhắn vào cuộc trò chuyện này');
  }

  const message = new Message({
    conversationId,
    senderId,
    content,
    type
  });

  await message.save();

  // Cập nhật lastMessage cho conversation
  conversation.lastMessage = {
    content,
    senderId,
    sentAt: new Date()
  };
  await conversation.save();

  return await Message.findById(message._id).populate('senderId', 'name avatar');
};

module.exports = {
  getUserConversations,
  getConversationMessages,
  findOrCreatePersonalConversation,
  sendMessage
};
