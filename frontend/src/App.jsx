import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AppLayout from './layouts/AppLayout';
import Feed from './pages/feed/Feed';
import ProjectDetail from './pages/feed/ProjectDetail';
import ManageProjects from './pages/manage/ManageProjects';
import PublicProfile from './pages/profile/PublicProfile';
import ProjectHistoryDetail from './pages/profile/ProjectHistoryDetail';
import Messages from './pages/messages/Messages';
import AIHub from './pages/ai/AIHub';
import Dashboard from './pages/dashboard/Dashboard';
import Settings from './pages/settings/Settings';

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
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      
      {/* App Layout cho các trang sau đăng nhập */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
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
