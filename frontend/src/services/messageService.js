import axiosClient from '../utils/axiosClient';

// Lấy danh sách cuộc trò chuyện
export const getConversations = async () => {
  const response = await axiosClient.get('/messages/conversations');
  return response;
};

// Lấy danh sách tin nhắn
export const getMessages = async (conversationId) => {
  const response = await axiosClient.get(`/messages/${conversationId}`);
  return response;
};

// Gửi tin nhắn
export const sendMessage = async (conversationId, content) => {
  const response = await axiosClient.post(`/messages/${conversationId}`, { content, type: 'text' });
  return response;
};

// Bắt đầu cuộc trò chuyện mới
export const initConversation = async (targetUserId) => {
  const response = await axiosClient.post('/messages/init', { targetUserId });
  return response;
};
