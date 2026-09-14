import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Offcanvas, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
import { profileService } from '../../services/profileService';
import { useDepartments, useMajors, useSkills } from '../../hooks/useMasterData';
import { useOnboardingMutation } from '../../hooks/useProfile';

const ProfileOnboarding = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(() => {
    const saved = sessionStorage.getItem('onboardingStep');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [errors, setErrors] = useState({});
  const { mutate: submitOnboarding, isPending: submitting } = useOnboardingMutation(setCurrentStep, setErrors);

  // ----------------------------------------
  // LẤY DỮ LIỆU TỪ REACT QUERY
  // ----------------------------------------
  const { data: depsData } = useDepartments();
  const departments = depsData || [];
  const { data: skillsData } = useSkills();
  const skillOptions = skillsData || [];

  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('onboardingForm');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    return {
      name: '', phone: '', dob: '', address: '', semester: 1,
      departmentId: '', majorId: '', mainSkills: [], projectHistory: [], gradeGoal: 0.0
    };
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = useState(-1);
  const [projectForm, setProjectForm] = useState({
    type: 'personal', projectName: '', description: '', startDate: '', endDate: '', role: 'member', task: ''
  });
  const [projectErrors, setProjectErrors] = useState({});

  useEffect(() => {
    sessionStorage.setItem('onboardingForm', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    sessionStorage.setItem('onboardingStep', currentStep.toString());
  }, [currentStep]);

  const { data: majorsData } = useMajors(formData.departmentId);
  const majors = majorsData || [];

  // ----------------------------------------
  // HANDLERS FORM CHÍNH
  // ----------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Nếu đổi ngành học thì reset chuyên ngành
      if (name === 'departmentId') {
        updated.majorId = '';
      }
      return updated;
    });
    // Clear error khi user gõ lại
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        return setErrors(prev => ({ ...prev, avatar: "Chỉ chấp nhận file ảnh (jpg, png)" }));
      }
      if (file.size > 5 * 1024 * 1024) {
        return setErrors(prev => ({ ...prev, avatar: "Ảnh không được vượt quá 5MB" }));
      }
      setErrors(prev => ({ ...prev, avatar: null }));
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleNext = () => {
    let newErrors = {};

    // Validate Bước 1
    if (currentStep === 1) {
      if (!formData.name) {
        newErrors.name = "Họ và tên không được để trống";
      } else if (!/^[\p{L}\s]+$/u.test(formData.name)) {
        newErrors.name = "Họ và tên chỉ được chứa chữ cái và khoảng trắng";
      }

      if (!formData.phone) {
        newErrors.phone = "Số điện thoại không được để trống";
      } else if (!/^0\d{9}$/.test(formData.phone)) {
        newErrors.phone = "SĐT phải bắt đầu bằng 0 và có 10 chữ số";
      }

      if (!formData.dob) {
        newErrors.dob = "Ngày sinh không được để trống";
      } else if (new Date(formData.dob) > new Date()) {
        newErrors.dob = "Ngày sinh không được ở tương lai";
      }
    }

    // Validate Bước 2
    if (currentStep === 2) {
      if (!formData.departmentId) {
        newErrors.departmentId = "Vui lòng chọn Ngành học";
      }
      if (!formData.majorId) {
        newErrors.majorId = "Vui lòng chọn Chuyên ngành";
      }
    }

    // Validate Bước 3
    if (currentStep === 3) {
      if (formData.mainSkills.length === 0) {
        newErrors.mainSkills = "Vui lòng thêm ít nhất 1 kỹ năng";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    // Đóng gói data bằng FormData để gửi file
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('phone', formData.phone);
    payload.append('dob', formData.dob);
    payload.append('address', formData.address);
    payload.append('semester', formData.semester);
    payload.append('departmentId', formData.departmentId);
    if (formData.majorId) payload.append('majorId', formData.majorId);
    payload.append('gradeGoal', formData.gradeGoal);

    // Mảng phức tạp cần stringify khi ném vào FormData
    const skillArray = formData.mainSkills.map(opt => opt.value);
    payload.append('mainSkills', JSON.stringify(skillArray));
    payload.append('projectHistory', JSON.stringify(formData.projectHistory));

    if (avatarFile) {
      payload.append('avatar', avatarFile);
    }

    // React Query thực thi việc call API và lo liệu state loading/error
    submitOnboarding(payload);
  };

  // ----------------------------------------
  // HANDLERS DỰ ÁN (PROJECT)
  // ----------------------------------------
  const handleOpenProject = (idx = -1) => {
    if (idx >= 0) {
      setProjectForm(formData.projectHistory[idx]);
      setEditingProjectIndex(idx);
    } else {
      setProjectForm({ type: 'personal', projectName: '', description: '', startDate: '', endDate: '', role: 'member', task: '' });
      setEditingProjectIndex(-1);
    }
    setShowProjectModal(true);
  };

  const handleCloseProject = () => {
    setShowProjectModal(false);
    setEditingProjectIndex(-1);
  };

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({ ...prev, [name]: value }));
    if (projectErrors[name]) {
      setProjectErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDeleteProject = (idx) => {
    setFormData(prev => {
      const newHistory = [...prev.projectHistory];
      newHistory.splice(idx, 1);
      return { ...prev, projectHistory: newHistory };
    });
  };

  const handleSaveProject = () => {
    let pErr = {};
    if (!projectForm.projectName) pErr.projectName = "Tên dự án không được để trống";
    if (projectForm.type === 'group' && !projectForm.role) pErr.role = "Vui lòng chọn vai trò";

    if (Object.keys(pErr).length > 0) {
      setProjectErrors(pErr);
      return;
    }

    setFormData(prev => {
      const updatedHistory = [...prev.projectHistory];
      if (editingProjectIndex >= 0) {
        updatedHistory[editingProjectIndex] = projectForm;
      } else {
        updatedHistory.push(projectForm);
      }
      return { ...prev, projectHistory: updatedHistory };
    });

    setShowProjectModal(false);
    setProjectForm({
      type: 'personal', projectName: '', description: '', startDate: '', endDate: '', role: 'member', task: ''
    });
    setProjectErrors({});
    setEditingProjectIndex(-1);
  };

  // ----------------------------------------
  // RENDER UI
  // ----------------------------------------
  const renderStepIndicator = () => {
    const steps = ['Cá nhân', 'Học tập', 'Năng lực', 'Mục tiêu'];
    return (
      <div className="d-flex justify-content-between mb-4 position-relative">
        <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', backgroundColor: '#e0e0e0', zIndex: 1 }}></div>
        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;
          return (
            <div key={idx} className="text-center position-relative" style={{ zIndex: 2, width: '60px' }}>
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 text-white font-weight-bold`}
                style={{
                  width: '32px', height: '32px',
                  backgroundColor: isActive ? '#0d6efd' : isCompleted ? '#198754' : '#6c757d'
                }}
              >
                {isCompleted ? '✓' : stepNum}
              </div>
              <small style={{ color: isActive || isCompleted ? '#212529' : '#6c757d', fontWeight: isActive ? '600' : 'normal' }}>
                {label}
              </small>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStep1 = () => (
    <div>
      <h4 className="mb-4 text-center">Thông tin cá nhân</h4>

      <div className="text-center mb-4">
        <div
          className="rounded-circle bg-white d-inline-flex align-items-center justify-content-center border shadow-sm mb-3"
          style={{ width: '120px', height: '120px', overflow: 'hidden' }}
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span className="text-muted small">Chưa có ảnh</span>
          )}
        </div>
        <div>
          <Form.Control
            type="file"
            size="sm"
            className="mx-auto"
            style={{ maxWidth: '250px' }}
            accept="image/*"
            onChange={handleAvatarChange}
            isInvalid={!!errors.avatar}
          />
          <Form.Control.Feedback type="invalid">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="me-1 mb-1" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" /><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" /></svg> {errors.avatar}
          </Form.Control.Feedback>
        </div>
      </div>

      <Form.Group className="mb-3">
        <Form.Label>Họ và tên <span className="text-danger">*</span></Form.Label>
        <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nguyễn Văn A" isInvalid={!!errors.name} />
        <Form.Control.Feedback type="invalid">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="me-1 mb-1" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" /><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" /></svg> {errors.name}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
        <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="09xxxxxxx" isInvalid={!!errors.phone} />
        <Form.Control.Feedback type="invalid">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="me-1 mb-1" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" /><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" /></svg> {errors.phone}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Ngày sinh <span className="text-danger">*</span></Form.Label>
        <Form.Control type="date" name="dob" value={formData.dob} onChange={handleChange} isInvalid={!!errors.dob} />
        <Form.Control.Feedback type="invalid">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="me-1 mb-1" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" /><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" /></svg> {errors.dob}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Địa chỉ</Form.Label>
        <Form.Control as="textarea" rows={2} name="address" value={formData.address} onChange={handleChange} placeholder="Ví dụ: Quận 1, TP.HCM" />
      </Form.Group>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h4 className="mb-4 text-center">Thông tin học tập</h4>
      <Form.Group className="mb-3">
        <Form.Label>Kỳ học hiện tại (1 - 9) <span className="text-danger">*</span></Form.Label>
        <Form.Control type="number" name="semester" min="1" max="9" value={formData.semester} onChange={handleChange} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Ngành học <span className="text-danger">*</span></Form.Label>
        <Form.Select name="departmentId" value={formData.departmentId} onChange={handleChange} isInvalid={!!errors.departmentId}>
          <option value="">-- Chọn ngành học --</option>
          {departments.map(d => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="me-1 mb-1" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" /><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" /></svg> {errors.departmentId}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3 p-3 bg-light rounded border">
        <Form.Label className="text-primary fw-bold">Chuyên ngành <span className="text-danger">*</span></Form.Label>
        <Form.Select name="majorId" value={formData.majorId} onChange={handleChange} isInvalid={!!errors.majorId}>
          <option value="">-- Chọn chuyên ngành --</option>
          {majors.map(m => (
            <option key={m._id} value={m._id}>{m.name}</option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="me-1 mb-1" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" /><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" /></svg> {errors.majorId}
        </Form.Control.Feedback>
      </Form.Group>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h4 className="mb-4 text-center">Hồ sơ năng lực</h4>

      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">Các kỹ năng chuyên môn <span className="text-danger">*</span></Form.Label>
        <p className="text-muted small mb-2">Gõ để tìm kiếm. Nhấn Enter để tạo mới.</p>
        <div style={errors.mainSkills ? { border: '1px solid #dc3545', borderRadius: '5px' } : {}}>
          <CreatableSelect
            isMulti
            options={skillOptions}
            value={formData.mainSkills}
            onChange={(newValues) => {
              setFormData(prev => ({ ...prev, mainSkills: newValues }));
              if (errors.mainSkills) setErrors(prev => ({ ...prev, mainSkills: null }));
            }}
            placeholder="Ví dụ: ReactJS, Figma..."
          />
        </div>
        {errors.mainSkills && <small className="text-danger mt-1 d-block">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="me-1 mb-1" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" /><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" /></svg> {errors.mainSkills}
        </small>}
      </Form.Group>

      <div className="d-flex justify-content-between align-items-center mb-3 mt-5">
        <Form.Label className="fw-bold mb-0">Lịch sử dự án <span className="text-danger">*</span></Form.Label>
        <Button variant="primary" className="rounded-pill shadow-sm px-3 fw-medium" size="sm" onClick={() => handleOpenProject(-1)}>
          + Thêm dự án
        </Button>
      </div>

      {formData.projectHistory.length === 0 ? (
        <div className="text-center p-5 bg-light rounded-4 text-muted border border-dashed">
          Bạn chưa thêm dự án nào. Bấm nút Thêm để bắt đầu.
        </div>
      ) : (
        <div className="border rounded-3 overflow-hidden bg-white">
          <Table responsive hover className="mb-0 align-middle text-nowrap">
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th className="px-4 fw-semibold border-bottom text-muted" style={{ fontSize: '0.85rem', backgroundColor: '#f8f9fa' }}>Loại</th>
                <th className="px-4 fw-semibold border-bottom text-muted" style={{ fontSize: '0.85rem', backgroundColor: '#f8f9fa' }}>Tên dự án</th>
                <th className="px-4 fw-semibold border-bottom text-muted text-end" style={{ fontSize: '0.85rem', backgroundColor: '#f8f9fa' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {formData.projectHistory.map((proj, idx) => (
                <tr key={idx} style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}>
                  <td className="px-4 border-bottom">
                    <span
                      className="rounded-pill px-3 py-1 fw-medium"
                      style={
                        proj.type === 'personal'
                          ? { backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.85rem' }
                          : { backgroundColor: '#eef2ff', color: '#4338ca', fontSize: '0.85rem' }
                      }
                    >
                      {proj.type === 'personal' ? 'Cá nhân' : 'Nhóm'}
                    </span>
                  </td>
                  <td className="px-4 fw-medium text-dark border-bottom">{proj.projectName}</td>
                  <td className="px-4 text-end border-bottom">
                    <div className="d-flex gap-2 justify-content-end">
                      <Button variant="light" size="sm" className="rounded border bg-white d-flex align-items-center justify-content-center text-secondary" onClick={() => handleOpenProject(idx)} title="Chỉnh sửa">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                      </Button>
                      <Button variant="light" size="sm" className="rounded border bg-white d-flex align-items-center justify-content-center text-danger" onClick={() => handleDeleteProject(idx)} title="Xóa">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center">
      <h4 className="mb-4">Mục tiêu phấn đấu</h4>
      <Form.Group className="mb-5 mx-auto" style={{ maxWidth: '400px' }}>
        <h1 className="display-4 text-primary fw-bold mb-3">{Number(formData.gradeGoal).toFixed(1)}</h1>
        <Form.Range
          name="gradeGoal" min={0.0} max={4.0} step={0.1}
          value={formData.gradeGoal} onChange={handleChange}
        />
        <div className="d-flex justify-content-between text-muted small mt-2">
          <span>0.0</span><span>GPA</span><span>4.0</span>
        </div>
      </Form.Group>
      <div className="alert alert-info">Hồ sơ của bạn đã sẵn sàng!</div>
    </div>
  );

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center py-3">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8} xl={7}>
            <Card className="shadow border-0 rounded-4">
              <Card.Body className="p-4 p-sm-5">
                {renderStepIndicator()}
                <hr className="mb-4" />
                <div className="step-content mb-3" style={{ minHeight: '250px' }}>
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                  {currentStep === 4 && renderStep4()}
                </div>
                <div className="d-flex justify-content-between mt-4">
                  <Button variant="outline-secondary" onClick={handleBack} disabled={currentStep === 1 || submitting}>Quay lại</Button>
                  {currentStep < 4 ? (
                    <Button variant="primary" onClick={handleNext}>Tiếp tục</Button>
                  ) : (
                    <Button variant="success" onClick={handleSubmit} disabled={submitting}>
                      {submitting ? 'Đang lưu...' : 'Hoàn thiện hồ sơ'}
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* OFFCANVAS THÊM DỰ ÁN */}
      <Offcanvas show={showProjectModal} onHide={handleCloseProject} placement="end" style={{ width: '450px', borderLeft: 'none', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)' }}>
        <Offcanvas.Header closeButton className="border-bottom px-4 py-3 bg-light">
          <Offcanvas.Title className="fw-bold text-dark d-flex align-items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {editingProjectIndex >= 0 ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="px-4 py-4" style={{ backgroundColor: '#f8fafc' }}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold text-secondary small text-uppercase">Loại dự án</Form.Label>
            <Form.Select name="type" value={projectForm.type} onChange={handleProjectChange} className="border shadow-sm py-2 bg-white">
              <option value="personal">Cá nhân</option>
              <option value="group">Nhóm</option>
            </Form.Select>
          </Form.Group>

          <Card className="border shadow-sm mb-4 rounded-3">
            <Card.Body className="p-4">
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium text-dark">Tên dự án <span className="text-danger">*</span></Form.Label>
                <Form.Control type="text" name="projectName" value={projectForm.projectName} onChange={handleProjectChange} isInvalid={!!projectErrors.projectName} placeholder="Ví dụ: App quản lý kho" className="py-2" />
                <Form.Control.Feedback type="invalid">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="me-1 mb-1" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" /><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" /></svg> {projectErrors.projectName}
                </Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-secondary small fw-medium">Ngày bắt đầu</Form.Label>
                    <Form.Control type="date" name="startDate" value={projectForm.startDate} onChange={handleProjectChange} className="py-2" />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-secondary small fw-medium">Ngày kết thúc</Form.Label>
                    <Form.Control type="date" name="endDate" value={projectForm.endDate} onChange={handleProjectChange} className="py-2" />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-0">
                <Form.Label className="fw-medium text-dark">Mô tả khái quát</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={projectForm.description} onChange={handleProjectChange} placeholder="Dự án này làm về..." className="py-2" />
              </Form.Group>
            </Card.Body>
          </Card>

          {projectForm.type === 'group' && (
            <Card className="border shadow-sm rounded-3 bg-light mb-4">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3 text-secondary d-flex align-items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                  Thông tin nhóm
                </h6>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-medium text-dark">Vai trò của bạn <span className="text-danger">*</span></Form.Label>
                  <Form.Select name="role" value={projectForm.role} onChange={handleProjectChange} isInvalid={!!projectErrors.role} className="border shadow-sm">
                    <option value="member">Thành viên</option>
                    <option value="leader">Trưởng nhóm</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {projectErrors.role}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-0">
                  <Form.Label className="small fw-medium text-dark">Nhiệm vụ cụ thể</Form.Label>
                  <Form.Control as="textarea" rows={3} name="task" value={projectForm.task} onChange={handleProjectChange} placeholder="Tôi đảm nhiệm việc..." className="border shadow-sm" />
                </Form.Group>
              </Card.Body>
            </Card>
          )}

          <div className="d-flex gap-2 justify-content-end mt-4 pt-3">
            <Button variant="outline-secondary" className="rounded-pill px-4" onClick={handleCloseProject}>Hủy bỏ</Button>
            <Button variant="primary" className="rounded-pill px-4 shadow-sm" onClick={handleSaveProject}>
              {editingProjectIndex >= 0 ? 'Cập nhật' : 'Lưu dự án'}
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};
export default ProfileOnboarding;
