import React, { useState, useRef, useEffect } from 'react';
import { Container, Card, Form, Badge, Spinner } from 'react-bootstrap';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Alert from '../../components/Alert';
import { useNavigate } from 'react-router-dom';
import { recommendProjects } from '../../services/aiService';
import { getProjectDetail } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import { PACKAGE_TYPE } from '../../constants/subscriptionEnum';
import ProjectDetailModal from '../feed/ProjectDetailModal';
import './AIHub.css';

// Enum phân biệt tin nhắn AI / User
const SENDER = {
  AI: 'ai',
  USER: 'user'
};

// Các câu hỏi gợi ý để user bấm nhanh
const QUICK_SUGGESTIONS = [
  'Tìm dự án phù hợp với kỹ năng của mình',
  'Mình muốn tham gia dự án về Mobile App',
  'Có dự án nào cần Frontend Developer không?'
];

const AIHub = () => {
  const [messages, setMessages] = useState([
    {
      sender: SENDER.AI,
      text: 'Chào bạn! Mình là Trợ lý AI của UniVerse\nMình có thể giúp bạn tìm kiếm những dự án phù hợp nhất với kỹ năng và định hướng của bạn.\nHãy cho mình biết bạn muốn tìm dự án như thế nào nhé!',
      projects: null
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  // Gửi tin nhắn cho AI
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setMessages(prev => [...prev, { sender: SENDER.USER, text: userText }]);
    setInputMessage('');
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await recommendProjects(userText);
      const aiData = response.data;

      setMessages(prev => [
        ...prev,
        {
          sender: SENDER.AI,
          text: aiData.replyMessage,
          projects: aiData.recommendedProjects
        }
      ]);
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
    setInputMessage(text);
    // Tự động submit sau khi set text
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => { } };
      setMessages(prev => [...prev, { sender: SENDER.USER, text }]);
      setIsLoading(true);
      setErrorMsg('');
      recommendProjects(text)
        .then(response => {
          const aiData = response.data;
          setMessages(prev => [...prev, { sender: SENDER.AI, text: aiData.replyMessage, projects: aiData.recommendedProjects }]);
        })
        .catch(error => {
          console.error('Lỗi khi gọi AI:', error);
          setMessages(prev => [...prev, { sender: SENDER.AI, text: 'Xin lỗi, hệ thống AI đang bận. Bạn thử lại sau nhé!' }]);
        })
        .finally(() => {
          setIsLoading(false);
          setInputMessage('');
        });
    }, 100);
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
    } finally {
      setIsLoadingProject(false);
    }
  };

  // Đóng Modal
  const handleCloseProjectModal = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
  };

  // Kiểm tra xem mới chỉ có 1 tin chào mở đầu (chưa chat gì)
  const isFirstMessage = messages.length === 1;

  return (
    <Container className="ai-hub-container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1 fw-bold ai-hub-title">
            <i className="bi bi-stars"></i> AI Project Matcher
          </h2>
          <p className="text-muted mb-0 small">Tìm kiếm dự án phù hợp với bạn bằng trí tuệ nhân tạo</p>
        </div>
        {isFreePackage && (
          <Button variant="warning" onClick={() => navigate('/subscription')}>
            <i className="bi bi-gem me-1"></i> Nâng cấp
          </Button>
        )}
      </div>

      {/* Cảnh báo nếu gói Free */}
      {isFreePackage && (
        <Alert type="warning">
          <p className="mb-0">Tài khoản của bạn là tài khoản <b>FREE</b>. Tính năng AI Đề xuất dự án yêu cầu gói <b>VIP</b> hoặc <b>PREMIUM</b>.</p>
        </Alert>
      )}

      {/* Khung Chat chính */}
      <Card className="chat-card shadow-lg border-0" style={{ height: '75vh', borderRadius: '20px', overflow: 'hidden' }}>
        <Card.Body className="chat-body d-flex flex-column p-0">
          <div className="chat-messages flex-grow-1 overflow-auto p-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`d-flex mb-4 ${msg.sender === SENDER.USER ? 'justify-content-end' : 'justify-content-start'}`}>

                {/* AI Avatar */}
                {msg.sender === SENDER.AI && (
                  <div className="me-3 mt-1 flex-shrink-0">
                    <div className="ai-avatar rounded-circle d-flex align-items-center justify-content-center shadow-sm">
                      <i className="bi bi-robot fs-5 text-white"></i>
                    </div>
                  </div>
                )}

                <div style={{ maxWidth: '80%' }}>
                  {/* Bong bóng tin nhắn */}
                  <div className={`p-3 shadow-sm ${msg.sender === SENDER.USER ? 'user-message-bubble text-white' : 'ai-message-bubble'}`}>
                    <div className="message-text" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  </div>

                  {/* Thẻ Dự án xếp NGANG */}
                  {msg.projects && msg.projects.length > 0 && (
                    <div className="mt-3 ai-projects-row d-flex gap-3 overflow-auto pb-2">
                      {msg.projects.map((proj, pIdx) => (
                        <div key={pIdx} className="ai-project-card flex-shrink-0">
                          {/* Badge % Match */}
                          <div className="text-end mb-2">
                            <Badge className="match-badge px-3 py-2 rounded-pill">
                              <i className="bi bi-stars me-1"></i> {proj.matchPercent}% Phù hợp
                            </Badge>
                          </div>

                          {/* Tên dự án */}
                          <h6 className="fw-bold text-dark mb-1 text-truncate" title={proj.projectTitle || proj.projectId}>
                            {proj.projectTitle || `Dự án ${proj.projectId?.substring(0, 8)}`}
                          </h6>

                          {/* Kỹ năng yêu cầu */}
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

                          {/* Lý do phù hợp */}
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
                    <div className="user-avatar rounded-circle d-flex align-items-center justify-content-center shadow-sm">
                      <i className="bi bi-person-fill fs-5 text-white"></i>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Animation đang chờ AI trả lời */}
            {isLoading && (
              <div className="d-flex mb-4 justify-content-start">
                <div className="me-3 mt-1 flex-shrink-0">
                  <div className="ai-avatar rounded-circle d-flex align-items-center justify-content-center shadow-sm">
                    <i className="bi bi-robot fs-5 text-white"></i>
                  </div>
                </div>
                <div className="ai-message-bubble p-3 shadow-sm d-flex align-items-center gap-2">
                  <Spinner animation="grow" size="sm" style={{ color: '#6366f1' }} />
                  <Spinner animation="grow" size="sm" style={{ color: '#8b5cf6', animationDelay: '0.2s' }} />
                  <Spinner animation="grow" size="sm" style={{ color: '#d946ef', animationDelay: '0.4s' }} />
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
              <div className="d-flex gap-2 flex-wrap">
                {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="suggestion-chip"
                    onClick={() => handleQuickSuggestion(suggestion)}
                    disabled={isLoading}
                  >
                    <i className="bi bi-lightning-fill me-1"></i> {suggestion}
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
                  disabled={isLoading || isFreePackage}
                  className="border-0 bg-transparent shadow-none px-4 py-2 flex-grow-1 mb-0 chat-input"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim() || isFreePackage}
                  className="rounded-circle send-btn d-flex align-items-center justify-content-center"
                  variant="primary"
                  style={{ width: '44px', height: '44px', padding: 0 }}
                >
                  <i className="bi bi-send-fill"></i>
                </Button>
              </div>
            </Form>
            <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '11px' }}>
              Kết quả do AI tạo ra có thể thay đổi dựa trên cập nhật hồ sơ.
            </p>
          </div>
        </Card.Body>
      </Card>

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
