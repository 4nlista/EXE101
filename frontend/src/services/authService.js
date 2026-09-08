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

// Hàm mô phỏng Google Login (chưa nối API thật)
export const loginWithGoogle = async () => {
  // TODO: Nối API /auth/login-google sau khi có Firebase/Google Auth
  return {
    success: true,
    data: {
      user: {
        id: Date.now(),
        email: 'google.user@gmail.com',
        name: 'Google User',
        avatar: null,
        isProfileComplete: false,
        occupation: '',
        organization: '',
        skills: [],
        fields: [],
        level: '',
        onboardingCompleted: false
      },
      token: 'dummy-google-token'
    }
  };
};
