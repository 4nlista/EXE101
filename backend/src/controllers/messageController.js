const messageService = require('../services/messageService');
const { emitToUser } = require('../socket');

const getUserConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversations = await messageService.getUserConversations(userId);
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

const getConversationMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { limit, skip } = req.query;
    
    const messages = await messageService.getConversationMessages(
      conversationId, 
      userId, 
      limit ? parseInt(limit) : 50, 
      skip ? parseInt(skip) : 0
    );
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(403).json({ success: false, message: error.message });
  }
};

const initPersonalConversation = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body;
    
    console.log('[CHAT DEBUG][BE INIT]', {
      currentUserId,
      targetUserId,
      sameUser: currentUserId === targetUserId
    });

    if (currentUserId === targetUserId) {
      return res.status(400).json({ success: false, message: 'Không thể tự chat với chính mình' });
    }

    const conversation = await messageService.findOrCreatePersonalConversation(currentUserId, targetUserId);
    
    console.log('[CHAT DEBUG][BE CONVERSATION]', {
      conversationId: conversation?._id,
      participants: conversation?.participants?.map(p => ({
        userId: p.userId?._id || p.userId,
        name: p.userId?.name
      }))
    });

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { conversationId } = req.params;
    const { content, type } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được trống' });
    }

    const message = await messageService.sendMessage(conversationId, senderId, content, type);
    
    // Tìm các thành viên trong conversation để gửi notification qua socket (ngoại trừ người gửi)
    const conversation = await messageService.getUserConversations(senderId); // Tạm dùng hàm này để lấy full
    const currentConv = conversation.find(c => c._id.toString() === conversationId);
    if (currentConv) {
      currentConv.participants.forEach(p => {
        if (p.userId._id.toString() !== senderId) {
          emitToUser(p.userId._id, 'new_message', {
            conversationId,
            message
          });
        }
      });
    }

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(403).json({ success: false, message: error.message });
  }
};

const revokeMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const message = await messageService.revokeMessage(id, userId);
    
    // Gửi event socket
    const conversation = await messageService.getUserConversations(userId);
    const currentConv = conversation.find(c => c._id.toString() === message.conversationId.toString());
    if (currentConv) {
      currentConv.participants.forEach(p => {
        if (p.userId._id.toString() !== userId) {
          emitToUser(p.userId._id, 'message_revoked', { messageId: id, conversationId: message.conversationId });
        }
      });
    }

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const clearConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    await messageService.clearConversation(id, userId);
    res.json({ success: true, message: 'Đã xóa đoạn chat' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const markConversationAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    await messageService.markConversationAsRead(id, userId);
    
    // Gửi event socket báo đã đọc
    const conversation = await messageService.getUserConversations(userId);
    const currentConv = conversation.find(c => c._id.toString() === id);
    if (currentConv) {
      currentConv.participants.forEach(p => {
        if (p.userId._id.toString() !== userId) {
          emitToUser(p.userId._id, 'messages_read', { conversationId: id, readerId: userId });
        }
      });
    }

    res.json({ success: true, message: 'Đã đánh dấu xem' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserConversations,
  getConversationMessages,
  initPersonalConversation,
  sendMessage,
  revokeMessage,
  clearConversation,
  markConversationAsRead
};
