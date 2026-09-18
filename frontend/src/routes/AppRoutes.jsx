import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import AppLayout from '../layouts/AppLayout';
import Feed from '../pages/feed/ProjectFeed';
import ProjectDetail from '../pages/feed/ProjectDetail';
import ManageProjects from '../pages/manage/ManageProjects';
import PublicProfile from '../pages/profile/PublicProfile';
import ProjectHistoryDetail from '../pages/profile/ProjectHistoryDetail';
import Messages from '../pages/messages/Messages';
import AIHub from '../pages/ai/AIHub';
import AdminDashboard from '../pages/admin/AdminDashboard';
import Settings from '../pages/settings/Settings';
import ProfileOnboarding from '../pages/profile/ProfileOnboarding';

// Route cho Admin
function AdminRoute({ children }) {
  const { isAuthenticated, currentUser } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Nếu không phải admin (roleCode !== 0) thì đẩy về trang chủ của user
  if (currentUser && currentUser.roleCode !== 0) {
    return <Navigate to="/feed" replace />;
  }
  
  return children;
}

// Bảo vệ route: chưa login → redirect về trang chủ
// Nếu requireOnboarding = true và user chưa hoàn thiện hồ sơ → bắt buộc redirect sang /onboarding
function ProtectedRoute({ children, requireOnboarding = true }) {
  const { isAuthenticated, currentUser } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Admin không vào các trang của User, đẩy về /admin
  if (currentUser && currentUser.roleCode === 0) {
    return <Navigate to="/admin" replace />;
  }
  
  if (requireOnboarding && currentUser && !currentUser.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return children;
}

// Route public: đã login → redirect vào trong
function PublicRoute({ children }) {
  const { isAuthenticated, currentUser } = useAuth();
  
  if (isAuthenticated && currentUser) {
    if (currentUser.roleCode === 0) {
      return <Navigate to="/admin" replace />;
    }
    if (!currentUser.onboardingCompleted) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/feed" replace />;
  }
  
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      
      {/* Route riêng cho Onboarding (không requireOnboarding để tránh lặp vô hạn) */}
      <Route path="/onboarding" element={<ProtectedRoute requireOnboarding={false}><ProfileOnboarding /></ProtectedRoute>} />
      
      {/* Route riêng cho Admin */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      {/* App Layout cho các trang sau đăng nhập (User) */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/feed" element={<Feed />} />
        <Route path="/manage" element={<ManageProjects />} />
        <Route path="/profile" element={<PublicProfile />} />
        <Route path="/profile/:id" element={<PublicProfile />} />
        <Route path="/profile/project-detail" element={<ProjectHistoryDetail />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/ai-hub" element={<AIHub />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
