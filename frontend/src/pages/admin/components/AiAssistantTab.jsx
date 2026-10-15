import React, { useState, useRef, useEffect } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { Bot, Send, Sparkles, User, RefreshCw } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import Button from '../../../components/Button';
import Alert from '../../../components/Alert';

const QUICK_PROMPTS = [
  'Thống kê tổng quan số lượng người dùng và dự án hiện tại',
  'Phân tích tổng doanh thu từ các gói VIP và dự án đang mở',
  'Tình hình các dự án đang tuyển thành viên trên toàn hệ thống'
];

export default function AiAssistantTab() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Xin chào Quản trị viên! Tôi là trợ lý AI được trang bị công cụ Function Calling kết nối trực tiếp với Database của UniVerse AI. Bạn có thể hỏi tôi bất kỳ số liệu thống kê hoặc phân tích nào về người dùng, dự án và doanh thu.'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    setErrorMsg('');
    setInputPrompt('');

    // Thêm câu hỏi của Admin vào hội thoại
    const newMessages = [...messages, { sender: 'admin', text: prompt }];
    setMessages(newMessages);

    try {
      setIsLoading(true);
      const res = await adminService.askAi(prompt);
      const reply = res?.data || res?.message || 'Không có phản hồi từ AI.';
      setMessages([...newMessages, { sender: 'ai', text: reply }]);
    } catch (err) {
      setErrorMsg(err.message || err.response?.data?.message || 'Lỗi khi kết nối với Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3 border shadow-sm p-4 d-flex flex-column" style={{ minHeight: '600px' }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded-circle bg-light text-primary">
            <Bot size={22} />
          </div>
          <div>
            <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              Trợ lý Quản trị viên Gemini AI
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-normal" style={{ fontSize: '0.7rem' }}>
                Function Calling Realtime
              </span>
            </h6>
            <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
              Truy vấn và phân tích dữ liệu trực tiếp từ cơ sở dữ liệu MongoDB
            </div>
          </div>
        </div>

        <Button
          variant="light"
          size="sm"
          className="border text-secondary shadow-sm d-inline-flex align-items-center gap-1"
          onClick={() => {
            setMessages([
              {
                sender: 'ai',
                text: 'Xin chào Quản trị viên! Hãy đặt câu hỏi để tôi phân tích số liệu hệ thống giúp bạn.'
              }
            ]);
            setErrorMsg('');
          }}
        >
          <RefreshCw size={14} /> Làm mới đoạn chat
        </Button>
      </div>

      {/* Gợi ý câu hỏi nhanh */}
      <div className="mb-3 d-flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((promptText, idx) => (
          <button
            key={idx}
            type="button"
            className="btn btn-sm btn-light border text-secondary rounded-pill small py-1 px-3 d-inline-flex align-items-center gap-1 text-start"
            style={{ fontSize: '0.78rem' }}
            onClick={() => handleSend(promptText)}
            disabled={isLoading}
          >
            <Sparkles size={12} className="text-primary flex-shrink-0" />
            <span>{promptText}</span>
          </button>
        ))}
      </div>

      {errorMsg && <Alert type="danger" className="mb-3">{errorMsg}</Alert>}

      {/* Khung chat */}
      <div className="flex-grow-1 overflow-auto pe-2 mb-3 d-flex flex-column gap-3" style={{ maxHeight: '420px' }}>
        {messages.map((msg, index) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={index}
              className={`d-flex gap-2 ${isAi ? 'align-items-start' : 'align-items-start flex-row-reverse'}`}
            >
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${isAi ? 'bg-primary text-white' : 'bg-secondary text-white'}`}
                style={{ width: '32px', height: '32px' }}
              >
                {isAi ? <Bot size={18} /> : <User size={18} />}
              </div>

              <div
                className={`p-3 rounded-3 shadow-sm text-break ${isAi ? 'bg-light border text-dark' : 'bg-primary text-white'}`}
                style={{ maxWidth: '80%', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="d-flex align-items-center gap-2 text-muted small py-2">
            <Spinner animation="border" size="sm" variant="primary" />
            <span>AI đang truy vấn database và phân tích số liệu...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Ô nhập tin nhắn */}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="d-flex gap-2 pt-2 border-top"
      >
        <Form.Control
          type="text"
          placeholder="Nhập câu hỏi thống kê hoặc yêu cầu phân tích..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          disabled={isLoading}
          className="rounded-pill bg-light border"
        />
        <Button
          variant="primary"
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="rounded-pill px-4 d-inline-flex align-items-center gap-1 shadow-sm"
        >
          <Send size={16} /> Gửi
        </Button>
      </Form>
    </div>
  );
}
