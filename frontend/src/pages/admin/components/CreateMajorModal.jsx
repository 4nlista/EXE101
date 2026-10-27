import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { Plus, GraduationCap, Pencil, Check } from 'lucide-react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import Alert from '../../../components/Alert';
import { adminService } from '../../../services/adminService';
import { useDepartments } from '../../../hooks/useMasterData';
import { toast } from 'react-toastify';

export default function CreateMajorModal({ show, onClose, onSuccess, initialDeptId = '', majorToEdit = null }) {
  const isEditing = Boolean(majorToEdit?._id);
  const [departmentId, setDepartmentId] = useState(initialDeptId);
  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: rawDepartments } = useDepartments();
  const departments = Array.isArray(rawDepartments) ? rawDepartments : (rawDepartments?.data || []);

  // Điền dữ liệu khi ở chế độ chỉnh sửa hoặc làm mới form khi thêm mới
  useEffect(() => {
    if (majorToEdit) {
      setName(majorToEdit.name || '');
      setDepartmentId(majorToEdit.departmentId?._id || majorToEdit.departmentId || initialDeptId || '');
    } else {
      setName('');
      setDepartmentId(initialDeptId || '');
    }
    setFieldError('');
    setFormError('');
  }, [majorToEdit, show, initialDeptId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError('');
    setFormError('');

    if (!departmentId) {
      setFieldError('Vui lòng chọn ngành học.');
      return;
    }

    if (!name || name.trim().length < 2) {
      setFieldError('Tên chuyên ngành phải có ít nhất 2 ký tự.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing) {
        await adminService.updateMajor(majorToEdit._id, {
          name: name.trim(),
          departmentId
        });
        toast.success(`Đã cập nhật chuyên ngành "${name.trim()}" thành công.`);
      } else {
        await adminService.createMajor({
          name: name.trim(),
          departmentId
        });
        toast.success(`Đã thêm chuyên ngành "${name.trim()}" thành công.`);
      }
      onSuccess?.();
      handleClose();
    } catch (err) {
      setFormError(err.message || err.response?.data?.message || `Có lỗi xảy ra khi ${isEditing ? 'cập nhật' : 'tạo'} chuyên ngành.`);
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
          {isEditing ? (
            <>
              <Pencil size={20} className="text-secondary" /> Chỉnh sửa chuyên ngành
            </>
          ) : (
            <>
              <GraduationCap size={20} className="text-secondary" /> Thêm chuyên ngành mới
            </>
          )}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {formError && <Alert type="danger" className="mb-3">{formError}</Alert>}

          <Select
            label="Ngành học trực thuộc"
            required
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
          >
            <option value="">-- Chọn ngành học --</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </Select>

          <Input
            label="Tên chuyên ngành"
            required
            placeholder="Ví dụ: Trí tuệ nhân tạo (AI), Kỹ thuật phần mềm, v.v..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldError) setFieldError('');
            }}
            error={fieldError}
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
            loadingText={isEditing ? 'Đang lưu...' : 'Đang tạo...'}
            className="d-inline-flex align-items-center gap-1"
          >
            {isEditing ? (
              <>
                <Check size={16} /> Lưu thay đổi
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
