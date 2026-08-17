import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const savedUser = localStorage.getItem('universe_user') || sessionStorage.getItem('universe_user');
    
    if (savedToken && savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // ---- Login (Gọi API) ----
  const login = async (email, password, remember = false) => {
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      
      if (response.success) {
        const { token, user } = response.data;
        
        setCurrentUser(user);
        setIsAuthenticated(true);

        const store = remember ? localStorage : sessionStorage;
        store.setItem('token', token);
        store.setItem('universe_user', JSON.stringify(user));

        return { success: true };
      }
      return { success: false, error: response.message || 'Đăng nhập thất bại' };
    } catch (error) {
      return { success: false, error: error.message || 'Lỗi kết nối đến server.' };
    }
  };

  // ---- Google Login (simulated) ----
  const loginWithGoogle = () => {
    const googleUser = {
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
    };
    setCurrentUser(googleUser);
    setIsAuthenticated(true);
    setShowSetup(true);
    localStorage.setItem('universe_user', JSON.stringify(googleUser));
    return { success: true, needsSetup: true };
  };

  // ---- Register (Tạo OTP) ----
  const register = async (email, password) => {
    try {
      const response = await axiosClient.post('/auth/register', { email, password });
      if (response.success) {
        return { success: true, message: response.message };
      }
      return { success: false, error: response.message || 'Đăng ký thất bại' };
    } catch (error) {
      return { success: false, error: error.message || 'Lỗi kết nối' };
    }
  };

  // ---- Verify OTP (Xác thực và Đăng nhập) ----
  const verifyOtp = async (email, otp, password) => {
    try {
      const response = await axiosClient.post('/auth/verify-otp', { email, otp, password });
      if (response.success) {
        const { token, user } = response.data;
        setCurrentUser(user);
        setIsAuthenticated(true);

        // Lưu vào storage
        localStorage.setItem('token', token);
        localStorage.setItem('universe_user', JSON.stringify(user));

        return { success: true };
      }
      return { success: false, error: response.message || 'Xác thực thất bại' };
    } catch (error) {
      return { success: false, error: error.message || 'Lỗi kết nối' };
    }
  };

  // ---- Logout ----
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setShowSetup(false);
    localStorage.removeItem('token');
    localStorage.removeItem('universe_user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('universe_user');
  };

  // ---- Complete Profile (Local State Update) ----
  const completeProfile = (profileData) => {
    const updated = { ...currentUser, ...profileData, onboardingCompleted: true };
    setCurrentUser(updated);
    setShowSetup(false);

    // Persist update
    if (localStorage.getItem('universe_user')) {
      localStorage.setItem('universe_user', JSON.stringify(updated));
    } else if (sessionStorage.getItem('universe_user')) {
      sessionStorage.setItem('universe_user', JSON.stringify(updated));
    }
  };

  // ---- Open / close setup modal ----
  const openSetup  = () => setShowSetup(true);
  const closeSetup = () => setShowSetup(false);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        showSetup,
        login,
        loginWithGoogle,
        register,
        verifyOtp,
        logout,
        completeProfile,
        openSetup,
        closeSetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
