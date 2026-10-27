import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import {
  Settings, LogOut, ChevronDown, User, Home, Briefcase,
  MessageSquareMore, Sparkles, Crown, ReceiptText, Users, ShieldCheck
} from 'lucide-react';
import LogoImg from '../assets/images/Logo.png';
import NotificationDropdown from './NotificationDropdown';
import Button from './Button';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { totalUnreadCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDrop, setShowDrop] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng dropdown khi chuyển trang hoặc nhấn phím Escape
  useEffect(() => {
    setShowDrop(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowDrop(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navs = [
    { name: 'Bảng tin', path: '/feed', icon: Home },
    { name: 'Cộng đồng', path: '/community', icon: Users },
    { name: 'Dự án', path: '/manage', icon: Briefcase },
    { name: 'Tin nhắn', path: '/messages', icon: MessageSquareMore, badge: totalUnreadCount > 0 ? totalUnreadCount : null },
    { name: 'AI Hub', path: '/ai-hub', icon: Sparkles }
  ];

  return (
    <nav className="layout-nav">
      <Link to="/feed" className="layout-logo">
        <img src={LogoImg} alt="UniVerse AI Logo" style={{ height: '28px' }} />
        <span className="layout-logo-text">UniVerse AI</span>
      </Link>

      <div className="layout-nav-links">
        {navs.map(n => {
          const isActive = location.pathname.startsWith(n.path);
          const Icon = n.icon;
          return (
            <Link
              key={n.path}
              to={n.path}
              className={`layout-nav-link ${isActive ? 'active' : ''}`}
            >
              <div className="position-relative d-inline-flex align-items-center">
                <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
                {n.badge && (
                  <span
                    className="position-absolute status-badge status-badge--danger p-0 d-inline-flex align-items-center justify-content-center"
                    style={{
                      top: '-6px',
                      right: '-10px',
                      minWidth: '16px',
                      height: '16px',
                      fontSize: '10px',
                      padding: '0 4px',
                      lineHeight: 1
                    }}
                  >
                    {n.badge}
                  </span>
                )}
              </div>
              <span>{n.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="layout-nav-right">
        <NotificationDropdown />

        <div className="drop-wrap" ref={dropdownRef}>
          <Button
            variant="link"
            className="user-pill text-decoration-none shadow-none"
            onClick={() => setShowDrop(!showDrop)}
            aria-label="Menu người dùng"
            aria-expanded={showDrop}
            aria-haspopup="true"
          >
            <div className="user-av">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="Avatar" />
              ) : (
                currentUser?.name ? currentUser.name.trim().charAt(0).toUpperCase() : 'U'
              )}
            </div>
            {currentUser?.name && (
              <span className="user-pill-name d-none d-md-inline ms-1">
                {currentUser.name}
              </span>
            )}
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </Button>

          {showDrop && (
            <div className="drop-menu">
              <div className="drop-user">
                <div className="drop-user-name">{currentUser?.name || currentUser?.email || 'Người dùng'}</div>
                <div className="drop-user-email">
                  {currentUser?.onboardingCompleted ? 'Hồ sơ đã hoàn tất' : 'Chưa hoàn tất hồ sơ'}
                </div>
              </div>
              <div style={{ padding: '6px 0' }}>
                {currentUser?.roleCode === 'ADMIN' && (
                  <Button
                    variant="link"
                    className="drop-item fw-semibold text-start justify-content-start text-decoration-none w-100"
                    style={{ color: 'var(--primary)' }}
                    onClick={() => { navigate('/admin'); setShowDrop(false); }}
                  >
                    <ShieldCheck size={16} /> Cổng Quản trị viên
                  </Button>
                )}
                {!currentUser?.onboardingCompleted && (
                  <Button
                    variant="link"
                    className="drop-item fw-semibold text-start justify-content-start text-decoration-none w-100"
                    style={{ color: 'var(--primary)' }}
                    onClick={() => { navigate('/onboarding'); setShowDrop(false); }}
                  >
                    <Sparkles size={16} /> Hoàn tất hồ sơ (0/4)
                  </Button>
                )}
                <Button variant="link" className="drop-item text-start justify-content-start text-decoration-none w-100" onClick={() => { navigate('/profile'); setShowDrop(false); }}><User size={16} /> Hồ sơ cá nhân</Button>
                <Button variant="link" className="drop-item text-start justify-content-start text-decoration-none w-100" onClick={() => { navigate('/subscription'); setShowDrop(false); }}><Crown size={16} /> Nâng cấp tài khoản</Button>
                <Button variant="link" className="drop-item text-start justify-content-start text-decoration-none w-100" onClick={() => { navigate('/transactions'); setShowDrop(false); }}><ReceiptText size={16} /> Lịch sử thanh toán</Button>
                <Button variant="link" className="drop-item text-start justify-content-start text-decoration-none w-100" onClick={() => { navigate('/change-password'); setShowDrop(false); }}><Settings size={16} /> Đổi mật khẩu</Button>
                <div className="drop-sep" />
                <Button variant="link" className="drop-item danger text-start justify-content-start text-decoration-none w-100" onClick={handleLogout}><LogOut size={16} /> Đăng xuất</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}