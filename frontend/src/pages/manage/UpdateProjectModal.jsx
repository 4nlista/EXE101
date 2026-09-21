import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Alert from '../../components/Alert';
import { masterDataService } from '../../services/masterDataService';
import { updateProject } from '../../services/projectService';
import { toast } from 'react-toastify';

export default function UpdateProjectModal({ show, onHide, project, onSuccess }) {
  const queryClient = useQueryClient();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    candidateRequirements: '',
    departmentIds: '', 
    gradeTarget: '',
    maxMembers: '',
    deadline: ''
  });

  // Errors State
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Fetch Departments
  const { data: deptRes } = useQuery({
    queryKey: ['departments'],
    queryFn: masterDataService.getDepartments,
    staleTime: Infinity,
  });
  const departments = deptRes?.data || [];

  // Initialize form with project data
  useEffect(() => {
    if (project && show) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        candidateRequirements: project.candidateRequirements || '',
        departmentIds: project.departmentIds?.[0]?._id || project.departmentIds?.[0] || '',
        gradeTarget: project.gradeTarget !== undefined ? project.gradeTarget : '',
        maxMembers: project.maxMembers || '',
        deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''
      });
      setErrors({});
      setServerError('');
    }
  }, [project, show]);

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

  const validate = () => {
    const newErrors = {};
    const { title, description, candidateRequirements, departmentIds, gradeTarget, maxMembers, deadline } = formData;

    if (!title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề dự án.';
    else if (title.length > 150) newErrors.title = 'Tiêu đề dự án không vượt quá 150 ký tự.';

    if (!description.trim()) newErrors.description = 'Vui lòng nhập tổng quan dự án.';
    else if (description.length > 3000) newErrors.description = 'Tổng quan dự án không vượt quá 3000 ký tự.';

    if (!candidateRequirements.trim()) newErrors.candidateRequirements = 'Vui lòng nhập yêu cầu ứng viên.';
    else if (candidateRequirements.length > 2000) newErrors.candidateRequirements = 'Yêu cầu ứng viên không vượt quá 2000 ký tự.';

    if (!departmentIds) newErrors.departmentIds = 'Vui lòng chọn ngành học liên quan.';

    if (gradeTarget === '') newErrors.gradeTarget = 'Vui lòng nhập mục tiêu điểm.';
    else if (Number(gradeTarget) < 0 || Number(gradeTarget) > 10) newErrors.gradeTarget = 'Mục tiêu điểm từ 0 đến 10.';

    if (!maxMembers) newErrors.maxMembers = 'Vui lòng chọn số lượng cần tuyển.';
    else if (Number(maxMembers) < 1) newErrors.maxMembers = 'Số lượng tuyển tối thiểu là 1.';

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
        ...formData,
        departmentIds: [formData.departmentIds],
        gradeTarget: Number(formData.gradeTarget),
        maxMembers: Number(formData.maxMembers)
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

          <Row className="g-3">
            <Col md={6}>
              {/* Ngành học */}
              <div className="mb-2">
                <Select
                  label={<span>Ngành học <span className="text-danger">*</span></span>}
                  name="departmentIds"
                  value={formData.departmentIds}
                  onChange={handleChange}
                  error={errors.departmentIds}
                  className="mb-0"
                >
                  <option value="">Chọn ngành học...</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </Select>
              </div>

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
              {/* Số lượng tuyển */}
              <div className="mb-2">
                <Input
                  type="number"
                  min="1"
                  step="1"
                  label={<span>Số lượng tuyển <span className="text-danger">*</span></span>}
                  name="maxMembers"
                  placeholder="Nhập số lượng ứng viên..."
                  value={formData.maxMembers}
                  onChange={handleChange}
                  error={errors.maxMembers}
                  className="mb-0"
                />
              </div>

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
        <Button variant="outline-secondary" onClick={handleClose} disabled={updateMutation.isLoading}>
          Hủy
        </Button>
        <Button
          type="submit"
          form="updateProjectForm"
          variant="primary"
          style={{ backgroundColor: '#ea580c', borderColor: '#ea580c' }}
          disabled={updateMutation.isLoading}
        >
          {updateMutation.isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
