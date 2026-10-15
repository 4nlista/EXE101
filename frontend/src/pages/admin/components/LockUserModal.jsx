import React, { useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Alert from '../../../components/Alert';
import { adminService } from '../../../services/adminService';
import { toast } from 'react-toastify';

export default function LockUserModal({ user, show, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const isVip = user.currentPackage === 'vip' || user.currentPackage === 'premium';
  const hasProjects = (user.hostedProjectsCount || 0) > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError('');
    setFormError('');

    if (!reason || reason.trim().length < 5) {
      setFieldError('Lý do khóa tài khoản phải có ít nhất 5 ký tự.');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminService.lockUser(user._id, reason.trim());
      toast.success(`Đã khóa tài khoản "${user.name}" thành công.`);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setFormError(err.message || err.response?.data?.message || 'Có lỗi xảy ra khi khóa tài khoản.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setFieldError('');
    setFormError('');
    onClose?.();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2 text-danger fs-5">
          <ShieldAlert size={20} /> Khóa tài khoản người dùng
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Form-level Error */}
          {formError && <Alert type="danger" className="mb-3">{formError}</Alert>}

          {/* Cảnh báo cân nhắc quyền lợi người dùng (VIP / Dự án đang mở) */}
          {isVip && (
            <Alert type="warning" className="d-flex align-items-start gap-2 mb-3">
              <AlertTriangle size={18} className="mt-1 flex-shrink-0" />
              <div>
                <strong className="d-block">Người dùng sở hữu gói {user.currentPackage.toUpperCase()}!</strong>
                <span className="small">
                  Đây là tài khoản đã thanh toán ủng hộ nền tảng. Bạn nên cân nhắc gửi nhắc nhở trước khi tạm khóa quyền truy cập.
                </span>
              </div>
            </Alert>
          )}

          {hasProjects && (
            <Alert type="info" className="small mb-3">
              Người dùng này đang chủ trì <strong>{user.hostedProjectsCount} dự án</strong>. Khi khóa, toàn bộ bài tuyển dụng đang mở sẽ được hệ thống tự động tạm đình chỉ hiển thị để tránh người khác nộp hồ sơ.
            </Alert>
          )}

          <div className="mb-3">
            <div className="fw-semibold text-dark">{user.name}</div>
            <div className="text-muted small">{user.email}</div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="fw-medium text-dark small">
              Lý do khóa tài khoản <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Nêu rõ lý do vi phạm (ví dụ: Spam tuyển dụng, thông tin lừa đảo, ngôn từ phản cảm...)"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (fieldError) setFieldError('');
              }}
              isInvalid={Boolean(fieldError)}
            />
            {fieldError && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {fieldError}
              </Form.Control.Feedback>
            )}
            <Form.Text className="text-muted small">
              Lý do này sẽ được gửi trực tiếp đến chuông thông báo của người dùng.
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button variant="danger" size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" /> Đang khóa...
              </>
            ) : (
              'Xác nhận khóa'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
