import React, { useState } from 'react';
import { Search, Phone, Video, Info, Paperclip, Smile, ThumbsUp, MoreHorizontal, BellOff, MapPin, Briefcase, ChevronDown, User } from 'lucide-react';

const threads = [
  { id: 1, name: 'Bui Thuy Linh', msg: 'Linh đã gửi một file đính kèm.', time: '24 phút', unread: true, active: true },
  { id: 2, name: 'Thủy Trần', msg: 'Bạn: nay đang rực hết cả đầu', time: '47 phút', unread: false },
  { id: 3, name: 'Minh Đào', msg: 'Lên HN chơi', time: '4 giờ', unread: false }
];

export default function MessagesPage() {
  const [msgInput, setMsgInput] = useState('');
  
  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
      
      {/* ── LEFT: Thread List (25% ~ 360px) ── */}
      <div style={{ width: 360, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 16 }}>Đoạn chat</h2>
          <div className="layout-search-bar" style={{ width: '100%', height: 36 }}>
            <Search size={16} />
            <input type="text" placeholder="Tìm kiếm trên NexLink" />
          </div>
        </div>
        
        <div style={{ padding: 12, display: 'flex', gap: 12, borderBottom: '1px solid var(--border)' }}>
          <button style={{ padding: '6px 12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 99, border: 'none', fontWeight: 600, fontSize: '0.85rem' }}>Tất cả</button>
          <button style={{ padding: '6px 12px', background: 'transparent', color: 'var(--text-secondary)', borderRadius: 99, border: 'none', fontWeight: 600, fontSize: '0.85rem' }}>Chưa đọc</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {threads.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 12, cursor: 'pointer', background: t.active ? 'var(--bg-subtle)' : 'transparent' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--bg-muted)', flexShrink: 0, position: 'relative' }}>
                <img src={`https://ui-avatars.com/api/?name=${t.name}&background=random`} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                {t.id === 1 && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, background: '#10B981', border: '2px solid white', borderRadius: '50%' }} />}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: t.unread ? 700 : 500, color: 'var(--text-primary)', marginBottom: 4 }}>{t.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: t.unread ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: t.unread ? 600 : 400 }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.msg}</span>
                  <span>• {t.time}</span>
                </div>
              </div>
              {t.unread && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* ── MIDDLE: Chat Area (50% ~ flex: 1) ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        
        {/* Chat Header */}
        <div style={{ height: 64, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={`https://ui-avatars.com/api/?name=Bui+Thuy+Linh&background=random`} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>Bui Thuy Linh</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hoạt động 6 phút trước</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, color: 'var(--primary)' }}>
            <Phone size={20} cursor="pointer" />
            <Video size={20} cursor="pointer" />
            <Info size={20} cursor="pointer" />
          </div>
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ alignSelf: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>21:03</div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <img src={`https://ui-avatars.com/api/?name=Bui+Thuy+Linh&background=random`} style={{ width: 28, height: 28, borderRadius: '50%' }} />
            <div>
              <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '18px 18px 18px 4px', fontSize: '0.9rem', maxWidth: 400 }}>
                Bạn ơi, mình gửi tài liệu thiết kế dự án hôm qua nhé.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <div style={{ width: 32, height: 32, background: '#EF4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontWeight: 800 }}>PDF</div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Design_System.pdf</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2.4 MB</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 8 }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '10px 14px', borderRadius: '18px 18px 4px 18px', fontSize: '0.9rem', maxWidth: 400 }}>
              Oke mình nhận được rồi nhé, tẹo mình check.
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Paperclip size={20} color="var(--primary)" cursor="pointer" />
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Aa" 
              style={{ width: '100%', height: 40, borderRadius: 99, border: 'none', background: 'var(--bg-subtle)', padding: '0 40px 0 16px', fontSize: '0.9rem', outline: 'none' }}
              value={msgInput}
              onChange={e => setMsgInput(e.target.value)}
            />
            <Smile size={20} color="var(--text-muted)" style={{ position: 'absolute', right: 12, top: 10, cursor: 'pointer' }} />
          </div>
          <ThumbsUp size={20} color="var(--primary)" cursor="pointer" />
        </div>
      </div>

      {/* ── RIGHT: Profile Sidebar (25% ~ 360px) ── */}
      <div style={{ width: 360, borderLeft: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <img src={`https://ui-avatars.com/api/?name=Bui+Thuy+Linh&background=random`} alt="" style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 12 }} />
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>Bui Thuy Linh</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hoạt động 6 phút trước</div>
          
          <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} /></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Trang cá nhân</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BellOff size={18} /></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Tắt thông báo</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search size={18} /></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Tìm kiếm</span>
            </div>
          </div>
        </div>
        
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 8px', cursor: 'pointer', borderRadius: 8 }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Thông tin về đoạn chat</span>
            <ChevronDown size={20} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 8px', cursor: 'pointer', borderRadius: 8 }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Tùy chỉnh đoạn chat</span>
            <ChevronDown size={20} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 8px', cursor: 'pointer', borderRadius: 8 }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>File phương tiện và file</span>
            <ChevronDown size={20} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 8px', cursor: 'pointer', borderRadius: 8 }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Quyền riêng tư và hỗ trợ</span>
            <ChevronDown size={20} />
          </div>
        </div>
      </div>

    </div>
  );
}
