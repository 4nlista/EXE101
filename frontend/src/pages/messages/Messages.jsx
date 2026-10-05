import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Dropdown, Badge } from 'react-bootstrap';
import {
  Search,
  SlidersHorizontal,
  Smile,
  Send,
  MoreVertical,
  Check,
  CheckCheck,
  Trash2,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import {
  getConversations,
  getMessages,
  sendMessage,
  revokeMessage,
  clearConversation,
  markConversationAsRead
} from '../../services/messageService';
import { MESSAGE_STATUS } from '../../constants/messageEnum';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import ConfirmActionModal from '../../components/ConfirmActionModal';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import './Messages.css';

/**
 * Danh mục icon cảm xúc phổ biến
 */
const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Cảm xúc',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳',
      '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫',
      '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳',
      '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭',
      '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
      '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢'
    ]
  },
  {
    id: 'gestures',
    name: 'Cử chỉ',
    emojis: [
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
      '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '👏',
      '🙌', '👐', '🤲', '🙏', '✍️', '💪', '🧠', '👀', '👁️', '👂'
    ]
  },
  {
    id: 'hearts',
    name: 'Trái tim',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌',
      '💯', '💢', '💥', '💫', '💬', '💭', '💤'
    ]
  },
  {
    id: 'objects',
    name: 'Biểu tượng',
    emojis: [
      '🔥', '✨', '🌟', '⭐', '🎉', '🎊', '🚀', '💡', '📌', '📍',
      '🎯', '🏆', '🥇', '🥈', '🥉', '☕', '🍕', '🍔', '🎂', '🍻',
      '🥂', '🎁', '🔔', '📢', '💻', '📱', '📦', '🔑', '🔒', '⏳',
      '⏰', '📅', '📈', '📊', '📝', '📎', '📁', '📂', '💎', '🍀'
    ]
  }
];

/**
 * Định dạng chuỗi trạng thái hoạt động: "Đang hoạt động" hoặc "Hoạt động X phút trước"
 */
const formatActivityStatus = (isOnline, lastSeenTime) => {
  if (isOnline) {
    return {
      text: 'Đang hoạt động',
      isOnline: true
    };
  }

  if (!lastSeenTime) {
    return {
      text: 'Chưa hoạt động gần đây',
      isOnline: false
    };
  }

  const diffMs = Date.now() - new Date(lastSeenTime).getTime();
  if (isNaN(diffMs) || diffMs < 0) {
    return { text: 'Không hoạt động', isOnline: false };
  }

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) {
    return { text: 'Hoạt động vài giây trước', isOnline: false };
  }
  if (diffMinutes < 60) {
    return { text: `Hoạt động ${diffMinutes} phút trước`, isOnline: false };
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return { text: `Hoạt động ${diffHours} giờ trước`, isOnline: false };
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return { text: `Hoạt động ${diffDays} ngày trước`, isOnline: false };
  }

  const d = new Date(lastSeenTime);
  const pad = (n) => n.toString().padStart(2, '0');
  return {
    text: `Hoạt động ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
    isOnline: false
  };
};

/**
 * Lấy cấu hình hiển thị trạng thái tin nhắn từ enum MESSAGE_STATUS
 */
const getMessageStatusConfig = (status) => {
  switch (status) {
    case MESSAGE_STATUS.READ:
      return { label: 'Đã xem', isRead: true, isDelivered: false };
    case MESSAGE_STATUS.DELIVERED:
      return { label: 'Đã nhận', isRead: false, isDelivered: true };
    case MESSAGE_STATUS.SENT:
    default:
      return { label: 'Đã gửi', isRead: false, isDelivered: false };
  }
};

/**
 * Trả về 2 chữ cái viết tắt từ tên người dùng
 */
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Component Avatar người dùng: lấy từ avatar thật hoặc initials chữ cái mềm mại
 */
const UserAvatar = ({ user, size = 42, showOnline = false, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = user?.avatar;
  const name = user?.name || 'Người dùng';
  const initials = getInitials(name);

  // Bảng màu nền pastel cho initials chữ cái (giống mẫu "TC", "NA", "LB"...)
  const palette = [
    { bg: '#fed7aa', text: '#9a3412' }, // cam pastel
    { bg: '#fde68a', text: '#854d0e' }, // vàng
    { bg: '#e0e7ff', text: '#3730a3' }, // chàm
    { bg: '#dcfce7', text: '#166534' }, // xanh lá
    { bg: '#fce7f3', text: '#9d174d' }, // hồng
    { bg: '#e2e8f0', text: '#334155' }, // xám đá
    { bg: '#f3f4f6', text: '#374151' }  // xám nhẹ
  ];
  const charSum = (name.charCodeAt(0) || 0) + (name.charCodeAt(name.length - 1) || 0);
  const color = palette[charSum % palette.length];

  return (
    <div className={`position-relative d-inline-flex flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="rounded-circle object-fit-cover w-100 h-100"
          style={{ border: '1px solid rgba(0,0,0,0.06)' }}
        />
      ) : (
        <div
          className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
          style={{
            width: size,
            height: size,
            backgroundColor: color.bg,
            color: color.text,
            fontSize: size <= 32 ? '11px' : size <= 42 ? '13px' : '15px',
            border: '1px solid rgba(0,0,0,0.05)',
            userSelect: 'none'
          }}
        >
          {initials}
        </div>
      )}
      {showOnline && (
        <span
          className="position-absolute rounded-circle border border-white"
          style={{
            width: size <= 36 ? '9px' : '11px',
            height: size <= 36 ? '9px' : '11px',
            backgroundColor: '#22c55e',
            bottom: '1px',
            right: '1px'
          }}
          title="Đang hoạt động"
        />
      )}
    </div>
  );
};

