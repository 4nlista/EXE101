import React from 'react';
import { Form, Badge, Spinner, Card, Row, Col } from 'react-bootstrap';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Alert from '../../components/Alert';
import { Sparkles, Send, Zap, PanelLeftOpen } from 'lucide-react';
import { AI_SENDER } from '../../constants/aiEnum';

const QUICK_SUGGESTIONS = [
  'Tìm dự án phù hợp với kỹ năng của mình',
  'Mình muốn tham gia dự án về Mobile App',
  'Có dự án nào cần Frontend Developer không?'
];

const AIChat = ({
  messages,
  isLoading,
  inputMessage,
  setInputMessage,
  onSendMessage,
  onQuickSuggestion,
  isFirstMessage,
  isFreePackage,
  currentSessionId,
  errorMsg,
  onViewProject,
  isLoadingProject,
  isSidebarOpen,
  setIsSidebarOpen,
  messagesEndRef
}) => {
  return (
    <div className="d-flex flex-column h-100 position-relative bg-white">
      {/* Nút Toggle Sidebar khi đóng */}
      {!isSidebarOpen && (
        <div className="p-3 position-absolute top-0 start-0 z-3">
          <Button
            variant="link"
            className="text-secondary p-0 border-0 shadow-none"
            onClick={() => setIsSidebarOpen(true)}
            title="Mở thanh bên"
          >
            <PanelLeftOpen size={24} />
          </Button>
        </div>
      )}

      {/* Vùng tin nhắn */}
      <div className="flex-grow-1 overflow-auto p-4" style={{ overflowX: 'hidden' }}>
        {messages.length === 0 && !isLoading && (
          <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center pt-5">
            <h5 className="fw-bold text-dark">Chào bạn! Mình là Trợ lý AI của UniVerse</h5>
            <p className="text-muted w-75 mx-auto">Mình có thể giúp bạn tìm kiếm những dự án phù hợp nhất với kỹ năng và định hướng của bạn. Hãy cho mình biết bạn muốn tìm dự án như thế nào nhé!</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`d-flex mb-4 px-md-4 ${msg.sender === AI_SENDER.USER ? 'justify-content-end' : 'justify-content-start'}`}>
            <div className={msg.sender === AI_SENDER.USER ? 'w-75 text-end' : 'w-100 text-start'}>
              {/* Bong bóng tin nhắn */}
              <div className={`d-inline-block p-3 rounded-4 text-start shadow-sm ${msg.sender === AI_SENDER.USER ? 'bg-primary text-white' : 'bg-light text-dark'}`}>
                <div className="text-break">{msg.text}</div>
              </div>

              {/* Thẻ Dự án xếp NGANG (nếu có) */}
              {msg.projects && msg.projects.length > 0 && (
                <Row className="flex-nowrap overflow-auto mt-3 pb-3 px-2">
                  {msg.projects.map((proj, pIdx) => (
                    <Col xs={11} sm={8} md={6} lg={5} key={pIdx}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="d-flex flex-column">
                          <div className="text-end mb-2">
                            <Badge bg="success" className="px-3 py-2 rounded-pill">
                              <Sparkles size={14} className="me-1" /> {proj.matchPercent}% Phù hợp
                            </Badge>
                          </div>
                          <h6 className="fw-bold text-dark mb-1 text-truncate" title={proj.projectTitle}>
                            {proj.projectTitle || `Dự án ${proj.projectId?.substring(0, 8)}`}
                          </h6>
                          {proj.skills && proj.skills.length > 0 && (
                            <div className="mb-2">
                              <small className="text-muted fw-semibold">KỸ NĂNG YÊU CẦU</small>
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                {proj.skills.slice(0, 3).map((skill, sIdx) => (
                                  <Badge key={sIdx} bg="secondary" className="fw-normal">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-secondary small mb-3 flex-grow-1">{proj.reason}</p>
                          <Button
                            variant="outline-primary"
                            className="w-100 rounded-pill mt-auto fw-bold"
                            onClick={() => onViewProject(proj.projectId)}
                            loading={isLoadingProject}
                          >
                            Xem chi tiết
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </div>
        ))}

        {/* Animation đang chờ AI trả lời */}
        {isLoading && messages.length > 0 && messages[messages.length - 1]?.sender === AI_SENDER.USER && (
          <div className="d-flex mb-4 justify-content-start px-md-4">
            <div className="bg-light text-dark p-3 rounded-4 shadow-sm d-flex align-items-center gap-2">
              <Spinner animation="grow" size="sm" className="text-primary" />
              <Spinner animation="grow" size="sm" className="text-primary" />
              <Spinner animation="grow" size="sm" className="text-primary" />
            </div>
          </div>
        )}

        {/* Cảnh báo lỗi quyền */}
        {errorMsg && (
          <Alert type="danger" className="mt-2 text-center rounded-3">{errorMsg}</Alert>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Câu hỏi gợi ý - chỉ hiện khi mới vào chưa chat */}
      {isFirstMessage && !isFreePackage && (
        <div className="px-4 pb-3">
          <div className="d-flex gap-2 flex-wrap justify-content-center">
            {QUICK_SUGGESTIONS.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline-primary"
                className="rounded-pill btn-sm d-flex align-items-center"
                onClick={() => onQuickSuggestion(suggestion)}
                disabled={isLoading}
              >
                <Zap size={14} className="me-1 text-warning" /> {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Ô nhập tin nhắn */}
      <div className="bg-white">
        <Form onSubmit={onSendMessage} className="mx-auto">
          <div className="d-flex align-items-center gap-3 bg-light rounded-pill p-2 border">
            <Input
              type="text"
              placeholder="Hỏi Trợ lý AI..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading || isFreePackage || !currentSessionId}
              className="border-0 bg-transparent shadow-none px-4 py-2 flex-grow-1 mb-0 text-dark"
              autoComplete="off"
            />
            <Button
              type="submit"
              disabled={isLoading || !inputMessage.trim() || isFreePackage || !currentSessionId}
              className="rounded-circle d-flex align-items-center justify-content-center p-2"
              variant="primary"
            >
              <Send size={20} />
            </Button>
          </div>
        </Form>
        <div className="text-center mt-2">
          <span className="text-muted small">
            AI có thể mắc lỗi. Vui lòng kiểm tra lại thông tin dự án trước khi ứng tuyển.
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
