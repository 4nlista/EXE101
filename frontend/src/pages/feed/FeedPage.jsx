import React, { useState } from 'react';
import { Filter, Clock, ChevronDown, ChevronLeft, ChevronRight, X, FileText, CheckCircle, Award, UploadCloud, GraduationCap, Briefcase, Users, Search, Heart, Palette, Code, Target, Cpu, Settings } from 'lucide-react';

const mockProjects = [
  {
    id: 1,
    title: 'Tái thiết kế trang Thương mại Điện tử',
    author: 'Lê Anh',
    avatarText: 'LA',
    school: 'ĐH Bách Khoa',
    timeLeft: 'Còn 3 ngày',
    desc: 'Tìm kiếm UI/UX Designer sáng tạo và Frontend Developer để cải tiến trang web thương mại điện t...',
    roles: [
      { name: '1 Thiết kế', icon: <Palette size={14} /> },
      { name: '2 Lập trình viên', icon: <Code size={14} /> }
    ]
  },
  {
    id: 2,
    title: 'Tài liệu Pitching Startup Công nghệ',
    author: 'Minh Tuấn',
    avatarText: 'MT',
    school: 'RMIT VN',
    match: 'Phù hợp 92%',
    timeLeft: 'Còn 1 tuần',
    desc: 'Cần một trưởng nhóm có tư duy kinh doanh và một designer để giúp xây dựng bộ tài liệu pitching và...',
    roles: [
      { name: '1 Trưởng nhóm', icon: <Target size={14} /> },
      { name: '1 Thiết kế', icon: <Palette size={14} /> }
    ]
  },
  {
    id: 3,
    title: 'Hệ thống Tạo Portfolio Tự động bằng AI',
    author: 'Hoàng Long',
    avatarText: 'HL',
    school: 'ĐH FPT',
    timeLeft: 'Còn 2 tuần',
    desc: 'Chúng tôi đang xây dựng một nền tảng sử dụng AI để tự động tạo một trang web portfolio chuyên nghiệp...',
    roles: [
      { name: '2 Frontend', icon: <Code size={14} /> },
      { name: '1 AI Engineer', icon: <Cpu size={14} /> }
    ]
  },
  {
    id: 4,
    title: 'App quản lý chi tiêu cá nhân (Startup)',
    author: 'Trần Thị B',
    avatarText: 'TB',
    school: 'ĐH Kinh tế',
    timeLeft: 'Còn 4 ngày',
    desc: 'Team đang có 3 người (1 Business, 1 UI, 1 Mobile). Cần tuyển gấp 1 bạn làm Backend Node.js có kinh nghiệm.',
    roles: [
      { name: '1 Backend', icon: <Settings size={14} /> }
    ]
  },
  {
    id: 5,
    title: 'Freelance - Cắt HTML/CSS Landing Page',
    author: 'Công ty ABC',
    avatarText: 'AB',
    timeLeft: 'Còn 5 ngày',
    desc: 'Cần một bạn cắt HTML/CSS/JS thuần cho 5 trang Landing page quảng cáo. Yêu cầu pixel-perfect và responsive tốt.',
    roles: [
      { name: '1 Frontend', icon: <Code size={14} /> }
    ]
  },
  {
    id: 6,
    title: 'Thiết kế Logo và Brand Identity',
    author: 'Startup XYZ',
    avatarText: 'XY',
    school: 'Mỹ thuật CN',
    timeLeft: 'Còn 1 tuần',
    desc: 'Cần một bạn sinh viên thiết kế bộ nhận diện thương hiệu cho quán cafe mới mở, phong cách minimal.',
    roles: [
      { name: '1 Thiết kế', icon: <Palette size={14} /> }
    ]
  }
];

