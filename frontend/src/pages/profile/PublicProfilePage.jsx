import React, { useState } from 'react';
import { Star, CheckCircle, Shield, Briefcase, MapPin, GraduationCap, Zap, Edit2, ChevronRight, ChevronDown, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PublicProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Giả lập ID profile. Nếu ID trùng với user hiện tại -> là chủ sở hữu.
  const isOwner = true; // Hardcode để test giao diện chỉnh sửa

  const [showAvatarModal, setShowAvatarModal] = useState(false);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
      
      {/* ── Cover & Header ── */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 24, position: 'relative' }}>
        <div style={{ height: 180, background: 'linear-gradient(to right, #FB923C, #C2410C)', position: 'relative' }}>
          
          <div style={{ position: 'absolute', bottom: -50, left: 32, width: 140, height: 140, borderRadius: '50%', background: '#fff', padding: 6, display: 'inline-block' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, position: 'relative' }}>
              {/* Fake Avatar */}
              <img src="https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              
              {isOwner && (
                <button 
                  onClick={() => setShowAvatarModal(true)}
                  style={{ position: 'absolute', bottom: 4, right: 4, width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ padding: '64px 32px 32px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Nguyễn Văn A.</h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Sinh viên năm cuối Kỹ thuật phần mềm - HUST
            </p>
            
            <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> Hà Nội, Việt Nam</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><GraduationCap size={16} /> ĐH Bách Khoa</span>
            </div>
          </div>
          
          {!isOwner && (
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary">Đang theo dõi</button>
              <button className="btn btn-primary" style={{ background: '#B45309', borderColor: '#B45309' }}>Nhắn tin</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        
        {/* ── Left Column (30%) ── */}
        <div style={{ width: '32%', display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Trust Score */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={16} /> Điểm uy tín
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>4.8</span>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: 6 }}>/ 5.0</span>
            </div>
            
            <div style={{ display: 'flex', color: '#B45309', gap: 4, marginBottom: 16 }}>
              <Star size={24} fill="currentColor" />
              <Star size={24} fill="currentColor" />
              <Star size={24} fill="currentColor" />
              <Star size={24} fill="currentColor" />
              <Star size={24} />
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Dựa trên <strong>25 đánh giá đã xác thực</strong> từ các dự án thành công.
            </p>
          </div>

          {/* AI Insights */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#8B5CF6', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={16} /> Nhận định từ NexLink AI
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', gap: 12 }}><Zap size={18} color="#8B5CF6" style={{ flexShrink: 0 }} /> Phản hồi tin nhắn rất nhanh (Trung bình 2h)</li>
              <li style={{ display: 'flex', gap: 12 }}><CheckCircle size={18} color="#8B5CF6" style={{ flexShrink: 0 }} /> Luôn hoàn thành công việc trước thời hạn</li>
              <li style={{ display: 'flex', gap: 12 }}><Star size={18} color="#8B5CF6" style={{ flexShrink: 0 }} /> Được đánh giá cao về tinh thần làm việc nhóm</li>
            </ul>
          </div>

          {/* Skills */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 16 }}>Kỹ năng chuyên môn</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span className="proj-role-tag tech">React</span>
              <span className="proj-role-tag tech">Node.js</span>
              <span className="proj-role-tag tech">TypeScript</span>
              <span className="proj-role-tag tech">MongoDB</span>
              <span className="proj-role-tag design">Figma</span>
            </div>
          </div>
        </div>

        {/* ── Right Column (70%) ── */}
        <div style={{ width: '68%', display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Lịch sử dự án đã xác thực</h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Hồ sơ các công việc đã hoàn thành thành công trên NexLink.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sắp xếp theo:</span>
                <select className="filter-select" style={{ width: 'auto', marginBottom: 0, height: 36 }}>
                  <option>Mới nhất</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* History Item 1 */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                      Đồ án tốt nghiệp: Trợ lý học tập AI 
                      <span style={{ fontSize: '0.7rem', background: 'var(--bg-muted)', padding: '4px 8px', borderRadius: 6, fontWeight: 700, color: 'var(--text-muted)' }}>CÔNG KHAI</span>
                    </h4>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Vai trò: Lead Frontend Developer • Hoàn thành: Tháng 10/2023</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FEF3C7', color: '#B45309', padding: '6px 12px', borderRadius: 8, fontSize: '0.95rem', fontWeight: 800 }}>
                    5.0 <Star size={16} fill="currentColor" />
                  </div>
                </div>
                
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                  Phát triển toàn bộ giao diện phía client cho ứng dụng học tập điều khiển bằng AI. 
                  Triển khai quản lý trạng thái phức tạp cho các tính năng cộng tác thời gian thực và đảm bảo hệ thống thiết kế có khả năng truy cập cao.
                </p>

                <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 8, fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)', borderLeft: '3px solid var(--primary)', marginBottom: 16 }}>
                  "Làm việc xuất sắc trong việc xây dựng kiến trúc frontend. Văn cung cấp code rất chất lượng và luôn giữ liên lạc tốt."
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8, fontStyle: 'normal' }}>— Nhà tài trợ dự án, TechStartup Co.</div>
                </div>
                
                <button onClick={() => navigate('/profile/project-detail')} className="btn btn-secondary" style={{ width: '100%', fontWeight: 700 }}>Xem chi tiết dự án</button>
              </div>

              {/* History Item 2 */}
              <div style={{ border: '1px dashed var(--border)', borderRadius: 12, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4, fontStyle: 'italic', color: 'var(--text-secondary)' }}>Dự án bảo mật cho doanh nghiệp <span style={{ fontSize: '0.65rem', background: '#E2E8F0', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>NDA</span></h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chi tiết bị ẩn theo yêu cầu khách hàng • Hoàn thành: Tháng 8/2023</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '1rem', fontWeight: 700 }}>
                    4.7 <Star size={16} fill="#F59E0B" color="#F59E0B" />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Đánh giá đã xác thực</div>
                </div>
              </div>

            </div>
            
            {/* Pagination / View More */}
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, margin: '0 auto' }}>
                Xem tất cả 15 dự án <ChevronDown size={18} />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Tuỳ chỉnh ảnh đại diện</h3>
              <button className="icon-btn" onClick={() => setShowAvatarModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '16px' }}>
                <ImageIcon size={20} style={{ marginRight: 12 }} /> 
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>Xem ảnh đại diện</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phóng to ảnh hiện tại</div>
                </div>
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '16px' }}>
                <Edit2 size={20} style={{ marginRight: 12 }} /> 
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>Tải ảnh mới lên</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Thay đổi ảnh đại diện của bạn</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
