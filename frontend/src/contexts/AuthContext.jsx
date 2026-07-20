import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../constants/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const saved =
      localStorage.getItem('universe_user') ||
      sessionStorage.getItem('universe_user');
    if (saved) {
      const user = JSON.parse(saved);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  // ---- Login ----
  const login = (email, password, remember = false) => {
    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) {
      return { success: false, error: 'Email hoặc mật khẩu không chính xác' };
    }

    const user = { ...found };
    setCurrentUser(user);
    setIsAuthenticated(true);

    const store = remember ? localStorage : sessionStorage;
    store.setItem('universe_user', JSON.stringify(user));

    // Show setup modal if profile not complete
    if (!user.isProfileComplete) setShowSetup(true);

    return { success: true, needsSetup: !user.isProfileComplete };
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

  // ---- Register ----
  const register = (email) => {
    const exists = MOCK_USERS.find((u) => u.email === email);
    if (exists) return { success: false, error: 'Email này đã được sử dụng' };
    return { success: true };
  };

  // ---- Logout ----
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setShowSetup(false);
    localStorage.removeItem('universe_user');
    sessionStorage.removeItem('universe_user');
  };

  // ---- Complete Profile ----
  const completeProfile = (profileData) => {
    const updated = { ...currentUser, ...profileData, isProfileComplete: true };
    setCurrentUser(updated);
    setShowSetup(false);

    // Persist update
    if (localStorage.getItem('universe_user')) {
      localStorage.setItem('universe_user', JSON.stringify(updated));
    } else {
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
