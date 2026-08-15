import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProjects, getUsers } from '../../utils/storage';
import {
  Briefcase, FolderGit2, Star, CheckCircle, X, MessageSquare,
  ChevronLeft, Users, FileText, Target, Clock, MoreVertical, Shield
} from 'lucide-react';

// Giả lập danh sách ứng viên (vì trong mockData chưa có data ứng viên)
const mockApplicants = [
  { id: 2, name: 'Nguyễn Văn A', role: 'Data Analyst', match: 95, exp: '2 năm', date: '2023-10-25', status: 'pending' },
  { id: 3, name: 'Trần Thị B', role: 'Frontend Dev', match: 82, exp: '1 năm', date: '2023-10-24', status: 'approved' },
  { id: 4, name: 'Lê Văn C', role: 'UI/UX Designer', match: 70, exp: 'Sinh viên', date: '2023-10-20', status: 'rejected' }
];

// Giả lập danh sách thành viên dự án tham gia
const mockMembers = [
  { id: 2, name: 'Nguyễn Văn A', role: 'Chủ dự án' },
  { id: 5, name: 'Phạm Thị D', role: 'Developer' },
];

export default function ManageProjectsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Tạm mặc định userId là 1 nếu chưa đăng nhập thực sự (để khớp mockData)
  const currentUserId = user?.id || 1;

  const [activeTab, setActiveTab] = useState('posted'); // 'posted' | 'joined'
  const [myPostedProjects, setMyPostedProjects] = useState([]);
  const [myJoinedProjects, setMyJoinedProjects] = useState([]);

  // Trạng thái cho màn hình chi tiết
  const [selectedProject, setSelectedProject] = useState(null);
  const [applicants, setApplicants] = useState(mockApplicants); // Dummy state cho danh sách ứng viên
  const [applicantFilter, setApplicantFilter] = useState('all');
  const [applicantPage, setApplicantPage] = useState(1);
  const applicantsPerPage = 3;

  // Trạng thái cho Đánh giá
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewNote, setReviewNote] = useState('');

  // Tải dữ liệu ban đầu
  useEffect(() => {
    const allProjects = getProjects();
    // Dự án của tôi đăng (authorId = currentUserId)
    const posted = allProjects.filter(p => p.authorId === currentUserId).map(p => ({
      ...p,
      status: p.timeLeft?.includes('Còn') ? 'ongoing' : 'completed' // Tạm logic fake trạng thái
    }));

    // Tạm fake 1 dự án joined (giả định project id 104)
    const joined = allProjects.filter(p => p.id === 104).map(p => ({
      ...p,
      status: 'completed', // Giả lập dự án này đã kết thúc để test nút Đánh giá
      role: 'Content Creator'
    }));

    // Thêm 1 dự án đang diễn ra
    const joined2 = allProjects.filter(p => p.id === 105).map(p => ({
      ...p,
      status: 'ongoing',
      role: 'Market Researcher'
    }));

    setMyPostedProjects(posted);
    setMyJoinedProjects([...joined, ...joined2]);
  }, [currentUserId]);

  // Hành động Duyệt / Từ chối
  const handleApprove = (appId) => {
    setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: 'approved' } : a));
  };
  const handleReject = (appId) => {
    setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: 'rejected' } : a));
  };

  // Nút đánh giá
  const openReviewModal = (member) => {
    setReviewTarget(member);
    setRating(0);
    setReviewNote('');
    setShowReviewModal(true);
  };

  const submitReview = () => {
    alert(`Đã gửi đánh giá ${rating} sao cho ${reviewTarget.name}`);
    setShowReviewModal(false);
  };

  // Lọc và phân trang ứng viên
  const filteredApplicants = applicants.filter(a => applicantFilter === 'all' || a.status === applicantFilter);
  const totalApplicantPages = Math.ceil(filteredApplicants.length / applicantsPerPage) || 1;
  const paginatedApplicants = filteredApplicants.slice((applicantPage - 1) * applicantsPerPage, applicantPage * applicantsPerPage);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)', background: '#F8FAFC' }}>

      {/* ── Sidebar (Left) ── */}
      <div style={{ width: 280, background: 'var(--bg)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Quản lý Công việc</h2>
        </div>

        <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button
            onClick={() => { setActiveTab('posted'); setSelectedProject(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: activeTab === 'posted' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'posted' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'posted' ? 700 : 500, transition: 'all 0.2s'
            }}
          >
            <FolderGit2 size={20} /> Bài đăng dự án
          </button>

          <button
            onClick={() => { setActiveTab('joined'); setSelectedProject(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: activeTab === 'joined' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'joined' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'joined' ? 700 : 500, transition: 'all 0.2s'
            }}
          >
            <Briefcase size={20} /> Dự án của tôi
          </button>
        </div>
      </div>

      {/* ── Main Content (Right) ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {!selectedProject ? (
          /* ── Danh sách dạng Bảng (Table) ── */
          <div style={{ padding: 32, overflowY: 'auto' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>
              {activeTab === 'posted' ? 'Danh sách Bài đăng dự án' : 'Dự án đã tham gia'}
            </h1>

            <div style={{ background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-subtle)' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>TIÊU ĐỀ</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{activeTab === 'posted' ? 'SỐ LƯỢNG' : 'VAI TRÒ CỦA TÔI'}</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>THỜI HẠN</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>TRẠNG THÁI</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === 'posted' ? myPostedProjects : myJoinedProjects).map((p, idx) => {
                    const isCompleted = p.status === 'completed';
                    return (
                      <tr
                        key={p.id}
                        style={{ borderTop: '1px solid var(--border)', opacity: isCompleted ? 0.6 : 1, cursor: 'pointer', transition: 'background 0.2s' }}
                        onClick={() => setSelectedProject(p)}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--text-primary)' }}>{p.title}</td>
                        <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
                          {activeTab === 'posted' ? (p.roles ? p.roles.reduce((a, r) => a + (parseInt(r.quantity) || 1), 0) : 1) + ' ứng viên' : p.role}
                        </td>
                        <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{p.timeLeft || 'Không giới hạn'}</td>
                        <td style={{ padding: '16px 24px' }}>
                          {isCompleted ? (
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', background: '#F1F5F9', padding: '4px 10px', borderRadius: 99 }}>Đã kết thúc</span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#059669', background: '#D1FAE5', padding: '4px 10px', borderRadius: 99 }}>Đang diễn ra</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          {!isCompleted && activeTab === 'posted' && (
                            <button onClick={(e) => { e.stopPropagation(); alert('Mở menu sửa'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                              <MoreVertical size={20} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {(activeTab === 'posted' ? myPostedProjects : myJoinedProjects).length === 0 && (
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                  Không có dữ liệu dự án nào.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── Màn hình chi tiết Split Layout ── */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Header Màn hình chi tiết */}
            <div style={{ padding: '10px 24px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => setSelectedProject(null)}
                  style={{ background: 'var(--bg-muted)', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <ChevronLeft size={18} />
                </button>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{selectedProject.title}</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    • {activeTab === 'posted' ? 'Quản lý bài đăng dự án' : 'Chi tiết dự án tham gia'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                {activeTab === 'posted' && selectedProject.status !== 'completed' && (
                  <button className="btn btn-primary" style={{ height: 32, padding: '0 12px', fontSize: '0.85rem' }}>Đóng dự án</button>
                )}
              </div>
            </div>

            {/* Chi tiết Nội dung */}
            {activeTab === 'posted' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '16px 24px', gap: 12, background: '#F8FAFC' }}>

                {/* Box 1 (Box trên - Chi tiết Dự án Caro) */}
                <div style={{ background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', padding: 12 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={16} color="var(--primary)" /> Chi tiết Bài đăng</h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>Tiêu đề</div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedProject.title}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>Đối tượng</div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedProject.target === 'student' ? 'Sinh viên' : 'Người đi làm'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>Hạn chót</div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedProject.timeLeft}</div>
                    </div>

                    {selectedProject.target === 'student' ? (
                      <>
                        <div style={{ gridColumn: 'span 2' }}>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>Trường đại học</div>
                          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedProject.school || 'Không yêu cầu'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>Mục tiêu điểm</div>
                          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedProject.targetScore || 'Không'}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ gridColumn: 'span 2' }}>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>Lĩnh vực</div>
                          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedProject.field || 'Công nghệ phần mềm'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>Mức lương</div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-dark)' }}>{selectedProject.salary || 'Thỏa thuận'}</div>
                        </div>
                      </>
                    )}

                    <div style={{ gridColumn: 'span 3', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 2 }}>Tổng quan Dự án</div>
                      <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>{selectedProject.desc}</p>
                    </div>
                  </div>
                </div>

                {/* Box 2 (Box dưới - Danh sách ứng viên) */}
                <div style={{ background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}><Users size={16} color="var(--primary)" /> Danh sách Ứng viên</h3>
                    <select
                      value={applicantFilter}
                      onChange={e => { setApplicantFilter(e.target.value); setApplicantPage(1); }}
                      style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', fontSize: '0.85rem' }}
                    >
                      <option value="all">Tất cả</option>
                      <option value="pending">Chưa duyệt</option>
                      <option value="approved">Đã duyệt</option>
                      <option value="rejected">Từ chối</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {paginatedApplicants.map(a => (
                      <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: '#F8FAFC', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                            {a.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 2 }}>{a.name} <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: 4, marginLeft: 8 }}>Phù hợp {a.match}%</span></div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ứng tuyển: <strong>{a.role}</strong> • {a.date}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {a.status === 'pending' && (
                            <>
                              <button onClick={() => handleReject(a.id)} className="btn btn-sm" style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#FEE2E2', color: '#B91C1C', border: 'none' }}>
                                <X size={14} /> Từ chối
                              </button>
                              <button onClick={() => handleApprove(a.id)} className="btn btn-sm btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                                <CheckCircle size={14} /> Duyệt
                              </button>
                            </>
                          )}
                          {a.status === 'approved' && (
                            <>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14} /> Đã duyệt</span>
                              <button className="btn btn-sm btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => navigate(`/messages?userId=${a.id}`)}>
                                <MessageSquare size={14} /> Nhắn tin
                              </button>
                            </>
                          )}
                          {a.status === 'rejected' && (
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 4 }}><X size={14} /> Đã từ chối</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                    <button 
                      onClick={() => setApplicantPage(p => Math.max(1, p - 1))}
                      disabled={applicantPage === 1}
                      style={{ padding: '4px 10px', fontSize: '0.8rem', border: '1px solid var(--border)', background: 'var(--bg)', borderRadius: 6, cursor: applicantPage === 1 ? 'not-allowed' : 'pointer', opacity: applicantPage === 1 ? 0.5 : 1 }}
                    >
                      Trước
                    </button>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {Array.from({ length: totalApplicantPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setApplicantPage(i + 1)}
                          style={{ 
                            width: 24, height: 24, fontSize: '0.8rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            borderRadius: 4, border: 'none', 
                            background: applicantPage === i + 1 ? 'var(--primary)' : 'transparent',
                            color: applicantPage === i + 1 ? '#FFF' : 'var(--text)',
                            fontWeight: applicantPage === i + 1 ? 700 : 400,
                            cursor: 'pointer'
                          }}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => setApplicantPage(p => Math.min(totalApplicantPages, p + 1))}
                      disabled={applicantPage === totalApplicantPages}
                      style={{ padding: '4px 10px', fontSize: '0.8rem', border: '1px solid var(--border)', background: 'var(--bg)', borderRadius: 6, cursor: applicantPage === totalApplicantPages ? 'not-allowed' : 'pointer', opacity: applicantPage === totalApplicantPages ? 0.5 : 1 }}
                    >
                      Sau
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              /* Chi tiết dự án joined */
              <div style={{ flex: 1, padding: 32, overflowY: 'auto', background: '#F8FAFC' }}>
                <div style={{ background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', padding: 24, maxWidth: 800, margin: '0 auto' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={20} color="var(--primary)" /> Đội ngũ Dự án</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {mockMembers.map(m => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, border: '1px solid var(--border)', borderRadius: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random`} style={{ width: 48, height: 48, borderRadius: '50%' }} alt="" />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>{m.name}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Vai trò: <strong>{m.role}</strong></div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (selectedProject.status !== 'completed') {
                              alert('Chỉ được đánh giá khi dự án kết thúc!');
                              return;
                            }
                            openReviewModal(m);
                          }}
                          className="btn btn-sm"
                          style={{
                            background: selectedProject.status === 'completed' ? '#F59E0B' : '#E2E8F0',
                            color: selectedProject.status === 'completed' ? '#FFF' : '#94A3B8',
                            border: 'none', cursor: selectedProject.status === 'completed' ? 'pointer' : 'not-allowed',
                            fontWeight: 700
                          }}
                        >
                          <Star size={16} fill="currentColor" /> Đánh giá
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* ── Modal Đánh giá ── */}
      {showReviewModal && reviewTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(2px)' }}>
          <div style={{ background: 'var(--bg)', borderRadius: 12, width: '100%', maxWidth: 500, padding: 32, position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <button onClick={() => setShowReviewModal(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>Đánh giá Thành viên</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Đánh giá của bạn giúp xây dựng uy tín cộng đồng UniVerse.</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, padding: 16, background: 'var(--bg-subtle)', borderRadius: 8 }}>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(reviewTarget.name)}&background=random`} style={{ width: 48, height: 48, borderRadius: '50%' }} alt="" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{reviewTarget.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{reviewTarget.role}</div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 12 }}>Mức đánh giá (1-5 sao)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={32}
                    color={star <= (hoverRating || rating) ? '#F59E0B' : '#E2E8F0'}
                    fill={star <= (hoverRating || rating) ? '#F59E0B' : 'transparent'}
                    style={{ cursor: 'pointer', transition: 'all 0.1s' }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 12 }}>Ghi chú / Nhận xét (Tùy chọn)</label>
              <textarea
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder="Nhận xét thái độ làm việc, kỹ năng chuyên môn..."
                style={{ width: '100%', height: 100, padding: 12, borderRadius: 8, border: '1px solid var(--border)', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowReviewModal(false)}>Hủy</button>
              <button className="btn btn-primary" style={{ flex: 1, background: '#F59E0B', borderColor: '#F59E0B' }} disabled={rating === 0} onClick={submitReview}>Gửi đánh giá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
