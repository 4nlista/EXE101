import React, { useState } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import Button from '../../components/Button';
import ProjectCard from '../../components/ProjectCard';
import Alert from '../../components/Alert';
import { Sparkles, Send, PanelLeftOpen, PanelLeftClose, Pencil, Trash2, Check, X } from 'lucide-react';
import { AI_SENDER } from '../../constants/aiEnum';

const DEFAULT_SUGGESTIONS = [
  'Tìm dự án phù hợp với kỹ năng của mình',
  'Giải thích kiến trúc MVC',
  'Tạo sơ đồ ERD',
  'Có dự án nào cần Frontend Developer không?'
];

const AIChat = ({
  messages,
  isLoading,
  inputMessage,
  setInputMessage,
  onSendMessage,
  onQuickSuggestion,
  isFirstMessage,
  isFreePackage,
  currentSessionId,
  currentSession,
  onRenameSession,
  onDeleteSession,
  errorMsg,
  onViewProject,
  isLoadingProject,
  isSidebarOpen,
  setIsSidebarOpen,
  onToggleSidebar,
  messagesEndRef
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');

  const handleStartRename = () => {
    setEditTitleValue(currentSession?.title || 'Cuộc trò chuyện mới');
    setIsEditingTitle(true);
  };

  const handleSaveRename = (e) => {
    if (e) e.stopPropagation();
    if (editTitleValue.trim() && currentSessionId) {
      onRenameSession(e, currentSessionId, editTitleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelRename = () => {
    setIsEditingTitle(false);
  };

  const handleToggle = onToggleSidebar || (() => setIsSidebarOpen && setIsSidebarOpen(!isSidebarOpen));

  return (
    <section className="aihub-chat-area">
      {/* ── Top Header của Chat Area ── */}
      <div className="aihub-chat-header">
        <div className="aihub-chat-title-wrap">
          {/* Nút Ẩn / Hiện thanh bên (Sidebar) */}
          <Button
            variant="link"
            className="text-secondary p-1 border-0 shadow-none me-2 d-flex align-items-center justify-content-center aihub-sidebar-toggle-btn"
            onClick={handleToggle}
            title={isSidebarOpen ? "Ẩn thanh bên" : "Hiện thanh bên"}
          >
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </Button>

          <div className="aihub-ai-icon">
            <Sparkles size={20} />
          </div>

          <div>
            {isEditingTitle ? (
              <div className="d-flex align-items-center gap-1">
                <input
                  type="text"
                  className="form-control form-control-sm shadow-none"
                  style={{ fontSize: '13px', width: '220px' }}
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename(e);
                    if (e.key === 'Escape') handleCancelRename();
                  }}
                  autoFocus
                />
                <Button variant="link" className="p-1 text-success shadow-none border-0" onClick={handleSaveRename}>
                  <Check size={16} />
                </Button>
                <Button variant="link" className="p-1 text-danger shadow-none border-0" onClick={handleCancelRename}>
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <div className="aihub-chat-title text-truncate" style={{ maxWidth: '400px' }}>
                {currentSession?.title || 'Hỗ trợ phát triển dự án'}
              </div>
            )}
            <div className="aihub-chat-subtitle">Trợ lý AI hỗ trợ phân tích, thiết kế và tư vấn dự án</div>
          </div>
        </div>

        {/* Các nút hành động header: Đổi tên, Xóa */}
        {currentSessionId && (
          <div className="aihub-chat-header-actions">
            <Button
              variant="link"
              className="text-secondary p-1 border-0 shadow-none"
              onClick={handleStartRename}
              title="Đổi tên đoạn chat"
            >
              <Pencil size={18} />
            </Button>
            <Button
              variant="link"
              className="text-danger p-1 border-0 shadow-none"
              onClick={(e) => onDeleteSession(e, currentSessionId)}
              title="Xóa đoạn chat"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        )}
      </div>

      {/* ── Vùng hiển thị tin nhắn ── */}
      <div className="aihub-messages">
        {messages.length === 0 && !isLoading && (
          <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center py-5">
            <div className="aihub-ai-icon mb-3" style={{ width: '48px', height: '48px' }}>
              <Sparkles size={24} />
            </div>
            <h5 className="fw-bold text-dark mb-2">Chào bạn! Mình là Trợ lý AI của UniVerse</h5>
            <p className="text-muted small w-75 mx-auto mb-0" style={{ maxWidth: '480px' }}>
              Mình có thể giúp bạn tìm kiếm những dự án phù hợp nhất với kỹ năng và định hướng của bạn. Hãy cho mình biết bạn muốn tìm dự án như thế nào nhé!
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`aihub-message-row ${msg.sender === AI_SENDER.USER ? 'user' : ''}`}
          >
            {msg.sender === AI_SENDER.USER ? (
              <div className="aihub-message user" style={{ whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </div>
            ) : (
              (() => {
                const hasProjects = msg.projects && msg.projects.length > 0;
                const hasMultipleProjects = msg.projects && msg.projects.length >= 2;
                const hasSingleProject = msg.projects && msg.projects.length === 1;

                const layoutClass = hasMultipleProjects 
                  ? 'multiple-projects' 
                  : hasSingleProject 
                    ? 'single-project' 
                    : 'text-only';

                return (
                  <div className={`aihub-ai-message-wrap ${layoutClass}`}>
                    <div className="aihub-mini-ai">
                      <Sparkles size={16} />
                    </div>
                    <div className={`aihub-message ai ${layoutClass}`}>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {msg.text}
                      </div>

                      {/* Danh sách thẻ Dự án: 1 dự án chiếm 40-50%, 2 dự án chiếm 50-50%, từ 3 dự án trở lên tối đa 3 card/hàng (33.33%) */}
                      {hasProjects && (
                        <Row className="mt-3 pb-2 g-3">
                          {msg.projects.map((proj, pIdx) => {
                            const projectData = (typeof proj.projectId === 'object' && proj.projectId !== null)
                              ? proj.projectId
                              : {
                                _id: proj.projectId,
                                title: proj.projectTitle || `Dự án ${proj.projectId?.substring?.(0, 8) || ''}`,
                                description: proj.reason,
                                candidateRequirements: proj.skills?.join(', ')
                              };

                            // Phân bổ độ rộng cột chuẩn UX:
                            // - 1 dự án: chiếm 40% - 50% (md={6}, lg={5}) để card cân đối, dễ nhìn
                            // - 2 dự án: chiếm 50% mỗi card (md={6} - 2 card/hàng)
                            // - 3 dự án trở lên: chiếm 33.33% mỗi card (lg={4} - 3 card/hàng, tự động xuống dòng 3 trên 1 dưới, 3 trên 2 dưới...)
                            const colProps = msg.projects.length === 1
                              ? { xs: 12, sm: 8, md: 6, lg: 5 }
                              : msg.projects.length === 2
                                ? { xs: 12, md: 6 }
                                : { xs: 12, md: 6, lg: 4 };

                            return (
                              <Col {...colProps} key={pIdx}>
                                <ProjectCard
                                  project={projectData}
                                  matchPercent={proj.matchPercent}
                                  aiReason={proj.reason}
                                  onViewDetail={() => onViewProject(projectData._id || proj.projectId || projectData)}
                                />
                              </Col>
                            );
                          })}
                        </Row>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        ))}

        {/* Trạng thái đang tải tin nhắn AI */}
        {isLoading && (
          <div className="aihub-message-row">
            <div className="aihub-ai-message-wrap text-only">
              <div className="aihub-mini-ai">
                <Sparkles size={16} />
              </div>
              <div className="aihub-message ai d-flex align-items-center gap-2 py-3 text-only" style={{ width: 'auto' }}>
                <Spinner animation="grow" size="sm" style={{ color: 'var(--orange)' }} />
                <Spinner animation="grow" size="sm" style={{ color: 'var(--orange)' }} />
                <Spinner animation="grow" size="sm" style={{ color: 'var(--orange)' }} />
                <span className="text-muted small ms-1">UniVerse AI đang phản hồi...</span>
              </div>
            </div>
          </div>
        )}

        {/* Thông báo lỗi nếu có */}
        {errorMsg && (
          <Alert type="danger" className="mt-2 text-center rounded-3">
            {errorMsg}
          </Alert>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Khung nhập tin nhắn & Gợi ý (Composer Wrap) ── */}
      <div className="aihub-composer-wrap">
        <form onSubmit={onSendMessage}>
          <div className="aihub-composer">
            <input
              type="text"
              className="aihub-prompt"
              placeholder="Nhập câu hỏi của bạn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading || isFreePackage || !currentSessionId}
              autoComplete="off"
            />
            <Button
              type="submit"
              className="aihub-send border-0 p-0"
              disabled={isLoading || isFreePackage || !currentSessionId || !inputMessage.trim()}
              title="Gửi câu hỏi"
            >
              <Send size={18} />
            </Button>
          </div>
        </form>

      </div>
    </section>
  );
};

export default AIChat;
