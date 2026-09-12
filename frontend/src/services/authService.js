import axiosClient from '../utils/axiosClient';

/**
 * Service xử lý các API liên quan đến Authentication.
 * Toàn bộ logic giao tiếp với Backend đều nằm ở đây, tách biệt khỏi giao diện và State.
 */

export const login = async (email, password) => {
  return await axiosClient.post('/auth/login', { email, password });
};

export const register = async (email, password) => {
  return await axiosClient.post('/auth/register', { email, password });
};

export const verifyOtp = async (name, email, otp, password) => {
  return await axiosClient.post('/auth/verify-otp', { name, email, otp, password });
};

// Gọi API /auth/login-google với token lấy từ Google
export const loginWithGoogle = async (googleToken) => {
  return await axiosClient.post('/auth/login-google', { token: googleToken });
};

// Quên mật khẩu - kiểm tra email có tồn tại không
export const forgotPassword = async (email) => {
  return await axiosClient.post('/auth/forgot-password', { email });
};

// Đặt lại mật khẩu mới
export const resetPassword = async (email, newPassword, confirmNewPassword) => {
  return await axiosClient.post('/auth/reset-password', { email, newPassword, confirmNewPassword });
};
