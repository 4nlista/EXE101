import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, Bot, User as UserIcon, Plus, MessageSquare, X, File, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AIHubPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'user', text: 'Tôi đang tìm một chuyên gia thiết kế UI/UX cho dự án khởi nghiệp về giáo dục.' },
    { id: 2, sender: 'ai', text: 'Dựa trên yêu cầu của bạn, tôi đã tìm thấy 3 ứng viên xuất sắc nhất có kinh nghiệm trong lĩnh vực EdTech và UI/UX.', isCandidates: true }
  ]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showReasonModal, setShowReasonModal] = useState(null); // store candidate info to show reasons
  const messagesEndRef = useRef(null);

  const candidates = [
    { id: 1, name: 'Minh Anh Nguyễn', school: 'Đại học Quốc gia Hà Nội', match: '95', avatar: 'Minh+Anh' },
    { id: 2, name: 'Tuấn Lê', school: 'Đại học Bách khoa TP.HCM', match: '92', avatar: 'Tuan+Le' },
    { id: 3, name: 'Lan Phạm', school: 'Đại học FPT', match: '88', avatar: 'Lan+Pham' }
  ];

  const handleSend = () => {
    if (!inputMsg.trim() && uploadedFiles.length === 0) return;
    
    const newUserMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputMsg,
      files: [...uploadedFiles]
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputMsg('');
    setUploadedFiles([]);

    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Đã nhận yêu cầu và tài liệu đính kèm. Tôi đang tiến hành phân tích và sẽ đưa ra kết quả sớm nhất.'
      }]);
    }, 1000);
  };

  const handleFileUpload = () => {
    // Mock file upload
    setUploadedFiles(prev => [...prev, { name: `document_${prev.length + 1}.pdf`, size: '1.2 MB' }]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, uploadedFiles]);

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
          
          {messages.map((msg) => (
            <div key={msg.id} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              
              {msg.sender === 'ai' && (
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#8B5CF6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={18} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.text && (
                  <div style={{ 
                    background: msg.sender === 'user' ? '#B45309' : 'var(--bg)', 
                    color: msg.sender === 'user' ? 'white' : 'var(--text-primary)', 
                    padding: '12px 16px', 
                    borderRadius: msg.sender === 'user' ? '12px 0 12px 12px' : '0 12px 12px 12px', 
                    border: msg.sender === 'ai' ? '1px solid var(--border)' : 'none',
                    fontSize: '0.95rem', 
                    lineHeight: 1.5 
                  }}>
                    {msg.text}
                  </div>
                )}

                {msg.files && msg.files.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-subtle)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <File size={16} color="var(--primary)" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{f.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{f.size}</div>
                    </div>
                  </div>
                ))}

                {/* AI Candidates Cards */}
                {msg.isCandidates && (
                  <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, marginTop: 8 }}>
                    {candidates.map(c => (
                      <div key={c.id} style={{ width: 280, border: '1px solid var(--border)', borderRadius: 12, padding: 16, flexShrink: 0, background: 'var(--bg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <img src={`https://ui-avatars.com/api/?name=${c.avatar}&background=random`} style={{ width: 48, height: 48, borderRadius: '50%' }} />
                          <button 
                            onClick={() => setShowReasonModal(c)}
                            style={{ fontSize: '0.75rem', background: '#EEF2FF', color: '#4F46E5', padding: '4px 8px', borderRadius: 99, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #C7D2FE', cursor: 'pointer' }}
                          >
                            ✨ {c.match}% Phù hợp
                          </button>
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>{c.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{c.school}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Kỹ năng nổi bật</div>
                        <span className="proj-role-tag design" style={{ marginBottom: 16 }}>Thiết kế UI/UX</span>
                        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/profile/' + c.id)}>Kết nối ngay</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UserIcon size={16} />
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div style={{ padding: '0 10%', marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {uploadedFiles.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                <File size={14} /> {f.name}
                <button onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', marginLeft: 4, display: 'flex', alignItems: 'center' }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div style={{ padding: '0 10% 24px 10%' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', borderRadius: 24, padding: '8px 16px', border: '1px solid var(--border)' }}>
            <button onClick={handleFileUpload} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, color: 'var(--text-muted)' }}>
              <Paperclip size={20} />
            </button>
            
            <input 
              type="text" 
              placeholder="Hỏi Trợ lý AI..."
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, height: 40, border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', padding: '0 12px', color: 'var(--text-primary)' }}
            />

            <button onClick={handleSend} style={{ background: '#8B5CF6', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', opacity: (inputMsg.length > 0 || uploadedFiles.length > 0) ? 1 : 0.5 }}>
              <Send size={16} />
            </button>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>
            Kết quả do AI tạo ra có thể thay đổi dựa trên cập nhật hồ sơ.
          </div>
        </div>

      </div>

      {/* Reason Modal */}
      {showReasonModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(2px)' }}>
          <div style={{ background: 'var(--bg)', borderRadius: 12, width: '100%', maxWidth: 500, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#8B5CF6' }}><Bot size={20} /></span> Lý do phù hợp ({showReasonModal.match}%)
              </h3>
              <button onClick={() => setShowReasonModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <img src={`https://ui-avatars.com/api/?name=${showReasonModal.avatar}&background=random`} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{showReasonModal.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ứng viên thiết kế UI/UX</div>
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>Đã có kinh nghiệm 1.5 năm thiết kế ứng dụng giáo dục (EdTech).</span>
                </li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>Thành thạo Figma, Prototyping và thiết kế chuẩn Design System.</span>
                </li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>Nắm rõ tâm lý người dùng học sinh/sinh viên (đúng đối tượng mục tiêu của bạn).</span>
                </li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>Có thể bắt đầu công việc ngay lập tức và làm việc full-time.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
