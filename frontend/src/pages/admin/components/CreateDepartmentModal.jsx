import React, { useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { Plus, BookOpen } from 'lucide-react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Alert from '../../../components/Alert';
import { adminService } from '../../../services/adminService';
import { toast } from 'react-toastify';

export default function CreateDepartmentModal({ show, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xử lý gửi biểu mẫu tạo mới ngành học
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError('');
    setFormError('');

    if (!name || name.trim().length < 2) {
      setFieldError('Tên ngành học phải có ít nhất 2 ký tự.');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminService.createDepartment({
        name: name.trim(),
        description: description.trim()
      });
      toast.success(`Đã thêm ngành học "${name.trim()}" thành công.`);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setFormError(err.message || err.response?.data?.message || 'Có lỗi xảy ra khi tạo ngành học.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setFieldError('');
    setFormError('');
    onClose?.();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2 text-dark fs-5">
          <BookOpen size={20} className="text-secondary" /> Thêm ngành học mới
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Form-level Error */}
          {formError && <Alert type="danger" className="mb-3">{formError}</Alert>}

          {/* Tên ngành học */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium text-dark small">
              Tên ngành học <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Ví dụ: Công nghệ thông tin, Quản trị kinh doanh, v.v..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldError) setFieldError('');
              }}
              isInvalid={Boolean(fieldError)}
            />
            {fieldError && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {fieldError}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          {/* Mô tả ngành học */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium text-dark small">
              Mô tả ngành học (không bắt buộc)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Nhập mô tả ngắn gọn về phạm vi đào tạo hoặc định hướng của ngành học này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isSubmitting} className="d-inline-flex align-items-center gap-1">
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" /> Đang tạo...
              </>
            ) : (
              <>
                <Plus size={16} /> Tạo ngành học
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
