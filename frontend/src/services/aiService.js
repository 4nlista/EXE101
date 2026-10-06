import axiosClient from '../utils/axiosClient';

// =====================================
// API MỚI: AI CHAT SESSION (Hướng B)
// =====================================
export const getAiSessions = async () => {
  return await axiosClient.get('/ai/sessions');
};

export const createAiSession = async () => {
  return await axiosClient.post('/ai/sessions');
};

export const getAiSessionById = async (sessionId) => {
  return await axiosClient.get(`/ai/sessions/${sessionId}`);
};

export const deleteAiSession = async (sessionId) => {
  return await axiosClient.delete(`/ai/sessions/${sessionId}`);
};

export const updateAiSession = async (sessionId, title) => {
  return await axiosClient.put(`/ai/sessions/${sessionId}`, { title });
};

export const sendAiMessage = async (sessionId, text) => {
  return await axiosClient.post(`/ai/sessions/${sessionId}/messages`, { text });
};

// =====================================
// CÁC API CŨ (Sẽ loại bỏ tính năng cũ)
// =====================================
// Giai đoạn 2: Gọi AI đề xuất dự án (CŨ)
export const recommendProjects = async (prompt) => {
  return await axiosClient.post('/ai/recommend-projects', { prompt });
};

// Giai đoạn 3: Phân tích CV ứng viên (Cho Chủ dự án gói Premium)
export const matchApplicant = async (applicationId) => {
  return await axiosClient.post(`/ai/match-applicant/${applicationId}`);
};

// Giai đoạn 4: Chat với AI lấy thống kê (Cho Admin)
export const adminChat = async (prompt) => {
  return await axiosClient.post('/ai/admin-chat', { prompt });
};
