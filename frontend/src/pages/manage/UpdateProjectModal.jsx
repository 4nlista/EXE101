import React, { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Alert from '../../components/Alert';
import { Plus, Trash2 } from 'lucide-react';
import { useDepartments } from '../../hooks/useMasterData';
import { updateProject } from '../../services/projectService';
import { toast } from 'react-toastify';

export default function UpdateProjectModal({ show, onHide, project, onSuccess }) {
  const queryClient = useQueryClient();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    candidateRequirements: '',
    departmentTargets: [{ departmentId: '', neededCount: 1 }],
    gradeTarget: '',
    deadline: ''
  });

  // Errors State
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Fetch Departments
  const { data: rawDepartments } = useDepartments();
  const departments = Array.isArray(rawDepartments) ? rawDepartments : (rawDepartments?.data || []);

  // Initialize form with project data
  useEffect(() => {
    if (project && show) {
      let initTargets = [{ departmentId: '', neededCount: 1 }];
      if (project.departmentTargets && project.departmentTargets.length > 0) {
        initTargets = project.departmentTargets.map((t) => ({
          departmentId: t.departmentId?._id || t.departmentId || '',
          neededCount: t.neededCount || 1
        }));
      } else if (project.departmentIds && project.departmentIds.length > 0) {
        initTargets = project.departmentIds.map((deptId, idx) => ({
          departmentId: deptId?._id || deptId || '',
          neededCount: idx === 0 ? (project.maxMembers || 1) : 1
        }));
      }

      setFormData({
        title: project.title || '',
        description: project.description || '',
        candidateRequirements: project.candidateRequirements || '',
        departmentTargets: initTargets,
        gradeTarget: project.gradeTarget !== undefined ? project.gradeTarget : '',
        deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''
      });
      setErrors({});
      setServerError('');
    }
  }, [project, show]);

  // Tính tổng số lượng tuyển tự động từ các ngành
  const totalNeededMembers = formData.departmentTargets.reduce(
    (sum, item) => sum + (parseInt(item.neededCount, 10) || 0),
    0
  );

  // Mutation
  const updateMutation = useMutation({
    mutationFn: (data) => updateProject(project._id, data),
    onSuccess: (res) => {
      toast.success('Cập nhật dự án thành công!');
      queryClient.invalidateQueries(['projects']);
      if (onSuccess) onSuccess(res.data);
      onHide();
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật dự án.';
      setServerError(msg);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) setServerError('');
  };

  // Thêm một ngành cần tuyển
  const handleAddDepartmentTarget = () => {
    setFormData((prev) => ({
      ...prev,
      departmentTargets: [...prev.departmentTargets, { departmentId: '', neededCount: 1 }]
    }));
  };

  // Xóa một ngành cần tuyển
  const handleRemoveDepartmentTarget = (index) => {
    setFormData((prev) => ({
      ...prev,
      departmentTargets: prev.departmentTargets.filter((_, idx) => idx !== index)
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`departmentTarget_${index}`];
      delete next[`departmentTargetCount_${index}`];
      delete next.departmentTargets;
      return next;
    });
  };

  // Cập nhật thông tin ngành hoặc số lượng trong hàng tuyển dụng
  const handleDepartmentTargetChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.departmentTargets];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, departmentTargets: updated };
    });
    if (errors[`departmentTarget_${index}`] || errors[`departmentTargetCount_${index}`] || errors.departmentTargets) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`departmentTarget_${index}`];
        delete next[`departmentTargetCount_${index}`];
        delete next.departmentTargets;
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    const { title, description, candidateRequirements, departmentTargets, gradeTarget, deadline } = formData;

    if (!title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề dự án.';
    else if (title.length > 150) newErrors.title = 'Tiêu đề dự án không vượt quá 150 ký tự.';

    if (!description.trim()) newErrors.description = 'Vui lòng nhập tổng quan dự án.';
    else if (description.length > 3000) newErrors.description = 'Tổng quan dự án không vượt quá 3000 ký tự.';

    if (!candidateRequirements.trim()) newErrors.candidateRequirements = 'Vui lòng nhập yêu cầu ứng viên.';
    else if (candidateRequirements.length > 2000) newErrors.candidateRequirements = 'Yêu cầu ứng viên không vượt quá 2000 ký tự.';

    // Kiểm tra danh sách ngành tuyển dụng
    if (!departmentTargets || departmentTargets.length === 0) {
      newErrors.departmentTargets = 'Vui lòng chọn ít nhất một ngành học cần tuyển.';
    } else {
      const selectedDeptIds = new Set();
      departmentTargets.forEach((target, index) => {
        if (!target.departmentId) {
          newErrors[`departmentTarget_${index}`] = 'Vui lòng chọn ngành học.';
        } else if (selectedDeptIds.has(target.departmentId)) {
          newErrors[`departmentTarget_${index}`] = 'Ngành học này đã được chọn ở dòng trên.';
        } else {
          selectedDeptIds.add(target.departmentId);
        }

        if (!target.neededCount || Number(target.neededCount) < 1) {
          newErrors[`departmentTargetCount_${index}`] = 'Tối thiểu 1 người.';
        }
      });
    }

    if (gradeTarget === '') newErrors.gradeTarget = 'Vui lòng nhập mục tiêu điểm.';
    else if (Number(gradeTarget) < 0 || Number(gradeTarget) > 10) newErrors.gradeTarget = 'Mục tiêu điểm từ 0 đến 10.';

    if (!deadline) newErrors.deadline = 'Vui lòng chọn hạn ứng tuyển.';
    else {
      const selectedDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        newErrors.deadline = 'Hạn ứng tuyển phải là ngày trong tương lai.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        candidateRequirements: formData.candidateRequirements.trim(),
        gradeTarget: Number(formData.gradeTarget),
        deadline: formData.deadline,
        departmentTargets: formData.departmentTargets.map((item) => ({
          departmentId: item.departmentId,
          neededCount: Number(item.neededCount)
        })),
        departmentIds: Array.from(new Set(formData.departmentTargets.map((item) => item.departmentId))),
        maxMembers: totalNeededMembers
      };
      updateMutation.mutate(payload);
    }
  };

  const handleClose = () => {
    onHide();
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="pb-2">
        <Modal.Title className="fw-bold">
          Chỉnh sửa bài đăng dự án
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="py-2 px-4" style={{ overflowX: 'hidden' }}>
        {serverError && <Alert type="danger" className="mb-2">{serverError}</Alert>}

        <form id="updateProjectForm" onSubmit={handleSubmit}>
          {/* Tiêu đề dự án */}
          <div className="mb-2">
            <Input
              label={<span>Tiêu đề dự án <span className="text-danger">*</span></span>}
              name="title"
              placeholder="Nhập tiêu đề dự án..."
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              className="mb-0"
            />
            <div className="d-flex justify-content-between text-muted small">
              <span>{formData.title.length}/150</span>
            </div>
          </div>

          {/* Tổng quan dự án */}
          <div className="mb-2">
            <Input
              as="textarea"
              rows={2}
              label={<span>Tổng quan dự án <span className="text-danger">*</span></span>}
              name="description"
              placeholder="Mô tả mục tiêu, công việc và kết quả mong muốn của dự án..."
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              className="mb-0"
            />
            <div className="d-flex justify-content-between text-muted small">
              <span>{formData.description.length}/3000</span>
            </div>
          </div>

          {/* Yêu cầu ứng viên */}
          <div className="mb-2">
            <Input
              as="textarea"
              rows={2}
              label={<span>Yêu cầu ứng viên <span className="text-danger">*</span></span>}
              name="candidateRequirements"
              placeholder="Mô tả kỹ năng, chuyên ngành, kinh nghiệm hoặc yêu cầu đối với thành viên..."
              value={formData.candidateRequirements}
              onChange={handleChange}
              error={errors.candidateRequirements}
              className="mb-0"
            />
            <div className="d-flex justify-content-between text-muted small">
              <span>{formData.candidateRequirements.length}/2000</span>
            </div>
          </div>

          {/* Danh sách ngành cần tuyển & Số lượng */}
          <div className="mb-3 p-3 bg-light rounded-3 border">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold small text-dark">
                Ngành cần tuyển & Chỉ tiêu <span className="text-danger">*</span>
              </span>
              <span className="badge bg-white text-secondary border px-2 py-1 small">
                Tổng cần tuyển: <strong style={{ color: '#ea580c' }}>{totalNeededMembers}</strong> ứng viên
              </span>
            </div>

            {errors.departmentTargets && (
              <div className="text-danger small mb-2">{errors.departmentTargets}</div>
            )}

            <div className="d-flex flex-column gap-2">
              {formData.departmentTargets.map((target, idx) => {
                const deptError = errors[`departmentTarget_${idx}`];
                const countError = errors[`departmentTargetCount_${idx}`];

                return (
                  <div key={idx} className="d-flex align-items-start gap-2">
                    {/* Chọn ngành */}
                    <div className="flex-grow-1">
                      <Form.Select
                        size="sm"
                        value={target.departmentId}
                        onChange={(e) => handleDepartmentTargetChange(idx, 'departmentId', e.target.value)}
                        isInvalid={!!deptError}
                      >
                        <option value="">-- Chọn ngành học --</option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept._id}>
                            {dept.name}
                          </option>
                        ))}
                      </Form.Select>
                      {deptError && (
                        <Form.Control.Feedback type="invalid" className="d-block small" style={{ fontSize: '0.75rem' }}>
                          {deptError}
                        </Form.Control.Feedback>
                      )}
                    </div>

                    {/* Số lượng */}
                    <div style={{ width: '135px' }}>
                      <div className="input-group input-group-sm">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          className={`form-control ${countError ? 'is-invalid' : ''}`}
                          placeholder="Số lượng"
                          value={target.neededCount}
                          onChange={(e) => handleDepartmentTargetChange(idx, 'neededCount', e.target.value)}
                        />
                        <span className="input-group-text text-muted" style={{ fontSize: '0.75rem' }}>người</span>
                      </div>
                      {countError && (
                        <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>
                          {countError}
                        </div>
                      )}
                    </div>

                    {/* Nút xóa dòng (chỉ hiện khi có từ 2 dòng trở lên) */}
                    {formData.departmentTargets.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm p-1 d-flex align-items-center justify-content-center"
                        style={{ width: '31px', height: '31px' }}
                        onClick={() => handleRemoveDepartmentTarget(idx)}
                        title="Xóa ngành này"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Nút thêm ngành */}
            <div className="mt-2 pt-1">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                onClick={handleAddDepartmentTarget}
                style={{ fontSize: '0.8rem' }}
              >
                <Plus size={14} />
                <span>Thêm ngành cần tuyển</span>
              </button>
            </div>
          </div>

          <Row className="g-3">
            <Col md={6}>
              {/* Mục tiêu điểm */}
              <div className="mb-1">
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  label={<span>Mục tiêu điểm dự án <span className="text-danger">*</span></span>}
                  name="gradeTarget"
                  value={formData.gradeTarget}
                  onChange={handleChange}
                  error={errors.gradeTarget}
                  className="mb-0"
                />
              </div>
            </Col>

            <Col md={6}>
              {/* Hạn ứng tuyển */}
              <div className="mb-1">
                <Input
                  type="date"
                  min={todayStr}
                  label={<span>Hạn ứng tuyển <span className="text-danger">*</span></span>}
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  error={errors.deadline}
                  className="mb-0"
                />
              </div>
            </Col>
          </Row>
        </form>
      </Modal.Body>

      <Modal.Footer className="pt-2">
        <Button variant="cancel" onClick={handleClose} disabled={updateMutation.isLoading}>
          Hủy
        </Button>
        <Button
          type="submit"
          form="updateProjectForm"
          variant="primary"
          style={{ backgroundColor: '#ea580c', borderColor: '#ea580c' }}
          loading={updateMutation.isLoading}
        >
          Lưu thay đổi
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
