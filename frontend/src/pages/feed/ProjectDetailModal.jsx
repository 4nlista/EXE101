import React, { useState } from 'react';
import { X, Clock, MapPin, Building2, CheckCircle2, ChevronRight, FileText, Upload } from 'lucide-react';

export default function ProjectDetailModal({ project, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showApply, setShowApply] = useState(false);
  const [applyType, setApplyType] = useState('profile'); // 'profile' or 'cv'
  const [applied, setApplied] = useState(false);
  const [toast, setToast] = useState(false);

  const handleApplySubmit = (e) => {
    e.preventDefault();
    setApplied(true);
    setToast(true);
    setShowApply(false);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
          <div className="modal-header" style={{ padding: '24px 32px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {project.org[0]}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 4 }}>{project.title}</h2>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Building2 size={14} /> {project.org}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {project.type === 'pro' ? 'Remote' : 'Hà Nội'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {project.timeLeft}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="chat-head-btn" style={{ color: 'var(--text-muted)' }} onClick={onClose}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', gap: 24, marginTop: 24, borderBottom: '1px solid var(--border)' }}>
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >Tổng quan dự án</button>
              <button 
                className={`tab-btn ${activeTab === 'reqs' ? 'active' : ''}`}
                onClick={() => setActiveTab('reqs')}
              >Yêu cầu thành viên</button>
              <button 
                className={`tab-btn ${activeTab === 'benefits' ? 'active' : ''}`}
                onClick={() => setActiveTab('benefits')}
              >Quyền lợi & Cam kết</button>
            </div>
          </div>

          <div className="modal-body" style={{ padding: '24px 32px' }}>
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Mô tả công việc</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 24 }}>
                  {project.desc}
                  {'\n\n'}
                  Chúng tôi đang tìm kiếm những người có đam mê xây dựng sản phẩm chất lượng cao, có tư duy khởi nghiệp và sẵn sàng học hỏi.
                  Dự án đã có bản Prototype trên Figma và cần đội ngũ thực thi để ra mắt MVP trong vòng 2 tháng tới.
                </p>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Vị trí đang tuyển</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {project.roles.map((r, i) => (
                    <div key={i} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{r.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mức độ ưu tiên: Cao</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'reqs' && (
              <div>
                <ul style={{ paddingLeft: 20, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  <li>Có kinh nghiệm tương đương 1 năm trở lên hoặc đã từng làm dự án thực tế.</li>
                  <li>Tinh thần trách nhiệm cao, đảm bảo tiến độ công việc hàng tuần.</li>
                  <li>Sử dụng thành thạo các công cụ làm việc nhóm như Trello, Jira, Github.</li>
                  <li>Biết sử dụng Figma để trao đổi với Designer (đối với Developer).</li>
                  <li>Có thể tham gia họp định kỳ 2 lần/tuần (Online).</li>
                </ul>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div>
                <ul style={{ paddingLeft: 20, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  <li>Cơ hội trở thành Co-founder nếu dự án gọi vốn thành công.</li>
                  <li>Làm việc trực tiếp với các Mentor có kinh nghiệm từ các tập đoàn công nghệ lớn.</li>
                  <li>Hỗ trợ chứng nhận tham gia dự án thực tế để làm đẹp CV / Khóa luận tốt nghiệp.</li>
                  <li>Môi trường năng động, tôn trọng ý kiến cá nhân.</li>
                </ul>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ padding: '16px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="proj-leader-av">{project.leader[0]}</div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Đăng bởi {project.leader}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phản hồi trong vòng 24h</div>
              </div>
            </div>
            
            <div>
              {applied ? (
                <button className="btn btn-secondary" disabled>Đang chờ duyệt...</button>
              ) : (
                <button className="btn btn-primary" style={{ background: '#B45309', borderColor: '#B45309' }} onClick={() => setShowApply(true)}>
                  Ứng tuyển ngay
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Apply Modal ── */}
      {showApply && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowApply(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Nộp hồ sơ ứng tuyển</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>Chọn phương thức ứng tuyển cho vị trí này</p>
            </div>
            
            <form className="modal-body" onSubmit={handleApplySubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <label className={`opt-card-large ${applyType === 'profile' ? 'selected' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}>
                  <input type="radio" name="atype" checked={applyType === 'profile'} onChange={() => setApplyType('profile')} style={{ accentColor: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={16} /> Sử dụng Profile hệ thống</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Hồ sơ của bạn đã được tối ưu hóa cho nền tảng.</div>
                  </div>
                </label>

                <label className={`opt-card-large ${applyType === 'cv' ? 'selected' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}>
                  <input type="radio" name="atype" checked={applyType === 'cv'} onChange={() => setApplyType('cv')} style={{ accentColor: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}><Upload size={16} /> Tải file CV/Portfolio</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>PDF/DOCX, tối đa 5MB.</div>
                  </div>
                </label>
              </div>

              {applyType === 'cv' && (
                <div style={{ padding: 24, border: '1px dashed var(--border)', borderRadius: 8, textAlign: 'center', marginBottom: 20 }}>
                  <Upload size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Kéo thả file vào đây hoặc bấm để chọn</div>
                </div>
              )}

              <div className="field">
                <label className="field-label">Lời nhắn (Tùy chọn)</label>
                <textarea className="input" placeholder="Viết vài dòng giới thiệu bản thân..." style={{ minHeight: 80 }}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowApply(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#B45309', borderColor: '#B45309' }}>Gửi hồ sơ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className="toast toast-success">
            <CheckCircle2 size={18} className="toast-icon" style={{ color: 'var(--success)' }} />
            <div className="toast-msg">Gửi hồ sơ ứng tuyển thành công!</div>
          </div>
        </div>
      )}
    </>
  );
}
