import React from 'react';
import { Col, Dropdown, Badge } from 'react-bootstrap';
import { Search, SlidersHorizontal, MoreVertical, Trash2 } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { formatSidebarTime } from '../utils/messageHelpers';

// Toggle custom cho icon ba chấm trong danh sách cuộc trò chuyện
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

// Thanh sidebar hiển thị thanh tìm kiếm và danh sách cuộc trò chuyện gần đây
export default function ConversationSidebar({
  conversations,
  activeConversationId,
  currentUserId,
  searchQuery,
  setSearchQuery,
  onSelectConversation,
  onOpenClearModal,
  isUserOnline
}) {
  return (
    <Col md={4} lg={3} className="messages-sidebar">
      {/* Header sidebar chứa ô tìm kiếm */}
      <div className="messages-sidebar-header">
        <div className="messages-search-bar">
          <Search size={15} className="text-secondary" />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="messages-search-input"
          />
          <SlidersHorizontal size={15} className="text-secondary" style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* Tiêu đề mục */}
      <div className="messages-section-title">
        Cuộc trò chuyện gần đây
      </div>

      {/* Danh sách các cuộc trò chuyện */}
      <div className="messages-conversation-list">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted small">
            {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có tin nhắn nào'}
          </div>
        ) : (
          conversations.map(conv => {
            const partner = conv.participants.find(
              p => p.userId?._id?.toString() !== currentUserId?.toString()
            )?.userId;
            const partnerId = partner?._id?.toString() || partner?.toString();
            const isPartnerOnline = isUserOnline(partnerId);

            const myParticipant = conv.participants.find(
              p =>
                p.userId?._id?.toString() === currentUserId?.toString() ||
                p.userId?.toString() === currentUserId?.toString()
            );
            const unreadCount = myParticipant?.unreadCount || 0;
            const isActive = activeConversationId === conv._id;

            // Ẩn tin nhắn cũ nếu người dùng đã clear chat
            let displayLastMessage = conv.lastMessage;
            if (myParticipant?.clearedAt && conv.lastMessage?.sentAt) {
              if (new Date(conv.lastMessage.sentAt) <= new Date(myParticipant.clearedAt)) {
                displayLastMessage = null;
              }
            }

            return (
              <div
                key={conv._id}
                className={`messages-conv-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectConversation(conv)}
              >
                {/* Avatar đối tác kèm chấm trạng thái online */}
                <UserAvatar
                  user={partner}
                  size={44}
                  showOnline={isPartnerOnline}
                />

                {/* Tên và nội dung xem trước tin nhắn */}
                <div className="messages-conv-body">
                  <div className="messages-conv-name">
                    <span className={`text-truncate ${unreadCount > 0 ? 'fw-bold text-dark' : ''}`}>
                      {conv.type === 'group' ? conv.name : partner?.name || 'Người dùng'}
                    </span>
                  </div>
                  <div className={`messages-conv-preview ${unreadCount > 0 ? 'fw-bold text-dark' : ''}`}>
                    {displayLastMessage?.senderId?.toString() === currentUserId?.toString() && 'Bạn: '}
                    {displayLastMessage?.content || 'Bắt đầu cuộc trò chuyện...'}
                  </div>
                </div>

                {/* Thời gian, số tin chưa đọc và menu 3 chấm */}
                <div className="messages-conv-meta">
                  <span className="messages-conv-time">
                    {displayLastMessage && formatSidebarTime(displayLastMessage.sentAt)}
                  </span>

                  <div className="d-flex align-items-center gap-1 mt-1">
                    {unreadCount > 0 && (
                      <Badge pill bg="danger" style={{ fontSize: '10px', padding: '3px 6px' }}>
                        {unreadCount}
                      </Badge>
                    )}

                    <Dropdown>
                      <Dropdown.Toggle as={CustomToggle} className="messages-conv-actions text-secondary p-1">
                        <MoreVertical size={15} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu align="end" style={{ zIndex: 1050, fontSize: '13px' }}>
                        <Dropdown.Item
                          className="text-danger d-flex align-items-center gap-2"
                          onClick={(e) => onOpenClearModal(e, conv._id)}
                        >
                          <Trash2 size={14} /> Xóa đoạn chat
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Col>
  );
}
