import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Clock, ChevronDown, ChevronLeft, ChevronRight, X, FileText, CheckCircle, Award, UploadCloud, GraduationCap, Briefcase, Users, Search, Heart, Palette, Code, Target, Cpu, Settings } from 'lucide-react';

const mockProjects = [
  // Premium - Sinh Viên
  { id: 101, package: 'premium', title: 'Phân tích Data Customer', author: 'Team DataV', authorId: 1, avatarText: 'DV', school: 'ĐH Bách Khoa', target: 'student', match: 'Phù hợp 98%', timeLeft: 'Còn 1 ngày', desc: 'Cần bạn làm Data Analyst, có khả năng dùng Python/R để clean data và viz bằng PowerBI.', roles: [{ name: '1 Data Analyst', icon: <Cpu size={14} /> }] },
  { id: 102, package: 'premium', title: 'Thiết kế Game Mobile 2D', author: 'Studio X', authorId: 2, avatarText: 'SX', school: 'RMIT VN', target: 'student', timeLeft: 'Còn 3 ngày', desc: 'Tuyển 2D Artist vẽ nhân vật phong cách Anime/Chibi. Làm remote part-time.', roles: [{ name: '1 2D Artist', icon: <Palette size={14} /> }] },
  { id: 103, package: 'premium', title: 'Fullstack Dev - Web3 Dapp', author: 'Lê Nguyên', authorId: 3, avatarText: 'LN', target: 'student', match: 'Phù hợp 85%', timeLeft: 'Còn 5 ngày', desc: 'Khởi nghiệp Web3 cần Dev làm Nodejs/React. Trả lương hoặc shares.', roles: [{ name: '2 Fullstack', icon: <Code size={14} /> }] },
  // VIP - Sinh viên
  { id: 104, package: 'vip', title: 'Trợ lý Marketing Sinh Viên', author: 'CLB Truyền thông', authorId: 4, avatarText: 'TT', school: 'ĐH KHXH&NV', target: 'student', timeLeft: 'Còn 2 ngày', desc: 'Lên kế hoạch content fanpage và tổ chức event nội bộ.', roles: [{ name: '1 Content', icon: <Target size={14} /> }] },
  { id: 105, package: 'vip', title: 'Nghiên cứu thị trường F&B', author: 'Hoàng Lan', authorId: 5, avatarText: 'HL', school: 'ĐH Kinh tế', target: 'student', match: 'Phù hợp 90%', timeLeft: 'Còn 1 tuần', desc: 'Đi khảo sát, gọi điện thoại lấy insight khách hàng cho chuỗi cafe mới.', roles: [{ name: '1 Research', icon: <Users size={14} /> }] },
  // Normal - Sinh Viên
  { id: 1, title: 'Tái thiết kế trang Thương mại Điện tử', author: 'Lê Anh', authorId: 1, avatarText: 'LA', school: 'ĐH Bách Khoa', target: 'student', timeLeft: 'Còn 3 ngày', desc: 'Tìm kiếm UI/UX Designer sáng tạo và Frontend Developer để cải tiến trang web.', roles: [{ name: '1 Thiết kế', icon: <Palette size={14} /> }, { name: '2 Frontend', icon: <Code size={14} /> }] },
  { id: 2, title: 'Tài liệu Pitching Startup Công nghệ', author: 'Minh Tuấn', authorId: 2, avatarText: 'MT', school: 'RMIT VN', target: 'student', match: 'Phù hợp 92%', timeLeft: 'Còn 1 tuần', desc: 'Cần một trưởng nhóm có tư duy kinh doanh và một designer để giúp xây dựng bộ tài liệu pitching.', roles: [{ name: '1 Trưởng nhóm', icon: <Target size={14} /> }, { name: '1 Thiết kế', icon: <Palette size={14} /> }] },
  { id: 3, title: 'Hệ thống Tạo Portfolio Tự động bằng AI', author: 'Hoàng Long', authorId: 1, avatarText: 'HL', school: 'ĐH FPT', target: 'student', timeLeft: 'Còn 2 tuần', desc: 'Chúng tôi đang xây dựng một nền tảng sử dụng AI để tự động tạo một trang web portfolio chuyên nghiệp.', roles: [{ name: '2 Frontend', icon: <Code size={14} /> }, { name: '1 AI', icon: <Cpu size={14} /> }] },
  { id: 6, title: 'Thiết kế Logo và Brand Identity', author: 'Startup XYZ', authorId: 3, avatarText: 'XY', target: 'student', timeLeft: 'Còn 1 tuần', desc: 'Cần một bạn sinh viên thiết kế bộ nhận diện thương hiệu cho quán cafe mới mở, phong cách minimal.', roles: [{ name: '1 Thiết kế', icon: <Palette size={14} /> }] },

  // Premium - Đi làm
  { id: 201, package: 'premium', title: 'Lead Backend Engineer (Go/Nodejs)', author: 'Tech Corp', authorId: 4, avatarText: 'TC', target: 'professional', match: 'Phù hợp 99%', timeLeft: 'Còn 2 ngày', desc: 'Tuyển gấp Lead Backend. Range lương 2000-3000$. Làm việc tại Quận 1, TPHCM.', roles: [{ name: '1 Lead Backend', icon: <Settings size={14} /> }] },
  { id: 202, package: 'premium', title: 'Product Manager - EdTech', author: 'EduTech Inc.', authorId: 5, avatarText: 'ET', target: 'professional', timeLeft: 'Còn 4 ngày', desc: 'Cần PM có kinh nghiệm làm các sản phẩm Edtech. Lương thỏa thuận.', roles: [{ name: '1 PM', icon: <Target size={14} /> }] },
  // VIP - Đi làm
  { id: 203, package: 'vip', title: 'Mobile Dev (Flutter/React Native)', author: 'AppVn', authorId: 6, avatarText: 'AV', target: 'professional', match: 'Phù hợp 88%', timeLeft: 'Còn 1 tuần', desc: 'Dự án outsource ngắn hạn (3 tháng). Remote 100%. Lương theo giờ.', roles: [{ name: '1 Mobile Dev', icon: <Code size={14} /> }] },
  { id: 204, package: 'vip', title: 'Chuyên viên SEO / Digital Marketing', author: 'BDS Group', authorId: 7, avatarText: 'BD', target: 'professional', timeLeft: 'Còn 10 ngày', desc: 'Đẩy top từ khóa mảng Bất động sản. Cần rank top 5 Google trong 3 tháng.', roles: [{ name: '1 SEO', icon: <Users size={14} /> }] },
  // Normal - Đi làm
  { id: 4, title: 'App quản lý chi tiêu cá nhân (Startup)', author: 'Trần Thị B', authorId: 2, avatarText: 'TB', target: 'professional', timeLeft: 'Còn 4 ngày', desc: 'Team đang có 3 người (1 Business, 1 UI, 1 Mobile). Cần tuyển gấp 1 bạn làm Backend Node.js có kinh nghiệm.', roles: [{ name: '1 Backend', icon: <Settings size={14} /> }] },
  { id: 5, title: 'Freelance - Cắt HTML/CSS Landing Page', author: 'Công ty ABC', authorId: 3, avatarText: 'AB', target: 'professional', timeLeft: 'Còn 5 ngày', desc: 'Cần một bạn cắt HTML/CSS/JS thuần cho 5 trang Landing page quảng cáo. Yêu cầu pixel-perfect và responsive tốt.', roles: [{ name: '1 Frontend', icon: <Code size={14} /> }] }
];

