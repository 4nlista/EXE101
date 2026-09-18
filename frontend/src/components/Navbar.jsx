import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Settings, LogOut, ChevronDown, User } from 'lucide-react';
import LogoImg from '../assets/images/Logo.png';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
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
    <nav className="layout-nav">
      <Link to="/feed" className="layout-logo text-decoration-none d-flex align-items-center">
        <img src={LogoImg} alt="UniVerse AI Logo" style={{ height: '32px', marginRight: '10px' }} />
        <div className="layout-logo-text fw-bold text-dark fs-5">UniVerse AI</div>
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
                <div className="drop-user-name">{currentUser?.name || currentUser?.email || 'Người dùng'}</div>
                <div className="drop-user-email">Chưa cập nhật vai trò</div>
              </div>
              <div style={{ padding: '6px 0' }}>
                <button className="drop-item" onClick={() => { navigate('/profile'); setShowDrop(false); }}><User size={16} /> Hồ sơ cá nhân</button>
                <button className="drop-item" onClick={() => { navigate('/settings'); setShowDrop(false); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
                  Ví: <span style={{ fontWeight: 800, color: 'var(--primary)', marginLeft: 4 }}>50,000đ</span>
                </button>
                <button className="drop-item" onClick={() => { navigate('/settings'); setShowDrop(false); }}><Settings size={16} /> Cài đặt</button>
                <div className="drop-sep" />
                <button className="drop-item danger" onClick={handleLogout}><LogOut size={16} /> Đăng xuất</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}