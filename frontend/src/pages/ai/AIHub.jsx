import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Gem } from 'lucide-react';
import { getAiSessions, createAiSession, getAiSessionById, deleteAiSession, sendAiMessage } from '../../services/aiService';
import { getProjectDetail } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import { PACKAGE_TYPE } from '../../constants/subscriptionEnum';
import { AI_SENDER } from '../../constants/aiEnum';
import ProjectDetailModal from '../feed/ProjectDetailModal';
import SidebarAI from './SidebarAI';
import AIChat from './AIChat';

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

  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const isFreePackage = currentUser?.currentPackage === PACKAGE_TYPE.FREE;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
        const idToSelect = selectSessionId || sessionData[0]._id;
        handleSelectSession(idToSelect);
      } else {
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
    if (messages.length === 0 && currentSessionId) return;

    setIsLoading(true);
    try {
      const res = await createAiSession();
      if (res.data) {
        setSessions(prev => [res.data, ...prev]);
        setCurrentSessionId(res.data._id);
        setMessages([]);
      }
    } catch (error) {
      console.error('Lỗi khi tạo session mới:', error);
      setErrorMsg('Không thể tạo đoạn chat mới.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa đoạn chat này không?')) return;

    try {
      await deleteAiSession(sessionId);
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

  const handleSendMessage = async (e, textOverride = null) => {
    if (e) e.preventDefault();

    const userText = textOverride || inputMessage;
    if (!userText.trim() || !currentSessionId) return;

    setMessages(prev => [...prev, { sender: AI_SENDER.USER, text: userText }]);
    if (!textOverride) setInputMessage('');

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await sendAiMessage(currentSessionId, userText);
      const aiData = response.data;

      setMessages(prev => [...prev, aiData]);

      if (messages.length === 0) {
        const res = await getAiSessions();
        setSessions(res.data || []);
      }
    } catch (error) {
      console.error('Lỗi khi gọi AI:', error);
      // axiosClient.js reject bằng error.response.data nên error không còn thuộc tính response.status
      if (error.message && error.message.includes('nâng cấp')) {
        setErrorMsg('Tính năng này chỉ dành cho tài khoản VIP hoặc PREMIUM. Vui lòng nâng cấp để sử dụng.');
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: AI_SENDER.AI,
            text: 'Xin lỗi, hiện tại hệ thống AI đang quá tải hoặc gặp lỗi kết nối. Bạn thử lại sau ít phút nhé!'
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (text) => {
    handleSendMessage(null, text);
  };

  const handleViewProject = async (projectId) => {
    setIsLoadingProject(true);
    try {
      const response = await getProjectDetail(projectId);
      setSelectedProject(response.data);
      setShowProjectModal(true);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết dự án:', error);
      if (error.response?.status === 404) {
        alert('Dự án này đã bị đóng hoặc không còn tồn tại.');
      }
    } finally {
      setIsLoadingProject(false);
    }
  };

  const handleCloseProjectModal = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
  };

  const isFirstMessage = messages.length === 0;

  return (
    <Container fluid className="position-absolute top-0 bottom-0 start-0 end-0 d-flex flex-column p-0 bg-white">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center border-bottom flex-shrink-0">
        {isFreePackage && (
          <Button variant="warning" onClick={() => navigate('/subscription')} className="d-flex align-items-center fw-bold">
            <Gem size={18} className="me-2" /> Nâng cấp VIP
          </Button>
        )}
      </div>

      {isFreePackage && (
        <Alert type="warning" className="m-3 flex-shrink-0">
          <p className="mb-0">Tài khoản của bạn là tài khoản <b>FREE</b>. Tính năng AI Đề xuất dự án yêu cầu gói <b>VIP</b> hoặc <b>PREMIUM</b>.</p>
        </Alert>
      )}

      {/* Main Layout */}
      <Row className="g-0 flex-grow-1 overflow-hidden">
        {isSidebarOpen && (
          <Col md={3} className="h-100 border-end">
            <SidebarAI
              sessions={sessions}
              currentSessionId={currentSessionId}
              isLoadingSessions={isLoadingSessions}
              onSelectSession={handleSelectSession}
              onCreateNewSession={handleCreateNewSession}
              onDeleteSession={handleDeleteSession}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          </Col>
        )}
        <Col md={isSidebarOpen ? 9 : 12} className="h-100">
          <AIChat
            messages={messages}
            isLoading={isLoading}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onSendMessage={handleSendMessage}
            onQuickSuggestion={handleQuickSuggestion}
            isFirstMessage={isFirstMessage}
            isFreePackage={isFreePackage}
            currentSessionId={currentSessionId}
            errorMsg={errorMsg}
            onViewProject={handleViewProject}
            isLoadingProject={isLoadingProject}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            messagesEndRef={messagesEndRef}
          />
        </Col>
      </Row>

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
