import React, { useState, useRef, useEffect } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { Bot, Send, Sparkles, User, RefreshCw } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import Button from '../../../components/Button';
import Alert from '../../../components/Alert';
import AiStructuredReport from './AiStructuredReport';

const QUICK_PROMPTS = [
  'Thống kê tổng quan số lượng người dùng và dự án hiện tại',
  'Phân tích tổng doanh thu từ các gói VIP và dự án đang mở',
  'Tình hình các dự án đang tuyển thành viên trên toàn hệ thống'
];

export default function AiAssistantTab() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      data: {
        title: 'Trợ lý Quản trị viên UniVerse AI',
        summary: 'Chào Quản trị viên! Tôi được kết nối trực tiếp với cơ sở dữ liệu thời gian thực của hệ thống. Bạn có thể yêu cầu tôi báo cáo tổng quan, lập bảng phân tích người dùng, dự án hoặc doanh thu bất kỳ lúc nào.'
      }
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
      const replyData = res?.data || res?.message || 'Không có phản hồi từ AI.';
      setMessages([...newMessages, { sender: 'ai', data: replyData }]);
    } catch (err) {
      setErrorMsg(err.message || err.response?.data?.message || 'Lỗi khi kết nối với Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3 border shadow-sm p-4 d-flex flex-column" style={{ minHeight: '600px' }}>
      {/* ── Header ── */}
      <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded-2 bg-dark text-white d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
            <Bot size={20} />
          </div>
          <div>
            <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              Trợ lý Quản trị viên Gemini AI
              <span className="badge bg-light text-secondary border fw-normal" style={{ fontSize: '0.7rem' }}>
                Báo cáo Realtime
              </span>
            </h6>
            <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
              Trích xuất dữ liệu, lập bảng chỉ số và khuyến nghị quản trị vận hành
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
                data: {
                  title: 'Đoạn trò chuyện mới',
                  summary: 'Xin chào Quản trị viên! Hãy đặt câu hỏi để tôi lập bảng thống kê và phân tích số liệu hệ thống giúp bạn.'
                }
              }
            ]);
            setErrorMsg('');
          }}
        >
          <RefreshCw size={14} /> Làm mới đoạn chat
        </Button>
      </div>

      {/* ── Gợi ý câu hỏi nhanh (Monochrome style) ── */}
      <div className="mb-3 d-flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((promptText, idx) => (
          <Button
            key={idx}
            type="button"
            variant="secondary"
            size="sm"
            className="small py-1 px-3 d-inline-flex align-items-center gap-1 text-start"
            style={{ fontSize: '0.78rem' }}
            onClick={() => handleSend(promptText)}
            disabled={isLoading}
          >
            <Sparkles size={12} className="text-secondary flex-shrink-0" />
            <span>{promptText}</span>
          </Button>
        ))}
      </div>

      {errorMsg && <Alert type="danger" className="mb-3">{errorMsg}</Alert>}

      {/* ── Khung chat & Báo cáo dữ liệu ── */}
      <div className="flex-grow-1 overflow-auto pe-2 mb-3 d-flex flex-column gap-3" style={{ maxHeight: '480px' }}>
        {messages.map((msg, index) => {
          const isAi = msg.sender === 'ai';

          return (
            <div
              key={index}
              className={`d-flex gap-2 ${isAi ? 'align-items-start' : 'align-items-start flex-row-reverse'}`}
            >
              <div
                className={`rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 ${isAi ? 'bg-dark text-white' : 'bg-secondary text-white'}`}
                style={{ width: '32px', height: '32px' }}
              >
                {isAi ? <Bot size={16} /> : <User size={16} />}
              </div>

              <div
                className={`p-3 rounded-3 shadow-sm ${isAi ? 'bg-white border text-dark w-100' : 'bg-dark text-white'}`}
                style={{ maxWidth: isAi ? '90%' : '75%', fontSize: '0.9rem', lineHeight: '1.5' }}
              >
                {isAi ? (
                  <AiStructuredReport data={msg.data || msg.text} />
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="d-flex align-items-center gap-2 text-muted small py-2 px-1">
            <Spinner animation="border" size="sm" variant="dark" />
            <span>AI đang trích xuất số liệu MongoDB và lập báo cáo quản trị...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Ô nhập tin nhắn & Nút gửi monochrome ── */}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="d-flex gap-2 pt-2 border-top"
      >
        <Form.Control
          type="text"
          placeholder="Nhập câu hỏi thống kê hoặc yêu cầu phân tích số liệu..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          disabled={isLoading}
          className="rounded-pill bg-light border px-3"
        />
        <Button
          variant="dark"
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="rounded-pill px-4 d-inline-flex align-items-center gap-1 shadow-sm text-white"
        >
          <Send size={15} /> Gửi
        </Button>
      </Form>
    </div>
  );
}
