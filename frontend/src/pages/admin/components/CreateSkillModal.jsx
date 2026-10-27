import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { Plus, Tag } from 'lucide-react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Alert from '../../../components/Alert';
import { adminService } from '../../../services/adminService';
import { toast } from 'react-toastify';

export default function CreateSkillModal({ show, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError('');
    setFormError('');

    if (!name || name.trim().length < 2) {
      setFieldError('Tên kỹ năng phải có ít nhất 2 ký tự.');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminService.createSkill({
        name: name.trim()
      });
      toast.success(`Đã thêm kỹ năng "${name.trim()}" vào từ điển hệ thống.`);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setFormError(err.message || err.response?.data?.message || 'Có lỗi xảy ra khi tạo kỹ năng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setFieldError('');
    setFormError('');
    onClose?.();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2 text-dark fs-5">
          <Tag size={20} className="text-secondary" /> Thêm kỹ năng nổi bật mới
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {formError && <Alert type="danger" className="mb-3">{formError}</Alert>}

          <Input
            label="Tên kỹ năng"
            required
            placeholder="Ví dụ: Next.js, Prompt Engineering, Docker, Figma, v.v..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldError) setFieldError('');
            }}
            error={fieldError}
            helperText="Kỹ năng này sẽ được thêm vào kho từ điển chuẩn để hỗ trợ sinh viên tự động hoàn thiện hồ sơ và đăng bài tuyển dụng."
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            loading={isSubmitting}
            loadingText="Đang tạo..."
            className="d-inline-flex align-items-center gap-1"
          >
            <Plus size={16} /> Thêm kỹ năng
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
