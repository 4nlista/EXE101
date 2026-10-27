import React, { useState, useEffect } from 'react';
import { Form, Badge, Row, Col } from 'react-bootstrap';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Alert from '../../components/Alert';
import Input from '../../components/Input';
import { Clock, FileText, CheckCircle, Upload, Send, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { applyProject, checkApplicationStatus } from '../../services/applicationService';
import { APPLICATION_STATUS, PROJECT_STATUS } from '../../constants';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import OnboardingRequiredModal from '../../components/OnboardingRequiredModal';

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
  const { currentUser } = useAuth();
  const [applyFile, setApplyFile] = useState(null);
  const [applyNote, setApplyNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [appStatus, setAppStatus] = useState({ canApply: true, status: null, rejectionCount: 0 });
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const navigate = useNavigate();

  const getStatusMessage = (status, rejectionCount) => {
    if (status === APPLICATION_STATUS.PENDING) {
      return 'Hồ sơ của bạn đang được duyệt';
    }
    if (status === APPLICATION_STATUS.APPROVED) {
      return 'Bạn đã là thành viên của dự án này';
    }
    if (status === APPLICATION_STATUS.REJECTED && rejectionCount >= 3) {
      return 'Bạn đã bị từ chối 3 lần (Vượt quá giới hạn)';
    }
    if (status === APPLICATION_STATUS.CANCELLED) {
      return 'Dự án này đã bị chủ sở hữu hủy';
    }
    return 'Bạn đã ứng tuyển bài đăng dự án này rồi';
  };

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      if (show && project?._id) {
        try {
          const res = await checkApplicationStatus(project._id);
          if (isMounted && res.success) {
            setAppStatus({ canApply: res.canApply, status: res.status, rejectionCount: res.rejectionCount });
          }
        } catch (err) {
          console.error('Lỗi kiểm tra trạng thái:', err);
        }
      }
    };

    fetchStatus();

    // Reset các state khi đóng/mở
    if (show) {
      setApplyFile(null);
      setApplyNote('');
      setErrorMsg('');
    }

    return () => {
      isMounted = false;
    };
  }, [show, project]);

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

    // Kiểm tra hoàn tất hồ sơ onboarding
    if (currentUser && !currentUser.onboardingCompleted) {
      setShowOnboardingModal(true);
      return;
    }

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
      // Reset form
      setAppStatus({ canApply: true, status: null, rejectionCount: 0 }); // Temporarily true before we reload or refetch, though typically hiding is enough
      onHide();
    } catch (error) {
      const status = error.response?.data?.status;
      const rejectionCount = error.response?.data?.rejectionCount;

      if (status) {
        setAppStatus({ canApply: false, status, rejectionCount });
        setErrorMsg('');
      } else {
        const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại.';
        setErrorMsg(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      {/* ── Header ── */}
      <Modal.Header closeButton>
        <div className="w-100 pe-3">
          <div className="d-flex align-items-center mb-2 gap-2 flex-wrap">
            {project.departmentTargets && project.departmentTargets.length > 0 ? (
              project.departmentTargets.map((target, idx) => (
                <span
                  key={target._id || idx}
                  className="status-badge status-badge--warning"
                >
                  {target.departmentId?.name || 'Ngành'}: {target.neededCount} người
                </span>
              ))
            ) : project.departmentIds && project.departmentIds.length > 0 ? (
              project.departmentIds.map((dept, idx) => (
                <span
                  key={dept._id || idx}
                  className="status-badge status-badge--warning"
                >
                  {dept.name || dept}
                </span>
              ))
            ) : (
              <span className="status-badge status-badge--warning">
                {departmentName}
              </span>
            )}
            <span className="text-muted small d-flex align-items-center gap-1 ms-auto">
              <Clock size={14} /> {timeAgo}
            </span>
          </div>
          <Modal.Title>{project.title}</Modal.Title>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* ── Thông tin Chủ bài đăng & Meta ── */}
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 border-bottom pb-3">
          <div 
            className="d-flex align-items-center gap-2"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (project.ownerId?._id) {
                onHide();
                navigate(`/profile/${project.ownerId._id}`);
              }
            }}
          >
            <img
              src={project.ownerId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.ownerId?.name || 'User')}&background=random`}
              alt="Avatar"
              className="rounded-circle"
              style={{ width: 40, height: 40, objectFit: 'cover', border: '1px solid var(--border)' }}
            />
            <div>
              <div className="fw-semibold text-dark">{project.ownerId?.name || 'Người dùng ẩn danh'}</div>
              <div className="text-muted small">Người đăng bài</div>
            </div>
          </div>
        </div>

        {/* ── Box 1: Chi tiết Dự án ── */}
        <Card className="mb-4">
          <Card.Body className="p-4">

            {/* Tổng quan & Thông số */}
            <div className="mb-4">
              <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
                <h5 className="fw-semibold d-flex align-items-center gap-2 mb-0 text-dark">
                  <FileText size={18} className="text-secondary" /> Tổng quan Dự án
                </h5>
              </div>

              {/* Các thông số dự án */}
              <Row
                className="p-3 rounded mb-3 mx-0 border"
                style={{ backgroundColor: 'var(--bg-subtle)' }}
              >
                <Col className="text-center border-end">
                  <div className="fw-bold text-dark fs-5">{project.maxMembers}</div>
                  <div className="text-muted small">Tổng chỉ tiêu</div>
                </Col>
                <Col className={`text-center ${project.gradeTarget ? 'border-end' : ''}`}>
                  <div className="fw-bold text-primary fs-5">{remainingSlots}</div>
                  <div className="text-muted small">Còn lại</div>
                </Col>
                {project.gradeTarget && (
                  <Col className="text-center">
                    <div className="fw-bold text-success fs-5">{project.gradeTarget}</div>
                    <div className="text-muted small">Mục tiêu điểm số</div>
                  </Col>
                )}
              </Row>

              {/* Chỉ tiêu tuyển dụng chi tiết theo ngành (nếu có) */}
              {project.departmentTargets && project.departmentTargets.length > 0 && (
                <div className="mb-3 p-3 bg-light rounded border">
                  <div className="fw-medium small text-dark mb-2">Chỉ tiêu theo từng ngành:</div>
                  <div className="d-flex flex-wrap gap-2">
                    {project.departmentTargets.map((target, idx) => (
                      <span key={target._id || idx} className="status-badge status-badge--neutral">
                        {target.departmentId?.name || 'Ngành'}: <strong style={{ color: 'var(--primary)' }}>{target.neededCount} người</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-secondary mt-2" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {project.description}
              </div>
            </div>

            {/* Yêu cầu */}
            <div>
              <h5 className="fw-semibold d-flex align-items-center gap-2 mb-3 text-dark">
                <CheckCircle size={18} className="text-secondary" /> Yêu cầu Ứng viên
              </h5>
              <div className="text-secondary" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {project.candidateRequirements}
              </div>
            </div>

          </Card.Body>
        </Card>

        {/* ── Box 2: Form Nộp Hồ Sơ ── */}
        <Card>
          <Card.Body className="p-4">
            <h5 className="fw-semibold mb-4 text-dark">Nộp Hồ Sơ Ứng Tuyển</h5>

            {errorMsg && (
              <Alert type="danger" className="mb-4">
                {errorMsg}
              </Alert>
            )}

            {project?.status !== PROJECT_STATUS.OPEN ? (
              <div className="alert alert-secondary d-flex align-items-center justify-content-center gap-2 mb-0">
                <AlertCircle size={18} />
                {project?.status === PROJECT_STATUS.CANCELLED
                  ? 'Dự án này đã bị chủ sở hữu hủy'
                  : 'Dự án này hiện đã đóng hoặc kết thúc'}
              </div>
            ) : currentUser && !currentUser.onboardingCompleted ? (
              <div className="w-100 p-4 rounded text-center my-2 border bg-light">
                <p className="text-secondary mb-3 small" style={{ lineHeight: '1.6' }}>
                  Bạn cần hoàn tất hồ sơ cá nhân để chủ dự án xem xét chuyên ngành, kỹ năng và GPA của bạn trước khi ứng tuyển.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onHide();
                    navigate('/onboarding');
                  }}
                  className="fw-medium px-4"
                >
                  Hoàn tất hồ sơ ngay →
                </Button>
              </div>
            ) : !appStatus.canApply ? (
              <div className={`alert ${
                appStatus.status === APPLICATION_STATUS.APPROVED 
                  ? 'alert-success' 
                  : appStatus.status === APPLICATION_STATUS.PENDING || appStatus.status === APPLICATION_STATUS.INVITED
                  ? 'alert-warning'
                  : 'alert-danger'
              } d-flex align-items-center justify-content-center gap-2 mb-0`}>
                {appStatus.status === APPLICATION_STATUS.APPROVED ? <CheckCircle size={18} /> : <AlertCircle size={18} />} 
                {getStatusMessage(appStatus.status, appStatus.rejectionCount)}
              </div>
            ) : (
              <Form onSubmit={handleApplySubmit}>
                {/* Upload CV */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium mb-1">Chọn CV/Hồ sơ <span className="text-danger">*</span></Form.Label>
                  <label
                    className="d-block border rounded p-4 text-center cursor-pointer"
                    style={{
                      cursor: 'pointer',
                      backgroundColor: applyFile ? 'var(--primary-light)' : 'var(--bg-subtle)',
                      borderColor: applyFile ? 'var(--primary)' : 'var(--border)',
                      borderStyle: applyFile ? 'solid' : 'dashed'
                    }}
                  >
                    <input
                      type="file"
                      className="d-none"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            setErrorMsg('File CV không được vượt quá 5MB.');
                            setApplyFile(null);
                          } else if (file.type !== 'application/pdf') {
                            setErrorMsg('Chỉ hỗ trợ định dạng file PDF.');
                            setApplyFile(null);
                          } else {
                            setErrorMsg('');
                            setApplyFile(file);
                          }
                        }
                      }}
                      required
                    />
                    <div className="d-flex flex-column align-items-center justify-content-center">
                      <Upload size={28} style={{ color: applyFile ? 'var(--primary)' : 'var(--text-muted)', marginBottom: 8 }} />
                      {applyFile ? (
                        <>
                          <div className="fw-semibold" style={{ color: 'var(--primary)' }}>{applyFile.name}</div>
                          <div className="text-muted small mt-1">Đã chọn file thành công</div>
                        </>
                      ) : (
                        <>
                          <div className="fw-medium text-dark">Tải lên CV (PDF)</div>
                          <div className="text-muted small mt-1">Định dạng PDF, tối đa 5MB</div>
                        </>
                      )}
                    </div>
                  </label>
                </Form.Group>

                {/* Lời nhắn */}
                <Input
                  label={
                    <div className="d-flex justify-content-between align-items-center w-100">
                      <span>Ghi chú <span className="text-danger">*</span></span>
                      <small className={`text-muted fw-normal ${applyNote.length > 500 ? 'text-danger' : ''}`}>
                        {applyNote.length}/500
                      </small>
                    </div>
                  }
                  as="textarea"
                  rows={4}
                  placeholder="Giải thích lý do bạn phù hợp với dự án này và các kỹ năng của bạn đáp ứng yêu cầu ra sao...."
                  value={applyNote}
                  onChange={(e) => setApplyNote(e.target.value)}
                  maxLength={500}
                />

                {/* ── Footer Buttons ── */}
                <div className="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                  <Button variant="cancel" type="button" onClick={onHide} className="fw-medium px-4">
                    Hủy
                  </Button>
                  <Button type="submit" variant="primary" disabled={!applyFile} loading={isSubmitting} className="fw-medium px-4 d-flex align-items-center gap-2">
                    Gửi Hồ Sơ {!isSubmitting && <Send size={16} />}
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>

      {/* Modal Cảnh báo yêu cầu hoàn tất hồ sơ */}
      <OnboardingRequiredModal
        show={showOnboardingModal}
        onHide={() => setShowOnboardingModal(false)}
        actionTitle="ứng tuyển vào dự án này"
      />
    </Modal>
  );
}
