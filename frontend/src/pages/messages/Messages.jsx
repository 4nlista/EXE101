import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, ListGroup, Form, InputGroup } from 'react-bootstrap';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import { io } from 'socket.io-client';
import { getConversations, getMessages, sendMessage } from '../../services/messageService';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import { useLocation } from 'react-router-dom';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

export default function Messages() {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);
  const location = useLocation();

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = currentUser?.id;

  // Khởi tạo socket
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Lấy danh sách conversations
  const fetchConversations = async () => {
    try {
      const res = await getConversations();
      if (res.success) {
        setConversations(res.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách cuộc trò chuyện', { toastId: 'fetch_conv_error' });
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Nếu chuyển từ trang khác sang (có state.conversationId)
  useEffect(() => {
    if (location.state?.conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c._id === location.state.conversationId);
      if (conv) {
        setActiveConversation(conv);
      }
    }
  }, [location.state, conversations]);

  // Lấy messages khi chọn conversation
  useEffect(() => {
    if (activeConversation) {
      const fetchMsgs = async () => {
        try {
          const res = await getMessages(activeConversation._id);
          if (res.success) {
            setMessages(res.data);
          }
        } catch (error) {
          toast.error('Lỗi tải tin nhắn');
        }
      };
      fetchMsgs();

      // Join socket room
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

  // Lắng nghe tin nhắn mới từ socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      const { conversationId, message } = data;
      // Cập nhật lastMessage ở sidebar
      setConversations(prev => {
        const newConvs = [...prev];
        const idx = newConvs.findIndex(c => c._id === conversationId);
        if (idx !== -1) {
          newConvs[idx].lastMessage = {
            content: message.content,
            senderId: message.senderId,
            sentAt: message.createdAt
          };
          // Đẩy lên đầu
          const [moved] = newConvs.splice(idx, 1);
          newConvs.unshift(moved);
        }
        return newConvs;
      });

      // Thêm vào khung chat nếu đang mở
      if (activeConversation && activeConversation._id === conversationId) {
        setMessages(prev => [...prev, message]);
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, activeConversation]);

  // Cuộn xuống cuối chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;

    // Optimistic UI update
    const tempMessage = {
      _id: Date.now().toString(),
      content: messageInput,
      senderId: { _id: currentUserId, name: 'Bạn' },
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    const currentInput = messageInput;
    setMessageInput('');

    try {
      const res = await sendMessage(activeConversation._id, currentInput);
      if (!res.success) {
        throw new Error('Lỗi gửi');
      }
      
      // Cập nhật last message cho chính mình
      setConversations(prev => {
        const newConvs = [...prev];
        const idx = newConvs.findIndex(c => c._id === activeConversation._id);
        if (idx !== -1) {
          newConvs[idx].lastMessage = {
            content: currentInput,
            senderId: { _id: currentUserId },
            sentAt: new Date()
          };
          const [moved] = newConvs.splice(idx, 1);
          newConvs.unshift(moved);
        }
        return newConvs;
      });

    } catch (error) {
      toast.error('Lỗi khi gửi tin nhắn');
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
    }
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
                // Lấy tên người chat cùng
                const partner = conv.participants.find(p => p.userId?._id !== currentUserId)?.userId;
                const isActive = activeConversation?._id === conv._id;

                return (
                  <ListGroup.Item 
                    key={conv._id}
                    action 
                    active={isActive}
                    onClick={() => setActiveConversation(conv)}
                    className={`p-3 border-bottom ${isActive ? 'bg-primary border-primary' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <img 
                        src={partner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner?.name || 'A')}&background=random`} 
                        alt="avatar" 
                        className="rounded-circle object-fit-cover"
                        style={{ width: '48px', height: '48px' }}
                      />
                      <div className="flex-grow-1 overflow-hidden">
                        <div className={`fw-semibold text-truncate ${isActive ? 'text-white' : 'text-dark'}`}>
                          {partner?.name || 'Người dùng ẩn danh'}
                        </div>
                        <div className={`small text-truncate ${isActive ? 'text-white-50' : 'text-muted'}`}>
                          {conv.lastMessage?.senderId?.toString() === currentUserId ? 'Bạn: ' : ''}
                          {conv.lastMessage?.content || 'Chưa có tin nhắn'}
                        </div>
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
                  src={activeConversation.participants.find(p => p.userId?._id !== currentUserId)?.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConversation.participants.find(p => p.userId?._id !== currentUserId)?.userId?.name || 'A')}&background=random`} 
                  alt="avatar" 
                  className="rounded-circle object-fit-cover"
                  style={{ width: '40px', height: '40px' }}
                />
                <h5 className="mb-0 fw-bold">
                  {activeConversation.participants.find(p => p.userId?._id !== currentUserId)?.userId?.name || 'Người dùng'}
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
                    const isMine = msg.senderId?._id === currentUserId || msg.senderId === currentUserId;
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
                        <div 
                          className={`p-3 rounded-4 shadow-sm ${isMine ? 'bg-primary text-white' : 'bg-white border'}`}
                          style={{ maxWidth: '75%', borderBottomRightRadius: isMine ? '4px' : '16px', borderBottomLeftRadius: !isMine ? '4px' : '16px' }}
                        >
                          <div style={{ wordBreak: 'break-word', fontSize: '15px' }}>{msg.content}</div>
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
