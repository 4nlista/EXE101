import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle, MessageSquare, X, ChevronRight, User, Eye, Filter, Briefcase, MapPin, GraduationCap, Award } from 'lucide-react';

const mockMyProjects = [
  {
    id: 1, title: 'Tái thiết kế trang Thương mại Điện tử', status: 'open',
    applicants: [
      { id: 1, name: 'Nguyễn Văn Demo', role: 'UI/UX Designer', match: 95, exp: '2 năm', status: 'pending', date: '2023-10-25' },
      { id: 2, name: 'Trần Thị Test', role: 'Frontend Dev', match: 82, exp: '1 năm', status: 'pending', date: '2023-10-24' }
    ]
  },
  {
    id: 2, title: 'Hệ thống Quản lý Đào tạo', status: 'in-progress',
    applicants: [
      { id: 3, name: 'Lê Văn C', role: 'Backend Dev', match: 70, exp: 'Sinh viên', status: 'approved', date: '2023-10-20' }
    ]
  }
];

export default function ManageProjectsPage() {
  const navigate = useNavigate();
  const [selectedProj, setSelectedProj] = useState(mockMyProjects[0]);
  const [projects, setProjects] = useState(mockMyProjects);
  
  // Filters state
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  
  const [showCV, setShowCV] = useState(null); // hold applicant info to show dummy CV

  const handleApprove = (projId, appId) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          applicants: p.applicants.map(a => a.id === appId ? { ...a, status: 'approved' } : a)
        };
      }
      return p;
    }));
    
    if (selectedProj.id === projId) {
      setSelectedProj(prev => ({
        ...prev,
        applicants: prev.applicants.map(a => a.id === appId ? { ...a, status: 'approved' } : a)
      }));
    }
  };

  const handleReject = (projId, appId) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          applicants: p.applicants.map(a => a.id === appId ? { ...a, status: 'rejected' } : a)
        };
      }
      return p;
    }));
    
    if (selectedProj.id === projId) {
      setSelectedProj(prev => ({
        ...prev,
        applicants: prev.applicants.map(a => a.id === appId ? { ...a, status: 'rejected' } : a)
      }));
    }
  };
  
  // Lọc và Sắp xếp
  const getFilteredApplicants = () => {
    if (!selectedProj) return [];
    
    let filtered = selectedProj.applicants.filter(a => {
      if (statusFilter === 'all') return true;
      return a.status === statusFilter;
    });
    
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return filtered;
  };

  const filteredApplicants = getFilteredApplicants();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 24, padding: 24, height: 'calc(100vh - 110px)' }}>
      {/* ── Left: Project List ── */}
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16, borderRight: '1px solid var(--border)', paddingRight: 24 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Quản lý Dự án</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
          {projects.map(p => {
            const pendingCount = p.applicants.filter(a => a.status === 'pending').length;
            return (
              <div 
                key={p.id} 
                style={{ 
                  padding: 16, border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer',
                  background: selectedProj?.id === p.id ? 'var(--bg-subtle)' : 'var(--bg)',
                  borderColor: selectedProj?.id === p.id ? 'var(--primary)' : 'var(--border)'
                }}
                onClick={() => setSelectedProj(p)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.4 }}>{p.title}</div>
                  {pendingCount > 0 && (
                    <div style={{ background: '#EF4444', color: 'white', fontSize: '0.7rem', fontWeight: 700, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {pendingCount}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {p.applicants.length} ứng viên • {p.status === 'open' ? 'Đang tuyển' : 'Đang thực hiện'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: Applicant List ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedProj ? (
          <>
            <div style={{ paddingBottom: 20, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>{selectedProj.title}</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Danh sách ứng viên đã nộp hồ sơ</p>
                </div>
                
                {/* Filters */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', fontSize: '0.85rem' }}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chưa xử lý</option>
                    <option value="approved">Đã phê duyệt</option>
                    <option value="rejected">Từ chối</option>
                  </select>
                  
                  <select 
                    value={sortOrder} 
                    onChange={e => setSortOrder(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', fontSize: '0.85rem' }}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', paddingRight: 8 }}>
              {filteredApplicants.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg)' }}>
                  
                  {/* Clickable Profile Section */}
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, cursor: 'pointer' }}
                    onClick={() => navigate(`/profile/${a.id}`)}
                    onMouseEnter={(e) => e.currentTarget.querySelector('h4').style.color = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.querySelector('h4').style.color = 'var(--text-primary)'}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={24} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, transition: 'color 0.2s' }}>{a.name}</h4>
                        <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                          Match {a.match}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Ứng tuyển: <strong>{a.role}</strong> • {a.exp} • Nộp ngày: {a.date}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    
                    <button className="btn btn-sm btn-secondary" onClick={() => setShowCV(a)}>
                      <Eye size={16} /> Xem CV
                    </button>
                    
                    <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 8px' }}></div>
                    
                    {a.status === 'pending' ? (
                      <>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleReject(selectedProj.id, a.id)}>
                          <X size={16} />
                        </button>
                        <button className="btn btn-sm btn-primary" onClick={() => handleApprove(selectedProj.id, a.id)}>
                          <CheckCircle size={16} /> Duyệt
                        </button>
                      </>
                    ) : a.status === 'approved' ? (
                      <button className="btn btn-sm btn-secondary" style={{ color: '#059669', borderColor: '#34D399' }} onClick={() => navigate(`/messages?userId=${a.id}`)}>
                        <MessageSquare size={16} /> Nhắn tin
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg-muted)', padding: '6px 12px', borderRadius: 6 }}>Đã từ chối</span>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredApplicants.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
                  Không tìm thấy ứng viên phù hợp với bộ lọc.
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            Chọn một dự án để xem danh sách ứng viên
          </div>
        )}
      </div>

      {/* CV Modal Fake */}
      {showCV && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 0, width: '100%', maxWidth: 800, height: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Hồ sơ ứng viên</h2>
              <button onClick={() => setShowCV(null)} style={{ background: 'var(--bg-muted)', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}><X size={18} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>
              {/* Header CV */}
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(showCV.name)}&background=random&size=100`} alt="" style={{ borderRadius: 16 }} />
                <div>
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{showCV.name}</h1>
                  <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', display: 'flex', gap: 16 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={16} /> Ứng tuyển: {showCV.role}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={16} /> Hà Nội, Việt Nam</span>
                  </div>
                </div>
              </div>

              {/* Grid content */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <section>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '2px solid var(--primary)', paddingBottom: 8, marginBottom: 16, display: 'inline-block' }}>Tóm tắt mục tiêu</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Tôi là một người đam mê công nghệ và sáng tạo, luôn tìm kiếm cơ hội để áp dụng kiến thức vào thực tế. Với tinh thần học hỏi cao, tôi mong muốn đóng góp giá trị cho dự án và phát triển bản thân trong môi trường chuyên nghiệp.
                    </p>
                  </section>
                  
                  <section>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '2px solid var(--primary)', paddingBottom: 8, marginBottom: 16, display: 'inline-block' }}>Kinh nghiệm làm việc / Dự án</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Dự án {showCV.role}</strong>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>2023 - Hiện tại</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>- Tham gia phát triển các tính năng cốt lõi.<br/>- Làm việc theo mô hình Agile/Scrum.<br/>- Đạt giải thưởng dự án xuất sắc quý 3.</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '2px solid var(--primary)', paddingBottom: 8, marginBottom: 16, display: 'inline-block' }}>Học vấn</h3>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Đại học Công nghệ - VNU</strong>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: 4 }}>Cử nhân Công nghệ thông tin (GPA: 3.6/4.0)</div>
                    </div>
                  </section>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingLeft: 24, borderLeft: '1px solid var(--border)' }}>
                  <section>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Kỹ năng chuyên môn</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['JavaScript', 'ReactJS', 'NodeJS', 'Figma', 'UI/UX', 'Git'].map(skill => (
                        <span key={skill} style={{ padding: '6px 12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 99, fontSize: '0.85rem', fontWeight: 600 }}>{skill}</span>
                      ))}
                    </div>
                  </section>
                  
                  <section>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Kỹ năng mềm</h3>
                    <ul style={{ color: 'var(--text-secondary)', paddingLeft: 20, fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <li>Làm việc nhóm</li>
                      <li>Giải quyết vấn đề</li>
                      <li>Quản lý thời gian</li>
                      <li>Giao tiếp hiệu quả</li>
                    </ul>
                  </section>
                </div>

              </div>
            </div>

            <div style={{ padding: '20px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 12, background: 'var(--bg-subtle)' }}>
              <button className="btn btn-secondary" onClick={() => setShowCV(null)}>Đóng lại</button>
              <button className="btn btn-primary" onClick={() => {
                navigate(`/messages?userId=${showCV.id}`);
                setShowCV(null);
              }}><MessageSquare size={18} /> Nhắn tin ngay</button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
