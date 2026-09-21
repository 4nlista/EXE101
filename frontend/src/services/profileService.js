import axiosClient from '../utils/axiosClient';

/**
 * Service xử lý các API liên quan đến Profile / Onboarding
 */
export const profileService = {
  /**
   * Cập nhật hồ sơ Onboarding (Bước 1 -> 4)
   * @param {FormData} payload - Dữ liệu form bao gồm cả avatar (multipart/form-data)
   * @returns {Promise<any>}
   */
  updateOnboardingProfile: async (payload) => {
    return await axiosClient.put('/users/onboarding', payload);
  },

  /**
   * Lấy hồ sơ cá nhân của người đang đăng nhập
   */
  getMyProfile: async () => {
    return await axiosClient.get('/users/my-profile');
  },

  /**
   * Lấy hồ sơ công khai của user khác
   */
  getPublicProfile: async (id) => {
    return await axiosClient.get(`/users/${id}/profile`);
  },

  /**
   * Cập nhật hồ sơ cá nhân
   */
  updateMyProfile: async (payload) => {
    return await axiosClient.put('/users/my-profile', payload);
  },

  /**
   * Thêm dự án mới
   */
  createProjectHistory: async (data) => {
    return await axiosClient.post('/users/project-history', data);
  },

  /**
   * Cập nhật dự án
   */
  updateProjectHistory: async (id, data) => {
    return await axiosClient.put(`/users/project-history/${id}`, data);
  },

  /**
   * Xóa dự án
   */
  deleteProjectHistory: async (id) => {
    return await axiosClient.delete(`/users/project-history/${id}`);
  }
};