export default function FeedPage() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [targetAudience, setTargetAudience] = useState('student'); // 'student' | 'professional'
  const [openDropdown, setOpenDropdown] = useState(null); // 'linhvuc' | 'vaitro' | null

  const linhVucOptions = ['Kinh doanh/Bán hàng', 'Marketing/PR', 'Chăm sóc khách hàng', 'Nhân sự/Hành chính', 'Công nghệ Thông tin'];
  const vaiTroOptions = ['Thiết kế UI/UX', 'Lập trình viên', 'Trưởng nhóm', 'Kiểm thử (Tester)', 'Phân tích dữ liệu'];

  const handleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <div style={{ display: 'flex', width: '100%', maxWidth: 1440, margin: '0 auto', padding: '0 32px' }}>

      {/* ── Left Sidebar: Filters ── */}
      <aside style={{ width: 260, paddingRight: 24, paddingTop: 32, borderRight: '1px solid var(--border)', minHeight: 'calc(100vh - 65px)', position: 'relative' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Bộ lọc</h3>
        </div>

        {/* Toggle Target Audience */}
        <div style={{ display: 'flex', background: 'var(--bg-muted)', borderRadius: 8, padding: 4, marginBottom: 24 }}>
          <button
            onClick={() => setTargetAudience('student')}
            style={{ flex: 1, padding: '8px 0', fontSize: '0.85rem', fontWeight: 600, borderRadius: 6, transition: 'all 0.2s', background: targetAudience === 'student' ? 'var(--bg)' : 'transparent', color: targetAudience === 'student' ? 'var(--primary)' : 'var(--text-secondary)', boxShadow: targetAudience === 'student' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
          >
            Sinh viên
          </button>
          <button
            onClick={() => setTargetAudience('professional')}
            style={{ flex: 1, padding: '8px 0', fontSize: '0.85rem', fontWeight: 600, borderRadius: 6, transition: 'all 0.2s', background: targetAudience === 'professional' ? 'var(--bg)' : 'transparent', color: targetAudience === 'professional' ? 'var(--primary)' : 'var(--text-secondary)', boxShadow: targetAudience === 'professional' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
          >
            Người đi làm
          </button>
        </div>

        {/* Common Filters: Lĩnh vực & Vai trò (Dropdown Style) */}

        {/* Dropdown Lĩnh vực */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>Lĩnh vực</h4>
          <div
            onClick={() => handleDropdown('linhvuc')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: 38, padding: '0 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}
          >
            <span>Tất cả lĩnh vực</span>
            <ChevronDown size={16} color="var(--text-muted)" />
          </div>

          {openDropdown === 'linhvuc' && (
            <div style={{ position: 'absolute', top: 72, left: 0, width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 10, padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
              {linhVucOptions.map((opt, i) => (
                <div
                  key={i}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)', transition: 'background 0.2s, color 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{opt}</span>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', padding: '10px 16px 4px', marginTop: 4 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>1/5</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none' }}><ChevronLeft size={14} color="var(--text-muted)" /></button>
                  <button style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none' }}><ChevronRight size={14} color="var(--primary)" /></button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dropdown Vai trò */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>Vai trò</h4>
          <div
            onClick={() => handleDropdown('vaitro')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: 38, padding: '0 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}
          >
            <span>Tất cả vai trò</span>
            <ChevronDown size={16} color="var(--text-muted)" />
          </div>

          {openDropdown === 'vaitro' && (
            <div style={{ position: 'absolute', top: 72, left: 0, width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 10, padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
              {vaiTroOptions.map((opt, i) => (
                <div
                  key={i}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)', transition: 'background 0.2s, color 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{opt}</span>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', padding: '10px 16px 4px', marginTop: 4 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>1/5</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none' }}><ChevronLeft size={14} color="var(--text-muted)" /></button>
                  <button style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none' }}><ChevronRight size={14} color="var(--primary)" /></button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Student Specific Filters */}
        {targetAudience === 'student' && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>Mục tiêu điểm</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" placeholder="Min" style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 6, border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = 'var(--primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input type="number" placeholder="Max" style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 6, border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = 'var(--primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>Hạn chót</h4>
              <div style={{ position: 'relative' }}>
                <select style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '0.9rem', appearance: 'none', color: 'var(--text-primary)', outline: 'none' }}>
                  <option>Bất cứ lúc nào</option>
                  <option>Trong tuần này</option>
                  <option>Trong tháng này</option>
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: 11, color: 'var(--text-muted)', pointerEvents: 'none' }} />
              </div>
            </div>
          </>
        )}

        {/* Professional Specific Filters */}
        {targetAudience === 'professional' && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>Kinh nghiệm</h4>
              <div style={{ position: 'relative' }}>
                <select style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '0.9rem', appearance: 'none', color: 'var(--text-primary)', outline: 'none' }}>
                  <option>Tất cả cấp bậc</option>
                  <option>Thực tập sinh</option>
                  <option>Dưới 1 năm</option>
                  <option>1 - 3 năm</option>
                  <option>3 - 5 năm</option>
                  <option>Trên 5 năm</option>
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: 11, color: 'var(--text-muted)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>Mức lương</h4>
              <div style={{ position: 'relative' }}>
                <select style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '0.9rem', appearance: 'none', color: 'var(--text-primary)', outline: 'none' }}>
                  <option>Thỏa thuận</option>
                  <option>Dưới 10 triệu</option>
                  <option>10 - 20 triệu</option>
                  <option>20 - 40 triệu</option>
                  <option>Trên 40 triệu</option>
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: 11, color: 'var(--text-muted)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>Hạn chót</h4>
              <div style={{ position: 'relative' }}>
                <select style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '0.9rem', appearance: 'none', color: 'var(--text-primary)', outline: 'none' }}>
                  <option>Bất cứ lúc nào</option>
                  <option>Trong tuần này</option>
                  <option>Trong tháng này</option>
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: 11, color: 'var(--text-muted)', pointerEvents: 'none' }} />
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <button className="btn btn-secondary" style={{ flex: 1, borderRadius: 6, fontWeight: 600, justifyContent: 'center' }}>
            Xóa
          </button>
          <button className="btn btn-primary" style={{ flex: 1, borderRadius: 6, fontWeight: 600, justifyContent: 'center' }}>
            Lọc
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, padding: '24px 0 24px 32px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 2 }}>Bảng tin dự án</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tìm kiếm các nhóm đang cần kỹ năng của bạn.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', width: 280 }}>
              <input
                type="text"
                placeholder="Tìm kiếm tên dự án..."
                style={{ width: '100%', height: 38, padding: '0 12px 0 36px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '0.9rem', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 11, pointerEvents: 'none' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-subtle)', padding: '6px 14px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', height: 38 }}>
              Sắp xếp: Mới nhất <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* Grid (3x2) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {mockProjects.map(p => (
            <div
              key={p.id}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', position: 'relative', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'box-shadow 0.2s ease, transform 0.2s ease', height: '100%' }}
              onClick={() => setSelectedProject(p)}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >

              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: p.topColor, borderRadius: '10px 10px 0 0', opacity: p.id === 2 ? 1 : 0.5 }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {p.school && <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9A3412', background: '#FFEDD5', padding: '2px 8px', borderRadius: 99 }}>{p.school}</span>}
                  {p.match && <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#4F46E5', background: '#EEF2FF', padding: '2px 8px', borderRadius: 99 }}>{p.match}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Clock size={12} /> {p.timeLeft}
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3, color: 'var(--text-primary)', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.title}
              </h3>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.desc}
              </p>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Vị trí đang tuyển</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {p.roles.map((r, idx) => (
                    <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: r.bg, color: r.color, padding: '4px 10px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 }}>
                      <span style={{ fontSize: '0.9rem' }}>{r.icon}</span> {r.name}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFF7ED', color: '#9A3412', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                    {p.avatarText}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{p.author}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(234, 88, 12, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)'; }}
                    onClick={(e) => { e.stopPropagation(); /* Save logic */ }}
                  >
                    <Heart size={16} />
                  </button>
                  <button className="btn btn-primary" style={{ background: '#B45309', borderColor: '#B45309', borderRadius: 6, fontWeight: 600, padding: '0 16px', height: 34, fontSize: '0.85rem' }}>
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Bottom Center */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
          <button style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}><ChevronLeft size={18} /></button>
          <button style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid var(--primary)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontWeight: 600 }}>1</button>
          <button style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600 }}>2</button>
          <button style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600 }}>3</button>
          <button style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}><ChevronRight size={18} /></button>
        </div>

      </div>

      {/* ── Modal Chi Tiết Dự Án ── */}
      {selectedProject && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#FAFAFA', borderRadius: 12, width: '100%', maxWidth: 750, maxHeight: '90vh', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>

            {/* Modal Header */}
            <div style={{ padding: '24px 32px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', borderRadius: '12px 12px 0 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: 4 }}>Dự án Công nghệ</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> Đăng 2 ngày trước</span>
                </div>
                <button onClick={() => setSelectedProject(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={24} />
                </button>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedProject.title}</h2>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

              <div style={{ background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', padding: 24 }}>

                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <FileText size={18} /> Tổng quan Dự án
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                  {selectedProject.desc} Dự án yêu cầu sự kết hợp giữa phát triển frontend (React/Next.js) và tích hợp API backend với các mô hình ngôn ngữ lớn (LLMs).
                </p>

                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <CheckCircle size={18} /> Yêu cầu Ứng viên
                </h3>
                <ul style={{ paddingLeft: 24, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: 24 }}>
                  <li>Thành thạo React hoặc Next.js.</li>
                  <li>Có kiến thức cơ bản về RESTful APIs và xử lý dữ liệu JSON.</li>
                  <li>Cam kết ít nhất 15 giờ mỗi tuần trong 8 tuần tới.</li>
                  <li>Có thái độ chủ động trong việc học hỏi các kỹ thuật tích hợp AI mới.</li>
                </ul>

                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Award size={18} /> Quyền lợi Thành viên
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 16, display: 'flex', gap: 12 }}>
                    <div style={{ color: 'var(--primary)' }}><GraduationCap size={20} /></div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>Chứng nhận Kinh nghiệm</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Được cấp chứng nhận tham gia dự án thực tế quốc gia.</div>
                    </div>
                  </div>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 16, display: 'flex', gap: 12 }}>
                    <div style={{ color: 'var(--primary)' }}><Briefcase size={20} /></div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>Phát triển Kỹ năng</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Kinh nghiệm thực tế với các API AI hiện đại và Next.js.</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Application Form */}
              <div style={{ background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', padding: 24 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 20 }}>Nộp Hồ Sơ Ứng Tuyển</h3>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Tải lên CV (Bắt buộc) <span style={{ color: 'var(--error)' }}>*</span></label>
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-strong)', borderRadius: 6, padding: '24px', background: 'var(--bg-subtle)', cursor: 'pointer', transition: 'border-color 0.2s ease, background 0.2s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                  >
                    <UploadCloud size={32} color="var(--primary)" style={{ marginBottom: 12 }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Click để tải lên PDF</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dung lượng tối đa 5MB</span>
                    <input type="file" style={{ display: 'none' }} accept=".pdf" />
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Giới thiệu bản thân / Ghi chú</label>
                  <textarea
                    placeholder="Viết một đoạn ngắn giới thiệu bản thân và lý do bạn phù hợp với dự án..."
                    style={{ width: '100%', height: 100, padding: 12, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--text-primary)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  ></textarea>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '20px 32px', background: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 12, position: 'sticky', bottom: 0, borderRadius: '0 0 12px 12px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedProject(null)} style={{ padding: '0 20px', borderRadius: 6 }}>Hủy</button>
              <button className="btn btn-primary" onClick={() => setSelectedProject(null)} style={{ padding: '0 24px', borderRadius: 6, fontWeight: 600 }}>Gửi Hồ Sơ</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
