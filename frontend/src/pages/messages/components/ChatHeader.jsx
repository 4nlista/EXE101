import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { MoreVertical, Trash2 } from 'lucide-react';
import Button from '../../../components/Button';
import UserAvatar from './UserAvatar';

// Header hiển thị thông tin đối tác chat, trạng thái online và menu tùy chọn
export default function ChatHeader({
  partner,
  isOnline,
  activityStatusText,
  onOpenClearModal
}) {
  return (
    <div className="messages-chat-header">
      <div className="messages-header-user">
        <UserAvatar
          user={partner}
          size={44}
          showOnline={isOnline}
        />
        <div>
          <div className="messages-header-name">
            {partner?.name || 'Người dùng'}
          </div>
          {activityStatusText ? (
            <div className={`messages-header-status ${isOnline ? 'online' : 'offline'}`}>
              <span className={`messages-header-dot ${isOnline ? 'online' : 'offline'}`} />{' '}
              {activityStatusText}
            </div>
          ) : null}
        </div>
      </div>

      {/* Menu thao tác cuộc trò chuyện */}
      <div>
        <Dropdown align="end">
          <Dropdown.Toggle
            as={Button}
            variant="light"
            className="rounded-circle p-2 d-flex align-items-center justify-content-center text-secondary border-0"
            title="Tùy chọn cuộc trò chuyện"
          >
            <MoreVertical size={18} />
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ zIndex: 1050, fontSize: '13px' }}>
            <Dropdown.Item
              className="text-danger d-flex align-items-center gap-2"
              onClick={onOpenClearModal}
            >
              <Trash2 size={14} /> Xóa lịch sử cuộc trò chuyện
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
}
