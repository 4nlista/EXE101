const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { CONVERSATION_TYPE, MESSAGE_STATUS } = require('../constants/messageEnum');

// 1. Lấy danh sách cuộc trò chuyện của 1 user
const getUserConversations = async (userId) => {
  let conversations = await Conversation.find({ 'participants.userId': userId })
    .populate('participants.userId', 'name avatar') // Lấy thông tin người chat cùng
    .sort({ updatedAt: -1 });

  // Lọc bỏ những cuộc trò chuyện đã bị xóa mà chưa có tin nhắn mới
  conversations = conversations.filter(conv => {
    const me = conv.participants.find(p => p.userId._id.toString() === userId.toString());
    if (me && me.clearedAt && conv.lastMessage && conv.lastMessage.sentAt) {
      if (new Date(conv.lastMessage.sentAt) <= new Date(me.clearedAt)) {
        return false;
      }
    }
    // Nếu chưa từng nhắn gì thì vẫn hiển thị để có thể chat tiếp
    return true;
  });

  return conversations;
};

// 2. Lấy nội dung tin nhắn của 1 cuộc trò chuyện
const getConversationMessages = async (conversationId, userId, limit = 50, skip = 0) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    'participants.userId': userId
  });

  if (!conversation) {
    throw new Error('Bạn không có quyền truy cập cuộc trò chuyện này');
  }

  const me = conversation.participants.find(p => p.userId.toString() === userId.toString());

  const query = { conversationId, isDeleted: false };
  if (me && me.clearedAt) {
    query.createdAt = { $gt: me.clearedAt };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('senderId', 'name avatar');

  return messages.reverse(); // Trả về thứ tự cũ -> mới
};

// 3. Tìm hoặc tạo cuộc trò chuyện 1-1
const findOrCreatePersonalConversation = async (currentUserId, targetUserId) => {
  let conversation = await Conversation.findOne({
    type: CONVERSATION_TYPE.PERSONAL,
    $and: [
      { 'participants.userId': currentUserId },
      { 'participants.userId': targetUserId }
    ]
  }).populate('participants.userId', 'name avatar');

  if (!conversation) {
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
    type,
    status: MESSAGE_STATUS.SENT
  });

  await message.save();

  conversation.lastMessage = {
    content,
    senderId,
    sentAt: new Date()
  };
  await conversation.save();

  // Tăng unreadCount cho tất cả những người không phải là người gửi (dùng $inc để tránh race condition)
  for (const p of conversation.participants) {
    if (p.userId.toString() !== senderId.toString()) {
      await Conversation.updateOne(
        { _id: conversationId, 'participants.userId': p.userId },
        { $inc: { 'participants.$.unreadCount': 1 } }
      );
    }
  }

  return await Message.findById(message._id).populate('senderId', 'name avatar');
};

// 5. Thu hồi tin nhắn
const revokeMessage = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error('Tin nhắn không tồn tại');
  if (message.senderId.toString() !== userId.toString()) {
    throw new Error('Bạn không có quyền thu hồi tin nhắn của người khác');
  }

  const ONE_DAY = 24 * 60 * 60 * 1000;
  if (Date.now() - new Date(message.createdAt).getTime() > ONE_DAY) {
    throw new Error('Chỉ có thể thu hồi tin nhắn trong vòng 24 giờ');
  }

  message.isRevoked = true;
  await message.save();
  return message;
};

// 6. Xóa đoạn chat (ẩn với user hiện tại)
const clearConversation = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    'participants.userId': userId
  });

  if (!conversation) throw new Error('Không tìm thấy cuộc trò chuyện');

  const participant = conversation.participants.find(p => p.userId.toString() === userId.toString());
  if (participant) {
    participant.clearedAt = new Date();
    participant.unreadCount = 0; // Đặt lại số tin nhắn chưa đọc khi xóa đoạn chat
    await conversation.save();
  }
  return true;
};

// 7. Đánh dấu tất cả tin nhắn trong đoạn chat là đã xem
const markConversationAsRead = async (conversationId, userId) => {
  await Message.updateMany(
    {
      conversationId,
      senderId: { $ne: userId },
      status: { $ne: MESSAGE_STATUS.READ }
    },
    { $set: { status: MESSAGE_STATUS.READ } }
  );

  const conversation = await Conversation.findOne({ _id: conversationId, 'participants.userId': userId });
  if (conversation) {
    const participant = conversation.participants.find(p => p.userId.toString() === userId.toString());
    if (participant) {
      participant.unreadCount = 0;
      await conversation.save();
    }
  }

  return true;
};

// 8. Lấy tổng số tin nhắn chưa đọc
const getTotalUnreadCount = async (userId) => {
  const conversations = await Conversation.find({ 'participants.userId': userId });
  let total = 0;
  console.log('[DEBUG] getTotalUnreadCount for', userId);
  conversations.forEach(conv => {
    const participant = conv.participants.find(p => p.userId.toString() === userId.toString());
    if (participant) {
      console.log(`[DEBUG] Conv ${conv._id} unreadCount:`, participant.unreadCount);
      total += (participant.unreadCount || 0);
    }
  });
  console.log('[DEBUG] Total returned:', total);
  return total;
};

module.exports = {
  getUserConversations,
  getConversationMessages,
  findOrCreatePersonalConversation,
  sendMessage,
  revokeMessage,
  clearConversation,
  markConversationAsRead,
  getTotalUnreadCount
};
