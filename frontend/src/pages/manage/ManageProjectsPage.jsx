import React, { useState } from 'react';
import { Users, CheckCircle, MessageSquare, X, ChevronRight, User } from 'lucide-react';

const mockMyProjects = [
  {
    id: 1, title: 'Tái thiết kế trang Thương mại Điện tử', status: 'open',
    applicants: [
      { id: 101, name: 'Nguyễn Văn A', role: 'UI/UX Designer', match: 95, exp: '2 năm', status: 'pending' },
      { id: 102, name: 'Trần Thị B', role: 'Frontend Dev', match: 82, exp: '1 năm', status: 'pending' }
    ]
  },
  {
    id: 2, title: 'Hệ thống Quản lý Đào tạo', status: 'in-progress',
    applicants: [
      { id: 103, name: 'Lê Văn C', role: 'Backend Dev', match: 70, exp: 'Sinh viên', status: 'approved' }
    ]
  }
];

export default function ManageProjectsPage() {
  const [selectedProj, setSelectedProj] = useState(mockMyProjects[0]);
  const [projects, setProjects] = useState(mockMyProjects);

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
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>{selectedProj.title}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Danh sách ứng viên đã nộp hồ sơ</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
              {selectedProj.applicants.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={24} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{a.name}</h4>
                      <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                        Match {a.match}%
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Ứng tuyển: <strong>{a.role}</strong> • {a.exp}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {a.status === 'pending' ? (
                      <>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleReject(selectedProj.id, a.id)}>
                          <X size={16} /> Từ chối
                        </button>
                        <button className="btn btn-sm btn-primary" onClick={() => handleApprove(selectedProj.id, a.id)}>
                          <CheckCircle size={16} /> Phê duyệt
                        </button>
                      </>
                    ) : a.status === 'approved' ? (
                      <button className="btn btn-sm btn-secondary" style={{ color: '#059669', borderColor: '#34D399' }}>
                        <MessageSquare size={16} /> Nhắn tin
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Đã từ chối</span>
                    )}
                  </div>
                </div>
              ))}
              
              {selectedProj.applicants.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
                  Chưa có ứng viên nào nộp hồ sơ.
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
    </div>
  );
}