export default function FeedPage() {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const [targetAudience, setTargetAudience] = useState('student'); // 'student' | 'professional'
  const [openDropdown, setOpenDropdown] = useState(null); // 'linhvuc' | 'vaitro' | null
  const [projects, setProjects] = useState(mockProjects);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', overview: '', requirements: '', benefits: '', members: '', package: 'free' });

  // Filter state
  const [selectedLinhVuc, setSelectedLinhVuc] = useState('Tất cả lĩnh vực');
  const [selectedVaiTro, setSelectedVaiTro] = useState('Tất cả vai trò');

  const linhVucOptions = ['Tất cả lĩnh vực', 'Kinh doanh/Bán hàng', 'Marketing/PR', 'Chăm sóc khách hàng', 'Nhân sự/Hành chính', 'Công nghệ Thông tin'];
  const vaiTroOptions = ['Tất cả vai trò', 'Thiết kế UI/UX', 'Lập trình viên', 'Trưởng nhóm', 'Kiểm thử (Tester)', 'Phân tích dữ liệu'];

  const handleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleClearFilter = () => {
    setSelectedLinhVuc('Tất cả lĩnh vực');
    setSelectedVaiTro('Tất cả vai trò');
  };

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.overview || !newPost.requirements || !newPost.benefits || !newPost.members) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    const createdPost = {
      id: Date.now(),
      title: newPost.title,
      author: 'Tôi',
      authorId: 999,
      avatarText: 'T',
      target: targetAudience,
      timeLeft: 'Vừa xong',
      desc: newPost.overview,
      package: newPost.package,
      roles: newPost.members.split(',').map(m => ({ name: m.trim(), icon: <Target size={14} /> }))
    };

    // Theo logic sort: bài premium lên top, rồi đến vip, rồi bài thường
    // Nên mock logic insert lên đầu danh sách
    setProjects(prev => [createdPost, ...prev]);
    setShowCreateModal(false);
    setNewPost({ title: '', overview: '', requirements: '', benefits: '', members: '', package: 'free' });
    alert("Tạo bài đăng thành công!");
  };

  const filteredProjects = projects.filter(p => {
    return p.target === targetAudience;
  }).sort((a, b) => {
    const score = p => p.package === 'premium' ? 3 : p.package === 'vip' ? 2 : 1;
    return score(b) - score(a);
  });

  return (
    <div style={{ display: 'flex', width: '100%', maxWidth: '100%', margin: '0 auto', padding: '0 40px' }}>

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
            <span>{selectedLinhVuc}</span>
            <ChevronDown size={16} color="var(--text-muted)" />
          </div>

          {openDropdown === 'linhvuc' && (
            <div style={{ position: 'absolute', top: 72, left: 0, width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 10, padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
              {linhVucOptions.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => { setSelectedLinhVuc(opt); setOpenDropdown(null); }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', cursor: 'pointer', fontSize: '0.9rem', color: selectedLinhVuc === opt ? 'var(--primary)' : 'var(--text-primary)', transition: 'background 0.2s, color 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = selectedLinhVuc === opt ? 'var(--primary)' : 'var(--text-primary)'; e.currentTarget.style.background = 'transparent'; }}
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
            <span>{selectedVaiTro}</span>
            <ChevronDown size={16} color="var(--text-muted)" />
          </div>

          {openDropdown === 'vaitro' && (
            <div style={{ position: 'absolute', top: 72, left: 0, width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 10, padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
              {vaiTroOptions.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => { setSelectedVaiTro(opt); setOpenDropdown(null); }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', cursor: 'pointer', fontSize: '0.9rem', color: selectedVaiTro === opt ? 'var(--primary)' : 'var(--text-primary)', transition: 'background 0.2s, color 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = selectedVaiTro === opt ? 'var(--primary)' : 'var(--text-primary)'; e.currentTarget.style.background = 'transparent'; }}
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
          <button className="btn btn-secondary" onClick={handleClearFilter} style={{ flex: 1, borderRadius: 6, fontWeight: 600, justifyContent: 'center' }}>
            Xóa
          </button>
          <button className="btn btn-primary" onClick={() => setOpenDropdown(null)} style={{ flex: 1, borderRadius: 6, fontWeight: 600, justifyContent: 'center' }}>
            Lọc
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, padding: '24px 0 24px 32px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

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
                style={{ width: '100%', height: 38, padding: '0 12px 0 36px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '0.9rem', outline: 'none', color: 'var(--text-primary)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 11, pointerEvents: 'none' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-subtle)', padding: '6px 14px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', height: 38 }}>
              Sắp xếp: Mới nhất <ChevronDown size={14} />
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F97316', color: 'white', padding: '0 16px', borderRadius: 8, height: 38, fontSize: '0.9rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(249, 115, 22, 0.2)' }}
            >
              + Tạo bài đăng
            </button>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24, paddingRight: 32 }}>
          {filteredProjects.map(p => (
            <div
              key={p.id}
              style={{ background: 'var(--bg)', border: p.package === 'premium' ? '2px solid #F59E0B' : p.package === 'vip' ? '1px solid #10B981' : '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', position: 'relative', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'box-shadow 0.2s ease, transform 0.2s ease', height: '100%' }}
              onClick={() => setSelectedProject(p)}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: p.topColor || (p.package === 'premium' ? '#F59E0B' : p.package === 'vip' ? '#10B981' : 'var(--primary)'), borderRadius: '10px 10px 0 0', opacity: 1 }} />

              {p.package === 'premium' && (
                <div style={{ position: 'absolute', top: 4, left: 0, background: 'linear-gradient(90deg, #FDE68A 0%, #F59E0B 100%)', color: '#92400E', padding: '2px 8px', borderRadius: '0 4px 4px 0', fontSize: '0.65rem', fontWeight: 800, zIndex: 10, boxShadow: '0 2px 4px rgba(245,158,11,0.3)' }}>
                  PRE.
                </div>
              )}
              {p.package === 'vip' && (
                <div style={{ position: 'absolute', top: 4, left: 0, background: 'linear-gradient(90deg, #A7F3D0 0%, #10B981 100%)', color: '#064E3B', padding: '2px 8px', borderRadius: '0 4px 4px 0', fontSize: '0.65rem', fontWeight: 800, zIndex: 10, boxShadow: '0 2px 4px rgba(16,185,129,0.3)' }}>
                  VIP
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12, marginTop: (p.package === 'premium' || p.package === 'vip') ? 16 : 0 }}>
                <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                  {p.school && <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9A3412', background: '#FFEDD5', padding: '2px 8px', borderRadius: 99 }}>{p.school}</span>}
                  {p.match && <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#4F46E5', background: '#EEF2FF', padding: '2px 8px', borderRadius: 99 }}>{p.match}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Clock size={12} /> {p.timeLeft}
                </div>
              </div>

              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.3, color: 'var(--text-primary)', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.title}
              </h3>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.desc}
              </p>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Số lượng tuyển: <span style={{ color: 'var(--primary)' }}>{p.roles ? p.roles.reduce((a, r) => a + (parseInt(r.name) || 1), 0) : 1} ứng viên</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${p.authorId}`);
                  }}
                  onMouseEnter={(e) => e.currentTarget.querySelector('span').style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.querySelector('span').style.color = 'var(--text-primary)'}
                >
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFF7ED', color: '#9A3412', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                    {p.avatarText}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', transition: 'color 0.2s' }}>{p.author}</span>
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

      {/* ── Modal Tạo Bài Đăng ── */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(2px)' }}>
          <div style={{ background: 'var(--bg)', borderRadius: 12, width: '100%', maxWidth: 750, maxHeight: '90vh', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '20px 32px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tạo bài đăng mới</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}><X size={24} /></button>
            </div>

            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>Tiêu đề dự án *</label>
                <input type="text" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', color: 'var(--text-primary)' }} placeholder="Nhập tiêu đề ngắn gọn..." />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>Tổng quan dự án * <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>(tối đa 500 từ)</span></label>
                <textarea value={newPost.overview} onChange={e => setNewPost({ ...newPost, overview: e.target.value })} rows={4} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', resize: 'vertical', color: 'var(--text-primary)' }} placeholder="Mô tả dự án của bạn..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>Yêu cầu ứng viên *</label>
                  <textarea value={newPost.requirements} onChange={e => setNewPost({ ...newPost, requirements: e.target.value })} rows={4} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', resize: 'vertical', color: 'var(--text-primary)' }} placeholder="Kỹ năng, kinh nghiệm..." />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>Quyền lợi *</label>
                  <textarea value={newPost.benefits} onChange={e => setNewPost({ ...newPost, benefits: e.target.value })} rows={4} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', resize: 'vertical', color: 'var(--text-primary)' }} placeholder="Lương, thưởng, chứng nhận..." />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {targetAudience === 'student' ? (
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>Chuyên ngành *</label>
                    <input type="text" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', color: 'var(--text-primary)' }} placeholder="Nhập chuyên ngành (vd: CNTT, Kinh tế...)" />
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>Lĩnh vực *</label>
                    <input type="text" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', color: 'var(--text-primary)' }} placeholder="Nhập lĩnh vực..." />
                  </div>
                )}

                {targetAudience === 'student' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>Trường đại học *</label>
                    <input type="text" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', color: 'var(--text-primary)' }} placeholder="Nhập trường đại học..." />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>Hạn chót (Ngày kết thúc) *</label>
                  <input type="text" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', color: 'var(--text-primary)' }} placeholder="hh:mm dd/mm/yyyy" />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>Số lượng tuyển *</label>
                  <input type="number" min="1" max="100" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', color: 'var(--text-primary)' }} placeholder="Ví dụ: 3" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>Chi tiết vị trí (Thành viên & Vai trò) *</label>
                <input type="text" value={newPost.members} onChange={e => setNewPost({ ...newPost, members: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', color: 'var(--text-primary)' }} placeholder="Ví dụ: 1 Thiết kế, 2 Lập trình viên..." />
              </div>

              <div style={{ marginTop: 12 }}>
                <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Chọn gói đăng tin</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <div
                    onClick={() => setNewPost({ ...newPost, package: 'free' })}
                    style={{ border: newPost.package === 'free' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: 8, padding: 16, cursor: 'pointer', background: 'var(--bg)', textAlign: 'center' }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Miễn phí</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Hiển thị tiêu chuẩn</div>
                  </div>
                  <div
                    onClick={() => setNewPost({ ...newPost, package: 'vip' })}
                    style={{ border: newPost.package === 'vip' ? '2px solid #10B981' : '1px solid var(--border)', borderRadius: 8, padding: 16, cursor: 'pointer', background: 'var(--bg)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: '#10B981' }} />
                    <div style={{ fontWeight: 800, color: '#10B981', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Award size={16} /> VIP</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 4 }}>50,000đ</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Ưu tiên hiển thị 3 ngày</div>
                  </div>
                  <div
                    onClick={() => setNewPost({ ...newPost, package: 'premium' })}
                    style={{ border: newPost.package === 'premium' ? '2px solid #F59E0B' : '1px solid var(--border)', borderRadius: 8, padding: 16, cursor: 'pointer', background: 'var(--bg)', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: newPost.package === 'premium' ? '0 4px 12px rgba(245, 158, 11, 0.2)' : 'none' }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: '#F59E0B' }} />
                    <div style={{ fontWeight: 800, color: '#F59E0B', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Award size={16} /> PREMIUM</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 4 }}>100,000đ</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Luôn hiển thị đầu trang</div>
                  </div>
                </div>
              </div>

            </div>

            <div style={{ padding: '20px 32px', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 12, position: 'sticky', bottom: 0 }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleCreatePost}>Đăng bài ngay</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Chi Tiết Dự Án ── */}
      {selectedProject && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(2px)' }}>
          <div style={{ background: 'var(--bg)', borderRadius: 12, width: '100%', maxWidth: 750, maxHeight: '90vh', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>

            {/* Modal Header */}
            <div style={{ padding: '24px 32px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', borderRadius: '12px 12px 0 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {selectedProject.package === 'premium' && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E', background: 'linear-gradient(90deg, #FDE68A 0%, #F59E0B 100%)', padding: '4px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Award size={12} /> PREMIUM</span>}
                  {selectedProject.package === 'vip' && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#064E3B', background: 'linear-gradient(90deg, #A7F3D0 0%, #10B981 100%)', padding: '4px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Award size={12} /> VIP</span>}
                  {!selectedProject.package && <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: 4 }}>Dự án Công nghệ</span>}
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
                  {selectedProject.desc} Dự án yêu cầu sự kết hợp giữa phát triển frontend (React/Next.js) và tích hợp API backend.
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
                  <Users size={18} /> Chi tiết số lượng thành viên ({selectedProject.roles ? selectedProject.roles.reduce((a, r) => a + (parseInt(r.name) || 1), 0) : 1} ứng viên)
                </h3>
                <ul style={{ paddingLeft: 24, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: 24 }}>
                  {selectedProject.roles ? selectedProject.roles.map((r, i) => <li key={i}>{r.name}</li>) : <li>1 Thành viên</li>}
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
