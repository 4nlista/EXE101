import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import AppLayout from './layouts/AppLayout';
import FeedPage from './pages/feed/FeedPage';
import ProjectDetailPage from './pages/feed/ProjectDetailPage';
import ManageProjectsPage from './pages/manage/ManageProjectsPage';
import PublicProfilePage from './pages/profile/PublicProfilePage';
import ProjectHistoryDetail from './pages/profile/ProjectHistoryDetail';
import MessagesPage from './pages/messages/MessagesPage';
import AIHubPage from './pages/ai/AIHubPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import SettingsPage from './pages/settings/SettingsPage';

// Bảo vệ route: chưa login → redirect về trang chủ
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

// Route public: đã login → redirect vào dashboard
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/feed" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      
      {/* App Layout cho các trang sau đăng nhập */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/manage" element={<ManageProjectsPage />} />
        <Route path="/profile" element={<PublicProfilePage />} />
        <Route path="/profile/:id" element={<PublicProfilePage />} />
        <Route path="/profile/project-detail" element={<ProjectHistoryDetail />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/ai-hub" element={<AIHubPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
