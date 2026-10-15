import React, { useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Alert from '../../../components/Alert';
import { adminService } from '../../../services/adminService';
import { toast } from 'react-toastify';

export default function ModerateProjectModal({ project, show, onClose, onSuccess }) {
  const [action, setAction] = useState('suspend');
  const [reason, setReason] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!project) return null;

  const memberCount = (project.members?.length || 0);
  const hasJoinedMembers = memberCount > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError('');
    setFormError('');

    if (!reason || reason.trim().length < 10) {
      setFieldError('Lý do kiểm duyệt phải có ít nhất 10 ký tự để tác giả hiểu rõ.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await adminService.moderateProject(project._id, {
        action,
        reason: reason.trim()
      });
      toast.success(res?.message || 'Kiểm duyệt dự án thành công.');
      onSuccess?.();
      handleClose();
    } catch (err) {
      setFormError(err.message || err.response?.data?.message || 'Có lỗi xảy ra khi kiểm duyệt dự án.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAction('suspend');
    setReason('');
    setFieldError('');
    setFormError('');
    onClose?.();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2 text-danger fs-5">
          <ShieldAlert size={20} /> Kiểm duyệt & Gỡ bài đăng dự án
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {formError && <Alert type="danger" className="mb-3">{formError}</Alert>}

          {/* Cảnh báo nếu dự án đã có thành viên tham gia */}
          {hasJoinedMembers && (
            <Alert type="warning" className="d-flex align-items-start gap-2 mb-3">
              <AlertTriangle size={18} className="mt-1 flex-shrink-0" />
              <div>
                <strong className="d-block">Dự án đã có {memberCount} thành viên tham gia!</strong>
                <span className="small">
                  Để bảo vệ quyền lợi và dữ liệu công việc của các thành viên khác trong nhóm, hệ thống <strong>không cho phép xóa hoàn toàn</strong>. Vui lòng chọn hành động <em>"Đình chỉ / Ẩn bài đăng"</em>.
                </span>
              </div>
            </Alert>
          )}

          <div className="mb-3">
            <div className="fw-semibold text-dark">{project.title}</div>
            <div className="text-muted small">
              Chủ dự án: {project.ownerId?.name || 'Không rõ'} ({project.ownerId?.email})
            </div>
          </div>

          {/* Lựa chọn hành động */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium text-dark small">Hình thức xử lý</Form.Label>
            <div className="d-flex flex-column gap-2">
              <Form.Check
                type="radio"
                id="act-suspend"
                name="action"
                label="Đình chỉ / Ẩn bài đăng vi phạm (Khuyên dùng)"
                checked={action === 'suspend'}
                onChange={() => setAction('suspend')}
              />
              <Form.Check
                type="radio"
                id="act-delete"
                name="action"
                label={`Xóa hoàn toàn bài đăng ${hasJoinedMembers ? '(Bị vô hiệu do đã có thành viên)' : ''}`}
                disabled={hasJoinedMembers}
                checked={action === 'delete'}
                onChange={() => setAction('delete')}
              />
            </div>
          </Form.Group>

          {/* Lý do kiểm duyệt */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium text-dark small">
              Lý do gỡ bỏ / đình chỉ <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Nêu rõ lý do (ví dụ: Nội dung tuyển dụng spam, thông tin lừa đảo hoặc không phù hợp với chuẩn sinh viên...)"
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
              Lý do này sẽ tự động được gửi qua chuông thông báo đến chủ dự án và các thành viên nhóm.
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
                <Spinner animation="border" size="sm" className="me-1" /> Đang xử lý...
              </>
            ) : (
              'Xác nhận kiểm duyệt'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
