import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import Button from '../../components/Button';
import { Plus, Sparkles, Trash2, Pencil, Check, X, PanelLeftClose } from 'lucide-react';

/**
 * Định dạng thời gian hiển thị: "10:24", "Hôm qua", "28/09"
 */
const formatSessionTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Hôm qua';
  }
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const SidebarAI = ({
  sessions,
  currentSessionId,
  isLoadingSessions,
  onSelectSession,
  onCreateNewSession,
  onDeleteSession,
  onRenameSession,
  onToggleSidebar,
  setIsSidebarOpen
}) => {
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const startEditing = (e, session) => {
    e.stopPropagation();
    setEditingSessionId(session._id);
    setEditingTitle(session.title || 'Cuộc trò chuyện mới');
  };

  const handleSaveEdit = (e, sessionId) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameSession(e, sessionId, editingTitle);
    }
    setEditingSessionId(null);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

  const handleToggle = onToggleSidebar || (() => setIsSidebarOpen && setIsSidebarOpen(false));

  return (
    <aside className="aihub-sidebar">
      {/* ── Top Header Sidebar: Nút Tạo mới ── */}
      <div className="p-3 border-bottom bg-white">
        <Button
          variant="warning"
          className="w-100 fw-bold text-white d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 shadow-sm border-0"
          style={{ backgroundColor: 'var(--orange)' }}
          onClick={onCreateNewSession}
          loading={isLoadingSessions}
        >
          <Plus size={18} /> Đoạn chat mới
        </Button>
      </div>

      {/* ── Tiêu đề Cuộc trò chuyện gần đây ── */}
      <div className="px-3 pt-3 pb-2 aihub-recent-title">
        Cuộc trò chuyện gần đây
      </div>

      {/* ── Danh sách các cuộc trò chuyện ── */}
      <div className="aihub-recent-list px-3 pb-3">
        {isLoadingSessions ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="warning" size="sm" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center p-4 text-muted small">Chưa có lịch sử trò chuyện</div>
        ) : (
          sessions.map((session) => {
            const isActive = currentSessionId === session._id;
            const isEditing = editingSessionId === session._id;
            const previewText = session.messages && session.messages.length > 0
              ? session.messages[session.messages.length - 1]?.text || 'Bắt đầu cuộc trò chuyện...'
              : 'Bắt đầu cuộc trò chuyện...';

            return (
              <div
                key={session._id}
                className={`aihub-conversation ${isActive ? 'active' : ''}`}
                onClick={() => onSelectSession(session._id)}
              >
                <div className="aihub-conversation-icon">
                  <Sparkles size={16} />
                </div>

                {isEditing ? (
                  <div
                    className="d-flex align-items-center flex-grow-1 w-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      className="form-control form-control-sm me-1 shadow-none"
                      style={{ fontSize: '12px' }}
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(e, session._id);
                        if (e.key === 'Escape') handleCancelEdit(e);
                      }}
                      autoFocus
                    />
                    <Button
                      variant="link"
                      className="p-1 text-success shadow-none border-0"
                      onClick={(e) => handleSaveEdit(e, session._id)}
                    >
                      <Check size={16} />
                    </Button>
                    <Button
                      variant="link"
                      className="p-1 text-danger shadow-none border-0"
                      onClick={handleCancelEdit}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="aihub-conversation-body">
                      <div className="aihub-conversation-title" title={session.title || 'Cuộc trò chuyện mới'}>
                        {session.title || 'Cuộc trò chuyện mới'}
                      </div>
                      <div className="aihub-conversation-preview">{previewText}</div>
                    </div>
                    <div className="aihub-conversation-time">
                      {formatSessionTime(session.updatedAt || session.createdAt)}
                    </div>

                    {/* Các nút thao tác đổi tên và xóa */}
                    <div className="aihub-conversation-actions">
                      <Button
                        variant="link"
                        className="text-secondary p-1 border-0 shadow-none"
                        onClick={(e) => startEditing(e, session)}
                        title="Đổi tên đoạn chat"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="link"
                        className="text-danger p-1 border-0 shadow-none"
                        onClick={(e) => onDeleteSession(e, session._id)}
                        title="Xóa đoạn chat"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default SidebarAI;
