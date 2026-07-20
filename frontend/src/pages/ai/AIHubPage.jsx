import React, { useState } from 'react';
import { Paperclip, Send, Bot, User as UserIcon, Plus, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AIHubPage() {
  const { user } = useAuth();
  const [inputMsg, setInputMsg] = useState('');

  return (
    <div style={{ height: 'calc(100vh - 65px)', display: 'flex', background: 'var(--bg)', width: '100%', overflow: 'hidden' }}>
      
      {/* ── Left Sidebar: Chat History (1/5 ~ 260px) ── */}
      <div style={{ width: 280, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-subtle)' }}>
        <div style={{ padding: '20px 16px' }}>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', gap: 8 }}>
            <Plus size={18} /> Chat mới
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, paddingLeft: 8 }}>Gần đây</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg)', borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border)' }}>
              <MessageSquare size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Tìm chuyên gia UI/UX</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, cursor: 'pointer' }} className="hover-bg">
              <MessageSquare size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Sửa lỗi Code ReactJS</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, cursor: 'pointer' }} className="hover-bg">
              <MessageSquare size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Tư vấn chiến lược Marketing</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Content: Current Chat ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#8B5CF6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Trợ lý AI NexLink</h2>
              <div style={{ fontSize: '0.8rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} /> Trực tuyến
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 10%', display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          {/* User Message */}
          <div style={{ alignSelf: 'flex-end', maxWidth: '85%', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ background: '#B45309', color: 'white', padding: '12px 16px', borderRadius: '12px 0 12px 12px', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Tôi đang tìm một chuyên gia thiết kế UI/UX cho dự án khởi nghiệp về giáo dục.
            </div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UserIcon size={16} />
            </div>
          </div>

          {/* AI Message */}
          <div style={{ alignSelf: 'flex-start', maxWidth: '90%', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#8B5CF6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '0 12px 12px 12px', fontSize: '0.95rem', lineHeight: 1.5, background: 'var(--bg)' }}>
                Dựa trên yêu cầu của bạn, tôi đã tìm thấy 3 ứng viên xuất sắc nhất có kinh nghiệm trong lĩnh vực EdTech và UI/UX.
              </div>

              {/* AI Candidates Cards */}
              <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
                {/* Card 1 */}
                <div style={{ width: 280, border: '1px solid var(--border)', borderRadius: 12, padding: 16, flexShrink: 0, background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <img src="https://ui-avatars.com/api/?name=Minh+Anh&background=random" style={{ width: 48, height: 48, borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.75rem', background: '#EEF2FF', color: '#4F46E5', padding: '4px 8px', borderRadius: 99, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      ✨ 95% Phù hợp
                    </span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>Minh Anh Nguyễn</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>Đại học Quốc gia Hà Nội</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Kỹ năng nổi bật</div>
                  <span className="proj-role-tag design" style={{ marginBottom: 16 }}>Thiết kế UI/UX</span>
                  <button className="btn btn-secondary" style={{ width: '100%' }}>Kết nối ngay</button>
                </div>

                {/* Card 2 */}
                <div style={{ width: 280, border: '1px solid var(--border)', borderRadius: 12, padding: 16, flexShrink: 0, background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <img src="https://ui-avatars.com/api/?name=Tuan+Le&background=random" style={{ width: 48, height: 48, borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.75rem', background: '#EEF2FF', color: '#4F46E5', padding: '4px 8px', borderRadius: 99, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      ✨ 92% Phù hợp
                    </span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>Tuấn Lê</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>Đại học Bách khoa TP.HCM</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Kỹ năng nổi bật</div>
                  <span className="proj-role-tag design" style={{ marginBottom: 16 }}>Thiết kế UI/UX</span>
                  <button className="btn btn-secondary" style={{ width: '100%' }}>Kết nối ngay</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div style={{ padding: '0 10% 24px 10%' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', borderRadius: 24, padding: '8px 16px', border: '1px solid var(--border)' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, color: 'var(--text-muted)' }}>
              <Paperclip size={20} />
            </button>
            
            <input 
              type="text" 
              placeholder="Hỏi Trợ lý AI..."
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              style={{ flex: 1, height: 40, border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', padding: '0 12px' }}
            />

            <button style={{ background: '#8B5CF6', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', opacity: inputMsg.length > 0 ? 1 : 0.5 }}>
              <Send size={16} />
            </button>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>
            Kết quả do AI tạo ra có thể thay đổi dựa trên cập nhật hồ sơ.
          </div>
        </div>

      </div>
    </div>
  );
}
