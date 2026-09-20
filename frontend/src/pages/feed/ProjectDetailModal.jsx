import React, { useState } from 'react';
import { Modal, Button, Form, Badge, Row, Col, Card, Alert } from 'react-bootstrap';
import { Clock, FileText, CheckCircle, Upload, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { applyProject } from '../../services/applicationService';

const getTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
  return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
};

export default function ProjectDetailModal({ project, show, onHide }) {
  const [applyFile, setApplyFile] = useState(null);
  const [applyNote, setApplyNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!project) return null;

  const departmentName = project.departmentIds && project.departmentIds.length > 0
    ? project.departmentIds[0].name
    : 'Dự án';

  const timeAgo = getTimeAgo(project.createdAt);

  // Calculate remaining slots
  const remainingSlots = Math.max(0, project.maxMembers - (project.members?.length || 0));

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!applyFile) {
      setErrorMsg('Vui lòng chọn file CV.');
      return;
    }

    if (applyFile.size > 5 * 1024 * 1024) {
      setErrorMsg('File CV không được vượt quá 5MB.');
      return;
    }

    if (applyFile.type !== 'application/pdf') {
      setErrorMsg('Chỉ hỗ trợ định dạng file PDF.');
      return;
    }

    if (!applyNote || applyNote.trim() === '') {
      setErrorMsg('Vui lòng nhập ghi chú.');
      return;
    }

    if (applyNote.length > 500) {
      setErrorMsg('Ghi chú không được vượt quá 500 ký tự.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('cvFile', applyFile);
      formData.append('note', applyNote);

      await applyProject(project._id, formData);

      toast.success('Gửi hồ sơ ứng tuyển thành công!');

      // Reset form
      setApplyFile(null);
      setApplyNote('');
      setErrorMsg('');
      onHide();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      {/* ── Header ── */}
      <Modal.Header closeButton className="border-0 pb-0">
        <div className="w-100">
          <div className="d-flex align-items-center mb-2 gap-2">
            <Badge bg="warning" text="dark" className="px-2 py-1 fw-bold" style={{ backgroundColor: '#fed7aa', color: '#ea580c' }}>
              {departmentName}
            </Badge>
            <span className="text-muted small d-flex align-items-center gap-1">
              <Clock size={14} /> {timeAgo}
            </span>
          </div>
          <Modal.Title className="fw-bold fs-4">{project.title}</Modal.Title>
        </div>
      </Modal.Header>

      <Modal.Body className="pt-2 px-4 pb-4">
        {/* ── Thông tin Chủ bài đăng & Meta ── */}
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 border-bottom pb-3">
          <div className="d-flex align-items-center gap-2 mt-2">
            <img
              src={project.ownerId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.ownerId?.name || 'User')}&background=random`}
              alt="Avatar"
              className="rounded-circle"
              style={{ width: 40, height: 40, objectFit: 'cover' }}
            />
            <div>
              <div className="fw-bold">{project.ownerId?.name || 'Người dùng ẩn danh'}</div>
              <div className="text-muted small">Người đăng bài</div>
            </div>
          </div>
        </div>

        {/* ── Box 1: Chi tiết Dự án ── */}
        <Card
          className="mb-4 rounded-3 border-0 shadow-sm"
          style={{
            transition: 'box-shadow 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'}
        >
          <Card.Body className="p-4">

            {/* Tổng quan & Thông số */}
            <div className="mb-4">
              <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
                <h5 className="fw-bold d-flex align-items-center gap-2 mb-0" style={{ color: '#b45309' }}>
                  <FileText size={20} /> Tổng quan Dự án
                </h5>
              </div>

              {/* Các thông số dự án */}
              <Row
                className="p-3 rounded-3 mb-3 shadow-hover mx-0"
                style={{
                  backgroundColor: '#f3f4f6',
                  transition: 'box-shadow 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <Col className="text-center border-end border-secondary border-opacity-25">
                  <div className="fw-bold text-dark fs-5">{project.maxMembers}</div>
                  <div className="text-muted small fw-bold">Số lượng tuyển <span className="text-danger">*</span></div>
                </Col>
                <Col className={`text-center ${project.gradeTarget ? 'border-end border-secondary border-opacity-25' : ''}`}>
                  <div className="fw-bold text-primary fs-5">{remainingSlots}</div>
                  <div className="text-muted small fw-bold">Còn lại <span className="text-danger">*</span></div>
                </Col>
                {project.gradeTarget && (
                  <Col className="text-center">
                    <div className="fw-bold text-success fs-5">{project.gradeTarget}</div>
                    <div className="text-muted small fw-bold">Mục tiêu điểm số <span className="text-danger">*</span></div>
                  </Col>
                )}
              </Row>

              <div className="text-secondary mt-2" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {project.description}
              </div>
            </div>

            {/* Yêu cầu */}
            <div>
              <h5 className="fw-bold d-flex align-items-center gap-2 mb-3" style={{ color: '#b45309' }}>
                <CheckCircle size={20} /> Yêu cầu Ứng viên
              </h5>
              <div className="text-secondary" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {project.candidateRequirements}
              </div>
            </div>

          </Card.Body>
        </Card>

        {/* ── Box 2: Form Nộp Hồ Sơ ── */}
        <Card
          className="rounded-3 border-0 shadow-sm"
          style={{
            transition: 'box-shadow 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'}
        >
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-4">Nộp Hồ Sơ Ứng Tuyển</h5>

            {errorMsg && (
              <Alert variant="danger" className="mb-4">
                {errorMsg}
              </Alert>
            )}

            <Form onSubmit={handleApplySubmit}>
              {/* Upload CV */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Chọn CV/Hồ sơ <span className="text-danger">*</span></Form.Label>
                <label
                  className="d-block border rounded p-4 text-center cursor-pointer"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: applyFile ? '#fff7ed' : '#f9fafb',
                    borderColor: applyFile ? '#fdba74' : '#e5e7eb',
                    borderStyle: applyFile ? 'solid' : 'dashed'
                  }}
                >
                  <input
                    type="file"
                    className="d-none"
                    accept=".pdf"
                    onChange={(e) => setApplyFile(e.target.files[0])}
                    required
                  />
                  <div className="d-flex flex-column align-items-center justify-content-center">
                    <Upload size={32} style={{ color: applyFile ? '#ea580c' : '#9ca3af', marginBottom: 12 }} />
                    {applyFile ? (
                      <>
                        <div className="fw-bold" style={{ color: '#ea580c' }}>{applyFile.name}</div>
                        <div className="text-muted small mt-1">Đã chọn file thành công</div>
                      </>
                    ) : (
                      <>
                        <div className="fw-medium text-dark">Tải lên CV mới</div>
                        <div className="text-muted small mt-1">Định dạng PDF, tối đa 5MB</div>
                      </>
                    )}
                  </div>
                </label>
              </Form.Group>

              {/* Lời nhắn */}
              <Form.Group className="mb-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <Form.Label className="fw-bold mb-0">Ghi chú <span className="text-danger">*</span></Form.Label>
                  <small className={`text-muted ${applyNote.length > 500 ? 'text-danger' : ''}`}>
                    {applyNote.length}/500
                  </small>
                </div>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Giải thích lý do bạn phù hợp với dự án này và các kỹ năng của bạn đáp ứng yêu cầu ra sao...."
                  value={applyNote}
                  onChange={(e) => setApplyNote(e.target.value)}
                  maxLength={500}
                />
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>
      </Modal.Body>

      {/* ── Footer ── */}
      <Modal.Footer className="bg-light border-top shadow-sm px-4 py-3">
        <Button variant="outline-secondary" onClick={onHide} className="fw-medium px-4 bg-white">
          Hủy
        </Button>
        <Button
          variant="primary"
          onClick={handleApplySubmit}
          disabled={isSubmitting || !applyFile}
          className="fw-medium px-4 d-flex align-items-center gap-2"
        // style={{ backgroundColor: '#ea580c', borderColor: '#ea580c' }}
        >
          {isSubmitting ? 'Đang gửi...' : (
            <>
              Gửi Hồ Sơ
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
