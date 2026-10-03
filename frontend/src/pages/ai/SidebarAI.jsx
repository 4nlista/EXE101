import React from 'react';
import { ListGroup, Spinner } from 'react-bootstrap';
import Button from '../../components/Button';
import { Plus, MessageSquare, Trash2, PanelLeftClose } from 'lucide-react';

const SidebarAI = ({
  sessions,
  currentSessionId,
  isLoadingSessions,
  onSelectSession,
  onCreateNewSession,
  onDeleteSession,
  setIsSidebarOpen
}) => {
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
              <div className="text-truncate flex-grow-1 d-flex align-items-center me-2">
                <MessageSquare size={13} className="me-2 flex-shrink-0" />
                <span className="text-truncate">{session.title || 'Cuộc hội thoại mới'}</span>
              </div>
              <Button
                variant="link"
                className={` shadow-none ${currentSessionId === session._id ? 'text-danger' : 'text-danger'}`}
                onClick={(e) => onDeleteSession(e, session._id)}
                title="Xóa đoạn chat"
              >
                <Trash2 size={16} />
              </Button>
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </div>
  );
};

export default SidebarAI;
