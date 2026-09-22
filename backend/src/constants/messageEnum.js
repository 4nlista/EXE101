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

// Trạng thái tin nhắn
const MESSAGE_STATUS = {
  SENT: 'sent',           // Đã gửi
  DELIVERED: 'delivered', // Đã nhận tới máy
  READ: 'read'            // Đã xem
};

module.exports = { CONVERSATION_TYPE, MESSAGE_TYPE, MESSAGE_STATUS };
