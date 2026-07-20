import React from 'react';
import { Star, ArrowLeft, Shield, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectHistoryDetail() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      
      <button 
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 24, fontSize: '0.9rem', fontWeight: 600 }}
      >
        <ArrowLeft size={16} /> Quay lại Hồ sơ
      </button>

      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: 24, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Đồ án tốt nghiệp: Trợ lý học tập AI</h1>
              <span style={{ fontSize: '0.75rem', background: 'var(--bg-muted)', padding: '4px 8px', borderRadius: 6, fontWeight: 700, color: 'var(--text-muted)' }}>CÔNG KHAI</span>
            </div>
            <div style={{ display: 'flex', gap: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Shield size={16} /> Vai trò: Lead Frontend Developer</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={16} /> Tháng 7/2023 - Tháng 10/2023</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FEF3C7', color: '#B45309', padding: '8px 16px', borderRadius: 12, fontSize: '1.2rem', fontWeight: 800 }}>
              5.0 <Star size={20} fill="currentColor" />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Đánh giá đã xác thực</div>
          </div>
        </div>

        {/* Feedback from owner */}
        <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: 12, borderLeft: '4px solid var(--primary)', marginBottom: 32 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Nhận xét từ Quản lý dự án</h3>
          <p style={{ fontSize: '1rem', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
            "Làm việc xuất sắc trong việc xây dựng kiến trúc frontend. Code rất chất lượng, có khả năng maintain tốt. Kỹ năng giao tiếp và làm việc nhóm cực kỳ ấn tượng, luôn chủ động báo cáo tiến độ."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="https://ui-avatars.com/api/?name=Tran+Van+B&background=random" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Trần Văn B.</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nhà tài trợ dự án, TechStartup Co.</div>
            </div>
          </div>
        </div>

        {/* Project Description */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 12 }}>Tổng quan dự án</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Dự án xây dựng một nền tảng học tập trực tuyến tích hợp trí tuệ nhân tạo để cá nhân hóa lộ trình học cho sinh viên. Hệ thống bao gồm tính năng tự động tạo quiz từ tài liệu PDF, phân tích điểm số và đề xuất tài liệu ôn tập.
          </p>
        </div>

        {/* Key Tasks */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>Các nhiệm vụ đã thực hiện</h3>
          <ul style={{ paddingLeft: 20, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Khởi tạo kiến trúc Frontend bằng React, Vite và TailwindCSS.</li>
            <li>Thiết kế và phát triển UI/UX cho toàn bộ hệ thống dựa trên Figma mockups.</li>
            <li>Tích hợp API thời gian thực sử dụng Socket.io cho tính năng học nhóm (Co-learning).</li>
            <li>Xây dựng module hiển thị biểu đồ phân tích dữ liệu học tập với Recharts.</li>
            <li>Tối ưu hóa hiệu suất ứng dụng (Lazy loading, Code splitting) giúp tăng điểm Lighthouse lên 95.</li>
          </ul>
        </div>
        
        {/* Technologies Used */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 12 }}>Công nghệ sử dụng</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span className="proj-role-tag tech">React</span>
            <span className="proj-role-tag tech">Redux Toolkit</span>
            <span className="proj-role-tag tech">Tailwind CSS</span>
            <span className="proj-role-tag tech">Socket.io</span>
            <span className="proj-role-tag tech">Recharts</span>
          </div>
        </div>

      </div>
    </div>
  );
}
