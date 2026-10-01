import axiosClient from '../utils/axiosClient';

// Giai đoạn 2: Gọi AI đề xuất dự án (Cho SV gói VIP/Premium)
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
