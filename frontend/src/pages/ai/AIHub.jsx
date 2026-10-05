import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ConfirmActionModal from '../../components/ConfirmActionModal';
import { useNavigate } from 'react-router-dom';
import { getAiSessions, createAiSession, getAiSessionById, deleteAiSession, updateAiSession, sendAiMessage } from '../../services/aiService';
import { getProjectDetail } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import { PACKAGE_TYPE } from '../../constants/subscriptionEnum';
import { AI_SENDER } from '../../constants/aiEnum';
import ProjectDetailModal from '../feed/ProjectDetailModal';
import SidebarAI from './SidebarAI';
import AIChat from './AIChat';
import './AIHub.css';

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

  // State quản lý modal xác nhận xóa session
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingSession, setIsDeletingSession] = useState(false);

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

  const handleRenameSession = async (e, sessionId, newTitle) => {
    if (e) e.stopPropagation();
    if (!newTitle.trim()) return;

    try {
      const res = await updateAiSession(sessionId, newTitle);
      if (res.data) {
        setSessions(prev => prev.map(s => s._id === sessionId ? { ...s, title: newTitle } : s));
      }
    } catch (error) {
      console.error('Lỗi khi đổi tên session:', error);
      alert('Không thể đổi tên đoạn chat này.');
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

  const handleViewProject = async (projectOrId) => {
    const projectId = typeof projectOrId === 'object' ? projectOrId?._id : projectOrId;
    if (!projectId) return;

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

  const openDeleteModal = (e, sessionId) => {
    if (e) e.stopPropagation();
    setSessionToDelete(sessionId);
    setShowDeleteModal(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    setIsDeletingSession(true);
    try {
      await deleteAiSession(sessionToDelete);
      if (currentSessionId === sessionToDelete) {
        fetchSessions();
      } else {
        setSessions(prev => prev.filter(s => s._id !== sessionToDelete));
      }
      setShowDeleteModal(false);
      setSessionToDelete(null);
    } catch (error) {
      console.error('Lỗi khi xóa session:', error);
      setErrorMsg('Không thể xóa đoạn chat này.');
    } finally {
      setIsDeletingSession(false);
    }
  };

  const isFirstMessage = messages.length === 0;
  const currentSession = sessions.find(s => s._id === currentSessionId);

  return (
    <div className="aihub-page-wrapper">
      <Container fluid className="p-0 aihub-container">
        <Row className="g-0 h-100 flex-nowrap">
          {/* Cột Trái (Sidebar): Chiếm đúng 3/12 cột theo chuẩn Bootstrap */}
          {isSidebarOpen && (
            <Col md={3} className="aihub-sidebar-col h-100 border-end">
              <SidebarAI
                sessions={sessions}
                currentSessionId={currentSessionId}
                isLoadingSessions={isLoadingSessions}
                onSelectSession={handleSelectSession}
                onCreateNewSession={handleCreateNewSession}
                onDeleteSession={openDeleteModal}
                onRenameSession={handleRenameSession}
                onToggleSidebar={() => setIsSidebarOpen(false)}
              />
            </Col>
          )}

          {/* Cột Phải (Chat Area): Chiếm đúng 9/12 cột (hoặc 12/12 khi ẩn sidebar) */}
          <Col md={isSidebarOpen ? 9 : 12} className="aihub-chat-col h-100">
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
              currentSession={currentSession}
              onRenameSession={handleRenameSession}
              onDeleteSession={openDeleteModal}
              errorMsg={errorMsg}
              onViewProject={handleViewProject}
              isLoadingProject={isLoadingProject}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
              messagesEndRef={messagesEndRef}
            />
          </Col>
        </Row>
      </Container>

      {/* Modal xác nhận xóa session - Tái sử dụng ConfirmActionModal */}
      <ConfirmActionModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteSession}
        title="Xóa đoạn trò chuyện"
        message="Bạn có chắc chắn muốn xóa đoạn trò chuyện này không? Dữ liệu tin nhắn sẽ không thể khôi phục."
        confirmText="Xóa"
        variant="danger"
        isLoading={isDeletingSession}
      />

      {/* Modal xem chi tiết dự án - Tái sử dụng ProjectDetailModal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          show={showProjectModal}
          onHide={handleCloseProjectModal}
        />
      )}
    </div>
  );
};

export default AIHub;
