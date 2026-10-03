import React, { useState, useRef, useEffect } from 'react';
import { Container, Card, Form, Badge, Spinner, Row, Col, ListGroup } from 'react-bootstrap';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Alert from '../../components/Alert';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Bot, User, Trash2, Send, MessageSquare, Plus, PanelLeftClose, PanelLeftOpen, Zap, Gem } from 'lucide-react';
import { getAiSessions, createAiSession, getAiSessionById, deleteAiSession, sendAiMessage } from '../../services/aiService';
import { getProjectDetail } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import { PACKAGE_TYPE } from '../../constants/subscriptionEnum';
import ProjectDetailModal from '../feed/ProjectDetailModal';
import './AIHub.css';

// Enum phân biệt tin nhắn AI / User
const SENDER = {
  AI: 'AI',
  USER: 'USER'
};

// Các câu hỏi gợi ý để user bấm nhanh
const QUICK_SUGGESTIONS = [
  'Tìm dự án phù hợp với kỹ năng của mình',
  'Mình muốn tham gia dự án về Mobile App',
  'Có dự án nào cần Frontend Developer không?'
];

const AIHub = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const messagesEndRef = useRef(null);

  // State cho Modal xem chi tiết dự án
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const isFreePackage = currentUser?.currentPackage === PACKAGE_TYPE.FREE;

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Khởi tạo: Lấy danh sách sessions
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async (selectSessionId = null) => {
    try {
      setIsLoadingSessions(true);
      const res = await getAiSessions();
      const sessionData = res.data || [];
      setSessions(sessionData);
      
      if (sessionData.length > 0) {
        // Chọn session được chỉ định hoặc session đầu tiên
        const idToSelect = selectSessionId || sessionData[0]._id;
        handleSelectSession(idToSelect);
      } else {
        // Nếu chưa có session nào, tự động tạo mới
        handleCreateNewSession();
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách session:', error);
      setErrorMsg('Không thể tải lịch sử đoạn chat.');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleSelectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await getAiSessionById(sessionId);
      if (res.data) {
        setMessages(res.data.messages || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết session:', error);
      setErrorMsg('Không thể tải nội dung đoạn chat.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewSession = async () => {
    setIsLoading(true);
    try {
      const res = await createAiSession();
      if (res.data) {
        setSessions(prev => [res.data, ...prev]);
        setCurrentSessionId(res.data._id);
        setMessages([]); // Session mới trắng tinh
      }
    } catch (error) {
      console.error('Lỗi khi tạo session mới:', error);
      setErrorMsg('Không thể tạo đoạn chat mới.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation(); // Ngăn click vào list group item
    if (!window.confirm('Bạn có chắc chắn muốn xóa đoạn chat này không?')) return;
    
    try {
      await deleteAiSession(sessionId);
      // Nếu đang xóa session hiện tại, reload lại danh sách và chọn session khác
      if (currentSessionId === sessionId) {
        fetchSessions();
      } else {
        setSessions(prev => prev.filter(s => s._id !== sessionId));
      }
    } catch (error) {
      console.error('Lỗi khi xóa session:', error);
      alert('Không thể xóa đoạn chat này.');
    }
  };

  // Gửi tin nhắn cho AI
  const handleSendMessage = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    
    const userText = textOverride || inputMessage;
    if (!userText.trim() || !currentSessionId) return;

    // Tạm thời hiển thị tin nhắn của user ngay lập tức để UX mượt
    setMessages(prev => [...prev, { sender: SENDER.USER, text: userText }]);
    if (!textOverride) setInputMessage('');
    
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await sendAiMessage(currentSessionId, userText);
      const aiData = response.data; // Server trả về toàn bộ object aiMessage mới

      setMessages(prev => [...prev, aiData]);
      
      // Nếu đây là tin nhắn đầu tiên, tự động refresh danh sách session để cập nhật Title
      if (messages.length === 0) {
        const res = await getAiSessions();
        setSessions(res.data || []);
      }
    } catch (error) {
      console.error('Lỗi khi gọi AI:', error);
      if (error.response?.status === 403) {
         setErrorMsg('Tính năng này chỉ dành cho tài khoản VIP hoặc PREMIUM. Vui lòng nâng cấp để sử dụng.');
      } else {
         setMessages(prev => [
          ...prev,
          {
            sender: SENDER.AI,
            text: 'Xin lỗi, hiện tại hệ thống AI đang quá tải hoặc gặp lỗi kết nối. Bạn thử lại sau ít phút nhé!'
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Bấm vào câu gợi ý → tự động gửi
  const handleQuickSuggestion = (text) => {
    handleSendMessage(null, text);
  };

  // Mở Modal xem chi tiết dự án (gọi API lấy full data)
  const handleViewProject = async (projectId) => {
    setIsLoadingProject(true);
    try {
      const response = await getProjectDetail(projectId);
      setSelectedProject(response.data);
      setShowProjectModal(true);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết dự án:', error);
      // Dự án đã bị xóa hoặc private
      if (error.response?.status === 404) {
        alert('Dự án này đã bị đóng hoặc không còn tồn tại.');
      }
    } finally {
      setIsLoadingProject(false);
    }
  };

  // Đóng Modal
  const handleCloseProjectModal = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
  };

  // Kiểm tra xem session có trống không
  const isFirstMessage = messages.length === 0;

  return (
    <Container fluid className="ai-hub-container py-4 px-md-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1 fw-bold ai-hub-title d-flex align-items-center">
            <Sparkles className="text-primary me-2" size={28} /> AI Project Matcher
          </h2>
          <p className="text-muted mb-0 small">Tìm kiếm dự án phù hợp với bạn bằng trí tuệ nhân tạo</p>
        </div>
        {isFreePackage && (
          <Button variant="warning" onClick={() => navigate('/subscription')} className="d-flex align-items-center">
            <Gem size={18} className="me-2" /> Nâng cấp VIP
          </Button>
        )}
      </div>

      {/* Cảnh báo nếu gói Free */}
      {isFreePackage && (
        <Alert type="warning" className="mb-3">
          <p className="mb-0">Tài khoản của bạn là tài khoản <b>FREE</b>. Tính năng AI Đề xuất dự án yêu cầu gói <b>VIP</b> hoặc <b>PREMIUM</b>.</p>
        </Alert>
      )}

      <Row className="g-3">
        {/* Cột trái: Danh sách cuộc hội thoại */}
        {isSidebarOpen && (
          <Col md={3} className="d-none d-md-block">
            <Card className="sidebar-card shadow-sm border-0 h-100" style={{ minHeight: '75vh', borderRadius: '20px', overflow: 'hidden' }}>
              <Card.Body className="d-flex flex-column p-0">
              <div className="p-3 border-bottom">
                <Button 
                  variant="primary" 
                  className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 new-chat-btn"
                  onClick={handleCreateNewSession}
                  disabled={isLoadingSessions}
                >
                  <Plus size={18} /> Đoạn chat mới
                </Button>
              </div>
              <ListGroup variant="flush" className="sidebar-list overflow-auto flex-grow-1">
                {isLoadingSessions ? (
                  <div className="text-center p-4"><Spinner animation="border" variant="primary" size="sm"/></div>
                ) : sessions.length === 0 ? (
                  <div className="text-center p-4 text-muted small">Chưa có lịch sử chat</div>
                ) : (
                  sessions.map(session => (
                    <ListGroup.Item 
                      key={session._id}
                      action
                      active={currentSessionId === session._id}
                      onClick={() => handleSelectSession(session._id)}
                      className={`session-item d-flex justify-content-between align-items-center ${currentSessionId === session._id ? 'bg-primary text-white' : ''}`}
                    >
                      <div className="text-truncate flex-grow-1 d-flex align-items-center" style={{ fontSize: '0.9rem', maxWidth: '85%' }}>
                        <MessageSquare size={16} className="me-2 flex-shrink-0" />
                        <span className="text-truncate">{session.title || 'Cuộc hội thoại mới'}</span>
                      </div>
                      <Trash2 
                        size={16}
                        className={`delete-icon flex-shrink-0 ms-2 ${currentSessionId === session._id ? 'text-white-50' : 'text-danger'}`} 
                        onClick={(e) => handleDeleteSession(e, session._id)}
                        style={{ cursor: 'pointer' }}
                        title="Xóa đoạn chat"
                      />
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        )}

        {/* Cột phải: Khung Chat chính */}
        <Col md={isSidebarOpen ? 9 : 12} xs={12}>
          <Card className="chat-card shadow-lg border-0 h-100" style={{ minHeight: '75vh', borderRadius: '20px', overflow: 'hidden' }}>
            <Card.Body className="chat-body d-flex flex-column p-0 position-relative">
              
              {/* Nút Toggle Sidebar */}
              <button 
                className="btn btn-light position-absolute shadow-sm"
                style={{ top: '15px', left: '15px', zIndex: 10, width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0e0e0', backgroundColor: '#fff' }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title={isSidebarOpen ? "Đóng thanh bên" : "Mở thanh bên"}
              >
                {isSidebarOpen ? <PanelLeftClose size={20} className="text-secondary" /> : <PanelLeftOpen size={20} className="text-secondary" />}
              </button>
              
              {/* Vùng tin nhắn */}
              <div className="chat-messages flex-grow-1 overflow-auto p-4">
                {messages.length === 0 && !isLoading && (
                  <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center pt-5">
                    <div className="ai-avatar-large mb-3 shadow d-flex align-items-center justify-content-center mx-auto" style={{ width: '80px', height: '80px', backgroundColor: '#6366f1', borderRadius: '50%' }}>
                      <Bot size={40} className="text-white" />
                    </div>
                    <h5 className="fw-bold text-dark">Chào bạn! Mình là Trợ lý AI của UniVerse</h5>
                    <p className="text-muted w-75 mx-auto">Mình có thể giúp bạn tìm kiếm những dự án phù hợp nhất với kỹ năng và định hướng của bạn. Hãy cho mình biết bạn muốn tìm dự án như thế nào nhé!</p>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div key={idx} className={`d-flex mb-4 ${msg.sender === SENDER.USER ? 'justify-content-end' : 'justify-content-start'}`}>
                    
                    {/* AI Avatar */}
                    {msg.sender === SENDER.AI && (
                      <div className="me-3 mt-1 flex-shrink-0">
                        <div className="ai-avatar rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '35px', height: '35px', backgroundColor: '#6366f1' }}>
                          <Bot size={20} className="text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div style={{ maxWidth: '85%' }}>
                      {/* Bong bóng tin nhắn */}
                      <div className={`p-3 shadow-sm ${msg.sender === SENDER.USER ? 'user-message-bubble text-white' : 'ai-message-bubble'}`}>
                        <div className="message-text" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                      </div>

                      {/* Thẻ Dự án xếp NGANG (nếu có) */}
                      {msg.projects && msg.projects.length > 0 && (
                        <div className="mt-3 ai-projects-row d-flex gap-3 overflow-auto pb-2">
                          {msg.projects.map((proj, pIdx) => (
                            <div key={pIdx} className="ai-project-card flex-shrink-0">
                              {/* Badge % Match */}
                              <div className="text-end mb-2">
                                <Badge className="match-badge px-3 py-2 rounded-pill bg-success">
                                  <Sparkles size={14} className="me-1" /> {proj.matchPercent}% Phù hợp
                                </Badge>
                              </div>

                              {/* Tên dự án (lấy từ snapshot) */}
                              <h6 className="fw-bold text-dark mb-1 text-truncate" title={proj.projectTitle}>
                                {proj.projectTitle || `Dự án ${proj.projectId?.substring(0, 8)}`}
                              </h6>

                              {/* Kỹ năng yêu cầu (lấy từ snapshot) */}
                              {proj.skills && proj.skills.length > 0 && (
                                <div className="mb-2">
                                  <small className="text-muted fw-semibold">KỸ NĂNG YÊU CẦU</small>
                                  <div className="d-flex flex-wrap gap-1 mt-1">
                                    {proj.skills.slice(0, 3).map((skill, sIdx) => (
                                      <Badge key={sIdx} bg="" className="skill-badge">{skill}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Lý do phù hợp (lấy từ snapshot) */}
                              <p className="text-secondary small mb-3 lh-base reason-text">{proj.reason}</p>

                              {/* Nút Xem chi tiết */}
                              <Button
                                variant="outline-primary"
                                className="w-100 rounded-pill view-detail-btn"
                                onClick={() => handleViewProject(proj.projectId)}
                                disabled={isLoadingProject}
                              >
                                {isLoadingProject ? <Spinner animation="border" size="sm" /> : 'Xem chi tiết'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* User Avatar */}
                    {msg.sender === SENDER.USER && (
                      <div className="ms-3 mt-1 flex-shrink-0">
                        <div className="user-avatar rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '35px', height: '35px', backgroundColor: '#cbd5e1' }}>
                          <User size={20} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Animation đang chờ AI trả lời */}
                {isLoading && messages.length > 0 && messages[messages.length - 1]?.sender === SENDER.USER && (
                  <div className="d-flex mb-4 justify-content-start">
                    <div className="me-3 mt-1 flex-shrink-0">
                      <div className="ai-avatar rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '35px', height: '35px', backgroundColor: '#6366f1' }}>
                        <Bot size={20} className="text-white" />
                      </div>
                    </div>
                    <div className="ai-message-bubble p-3 shadow-sm d-flex align-items-center gap-2">
                      <Spinner animation="grow" size="sm" style={{color: '#6366f1'}} />
                      <Spinner animation="grow" size="sm" style={{color: '#8b5cf6', animationDelay: '0.2s'}} />
                      <Spinner animation="grow" size="sm" style={{color: '#d946ef', animationDelay: '0.4s'}} />
                    </div>
                  </div>
                )}
                
                {/* Cảnh báo lỗi quyền */}
                {errorMsg && (
                  <Alert type="danger" className="mt-2 text-center rounded-3">{errorMsg}</Alert>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Câu hỏi gợi ý - chỉ hiện khi mới vào chưa chat */}
              {isFirstMessage && !isFreePackage && (
                <div className="px-4 pb-2">
                  <div className="d-flex gap-2 flex-wrap justify-content-center">
                    {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        className="suggestion-chip btn btn-outline-primary rounded-pill btn-sm d-flex align-items-center"
                        onClick={() => handleQuickSuggestion(suggestion)}
                        disabled={isLoading}
                      >
                        <Zap size={14} className="me-1 text-warning" /> {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ô nhập tin nhắn */}
              <div className="p-4 bg-white border-top chat-input-container">
                <Form onSubmit={handleSendMessage}>
                  <div className="d-flex align-items-center gap-3 bg-light rounded-pill p-2 border flex-grow-1 shadow-sm focus-ring-wrapper">
                    <Input
                      type="text"
                      placeholder="Hỏi Trợ lý AI..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      disabled={isLoading || isFreePackage || !currentSessionId}
                      className="border-0 bg-transparent shadow-none px-4 py-2 flex-grow-1 mb-0 chat-input"
                      autoComplete="off"
                    />
                    <Button 
                      type="submit" 
                      disabled={isLoading || !inputMessage.trim() || isFreePackage || !currentSessionId}
                      className="rounded-circle send-btn d-flex align-items-center justify-content-center"
                      variant="primary"
                      style={{ width: '44px', height: '44px', padding: 0 }}
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                </Form>
                <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '11px' }}>
                  AI có thể mắc lỗi. Vui lòng kiểm tra lại thông tin dự án trước khi ứng tuyển.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal xem chi tiết dự án - Tái sử dụng component có sẵn */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          show={showProjectModal}
          onHide={handleCloseProjectModal}
        />
      )}
    </Container>
  );
};

export default AIHub;
