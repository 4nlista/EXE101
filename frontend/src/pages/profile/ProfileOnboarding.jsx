import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
import axios from '../../services/axios';

const ProfileOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dữ liệu master data
  const [departments, setDepartments] = useState([]);
  const [majors, setMajors] = useState([]);
  const [skillOptions, setSkillOptions] = useState([]);

  // Form chính
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    address: '',
    semester: 1,
    departmentId: '',
    majorId: '',
    mainSkills: [], // Sẽ lưu dạng mảng object của react-select { value, label } tạm thời
    projectHistory: [],
    gradeGoal: 0.0
  });

  // Modal thêm dự án
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    type: 'personal', // 'personal' | 'group'
    projectName: '',
    description: '',
    startDate: '',
    endDate: '',
    role: 'member',
    task: ''
  });

  // ----------------------------------------
  // FETCH MASTER DATA
  // ----------------------------------------
  useEffect(() => {
    fetchDepartments();
    fetchSkills();
  }, []);

  useEffect(() => {
    if (formData.semester >= 5 && formData.departmentId) {
      fetchMajors(formData.departmentId);
    } else {
      setMajors([]);
      setFormData(prev => ({ ...prev, majorId: '' }));
    }
  }, [formData.semester, formData.departmentId]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/master-data/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching departments', err);
    }
  };

  const fetchMajors = async (departmentId) => {
    try {
      const res = await axios.get(`/api/master-data/majors/${departmentId}`);
      if (res.data.success) {
        setMajors(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching majors', err);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await axios.get('/api/master-data/skills');
      if (res.data.success) {
        // Chuyển array string thành array object cho react-select
        const opts = res.data.data.map(skill => ({ value: skill, label: skill }));
        setSkillOptions(opts);
      }
    } catch (err) {
      console.error('Error fetching skills', err);
    }
  };

  // ----------------------------------------
  // HANDLERS FORM CHÍNH
  // ----------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    // Validate trước khi qua bước mới
    if (currentStep === 1) {
      if (!formData.name || !formData.phone || !formData.dob) {
        return toast.error('Vui lòng điền đủ Tên, SĐT và Ngày sinh');
      }
    }
    if (currentStep === 2) {
      if (!formData.departmentId) {
        return toast.error('Vui lòng chọn Ngành học');
      }
      if (formData.semester >= 5 && !formData.majorId) {
        return toast.error('Vui lòng chọn Chuyên ngành (vì bạn đang học kỳ 5 trở lên)');
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Biến đổi lại dữ liệu để gửi API
      const payload = {
        ...formData,
        mainSkills: formData.mainSkills.map(opt => opt.value), // Chỉ lấy text
        gradeGoal: parseFloat(formData.gradeGoal)
      };

      const res = await axios.put('/api/user/onboarding', payload);
      
      if (res.data.success) {
        toast.success(res.data.message || 'Lưu hồ sơ thành công!');
        // Reload trang hoặc redirect về bảng tin
        window.location.href = '/'; 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu hồ sơ');
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------
  // HANDLERS DỰ ÁN (PROJECT)
  // ----------------------------------------
  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProject = () => {
    if (!projectForm.projectName) {
      return toast.error('Vui lòng nhập tên dự án');
    }
    setFormData(prev => ({
      ...prev,
      projectHistory: [...prev.projectHistory, projectForm]
    }));
    setShowProjectModal(false);
    setProjectForm({
      type: 'personal', projectName: '', description: '', startDate: '', endDate: '', role: 'member', task: ''
    });
  };

  const handleDeleteProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projectHistory: prev.projectHistory.filter((_, i) => i !== index)
    }));
  };

  // ----------------------------------------
  // RENDER UI TỪNG BƯỚC
  // ----------------------------------------
  const renderStepIndicator = () => {
    const steps = ['Cá nhân', 'Học tập', 'Năng lực', 'Mục tiêu'];
    return (
      <div className="d-flex justify-content-between mb-4 position-relative">
        {/* Đường kẻ ngang */}
        <div style={{
          position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', backgroundColor: '#e0e0e0', zIndex: 1
        }}></div>

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
      <Form.Group className="mb-3">
        <Form.Label>Họ và tên *</Form.Label>
        <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nguyễn Văn A" />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Số điện thoại *</Form.Label>
        <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="09xxxxxxx" />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Ngày sinh *</Form.Label>
        <Form.Control type="date" name="dob" value={formData.dob} onChange={handleChange} />
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
        <Form.Label>Kỳ học hiện tại (1 - 9) *</Form.Label>
        <Form.Control type="number" name="semester" min="1" max="9" value={formData.semester} onChange={handleChange} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Ngành học *</Form.Label>
        <Form.Select name="departmentId" value={formData.departmentId} onChange={handleChange}>
          <option value="">-- Chọn ngành học --</option>
          {departments.map(d => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </Form.Select>
      </Form.Group>
      
      {formData.semester >= 5 && (
        <Form.Group className="mb-3 p-3 bg-light rounded border">
          <Form.Label className="text-primary fw-bold">Chuyên ngành * (Dành cho kỳ 5 trở lên)</Form.Label>
          <Form.Select name="majorId" value={formData.majorId} onChange={handleChange}>
            <option value="">-- Chọn chuyên ngành --</option>
            {majors.map(m => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </Form.Select>
        </Form.Group>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h4 className="mb-4 text-center">Hồ sơ năng lực</h4>
      
      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">Các kỹ năng chuyên môn</Form.Label>
        <p className="text-muted small mb-2">Gõ để tìm kiếm. Nếu kỹ năng chưa có, bạn có thể ấn Enter để tạo mới.</p>
        <CreatableSelect
          isMulti
          options={skillOptions}
          value={formData.mainSkills}
          onChange={(newValues) => setFormData(prev => ({ ...prev, mainSkills: newValues }))}
          placeholder="Ví dụ: ReactJS, Figma, Digital Marketing..."
          noOptionsMessage={() => "Không tìm thấy kết quả"}
          formatCreateLabel={(inputValue) => `Tạo mới kỹ năng "${inputValue}"`}
        />
      </Form.Group>

      <div className="d-flex justify-content-between align-items-center mb-3 mt-5">
        <Form.Label className="fw-bold mb-0">Lịch sử dự án</Form.Label>
        <Button variant="outline-primary" size="sm" onClick={() => setShowProjectModal(true)}>
          + Thêm dự án
        </Button>
      </div>

      {formData.projectHistory.length === 0 ? (
        <div className="text-center p-4 bg-light rounded text-muted">
          Bạn chưa thêm dự án nào. Bấm nút Thêm để bắt đầu.
        </div>
      ) : (
        <Table responsive bordered hover size="sm">
          <thead className="table-light">
            <tr>
              <th>Loại</th>
              <th>Tên dự án</th>
              <th>Thời gian</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {formData.projectHistory.map((proj, idx) => (
              <tr key={idx}>
                <td>
                  <span className={`badge ${proj.type === 'personal' ? 'bg-info text-dark' : 'bg-primary'}`}>
                    {proj.type === 'personal' ? 'Cá nhân' : 'Nhóm'}
                  </span>
                </td>
                <td className="fw-medium">{proj.projectName}</td>
                <td>{proj.startDate ? new Date(proj.startDate).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteProject(idx)}>Xóa</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center">
      <h4 className="mb-4">Mục tiêu phấn đấu</h4>
      <p className="text-muted mb-4">Hãy đặt mục tiêu điểm trung bình (GPA) để AI gợi ý lộ trình phù hợp cho bạn.</p>
      
      <Form.Group className="mb-5 mx-auto" style={{ maxWidth: '400px' }}>
        <h1 className="display-4 text-primary fw-bold mb-3">{formData.gradeGoal.toFixed(1)}</h1>
        <Form.Range 
          name="gradeGoal"
          min={0.0} 
          max={4.0} 
          step={0.1}
          value={formData.gradeGoal} 
          onChange={handleChange} 
        />
        <div className="d-flex justify-content-between text-muted small mt-2">
          <span>0.0</span>
          <span>GPA Range</span>
          <span>4.0</span>
        </div>
      </Form.Group>

      <div className="alert alert-info">
        Hồ sơ của bạn đã sẵn sàng! Bấm hoàn thiện để khám phá ngay mạng lưới dự án.
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="p-4 p-sm-5">
                
                {renderStepIndicator()}
                
                <hr className="mb-4" />

                <div className="step-content mb-4" style={{ minHeight: '300px' }}>
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                  {currentStep === 4 && renderStep4()}
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleBack} 
                    disabled={currentStep === 1 || submitting}
                  >
                    Quay lại
                  </Button>
                  
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

      {/* MODAL THÊM DỰ ÁN */}
      <Modal show={showProjectModal} onHide={() => setShowProjectModal(false)} backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>Thêm lịch sử dự án</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Loại dự án</Form.Label>
            <Form.Select name="type" value={projectForm.type} onChange={handleProjectChange}>
              <option value="personal">Dự án Cá nhân</option>
              <option value="group">Dự án Nhóm</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Tên dự án *</Form.Label>
            <Form.Control type="text" name="projectName" value={projectForm.projectName} onChange={handleProjectChange} />
          </Form.Group>
          
          <Row>
            <Col sm={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ngày bắt đầu</Form.Label>
                <Form.Control type="date" name="startDate" value={projectForm.startDate} onChange={handleProjectChange} />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ngày kết thúc</Form.Label>
                <Form.Control type="date" name="endDate" value={projectForm.endDate} onChange={handleProjectChange} />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Mô tả khái quát</Form.Label>
            <Form.Control as="textarea" rows={2} name="description" value={projectForm.description} onChange={handleProjectChange} />
          </Form.Group>

          {projectForm.type === 'group' && (
            <div className="p-3 bg-light border rounded">
              <h6 className="fw-bold mb-3 text-primary">Thông tin làm việc nhóm</h6>
              <Form.Group className="mb-3">
                <Form.Label>Vai trò của bạn</Form.Label>
                <Form.Select name="role" value={projectForm.role} onChange={handleProjectChange}>
                  <option value="member">Thành viên (Member)</option>
                  <option value="leader">Trưởng nhóm (Leader)</option>
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Nhiệm vụ cụ thể</Form.Label>
                <Form.Control as="textarea" rows={2} name="task" value={projectForm.task} onChange={handleProjectChange} placeholder="Ví dụ: Thiết kế Database, Code UI màn hình chính..." />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProjectModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleSaveProject}>Lưu dự án</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProfileOnboarding;
