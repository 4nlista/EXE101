import api from './api';

// Gọi AI đề xuất dự án
export const recommendProjects = async (prompt) => {
  const response = await api.post('/ai/recommend-projects', { prompt });
  return response.data;
};
