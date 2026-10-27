import React, { useState } from 'react';
import { Container, Nav } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3, Users, FolderGit2, GraduationCap, Bot, LogOut, ShieldCheck
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import Button from '../../components/Button';
import OverviewTab from './components/OverviewTab';
import UserManagementTab from './components/UserManagementTab';
import ProjectModerationTab from './components/ProjectModerationTab';
import MasterDataTab from './components/MasterDataTab';
import AiAssistantTab from './components/AiAssistantTab';

export default function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Lấy dữ liệu thống kê chung cho toàn bộ Dashboard
  const { data: statsResponse, isLoading: isStatsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getStats()
  });

  const stats = statsResponse?.data || statsResponse || null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { key: 'overview', label: 'Tổng quan', icon: BarChart3 },
    { key: 'users', label: 'Quản lý người dùng', icon: Users },
    { key: 'projects', label: 'Kiểm duyệt dự án', icon: FolderGit2 },
    { key: 'master-data', label: 'Chuyên ngành & Kỹ năng', icon: GraduationCap },
    { key: 'ai-assistant', label: 'Trợ lý Gemini AI', icon: Bot }
  ];

  return (
    <div className="min-vh-100" style={{ backgroundColor: 'var(--bg-subtle)' }}>
      {/* ── Topbar Quản trị ── */}
      <header className="bg-white border-bottom sticky-top" style={{ zIndex: 1020 }}>
        <Container fluid className="px-4 py-2 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <div className="rounded d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)' }}>
              U
            </div>
            <div>
              <span className="fw-semibold fs-6 text-dark">UniVerse AI</span>
              <span className="status-badge status-badge--neutral ms-2">
                <ShieldCheck size={12} /> Cổng Quản trị viên
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <div className="fw-medium text-dark small">{currentUser?.name || 'Quản trị viên'}</div>
              <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{currentUser?.email}</div>
            </div>

            <Button
              variant="outline-secondary"
              size="sm"
              className="d-inline-flex align-items-center gap-1"
              onClick={handleLogout}
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut size={14} />
              <span className="d-none d-sm-inline">Đăng xuất</span>
            </Button>
          </div>
        </Container>

        {/* ── Thanh chuyển Tab (Monochrome Icons) ── */}
        <div className="bg-white border-top px-4">
          <Container fluid className="p-0">
            <Nav variant="tabs" className="flex-nowrap overflow-auto" activeKey={activeTab}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;

                return (
                  <Nav.Item key={item.key}>
                    <Nav.Link
                      active={isActive}
                      onClick={() => setActiveTab(item.key)}
                      className="d-inline-flex align-items-center gap-2 text-nowrap"
                      style={{ cursor: 'pointer' }}
                    >
                      <Icon size={16} />
                      {item.label}
                    </Nav.Link>
                  </Nav.Item>
                );
              })}
            </Nav>
          </Container>
        </div>
      </header>

      {/* ── Vùng nội dung chính của Tab ── */}
      <main className="py-4">
        <Container fluid className="px-4" style={{ maxWidth: '1400px' }}>
          {activeTab === 'overview' && (
            <OverviewTab stats={stats} isLoading={isStatsLoading} />
          )}

          {activeTab === 'users' && (
            <UserManagementTab />
          )}

          {activeTab === 'projects' && (
            <ProjectModerationTab />
          )}

          {activeTab === 'master-data' && (
            <MasterDataTab />
          )}

          {activeTab === 'ai-assistant' && (
            <AiAssistantTab />
          )}
        </Container>
      </main>
    </div>
  );
}
