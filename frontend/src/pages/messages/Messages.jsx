import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, ListGroup, Form, InputGroup, Dropdown, Badge } from 'react-bootstrap';
import { FaPaperPlane, FaUserCircle, FaEllipsisV, FaCheck, FaCheckDouble } from 'react-icons/fa';
import { getConversations, getMessages, sendMessage, revokeMessage, clearConversation, markConversationAsRead } from '../../services/messageService';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'Vừa xong';
  } else if (diffMin < 60) {
    return `${diffMin} phút trước`;
  } else if (diffHour < 24) {
    return `${diffHour} giờ trước`;
  } else if (diffDay < 7) {
    return `${diffDay} ngày trước`;
  } else {
    const pad = (n) => n.toString().padStart(2, '0');
    if (d.getFullYear() !== now.getFullYear()) {
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    }
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  }
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
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);
  const location = useLocation();

  const fetchConversations = async () => {
    try {
      const res = await getConversations();
      if (res.success) {
        let fetchedConvs = res.data;

        // Nếu chuyển từ trang Profile qua, có truyền sẵn conversation object
        // mà backend đã lọc mất (do đã clear chat) thì add tạm vào để người dùng chat
        if (location.state?.conversation && location.state?.conversationId) {
          const exists = fetchedConvs.some(c => c._id === location.state.conversationId);
          if (!exists) {
            fetchedConvs = [location.state.conversation, ...fetchedConvs];
          }
        }

        setConversations(fetchedConvs);

        // Cập nhật activeConversation ngay sau khi tải xong nếu có id
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
            // Đánh dấu đã xem khi mở chat (nếu có unread)
            const myParticipant = activeConversation.participants.find(p => p.userId?._id?.toString() === currentUserId?.toString() || p.userId?.toString() === currentUserId?.toString());
            if (myParticipant && myParticipant.unreadCount > 0) {
              await markConversationAsRead(activeConversation._id);
              // Cập nhật lại local conversations state để xóa unreadCount
              setConversations(prev => prev.map(c => {
                if (c._id === activeConversation._id) {
                  return {
                    ...c,
                    participants: c.participants.map(p => {
                      if (p.userId?._id?.toString() === currentUserId?.toString() || p.userId?.toString() === currentUserId?.toString()) {
                        return { ...p, unreadCount: 0 };
                      }
                      return p;
                    })
                  };
                }
                return c;
              }));
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
    }
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

          // Tăng unreadCount cho mình nếu KHÔNG ĐANG MỞ chat này
          if (!activeConversation || activeConversation._id !== conversationId) {
            const myPartIdx = updatedConv.participants.findIndex(p => p.userId?._id?.toString() === currentUserId?.toString() || p.userId?.toString() === currentUserId?.toString());
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
        // Báo đã đọc ngay lập tức vì đang mở
        markConversationAsRead(conversationId);
      }
    };

    const handleMessageRevoked = (data) => {
      const { messageId, conversationId } = data;
      if (activeConversation && activeConversation._id === conversationId) {
        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isRevoked: true } : m));
      }
    };

    const handleMessagesRead = (data) => {
      const { conversationId, readerId } = data;
      if (activeConversation && activeConversation._id === conversationId) {
        setMessages(prev => prev.map(m => (m.senderId?._id !== readerId && m.senderId !== readerId) ? { ...m, status: 'read' } : m));
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

      setMessages(prev => prev.map(m => m._id === tempId ? res.data : m));

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

  const handleClearConversation = async (conversationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch sử cuộc trò chuyện này?')) return;
    try {
      await clearConversation(conversationId);
      toast.success('Đã xóa đoạn chat');
      
      // Xóa state để tránh fetchConversations tự động thêm lại
      if (location.state?.conversationId === conversationId) {
        window.history.replaceState({}, '');
      }
      
      if (activeConversation?._id === conversationId) setActiveConversation(null);
      setConversations(prev => prev.filter(c => c._id !== conversationId));
    } catch (error) {
      toast.error('Lỗi khi xóa đoạn chat');
    }
  };

  const handleRevokeMessage = async (messageId) => {
    if (!window.confirm('Bạn có chắc chắn muốn thu hồi tin nhắn này?')) return;
    try {
      await revokeMessage(messageId);
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isRevoked: true } : m));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi thu hồi tin nhắn');
    }
  };

  const renderMessageStatus = (status) => {
    if (status === 'read') return <span className="text-info ms-1" title="Đã xem"><FaCheckDouble size={12} /></span>;
    if (status === 'delivered') return <span className="text-secondary ms-1" title="Đã nhận"><FaCheckDouble size={12} /></span>;
    return <span className="text-secondary ms-1" title="Đã gửi"><FaCheck size={12} /></span>;
  };

  return (
    <Container className="py-4" style={{ height: 'calc(100vh - 80px)' }}>
      <Row className="h-100 bg-white rounded-4 shadow-sm border overflow-hidden">
        {/* Sidebar */}
        <Col md={4} className="border-end p-0 d-flex flex-column h-100">
          <div className="p-3 border-bottom bg-light">
            <h5 className="mb-0 fw-bold">Tin nhắn</h5>
          </div>
          <ListGroup variant="flush" className="overflow-auto flex-grow-1">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted">Chưa có tin nhắn nào</div>
            ) : (
              conversations.map(conv => {
                const partner = conv.participants.find(p => p.userId?._id?.toString() !== currentUserId?.toString())?.userId;
                const myParticipant = conv.participants.find(p => p.userId?._id?.toString() === currentUserId?.toString() || p.userId?.toString() === currentUserId?.toString());
                const unreadCount = myParticipant?.unreadCount || 0;
                const isActive = activeConversation?._id === conv._id;

                // Xử lý lastMessage bị ẩn nếu đã clear đoạn chat
                let displayLastMessage = conv.lastMessage;
                if (myParticipant?.clearedAt && conv.lastMessage?.sentAt) {
                  if (new Date(conv.lastMessage.sentAt) <= new Date(myParticipant.clearedAt)) {
                    displayLastMessage = null; // Ẩn tin nhắn cũ khỏi sidebar
                  }
                }

                return (
                  <ListGroup.Item
                    as="div"
                    key={conv._id}
                    action
                    active={isActive}
                    onClick={() => setActiveConversation(conv)}
                    className="d-flex align-items-center p-3 border-0 border-bottom"
                    style={{ cursor: 'pointer', backgroundColor: isActive ? 'var(--gray-100)' : 'transparent' }}
                  >
                    <div className="position-relative me-3">
                      {partner?.avatar ? (
                        <img
                          src={partner.avatar}
                          alt={partner.name}
                          className="rounded-circle object-fit-cover"
                          width={48} height={48}
                        />
                      ) : (
                        <FaUserCircle size={48} className="text-secondary" />
                      )}
                      {/* Có thể thêm chấm xanh online nếu làm tính năng online sau */}
                    </div>

                    <div className="flex-grow-1 overflow-hidden">
                      <h6 className={`mb-1 text-truncate ${unreadCount > 0 ? 'fw-bold text-dark' : 'text-dark'}`}>
                        {conv.type === 'group' ? conv.name : partner?.name || 'Người dùng'}
                      </h6>
                      <p className={`mb-0 text-truncate ${unreadCount > 0 ? 'fw-bold text-dark' : 'text-muted'}`} style={{ fontSize: '0.875rem' }}>
                        {displayLastMessage?.senderId?.toString() === currentUserId?.toString() && 'Bạn: '}
                        {displayLastMessage?.content || 'Chưa có tin nhắn'}
                      </p>
                    </div>

                    <div className="d-flex flex-column align-items-end justify-content-between ms-2" style={{ minWidth: '70px', height: '42px' }}>
                      <div className="d-flex justify-content-end w-100 mb-1">
                        {displayLastMessage && (
                          <small className={`text-nowrap ${unreadCount > 0 ? 'fw-bold text-primary' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                            {formatRelativeTime(displayLastMessage.sentAt)}
                          </small>
                        )}
                      </div>

                      <div className="d-flex align-items-center justify-content-end w-100">
                        {unreadCount > 0 && (
                          <Badge pill bg="danger" className="me-2">
                            {unreadCount}
                          </Badge>
                        )}

                        {/* Dropdown Menu - Xóa đoạn chat */}
                        <Dropdown>
                          <Dropdown.Toggle as={CustomToggle} className={`p-1 ${isActive ? 'text-dark' : 'text-muted'}`}>
                            <FaEllipsisV size={14} />
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end" style={{ zIndex: 1050 }}>
                            <Dropdown.Item className="text-danger" onClick={(e) => { e.stopPropagation(); handleClearConversation(conv._id); }}>Xóa đoạn chat</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </div>
                  </ListGroup.Item>
                );
              })
            )}
          </ListGroup>
        </Col>

        {/* Chat Area */}
        <Col md={8} className="p-0 d-flex flex-column h-100">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-bottom d-flex align-items-center gap-3 bg-light">
                <img
                  src={activeConversation.participants.find(p => p.userId?._id?.toString() !== currentUserId?.toString())?.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConversation.participants.find(p => p.userId?._id?.toString() !== currentUserId?.toString())?.userId?.name || 'A')}&background=random`}
                  alt="avatar"
                  className="rounded-circle object-fit-cover"
                  style={{ width: '40px', height: '40px' }}
                />
                <h5 className="mb-0 fw-bold">
                  {activeConversation.participants.find(p => p.userId?._id?.toString() !== currentUserId?.toString())?.userId?.name || 'Người dùng'}
                </h5>
              </div>

              {/* Messages */}
              <div className="flex-grow-1 p-3 overflow-auto" style={{ backgroundColor: '#f8f9fa' }}>
                {messages.length === 0 ? (
                  <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                    Hãy gửi tin nhắn đầu tiên để bắt đầu trò chuyện
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.senderId?._id?.toString() === currentUserId?.toString() || msg.senderId?.toString() === currentUserId?.toString();
                    const canRevoke = isMine && !msg.isRevoked && (Date.now() - new Date(msg.createdAt).getTime() < 24 * 60 * 60 * 1000);

                    return (
                      <div key={msg._id} className={`d-flex mb-3 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
                        {!isMine && (
                          <img
                            src={msg.senderId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderId?.name || 'A')}&background=random`}
                            alt="avatar"
                            className="rounded-circle me-2 align-self-end shadow-sm"
                            style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                          />
                        )}
                        <div className={`d-flex flex-column ${isMine ? 'align-items-end' : 'align-items-start'}`} style={{ maxWidth: '75%' }}>
                          <div className="d-flex align-items-center gap-2">
                            {isMine && canRevoke && (
                              <Dropdown drop="start">
                                <Dropdown.Toggle as={CustomToggle} className="text-muted p-2" style={{ opacity: 0.6 }}>
                                  <FaEllipsisV size={12} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={() => handleRevokeMessage(msg._id)}>Thu hồi tin nhắn</Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            )}
                            <div
                              className={`p-3 rounded-4 shadow-sm ${msg.isRevoked ? 'bg-light border text-muted' : (isMine ? 'bg-primary text-white' : 'bg-white border')}`}
                              style={{ borderBottomRightRadius: isMine ? '4px' : '16px', borderBottomLeftRadius: !isMine ? '4px' : '16px' }}
                            >
                              <div style={{ wordBreak: 'break-word', fontSize: '15px', fontStyle: msg.isRevoked ? 'italic' : 'normal' }}>
                                {msg.isRevoked ? 'Tin nhắn đã bị thu hồi' : msg.content}
                              </div>
                            </div>
                          </div>

                          <div className="small text-muted mt-1 d-flex align-items-center" style={{ fontSize: '11px' }}>
                            {formatDateTime(msg.createdAt)}
                            {isMine && !msg.isRevoked && renderMessageStatus(msg.status)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-top bg-white">
                <Form onSubmit={handleSendMessage}>
                  <InputGroup>
                    <Form.Control
                      placeholder="Nhập tin nhắn..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="rounded-pill rounded-end-0 bg-light border-0 px-4 py-2"
                    />
                    <Button type="submit" variant="primary" className="rounded-pill rounded-start-0 px-4">
                      <FaPaperPlane />
                    </Button>
                  </InputGroup>
                </Form>
              </div>
            </>
          ) : (
            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted bg-light">
              <FaUserCircle size={80} className="mb-3 text-secondary opacity-50" />
              <h5 className="fw-semibold">Chọn một cuộc trò chuyện để bắt đầu</h5>
              <p>Hoặc tìm người bạn muốn liên hệ từ trang dự án</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
