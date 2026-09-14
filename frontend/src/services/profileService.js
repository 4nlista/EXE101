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
  }
};
