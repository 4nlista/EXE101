import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Settings, LogOut, ChevronDown, User } from 'lucide-react';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDrop, setShowDrop] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navs = [
    { name: 'Bảng tin', path: '/feed' },
    { name: 'Dự án', path: '/manage' },
    { name: 'Tin nhắn', path: '/messages' },
    { name: 'AI Hub', path: '/ai-hub' }
  ];

  return (
    <div className="layout-shell">
      {/* ── Fixed Navbar ── */}
      <nav className="layout-nav">
        <Link to="/feed" className="layout-logo">
          <div className="layout-logo-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="layout-logo-text">Nex<span className="brand">Link</span></div>
        </Link>
        
        <div className="layout-nav-links" style={{ marginLeft: 40 }}>
          {navs.map(n => (
            <Link 
              key={n.path} to={n.path} 
              className={`layout-nav-link ${location.pathname.startsWith(n.path) ? 'active' : ''}`}
            >
              {n.name}
            </Link>
          ))}
        </div>

        <div className="layout-nav-right">
          <button className="nav-icon-btn">
            <Bell size={18} />
            <span className="notif-dot" />
          </button>
          
          <div className="drop-wrap">
            <button className="user-pill" onClick={() => setShowDrop(!showDrop)}>
              <div className="user-av">T</div>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </button>

            {showDrop && (
              <div className="drop-menu">
                <div className="drop-user">
                  <div className="drop-user-name">{user?.email || 'Người dùng'}</div>
                  <div className="drop-user-email">Chưa cập nhật vai trò</div>
                </div>
                <div style={{ padding: '6px 0' }}>
                  <button className="drop-item" onClick={() => {navigate('/profile'); setShowDrop(false);}}><User size={16} /> Hồ sơ cá nhân</button>
                  <button className="drop-item" onClick={() => {navigate('/settings'); setShowDrop(false);}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                    Ví: <span style={{ fontWeight: 800, color: 'var(--primary)', marginLeft: 4 }}>50,000đ</span>
                  </button>
                  <button className="drop-item" onClick={() => {navigate('/settings'); setShowDrop(false);}}><Settings size={16} /> Cài đặt</button>
                  <div className="drop-sep" />
                  <button className="drop-item danger" onClick={handleLogout}><LogOut size={16} /> Đăng xuất</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main Content Area ── */}
      <main className="layout-main">
        <Outlet />
      </main>

      {/* ── Fixed Footer ── */}
      <footer className="layout-footer">
        <div className="layout-footer-left">
          <strong>NexLink</strong> © 2024 NexLink - Mạng lưới chuyên gia Việt Nam
        </div>
        <div className="layout-footer-right">
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Điều khoản sử dụng</a>
          <a href="#">Hỗ trợ</a>
          <a href="#">Trung tâm nghề nghiệp</a>
        </div>
      </footer>
    </div>
  );
}
