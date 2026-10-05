import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { MoreVertical, RotateCcw, Check, CheckCheck } from 'lucide-react';
import UserAvatar from './UserAvatar';
import {
  formatMessageTime,
  formatSeparatorDate,
  getMessageStatusConfig
} from '../utils/messageHelpers';

// Toggle custom cho dropdown không có viền thừa
const CustomToggle = React.forwardRef(({ children, onClick, className }, ref) => (
  <span
    ref={ref}
    className={className}
    style={{ cursor: 'pointer' }}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(e);
    }}
  >
    {children}
  </span>
));

// Component bóng tin nhắn hiển thị nội dung, avatar, giờ gửi và trạng thái đã nhận/xem
export default function MessageBubble({
  message,
  isMine,
  showDateSeparator,
  onOpenRevokeModal
}) {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const canRevoke =
    isMine &&
    !message.isRevoked &&
    Date.now() - new Date(message.createdAt).getTime() < ONE_DAY;

  const statusConfig = getMessageStatusConfig(message.status);

  return (
    <>
      {/* Nhãn ngăn cách ngày tháng */}
      {showDateSeparator && (
        <div className="messages-date-separator">
          <span className="messages-date-pill">
            {formatSeparatorDate(message.createdAt)}
          </span>
        </div>
      )}

      <div className={`messages-bubble-row ${isMine ? 'mine' : 'other'}`}>
        {/* Avatar đối tác bên trái bong bóng tin nhắn đến */}
        {!isMine && (
          <UserAvatar
            user={message.senderId}
            size={32}
            className="align-self-end mb-1"
          />
        )}

        <div className={`messages-bubble-wrapper ${isMine ? 'mine' : 'other'}`}>
          <div className="d-flex align-items-center gap-1">
            {/* Menu thu hồi tin nhắn cho tin nhắn của chính mình */}
            {isMine && canRevoke && (
              <Dropdown drop="start">
                <Dropdown.Toggle as={CustomToggle} className="text-muted p-1 opacity-50 hover-opacity-100">
                  <MoreVertical size={13} />
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ fontSize: '12px' }}>
                  <Dropdown.Item
                    className="d-flex align-items-center gap-1 text-danger"
                    onClick={() => onOpenRevokeModal(message._id)}
                  >
                    <RotateCcw size={13} /> Thu hồi tin nhắn
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}

            {/* Nội dung bóng chat */}
            <div
              className={`messages-bubble ${isMine ? 'mine' : 'other'} ${message.isRevoked ? 'revoked' : ''}`}
            >
              {message.isRevoked ? 'Tin nhắn đã được thu hồi' : message.content}
            </div>
          </div>

          {/* Thời gian và icon trạng thái tin nhắn kèm tooltip */}
          <div className="messages-bubble-time">
            <span>{formatMessageTime(message.createdAt)}</span>
            {isMine && !message.isRevoked && (
              <span
                className="messages-status-indicator"
                title={statusConfig.label}
              >
                {statusConfig.isRead ? (
                  <CheckCheck size={13} className="text-primary" />
                ) : statusConfig.isDelivered ? (
                  <CheckCheck size={13} className="text-secondary opacity-75" />
                ) : (
                  <Check size={13} className="text-secondary opacity-75" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
