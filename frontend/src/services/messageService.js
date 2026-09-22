import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Lấy danh sách cuộc trò chuyện
export const getConversations = async () => {
  const response = await axios.get(`${API_URL}/messages/conversations`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Lấy danh sách tin nhắn
export const getMessages = async (conversationId) => {
  const response = await axios.get(`${API_URL}/messages/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Gửi tin nhắn
export const sendMessage = async (conversationId, content) => {
  const response = await axios.post(`${API_URL}/messages/${conversationId}`, { content, type: 'text' }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Bắt đầu cuộc trò chuyện mới
export const initConversation = async (targetUserId) => {
  const response = await axios.post(`${API_URL}/messages/init`, { targetUserId }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};
