import React, { useState, useEffect, useRef } from 'react';
import { Row, Col } from 'react-bootstrap';
import { MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  getConversations,
  getMessages,
  sendMessage,
  revokeMessage,
  clearConversation,
  markConversationAsRead
} from '../../services/messageService';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import ConfirmActionModal from '../../components/ConfirmActionModal';

// Các sub-component tách biệt theo kiến trúc modular
import ConversationSidebar from './components/ConversationSidebar';
import ChatHeader from './components/ChatHeader';
import MessageBubble from './components/MessageBubble';
import MessageComposer from './components/MessageComposer';
import { formatActivityStatus, isSameDay } from './utils/messageHelpers';

import './Messages.css';

// Trang nhắn tin thời gian thực hỗ trợ trò chuyện 1-1, emoji, trạng thái online và thu hồi tin nhắn
export default function Messages() {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?._id || currentUser?.id;
  const { socket, isUserOnline, getUserLastSeen } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Trạng thái Emoji picker và các refs
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const inputRef = useRef(null);

  // Modal xác nhận thao tác
  const [showClearModal, setShowClearModal] = useState(false);
  const [convToClear, setConvToClear] = useState(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [msgToRevoke, setMsgToRevoke] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const messagesEndRef = useRef(null);
  const location = useLocation();

  // Timer cập nhật nhãn hoạt động gần đây theo từng phút
  const [, setMinuteTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setMinuteTick(t => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  // Lấy danh sách cuộc trò chuyện của người dùng
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

        // Tự động mở cuộc trò chuyện nếu truyền conversationId qua location state
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

  // Tải danh sách tin nhắn và tham gia room socket khi chọn cuộc trò chuyện
  useEffect(() => {
    if (activeConversation) {
      const fetchMsgs = async () => {
        try {
          const res = await getMessages(activeConversation._id);
          if (res.success) {
            setMessages(res.data);

            // Đánh dấu đã xem nếu có tin nhắn chưa đọc
            const myParticipant = activeConversation.participants.find(
              p =>
                p.userId?._id?.toString() === currentUserId?.toString() ||
                p.userId?.toString() === currentUserId?.toString()
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
  }, [activeConversation, socket, currentUserId]);

  // Lắng nghe các sự kiện socket tin nhắn mới, thu hồi, đã xem
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

          // Tăng unreadCount nếu không đang mở cuộc trò chuyện này
          if (!activeConversation || activeConversation._id !== conversationId) {
            const myPartIdx = updatedConv.participants.findIndex(
              p =>
                p.userId?._id?.toString() === currentUserId?.toString() ||
                p.userId?.toString() === currentUserId?.toString()
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
  }, [socket, activeConversation, currentUserId]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Đóng bảng emoji khi click ra ngoài hoặc bấm Escape
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

  // Chèn emoji vào vị trí con trỏ của ô input
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

  // Gửi tin nhắn mới
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
    setShowEmojiPicker(false);

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

  // Mở modal xóa lịch sử cuộc trò chuyện
  const openClearModal = (e, conversationId) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setConvToClear(conversationId);
    setShowClearModal(true);
  };

  // Xác nhận xóa lịch sử cuộc trò chuyện
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

  // Mở modal thu hồi tin nhắn
  const openRevokeModal = (messageId) => {
    setMsgToRevoke(messageId);
    setShowRevokeModal(true);
  };

  // Xác nhận thu hồi tin nhắn
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

  // Lọc cuộc trò chuyện theo từ khóa tìm kiếm
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

  // Thông tin đối tác của cuộc trò chuyện đang mở
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
          {/* Cột trái: Danh sách cuộc trò chuyện */}
          <ConversationSidebar
            conversations={filteredConversations}
            activeConversationId={activeConversation?._id}
            currentUserId={currentUserId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectConversation={setActiveConversation}
            onOpenClearModal={openClearModal}
            isUserOnline={isUserOnline}
          />

          {/* Cột phải: Khung chat chi tiết */}
          <Col md={8} lg={9} className="messages-chat-pane">
            {activeConversation ? (
              <>
                {/* Header hiển thị thông tin đối tác */}
                <ChatHeader
                  partner={activePartner}
                  isOnline={isActivePartnerOnline}
                  activityStatusText={partnerStatus.text}
                  onOpenClearModal={() => openClearModal(null, activeConversation._id)}
                />

                {/* Danh sách các tin nhắn */}
                <div className="messages-body-area">
                  {messages.length === 0 ? (
                    <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                      <MessageSquare size={40} className="mb-2 text-secondary opacity-50" />
                      <div className="fw-semibold">
                        Hãy gửi lời chào đến {activePartner?.name || 'đối tác'}
                      </div>
                      <small className="text-secondary">
                        Bắt đầu cuộc hội thoại để trao đổi về công việc và dự án
                      </small>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine =
                        msg.senderId?._id?.toString() === currentUserId?.toString() ||
                        msg.senderId?.toString() === currentUserId?.toString();
                      const prevMsg = idx > 0 ? messages[idx - 1] : null;
                      const showDateSeparator =
                        !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt);

                      return (
                        <MessageBubble
                          key={msg._id || idx}
                          message={msg}
                          isMine={isMine}
                          showDateSeparator={showDateSeparator}
                          onOpenRevokeModal={openRevokeModal}
                        />
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Khung nhập và gửi tin nhắn */}
                <MessageComposer
                  messageInput={messageInput}
                  setMessageInput={setMessageInput}
                  onSendMessage={handleSendMessage}
                  showEmojiPicker={showEmojiPicker}
                  onToggleEmoji={() => setShowEmojiPicker(prev => !prev)}
                  emojiPickerRef={emojiPickerRef}
                  emojiButtonRef={emojiButtonRef}
                  inputRef={inputRef}
                  onSelectEmoji={handleSelectEmoji}
                />
              </>
            ) : (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted p-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#fff7ed',
                    color: 'var(--orange, #e98224)'
                  }}
                >
                  <MessageSquare size={40} />
                </div>
                <h5 className="fw-bold text-dark">Chọn một cuộc trò chuyện để bắt đầu</h5>
                <p className="text-muted small text-center" style={{ maxWidth: '360px' }}>
                  Bạn có thể chọn người nhận từ danh sách bên trái hoặc nhấn nút Nhắn tin từ hồ sơ
                  dự án của họ.
                </p>
              </div>
            )}
          </Col>
        </Row>
      </div>

      {/* Modal xác nhận xóa lịch sử cuộc trò chuyện */}
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

      {/* Modal xác nhận thu hồi tin nhắn */}
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