/**
 * Định dạng thời gian cho item hội thoại bên sidebar: "23/09" hoặc "10:24"
 */
const formatSidebarTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  if (d.toDateString() === now.toDateString()) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
};

/**
 * Định dạng giờ phút hiển thị trong bóng tin nhắn: "20:35"
 */
const formatMessageTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Định dạng nhãn ngày ngăn cách giữa các tin nhắn: "Thứ 3, 23 tháng 9, 2025"
 */
const formatSeparatorDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dayName = days[d.getDay()];
  return `${dayName}, ${d.getDate()} tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
};

/**
 * Kiểm tra xem 2 thời điểm có thuộc cùng 1 ngày không
 */
const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

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

export default function Messages() {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?._id || currentUser?.id;
  const { socket, isUserOnline, getUserLastSeen } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Trạng thái Emoji picker và tham chiếu
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState('smileys');
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const inputRef = useRef(null);

  // Bộ đếm cập nhật thời gian hoạt động theo từng phút
  const [, setMinuteTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setMinuteTick(t => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  // Đóng bảng emoji khi click ra ngoài hoặc bấm phím Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showEmojiPicker) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showEmojiPicker]);

  // Chèn emoji vào vị trí con trỏ của ô nhập liệu
  const handleSelectEmoji = (emoji) => {
    const input = inputRef.current;
    if (!input) {
      setMessageInput(prev => prev + emoji);
      return;
    }
    const start = input.selectionStart ?? messageInput.length;
    const end = input.selectionEnd ?? messageInput.length;
    const newText = messageInput.substring(0, start) + emoji + messageInput.substring(end);
    setMessageInput(newText);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  // Quản lý Modal xác nhận
  const [showClearModal, setShowClearModal] = useState(false);
  const [convToClear, setConvToClear] = useState(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [msgToRevoke, setMsgToRevoke] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const messagesEndRef = useRef(null);
  const location = useLocation();

  const fetchConversations = async () => {
    try {
      const res = await getConversations();
      if (res.success) {
        let fetchedConvs = res.data;

        // Nếu chuyển từ trang khác (Profile) qua có mang theo conversation object
        if (location.state?.conversation && location.state?.conversationId) {
          const exists = fetchedConvs.some(c => c._id === location.state.conversationId);
          if (!exists) {
            fetchedConvs = [location.state.conversation, ...fetchedConvs];
          }
        }

        setConversations(fetchedConvs);

        // Kích hoạt hội thoại nếu có id
        if (location.state?.conversationId) {
          const conv = fetchedConvs.find(c => c._id === location.state.conversationId);
          if (conv) {
            setActiveConversation(conv);
          }
        }
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách cuộc trò chuyện', { toastId: 'fetch_conv_error' });
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    if (activeConversation) {
      const fetchMsgs = async () => {
        try {
          const res = await getMessages(activeConversation._id);
          if (res.success) {
            setMessages(res.data);
            // Đánh dấu đã xem nếu có unreadCount
            const myParticipant = activeConversation.participants.find(
              p => p.userId?._id?.toString() === currentUserId?.toString() || p.userId?.toString() === currentUserId?.toString()
            );
            if (myParticipant && myParticipant.unreadCount > 0) {
              await markConversationAsRead(activeConversation._id);
              setConversations(prev =>
                prev.map(c => {
                  if (c._id === activeConversation._id) {
                    return {
                      ...c,
                      participants: c.participants.map(p => {
                        if (
                          p.userId?._id?.toString() === currentUserId?.toString() ||
                          p.userId?.toString() === currentUserId?.toString()
                        ) {
                          return { ...p, unreadCount: 0 };
                        }
                        return p;
                      })
                    };
                  }
                  return c;
                })
              );
            }
          }
        } catch (error) {
          toast.error('Lỗi tải tin nhắn');
        }
      };
      fetchMsgs();

      if (socket) {
        socket.emit('join_conversation', activeConversation._id);
      }
    }

    return () => {
      if (socket && activeConversation) {
        socket.emit('leave_conversation', activeConversation._id);
      }
    };
  }, [activeConversation, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      const { conversationId, message } = data;
      setConversations(prev => {
        const idx = prev.findIndex(c => c._id === conversationId);
        if (idx !== -1) {
          const newConvs = [...prev];
          const updatedConv = {
            ...newConvs[idx],
            lastMessage: {
              content: message.content,
              senderId: message.senderId,
              sentAt: message.createdAt
            }
          };

          // Tăng unreadCount nếu không mở cuộc trò chuyện này
          if (!activeConversation || activeConversation._id !== conversationId) {
            const myPartIdx = updatedConv.participants.findIndex(
              p => p.userId?._id?.toString() === currentUserId?.toString() || p.userId?.toString() === currentUserId?.toString()
            );
            if (myPartIdx !== -1) {
              const updatedParticipants = [...updatedConv.participants];
              updatedParticipants[myPartIdx] = {
                ...updatedParticipants[myPartIdx],
                unreadCount: (updatedParticipants[myPartIdx].unreadCount || 0) + 1
              };
              updatedConv.participants = updatedParticipants;
            }
          }

          newConvs.splice(idx, 1);
          newConvs.unshift(updatedConv);
          return newConvs;
        }
        return prev;
      });

      if (activeConversation && activeConversation._id === conversationId) {
        setMessages(prev => [...prev, message]);
        markConversationAsRead(conversationId);
      }
    };

    const handleMessageRevoked = (data) => {
      const { messageId, conversationId } = data;
      if (activeConversation && activeConversation._id === conversationId) {
        setMessages(prev => prev.map(m => (m._id === messageId ? { ...m, isRevoked: true } : m)));
      }
    };

    const handleMessagesRead = (data) => {
      const { conversationId, readerId } = data;
      if (activeConversation && activeConversation._id === conversationId) {
        setMessages(prev =>
          prev.map(m =>
            m.senderId?._id !== readerId && m.senderId !== readerId ? { ...m, status: 'read' } : m
          )
        );
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_revoked', handleMessageRevoked);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_revoked', handleMessageRevoked);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      content: messageInput,
      senderId: { _id: currentUserId, name: 'Bạn' },
      createdAt: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [...prev, tempMessage]);
    const currentInput = messageInput;
    setMessageInput('');

    try {
      const res = await sendMessage(activeConversation._id, currentInput);
      if (!res.success) throw new Error('Lỗi gửi');

      setMessages(prev => prev.map(m => (m._id === tempId ? res.data : m)));

      setConversations(prev => {
        const idx = prev.findIndex(c => c._id === activeConversation._id);
        if (idx !== -1) {
          const newConvs = [...prev];
          const updatedConv = {
            ...newConvs[idx],
            lastMessage: {
              content: currentInput,
              senderId: { _id: currentUserId },
              sentAt: new Date()
            }
          };
          newConvs.splice(idx, 1);
          newConvs.unshift(updatedConv);
          return newConvs;
        }
        return prev;
      });
    } catch (error) {
      toast.error('Lỗi khi gửi tin nhắn');
      setMessages(prev => prev.filter(m => m._id !== tempId));
    }
  };

  const openClearModal = (e, conversationId) => {
    if (e) e.stopPropagation();
    setConvToClear(conversationId);
    setShowClearModal(true);
  };

  const confirmClearConversation = async () => {
    if (!convToClear) return;
    setIsProcessing(true);
    try {
      await clearConversation(convToClear);
      toast.success('Đã xóa đoạn chat');

      if (location.state?.conversationId === convToClear) {
        window.history.replaceState({}, '');
      }

      if (activeConversation?._id === convToClear) setActiveConversation(null);
      setConversations(prev => prev.filter(c => c._id !== convToClear));
      setShowClearModal(false);
      setConvToClear(null);
    } catch (error) {
      toast.error('Lỗi khi xóa đoạn chat');
    } finally {
      setIsProcessing(false);
    }
  };

  const openRevokeModal = (messageId) => {
    setMsgToRevoke(messageId);
    setShowRevokeModal(true);
  };

  const confirmRevokeMessage = async () => {
    if (!msgToRevoke) return;
    setIsProcessing(true);
    try {
      await revokeMessage(msgToRevoke);
      setMessages(prev => prev.map(m => (m._id === msgToRevoke ? { ...m, isRevoked: true } : m)));
      setShowRevokeModal(false);
      setMsgToRevoke(null);
      toast.success('Đã thu hồi tin nhắn');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi thu hồi tin nhắn');
    } finally {
      setIsProcessing(false);
    }
  };

  // Lọc danh sách cuộc trò chuyện theo ô tìm kiếm
  const filteredConversations = conversations.filter(conv => {
    const partner = conv.participants.find(
      p => p.userId?._id?.toString() !== currentUserId?.toString()
    )?.userId;
    const partnerName = partner?.name || '';
    const lastContent = conv.lastMessage?.content || '';
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return partnerName.toLowerCase().includes(q) || lastContent.toLowerCase().includes(q);
  });

  // Lấy đối tác của cuộc trò chuyện đang mở
  const activePartner = activeConversation?.participants.find(
    p => p.userId?._id?.toString() !== currentUserId?.toString()
  )?.userId;
  const activePartnerId = activePartner?._id?.toString() || activePartner?.toString();
  const isActivePartnerOnline = isUserOnline(activePartnerId);
  const activePartnerLastSeen = getUserLastSeen(activePartnerId) || activePartner?.updatedAt;
  const partnerStatus = formatActivityStatus(isActivePartnerOnline, activePartnerLastSeen);

  return (
    <div className="messages-page-wrapper">
      <div className="messages-shell">
        <Row className="g-0 h-100">
          {/* ── Cột Trái: Danh sách cuộc trò chuyện ── */}
          <Col md={4} lg={3} className="messages-sidebar">
            <div className="messages-sidebar-header">
              {/* Thanh tìm kiếm cuộc trò chuyện */}
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
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-muted small">
                  {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có tin nhắn nào'}
                </div>
              ) : (
                filteredConversations.map(conv => {
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
                  const isActive = activeConversation?._id === conv._id;

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
                      onClick={() => setActiveConversation(conv)}
                    >
                      {/* Avatar hình tròn lấy từ chính avatar người dùng hoặc initials */}
                      <UserAvatar
                        user={partner}
                        size={44}
                        showOnline={isPartnerOnline}
                      />

                      {/* Tên & Xem trước tin nhắn */}
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

                      {/* Thời gian, Unread Badge, và Menu 3 chấm */}
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
                                onClick={(e) => openClearModal(e, conv._id)}
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

          {/* ── Cột Phải: Khung chat chính ── */}
          <Col md={8} lg={9} className="messages-chat-pane">
            {activeConversation ? (
              <>
                {/* ── Header của Khung Chat (Đã bỏ icon gọi điện thoại/call) ── */}
                <div className="messages-chat-header">
                  <div className="messages-header-user">
                    <UserAvatar
                      user={activePartner}
                      size={44}
                      showOnline={isActivePartnerOnline}
                    />
                    <div>
                      <div className="messages-header-name">
                        {activePartner?.name || 'Người dùng'}
                      </div>
                      <div className={`messages-header-status ${isActivePartnerOnline ? 'online' : 'offline'}`}>
                        <span className={`messages-header-dot ${isActivePartnerOnline ? 'online' : 'offline'}`} />{' '}
                        {partnerStatus.text}
                      </div>
                    </div>
                  </div>

                  {/* Menu tùy chọn header (chỉ có MoreVertical, không có icon call/video) */}
                  <div>
                    <Dropdown>
                      <Dropdown.Toggle as={CustomToggle} className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center text-secondary">
                        <MoreVertical size={18} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu align="end" style={{ zIndex: 1050, fontSize: '13px' }}>
                        <Dropdown.Item
                          className="text-danger d-flex align-items-center gap-2"
                          onClick={(e) => openClearModal(e, activeConversation._id)}
                        >
                          <Trash2 size={14} /> Xóa lịch sử cuộc trò chuyện
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>

                {/* ── Danh sách tin nhắn (Body) ── */}
                <div className="messages-body-area">
                  {messages.length === 0 ? (
                    <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                      <MessageSquare size={40} className="mb-2 text-secondary opacity-50" />
                      <div className="fw-semibold">Hãy gửi lời chào đến {activePartner?.name || 'đối tác'}</div>
                      <small className="text-secondary">Bắt đầu cuộc hội thoại để trao đổi về công việc và dự án</small>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine =
                        msg.senderId?._id?.toString() === currentUserId?.toString() ||
                        msg.senderId?.toString() === currentUserId?.toString();
                      const canRevoke =
                        isMine &&
                        !msg.isRevoked &&
                        Date.now() - new Date(msg.createdAt).getTime() < 24 * 60 * 60 * 1000;

                      // Kiểm tra xem có cần chèn nhãn ngày ngăn cách không
                      const prevMsg = idx > 0 ? messages[idx - 1] : null;
                      const showDateSeparator = !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt);

                      return (
                        <React.Fragment key={msg._id || idx}>
                          {showDateSeparator && (
                            <div className="messages-date-separator">
                              <span className="messages-date-pill">
                                {formatSeparatorDate(msg.createdAt)}
                              </span>
                            </div>
                          )}

                          <div className={`messages-bubble-row ${isMine ? 'mine' : 'other'}`}>
                            {/* Avatar đối tác ở bên trái tin nhắn đến */}
                            {!isMine && (
                              <UserAvatar
                                user={msg.senderId}
                                size={32}
                                className="align-self-end mb-1"
                              />
                            )}

                            <div className={`messages-bubble-wrapper ${isMine ? 'mine' : 'other'}`}>
                              <div className="d-flex align-items-center gap-1">
                                {/* Menu thu hồi tin nhắn */}
                                {isMine && canRevoke && (
                                  <Dropdown drop="start">
                                    <Dropdown.Toggle as={CustomToggle} className="text-muted p-1 opacity-50 hover-opacity-100">
                                      <MoreVertical size={13} />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu style={{ fontSize: '12px' }}>
                                      <Dropdown.Item
                                        className="d-flex align-items-center gap-1 text-danger"
                                        onClick={() => openRevokeModal(msg._id)}
                                      >
                                        <RotateCcw size={13} /> Thu hồi tin nhắn
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                )}

                                <div className={`messages-bubble ${isMine ? 'mine' : 'other'} ${msg.isRevoked ? 'revoked' : ''}`}>
                                  {msg.isRevoked ? 'Tin nhắn đã được thu hồi' : msg.content}
                                </div>
                              </div>

                              {/* Thời gian và trạng thái tin nhắn */}
                              <div className="messages-bubble-time">
                                <span>{formatMessageTime(msg.createdAt)}</span>
                                {isMine && !msg.isRevoked && (() => {
                                  const statusConfig = getMessageStatusConfig(msg.status);
                                  return (
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
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* ── Khung nhập tin nhắn (Composer) ── */}
                <div className="messages-composer-container">
                  {/* Bảng chọn Emoji cảm xúc */}
                  {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="messages-emoji-popover">
                      <div className="messages-emoji-tabs">
                        {EMOJI_CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            className={`messages-emoji-tab-btn ${activeEmojiTab === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveEmojiTab(cat.id)}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                      <div className="messages-emoji-grid">
                        {EMOJI_CATEGORIES.find(c => c.id === activeEmojiTab)?.emojis.map((emoji, i) => (
                          <button
                            key={i}
                            type="button"
                            className="messages-emoji-item"
                            onClick={() => handleSelectEmoji(emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSendMessage}>
                    <div className="messages-composer-pill">
                      <button
                        ref={emojiButtonRef}
                        type="button"
                        className="messages-emoji-btn"
                        onClick={() => setShowEmojiPicker(prev => !prev)}
                        title="Chọn biểu tượng cảm xúc"
                      >
                        <Smile size={20} />
                      </button>
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Nhập tin nhắn..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        className="messages-composer-input"
                        autoComplete="off"
                      />
                      <button
                        type="submit"
                        disabled={!messageInput.trim()}
                        className="messages-send-btn"
                        title="Gửi tin nhắn"
                      >
                        <Send size={20} className="messages-send-icon" />
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted p-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '80px', height: '80px', backgroundColor: '#fff7ed', color: 'var(--orange, #e98224)' }}
                >
                  <MessageSquare size={40} />
                </div>
                <h5 className="fw-bold text-dark">Chọn một cuộc trò chuyện để bắt đầu</h5>
                <p className="text-muted small text-center" style={{ maxWidth: '360px' }}>
                  Bạn có thể chọn người nhận từ danh sách bên trái hoặc nhấn nút Nhắn tin từ hồ sơ dự án của họ.
                </p>
              </div>
            )}
          </Col>
        </Row>
      </div>

      {/* Modal xác nhận Xóa cuộc trò chuyện */}
      <ConfirmActionModal
        show={showClearModal}
        onHide={() => setShowClearModal(false)}
        onConfirm={confirmClearConversation}
        title="Xóa đoạn chat"
        message="Bạn có chắc chắn muốn xóa toàn bộ lịch sử cuộc trò chuyện này? Dữ liệu tin nhắn sẽ không thể khôi phục."
        confirmText="Xóa đoạn chat"
        variant="danger"
        isLoading={isProcessing}
      />

      {/* Modal xác nhận Thu hồi tin nhắn */}
      <ConfirmActionModal
        show={showRevokeModal}
        onHide={() => setShowRevokeModal(false)}
        onConfirm={confirmRevokeMessage}
        title="Thu hồi tin nhắn"
        message="Bạn có chắc chắn muốn thu hồi tin nhắn này không? Tin nhắn sẽ được ẩn với tất cả mọi người trong cuộc trò chuyện."
        confirmText="Thu hồi"
        variant="warning"
        isLoading={isProcessing}
      />
    </div>
  );
}
