import React, { useState, useEffect } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { Plus, BookOpen, Pencil, Check } from 'lucide-react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Alert from '../../../components/Alert';
import { adminService } from '../../../services/adminService';
import { toast } from 'react-toastify';

export default function CreateDepartmentModal({ show, onClose, onSuccess, departmentToEdit = null }) {
  const isEditing = Boolean(departmentToEdit?._id);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Điền dữ liệu khi ở chế độ chỉnh sửa hoặc làm mới form khi thêm mới
  useEffect(() => {
    if (departmentToEdit) {
      setName(departmentToEdit.name || '');
      setDescription(departmentToEdit.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setFieldError('');
    setFormError('');
  }, [departmentToEdit, show]);

  // Xử lý gửi biểu mẫu tạo mới hoặc chỉnh sửa ngành học
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
      if (isEditing) {
        await adminService.updateDepartment(departmentToEdit._id, {
          name: name.trim(),
          description: description.trim()
        });
        toast.success(`Đã cập nhật ngành học "${name.trim()}" thành công.`);
      } else {
        await adminService.createDepartment({
          name: name.trim(),
          description: description.trim()
        });
        toast.success(`Đã thêm ngành học "${name.trim()}" thành công.`);
      }
      onSuccess?.();
      handleClose();
    } catch (err) {
      setFormError(err.message || err.response?.data?.message || `Có lỗi xảy ra khi ${isEditing ? 'cập nhật' : 'tạo'} ngành học.`);
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
          {isEditing ? (
            <>
              <Pencil size={20} className="text-secondary" /> Chỉnh sửa ngành học
            </>
          ) : (
            <>
              <BookOpen size={20} className="text-secondary" /> Thêm ngành học mới
            </>
          )}
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
                <Spinner animation="border" size="sm" className="me-1" /> {isEditing ? 'Đang lưu...' : 'Đang tạo...'}
              </>
            ) : isEditing ? (
              <>
                <Check size={16} /> Lưu thay đổi
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
