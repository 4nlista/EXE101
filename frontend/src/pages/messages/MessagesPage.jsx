import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Phone, Video, Info, Paperclip, Smile, ThumbsUp, MoreHorizontal, BellOff, MapPin, Briefcase, ChevronDown, User, Send, Image as ImageIcon, Trash2 } from 'lucide-react';
import { MOCK_USERS } from '../../constants/mockData';

const initialPersonalThreads = [
  { id: 1, name: 'Nguyễn Văn A', msg: 'Mình đã xem qua UI, rất ổn nhé.', time: '10:30', unread: true },
  { id: 2, name: 'Lê Thị B', msg: 'Hẹn bạn chiều nay 2h gặp mặt trao đổi nhé.', time: 'Hôm qua', unread: false },
  { id: 3, name: 'Công ty Cổ phần XYZ', msg: 'Chúng tôi muốn phỏng vấn bạn vào tuần tới.', time: 'T2', unread: false },
];

const initialGroupThreads = [
  { id: 101, name: 'Dự án Tái thiết kế trang Thương mại Điện tử...', msg: 'Nguyễn Văn A: Đã push code lên nhánh main.', time: '09:15', unread: true },
  { id: 102, name: 'Dự án Hệ thống Quản lý Đào tạo', msg: 'Lê Thị B: Lịch họp tuần này vào thứ 6 nhé.', time: 'Hôm qua', unread: false }
];

