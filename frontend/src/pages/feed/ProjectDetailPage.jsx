import React from 'react';
import { MapPin, Clock, Users, Briefcase, GraduationCap, DollarSign, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectDetailPage() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      
      {/* ── Header Card ── */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 6, background: 'var(--primary)' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>Tái thiết kế trang Thương mại Điện tử</h1>
            <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={18} /> Đồ án & Thực tập</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={18} /> Làm việc từ xa (Remote)</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={18} /> Hạn nộp: 30/11/2024</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random" style={{ width: 48, height: 48, borderRadius: '50%' }} />
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>Nguyễn Văn A</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sinh viên ĐH Bách Khoa Hà Nội</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>24 <Users size={16} style={{ display: 'inline', marginLeft: 4, verticalAlign: 'text-bottom' }} /></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đã ứng tuyển</div>
            </div>
            <button className="btn btn-primary" style={{ height: 44, padding: '0 24px', fontSize: '1rem', fontWeight: 700 }}>
              Ứng tuyển ngay
            </button>
          </div>
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div style={{ display: 'flex', gap: 24 }}>
        
        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>Mô tả công việc</h2>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <p style={{ marginBottom: 12 }}>Chúng tôi đang tìm kiếm các bạn sinh viên có đam mê về thiết kế UI/UX để cùng tham gia làm đồ án tốt nghiệp về hệ thống thương mại điện tử dành cho nông sản Việt Nam.</p>
              <p>Công việc cụ thể:</p>
              <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Phân tích yêu cầu và trải nghiệm người dùng (UX Research).</li>
                <li>Thiết kế Wireframe, Prototype bằng Figma.</li>
                <li>Xây dựng UI Guidelines và Design System cơ bản.</li>
                <li>Phối hợp cùng team Dev để đảm bảo tính khả thi của thiết kế.</li>
              </ul>
            </div>
          </div>

          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>Yêu cầu thành viên</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}><CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} /> Có kiến thức cơ bản về Figma và các nguyên tắc thiết kế UI/UX.</li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}><CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} /> Đã từng làm 1-2 dự án cá nhân (kèm portfolio/link Behance).</li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}><CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} /> Cam kết dành ít nhất 15-20 giờ/tuần cho dự án.</li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}><CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} /> Có tinh thần trách nhiệm, đúng deadline.</li>
            </ul>
          </div>

          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>Quyền lợi & Cam kết</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}><DollarSign size={20} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} /> Được chia đều điểm số khi báo cáo đồ án trên trường.</li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}><GraduationCap size={20} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} /> Có thêm project chất lượng để đưa vào CV/Portfolio.</li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}><Users size={20} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} /> Trải nghiệm làm việc nhóm chuẩn Agile/Scrum.</li>
            </ul>
          </div>
          
        </div>

        {/* Sidebar */}
        <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Vị trí cần tuyển</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>UI/UX Designer</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>1 người</div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Frontend Developer</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>2 người</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Kỹ năng yêu cầu</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span className="proj-role-tag design">Figma</span>
              <span className="proj-role-tag tech">ReactJS</span>
              <span className="proj-role-tag tech">Tailwind CSS</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
