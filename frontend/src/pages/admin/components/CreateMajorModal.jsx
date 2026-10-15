import React, { useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { Plus, GraduationCap } from 'lucide-react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Alert from '../../../components/Alert';
import { adminService } from '../../../services/adminService';
import { useDepartments } from '../../../hooks/useMasterData';
import { toast } from 'react-toastify';

export default function CreateMajorModal({ show, onClose, onSuccess, initialDeptId = '' }) {
  const [departmentId, setDepartmentId] = useState(initialDeptId);
  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: rawDepartments } = useDepartments();
  const departments = Array.isArray(rawDepartments) ? rawDepartments : (rawDepartments?.data || []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError('');
    setFormError('');

    if (!departmentId) {
      setFieldError('Vui lòng chọn ngành học cha.');
      return;
    }

    if (!name || name.trim().length < 2) {
      setFieldError('Tên chuyên ngành phải có ít nhất 2 ký tự.');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminService.createMajor({
        name: name.trim(),
        departmentId
      });
      toast.success(`Đã thêm chuyên ngành "${name.trim()}" thành công.`);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setFormError(err.message || err.response?.data?.message || 'Có lỗi xảy ra khi tạo chuyên ngành.');
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
          <GraduationCap size={20} className="text-secondary" /> Thêm chuyên ngành hẹp mới
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {formError && <Alert type="danger" className="mb-3">{formError}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label className="fw-medium text-dark small">
              Ngành học trực thuộc <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="text-secondary"
            >
              <option value="">-- Chọn ngành học cha --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-medium text-dark small">
              Tên chuyên ngành hẹp <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Ví dụ: Trí tuệ nhân tạo (AI), Kỹ thuật phần mềm, v.v..."
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
                <Plus size={16} /> Tạo chuyên ngành
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
