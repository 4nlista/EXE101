import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Badge, Spinner } from 'react-bootstrap';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Alert from '../../components/Alert';
import { useNavigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { recommendProjects } from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';
import { PACKAGE_TYPE } from '../../constants/subscriptionEnum';
import './AIHub.css';

const SENDER = {
  AI: 'ai',
  USER: 'user'
};

const AIHub = () => {
  const [messages, setMessages] = useState([
    {
      sender: SENDER.AI,
      text: 'Chào bạn! Mình là Trợ lý AI của UniVerse. Mình có thể giúp bạn tìm kiếm những dự án phù hợp nhất với kỹ năng và định hướng của bạn. Hãy cho mình biết bạn muốn tìm dự án như thế nào nhé!',
      projects: null
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef(null);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const isFreePackage = currentUser?.currentPackage === PACKAGE_TYPE.FREE;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Hiển thị tin nhắn của user
    const userText = inputMessage;
    setMessages(prev => [...prev, { sender: SENDER.USER, text: userText }]);
    setInputMessage('');
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Gọi API AI
      const response = await recommendProjects(userText);
      const aiData = response.data;

      // Thêm tin nhắn của AI vào
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

  const handleNavigateToProject = (projectId) => {
    navigate('/feed'); // Tạm thời chuyển về feed vì hiện tại trang chi tiết nằm trong feed
  };

  return (
    <Container className="ai-hub-container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold" style={{ color: '#0d6efd' }}>✨ AI Project Matcher</h2>
          <p className="text-muted mb-0">Tìm kiếm dự án phù hợp bằng AI</p>
        </div>
        {isFreePackage && (
          <Button variant="warning" onClick={() => navigate('/subscription')}>
            Nâng cấp VIP / PREMIUM
          </Button>
        )}
      </div>

      {isFreePackage && (
        <Alert type="warning">
          <p className="mb-0">Tài khoản của bạn là tài khoản <b>FREE</b>. Tính năng AI Đề xuất dự án yêu cầu gói <b>VIP</b> hoặc <b>PREMIUM</b>. Vui lòng nâng cấp để trải nghiệm trợ lý AI thông minh.</p>
        </Alert>
      )}

      <Card className="chat-card shadow-sm border-0" style={{ height: '70vh', borderRadius: '15px' }}>
        <Card.Body className="chat-body d-flex flex-column p-0">
          <div className="chat-messages flex-grow-1 overflow-auto p-4" style={{ backgroundColor: '#f8f9fa' }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`d-flex mb-4 ${msg.sender === SENDER.USER ? 'justify-content-end' : 'justify-content-start'}`}>
                {msg.sender === SENDER.AI && (
                  <div className="me-3 mt-1">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-robot fs-5"></i>
                    </div>
                  </div>
                )}
                
                <div style={{ maxWidth: '75%' }}>
                  <div 
                    className={`p-3 rounded-4 shadow-sm ${msg.sender === SENDER.USER ? 'bg-primary text-white' : 'bg-white border'}`}
                    style={{ borderTopRightRadius: msg.sender === SENDER.USER ? '4px' : '16px', borderTopLeftRadius: msg.sender === SENDER.AI ? '4px' : '16px' }}
                  >
                    <div className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                    
                    {/* Hiển thị Project Card */}
                    {msg.projects && msg.projects.length > 0 && (
                      <div className="mt-3 d-flex flex-column gap-2">
                        {msg.projects.map((proj, pIdx) => (
                          <Card 
                            key={pIdx} 
                            className="border border-primary border-opacity-25 bg-primary bg-opacity-10 cursor-pointer project-card-hover"
                            onClick={() => handleNavigateToProject(proj.projectId)}
                            style={{ transition: 'all 0.2s', borderRadius: '10px' }}
                          >
                            <Card.Body className="p-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="mb-0 text-dark fw-bold">ID: {proj.projectId.substring(0, 8)}...</h6>
                                <Badge bg="success" className="fs-6 rounded-pill">{proj.matchPercent}% Match</Badge>
                              </div>
                              <p className="text-secondary small mb-0 lh-sm">{proj.reason}</p>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {msg.sender === SENDER.USER && (
                  <div className="ms-3 mt-1">
                    <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-person fs-5"></i>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="d-flex mb-4 justify-content-start">
                <div className="me-3 mt-1">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-robot fs-5"></i>
                  </div>
                </div>
                <div className="bg-white border p-3 rounded-4 shadow-sm d-flex align-items-center" style={{ borderTopLeftRadius: '4px' }}>
                  <Spinner animation="grow" size="sm" variant="primary" className="me-1" />
                  <Spinner animation="grow" size="sm" variant="primary" className="me-1" />
                  <Spinner animation="grow" size="sm" variant="primary" />
                </div>
              </div>
            )}
            
            {errorMsg && (
              <Alert type="danger" className="mt-2 text-center rounded-3">{errorMsg}</Alert>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-top">
            <Form onSubmit={handleSendMessage}>
              <div className="d-flex align-items-center gap-2 bg-light rounded-pill p-1 border flex-grow-1">
                <Input
                  type="text"
                  placeholder="Ví dụ: Mình rành React, muốn kiếm nhóm có dev Backend xịn..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading || isFreePackage}
                  className="border-0 bg-transparent shadow-none px-3 py-2 flex-grow-1 mb-0"
                  autoComplete="off"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !inputMessage.trim() || isFreePackage}
                  className="rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2"
                >
                  Gửi <i className="bi bi-send-fill"></i>
                </Button>
              </div>
            </Form>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AIHub;
