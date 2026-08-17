// Loại cuộc trò chuyện
const CONVERSATION_TYPE = {
  PERSONAL: 'personal',   // Chat cá nhân 1 vs 1
  GROUP: 'group'           // Chat nhóm (từ 3 người trở lên)
};

// Loại tin nhắn
const MESSAGE_TYPE = {
  TEXT: 'text',       // Tin nhắn văn bản
  IMAGE: 'image',     // Tin nhắn hình ảnh
  FILE: 'file'        // Tin nhắn đính kèm file
};

module.exports = { CONVERSATION_TYPE, MESSAGE_TYPE };