const initialMessagesData = {
  1: [
    { id: 1, sender: 'them', type: 'text', content: 'Bạn ơi, mình gửi tài liệu thiết kế dự án hôm qua nhé.' },
    { id: 2, sender: 'them', type: 'file', content: 'Design_System.pdf', size: '2.4 MB' },
    { id: 3, sender: 'me', type: 'text', content: 'Oke mình nhận được rồi nhé, tẹo mình check.' }
  ],
  2: [
    { id: 1, sender: 'me', type: 'text', content: 'Bạn gửi mình báo cáo nhé' }
  ],
  3: [
    { id: 1, sender: 'them', type: 'text', content: 'Bạn ơi cho mình hỏi về tài liệu tối hôm qua thảo luận.' }
  ],
  101: [
    { id: 1, sender: 'them', type: 'text', content: 'Chào mọi người, dự án đã bắt đầu.' }
  ],
  102: [
    { id: 1, sender: 'them', type: 'text', content: 'Lịch họp tuần này đã cập nhật nhé.' }
  ]
};

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get('userId');

  const [activeTab, setActiveTab] = useState('personal'); 
  const [threads, setThreads] = useState(initialPersonalThreads);
  const [groupThreads, setGroupThreads] = useState(initialGroupThreads);
  const [activeThreadId, setActiveThreadId] = useState(1);
  const [messagesData, setMessagesData] = useState(initialMessagesData);
  const [msgInput, setMsgInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (userId) {
      const uId = parseInt(userId);
      const existing = threads.find(t => t.id === uId);
      if (existing) {
        setActiveThreadId(uId);
      } else {
        const mockUser = MOCK_USERS.find(u => u.id === uId);
        if (mockUser) {
          const newThread = {
            id: mockUser.id,
            name: mockUser.name,
            msg: 'Bắt đầu cuộc trò chuyện mới...',
            time: 'Vừa xong',
            unread: false
          };
          setThreads([newThread, ...threads]);
          setActiveThreadId(mockUser.id);
          setMessagesData(prev => ({ ...prev, [mockUser.id]: [] }));
        }
      }
    }
  }, [userId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThreadId, messagesData, activeTab]);

  const activeThreadsList = activeTab === 'personal' ? threads : groupThreads;
  const activeThread = activeThreadsList.find(t => t.id === activeThreadId) || activeThreadsList[0];
  const currentMessages = messagesData[activeThreadId] || [];

  const handleSendText = () => {
    if (!msgInput.trim()) return;
    const newMsg = { id: Date.now(), sender: 'me', type: 'text', content: msgInput };
    setMessagesData(prev => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), newMsg]
    }));

    // Update thread preview
    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, msg: `Bạn: ${msgInput}`, time: 'Vừa xong' } : t));
    setMsgInput('');
  };

  const handleSendLike = () => {
    const newMsg = { id: Date.now(), sender: 'me', type: 'like', content: '👍' };
    setMessagesData(prev => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), newMsg]
    }));
    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, msg: 'Bạn: 👍', time: 'Vừa xong' } : t));
  };

  const handleSendFile = (type) => {
    // Giả lập gửi file hoặc hình ảnh
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      type: type,
      content: type === 'image' ? 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' : 'Tài_liệu_mới.pdf',
      size: type === 'file' ? '1.2 MB' : undefined
    };
    setMessagesData(prev => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), newMsg]
    }));
    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, msg: `Bạn đã gửi 1 ${type === 'image' ? 'ảnh' : 'file'}.`, time: 'Vừa xong' } : t));
  };

  const handleDeleteChat = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đoạn chat này không?')) {
      const newThreads = threads.filter(t => t.id !== activeThreadId);
      setThreads(newThreads);
      const newMsgData = { ...messagesData };
      delete newMsgData[activeThreadId];
      setMessagesData(newMsgData);

      if (newThreads.length > 0) {
        setActiveThreadId(newThreads[0].id);
      } else {
        setActiveThreadId(null);
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>

      {/* ── LEFT: Thread List ── */}
      <div style={{ width: 360, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 16 }}>Đoạn chat</h2>
          <div className="layout-search-bar" style={{ width: '100%', height: 36 }}>
            <Search size={16} />
            <input type="text" placeholder="Tìm kiếm trên UniVerse" />
          </div>
        </div>

        <div style={{ padding: 12, display: 'flex', gap: 12, borderBottom: '1px solid var(--border)' }}>
          <button 
            onClick={() => { setActiveTab('personal'); setActiveThreadId(threads[0]?.id); }}
            style={{ padding: '6px 12px', background: activeTab === 'personal' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'personal' ? 'var(--primary)' : 'var(--text-secondary)', borderRadius: 99, border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            Cá nhân
          </button>
          <button 
            onClick={() => { setActiveTab('group'); setActiveThreadId(groupThreads[0]?.id); }}
            style={{ padding: '6px 12px', background: activeTab === 'group' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'group' ? 'var(--primary)' : 'var(--text-secondary)', borderRadius: 99, border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            Nhóm
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeThreadsList.map(t => {
            const isActive = t.id === activeThreadId;
            return (
              <div
                key={t.id}
                onClick={() => setActiveThreadId(t.id)}
                style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 12, cursor: 'pointer', background: isActive ? 'var(--bg-subtle)' : 'transparent', transition: 'background 0.2s' }}
              >
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--bg-muted)', flexShrink: 0, position: 'relative' }}>
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random`} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                  {isActive && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, background: '#10B981', border: '2px solid white', borderRadius: '50%' }} />}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: t.unread ? 700 : 500, color: 'var(--text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: t.unread ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: t.unread ? 600 : 400 }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.msg}</span>
                    <span>• {t.time}</span>
                  </div>
                </div>
                {t.unread && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
              </div>
            );
          })}
          {threads.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có tin nhắn nào</div>}
        </div>
      </div>

      {/* ── MIDDLE: Chat Area ── */}
      {activeThread ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

          {/* Chat Header */}
          <div style={{ height: 64, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate(`/profile/${activeThread.id}`)}>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeThread.name)}&background=random`} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'inherit'}>{activeThread.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Đang hoạt động</div>
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
            <div style={{ alignSelf: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hôm nay</div>

            {currentMessages.length > 0 ? currentMessages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start', gap: 8 }}>
                {msg.sender === 'them' && (
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeThread.name)}&background=random`} style={{ width: 28, height: 28, borderRadius: '50%' }} />
                )}

                <div>
                  {msg.type === 'text' && (
                    <div style={{
                      background: msg.sender === 'me' ? 'var(--primary)' : 'var(--bg-subtle)',
                      color: msg.sender === 'me' ? 'white' : 'var(--text-primary)',
                      padding: '10px 14px',
                      borderRadius: msg.sender === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      fontSize: '0.9rem',
                      maxWidth: 400,
                      wordBreak: 'break-word'
                    }}>
                      {msg.content}
                    </div>
                  )}
                  {msg.type === 'like' && (
                    <div style={{ fontSize: '3rem', lineHeight: 1 }}>👍</div>
                  )}
                  {msg.type === 'file' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <div style={{ width: 32, height: 32, background: '#EF4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontWeight: 800 }}>PDF</div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{msg.content}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{msg.size}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {msg.type === 'image' && (
                    <div style={{ marginTop: 4, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', maxWidth: 200 }}>
                      <img src={msg.content} alt="Attachment" style={{ width: '100%', display: 'block' }} />
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontStyle: 'italic', fontSize: '0.9rem' }}>
                Bắt đầu trò chuyện với {activeThread.name}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Paperclip size={20} color="var(--primary)" cursor="pointer" onClick={() => handleSendFile('file')} title="Gửi file đính kèm" />
            <ImageIcon size={20} color="var(--primary)" cursor="pointer" onClick={() => handleSendFile('image')} title="Gửi hình ảnh" />
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Aa"
                style={{ width: '100%', height: 40, borderRadius: 99, border: 'none', background: 'var(--bg-subtle)', padding: '0 40px 0 16px', fontSize: '0.9rem', outline: 'none', color: 'var(--text-primary)' }}
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendText()}
              />
              <Smile size={20} color="var(--text-muted)" style={{ position: 'absolute', right: 12, top: 10, cursor: 'pointer' }} />
            </div>
            {msgInput.trim() ? (
              <Send size={20} color="var(--primary)" cursor="pointer" onClick={handleSendText} />
            ) : (
              <ThumbsUp size={20} color="var(--primary)" cursor="pointer" onClick={handleSendLike} />
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Chọn một cuộc trò chuyện để bắt đầu
        </div>
      )}

      {/* ── RIGHT: Profile Sidebar ── */}
      {activeThread && (
        <div style={{ width: 360, borderLeft: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeThread.name)}&background=random`} alt="" style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 12 }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>{activeThread.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Đang hoạt động</div>

            <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
              <div onClick={() => navigate(`/profile/${activeThread.id}`)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}><User size={18} /></div>
                <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Trang cá nhân</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}><BellOff size={18} /></div>
                <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Tắt thông báo</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}><Search size={18} /></div>
                <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Tìm kiếm</span>
              </div>
            </div>
          </div>

          <div style={{ padding: 16, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 8px', cursor: 'pointer', borderRadius: 8 }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>File phương tiện và file</span>
              <ChevronDown size={20} color="var(--text-muted)" />
            </div>
          </div>

          <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
            <button
              onClick={handleDeleteChat}
              style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', borderRadius: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Trash2 size={18} /> Xóa đoạn chat
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
