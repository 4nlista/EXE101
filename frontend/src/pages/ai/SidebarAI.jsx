import React, { useState } from 'react';
import { ListGroup, Spinner } from 'react-bootstrap';
import Button from '../../components/Button';
import { Plus, MessageSquare, Trash2, PanelLeftClose, Pencil, Check, X } from 'lucide-react';

const SidebarAI = ({
  sessions,
  currentSessionId,
  isLoadingSessions,
  onSelectSession,
  onCreateNewSession,
  onDeleteSession,
  onRenameSession,
  setIsSidebarOpen
}) => {
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const startEditing = (e, session) => {
    e.stopPropagation();
    setEditingSessionId(session._id);
    setEditingTitle(session.title || 'Cuộc hội thoại mới');
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
  return (
    <div className="d-flex flex-column h-100 bg-light">
      <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
        <Button
          variant="primary"
          className="fw-bold w-100 d-flex align-items-center justify-content-center gap-2 me-2 rounded-3"
          onClick={onCreateNewSession}
          loading={isLoadingSessions}
        >
          <Plus size={18} /> Đoạn chat mới
        </Button>
        <Button
          variant="link"
          className="text-secondary p-0 border-0 shadow-none"
          onClick={() => setIsSidebarOpen(false)}
          title="Đóng thanh bên"
        >
          <PanelLeftClose size={24} />
        </Button>
      </div>
      <ListGroup variant="flush" className="overflow-auto flex-grow-1">
        {isLoadingSessions ? (
          <div className="text-center p-4"><Spinner animation="border" variant="primary" size="sm" /></div>
        ) : sessions.length === 0 ? (
          <div className="text-center p-4 text-muted small">Chưa có lịch sử chat</div>
        ) : (
          sessions.map(session => (
            <ListGroup.Item
              key={session._id}
              as="div"
              role="button"
              action
              active={currentSessionId === session._id}
              onClick={() => onSelectSession(session._id)}
              className={`d-flex justify-content-between align-items-center ${currentSessionId === session._id ? 'bg-secondary text-white' : 'bg-transparent text-dark'}`}
            >
              {editingSessionId === session._id ? (
                <div className="d-flex align-items-center flex-grow-1 me-2 w-100" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    className="form-control form-control-sm me-1 shadow-none"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(e, session._id);
                      if (e.key === 'Escape') handleCancelEdit(e);
                    }}
                    autoFocus
                  />
                  <Button variant="link" className="p-1 shadow-none text-success" onClick={(e) => handleSaveEdit(e, session._id)}>
                    <Check size={16} />
                  </Button>
                  <Button variant="link" className="p-1 shadow-none text-danger" onClick={handleCancelEdit}>
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-truncate flex-grow-1 d-flex align-items-center me-2" onDoubleClick={(e) => startEditing(e, session)}>
                    <MessageSquare size={13} className="me-2 flex-shrink-0" />
                    <span className="text-truncate">{session.title || 'Cuộc hội thoại mới'}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <Button
                      variant="link"
                      className={`p-1 shadow-none ${currentSessionId === session._id ? 'text-white' : 'text-secondary'}`}
                      onClick={(e) => startEditing(e, session)}
                      title="Đổi tên đoạn chat"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="link"
                      className={`p-1 shadow-none ${currentSessionId === session._id ? 'text-white' : 'text-danger'}`}
                      onClick={(e) => onDeleteSession(e, session._id)}
                      title="Xóa đoạn chat"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </>
              )}
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </div>
  );
};

export default SidebarAI;
