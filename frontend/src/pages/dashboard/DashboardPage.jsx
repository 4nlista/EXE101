import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ProfileSetupModal from '../onboarding/ProfileSetupModal';
import { 
  Search, Bell, Settings, LogOut, ChevronDown, 
  Users, FolderGit2, MessageSquare, Zap, Plus, ArrowRight 
} from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [showSetup, setShowSetup] = useState(user && !user.onboardingCompleted);
  const [showDrop, setShowDrop] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSetupComplete = (data) => {
    console.log('Setup data:', data);
    setShowSetup(false);
  };

  return (
    <div className="app-shell">
      {/* ── Navbar ── */}
      <nav className="app-nav">
        <Link to="/dashboard" className="app-nav-logo">
          <div className="app-nav-logo-mark">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="app-nav-logo-text">UniVerse <span className="brand">AI</span></div>
        </Link>
        
        <div className="nav-sep" />

        <div className="app-nav-links">
          <button className="nav-link active">Bảng điều khiển</button>
          <button className="nav-link">Tìm dự án</button>
          <button className="nav-link">Mạng lưới</button>
        </div>

        <div className="app-nav-right">
          <button className="nav-icon-btn">
            <Search size={18} />
          </button>
          <button className="nav-icon-btn">
            <Bell size={18} />
            <span className="notif-dot" />
          </button>
          
          <div className="drop-wrap">
            <button className="user-pill" onClick={() => setShowDrop(!showDrop)}>
              <div className="user-av">T</div>
              <span className="user-pill-name">Tài khoản</span>
              <ChevronDown size={14} style={{ marginLeft: 2, color: 'var(--text-muted)' }} />
            </button>

            {showDrop && (
              <div className="drop-menu">
                <div className="drop-user">
                  <div className="drop-user-name">{user?.email || 'Người dùng'}</div>
                  <div className="drop-user-email">Chưa cập nhật vai trò</div>
                </div>
                <div style={{ padding: '6px 0' }}>
                  <button className="drop-item"><Settings size={16} /> Cài đặt tài khoản</button>
                  <button className="drop-item" onClick={() => setShowSetup(true)}><User size={16} /> Cập nhật hồ sơ</button>
                  <div className="drop-sep" />
                  <button className="drop-item danger" onClick={handleLogout}><LogOut size={16} /> Đăng xuất</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="dash-content">
        
        {/* Banner */}
        <div className="dash-banner">
          <div className="dash-banner-left">
            <h2>Chào mừng trở lại! 👋</h2>
            <p>Hệ thống AI đã tìm thấy 5 dự án phù hợp với kỹ năng của bạn hôm nay.</p>
          </div>
          <button className="dash-banner-btn">
            Xem gợi ý <ArrowRight size={16} />
          </button>
        </div>

        {/* Incomplete profile warning */}
        {showSetup && (
          <div className="incomplete-bar">
            <span>⚠️</span>
            <div className="msg">Hồ sơ của bạn chưa hoàn thiện. Vui lòng cập nhật để AI có thể ghép nối chính xác hơn.</div>
            <button className="btn btn-sm btn-secondary" onClick={() => setShowSetup(true)}>
              Cập nhật ngay
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="stat-row">
          <div className="stat-c">
            <div className="n">12</div>
            <div className="l">Lượt xem hồ sơ tuần này</div>
          </div>
          <div className="stat-c">
            <div className="n"><span className="accent">3</span></div>
            <div className="l">Lời mời tham gia nhóm</div>
          </div>
          <div className="stat-c">
            <div className="n">1</div>
            <div className="l">Dự án đang tham gia</div>
          </div>
          <div className="stat-c">
            <div className="n">85%</div>
            <div className="l">Điểm hoàn thiện hồ sơ</div>
          </div>
        </div>

        <div className="sec-head">
          <h3>Hành động nhanh</h3>
          <p>Truy cập nhanh các tính năng chính của hệ thống.</p>
        </div>

        <div className="feat-grid">
          <div className="feat-card">
            <div className="feat-icon"><FolderGit2 size={18} /></div>
            <h4>Tạo dự án mới</h4>
            <p>Đăng tải ý tưởng hoặc bài tập lớn để tìm kiếm thành viên cùng tham gia.</p>
            <div className="feat-cta">Bắt đầu <ArrowRight size={14} /></div>
          </div>
          
          <div className="feat-card">
            <div className="feat-icon"><Users size={18} /></div>
            <h4>Tìm kiếm đồng đội</h4>
            <p>Duyệt qua danh sách các lập trình viên, designer, và chuyên gia đang rảnh.</p>
            <div className="feat-cta">Khám phá <ArrowRight size={14} /></div>
          </div>
          
          <div className="feat-card">
            <div className="feat-icon"><MessageSquare size={18} /></div>
            <h4>Tin nhắn & Lời mời</h4>
            <p>Kiểm tra các yêu cầu kết nối và thảo luận với nhóm của bạn.</p>
            <div className="feat-cta">Mở hộp thư <ArrowRight size={14} /></div>
          </div>
          
          <div className="feat-card">
            <div className="feat-icon"><Zap size={18} /></div>
            <h4>Gợi ý từ AI (Mới)</h4>
            <p>Xem các dự án hoặc ứng viên mà AI đánh giá là phù hợp nhất với bạn.</p>
            <div className="feat-cta">Xem gợi ý <ArrowRight size={14} /></div>
          </div>
        </div>

        <div className="g2">
          <div>
            <div className="sec-head">
              <h3>Dự án hiện tại</h3>
            </div>
            <div className="proj-list">
              <div className="add-proj-form">
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.855rem', marginBottom: 10 }}>
                    Bạn chưa tham gia dự án nào.
                  </div>
                  <button className="add-proj-btn">
                    <Plus size={16} /> Tìm hoặc tạo dự án mới
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="sec-head">
              <h3>Kỹ năng của bạn</h3>
            </div>
            <div className="skill-widget">
              <h3 style={{ marginBottom: 12 }}>Kỹ năng nổi bật</h3>
              <div className="skill-chips" style={{ marginBottom: 20 }}>
                <div className="skill-chip">React</div>
                <div className="skill-chip">Node.js</div>
                <div className="skill-chip">Figma</div>
                <div className="skill-chip">UI Design</div>
              </div>
              <button className="btn btn-secondary btn-sm btn-full">
                <Plus size={14} /> Thêm kỹ năng
              </button>
            </div>
          </div>
        </div>

        <div className="dash-footer">
          © 2024 UniVerse AI. All rights reserved.
        </div>
      </main>

      {/* Modal */}
      {showSetup && <ProfileSetupModal onClose={() => setShowSetup(false)} onComplete={handleSetupComplete} />}
    </div>
  );
}
