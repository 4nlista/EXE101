import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Plus, SquarePen } from 'lucide-react';
import Button from '../../../components/Button';

export default function ProjectDetailPanel({
  isAddingProject,
  projectForm,
  setProjectForm,
  saveProjectDetail,
  closeProjectDetail
}) {
  return (
    <div className="profile-detail d-flex flex-column">
      <div className="detail-header">
        <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
          <div className="p-1 rounded bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center">
            {isAddingProject ? <Plus size={18} /> : <SquarePen size={18} />}
          </div>
          {isAddingProject ? 'Thêm dự án mới' : 'Chi tiết dự án'}
        </h6>
        <button className="btn-close shadow-none" onClick={closeProjectDetail}></button>
      </div>

      <div className="detail-body flex-grow-1">
        <Form.Group className="mb-1">
          <Form.Label className="fw-bold text-dark mb-1" style={{ fontSize: '0.75rem' }}>Tên dự án <span className="text-danger">*</span></Form.Label>
          <Form.Control
            className="shadow-none fw-medium text-dark"
            size="sm"
            style={{ fontSize: '0.85rem' }}
            placeholder="Nhập tên dự án..."
            value={projectForm.projectName || ''}
            onChange={e => setProjectForm({ ...projectForm, projectName: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-1">
          <Form.Label className="fw-bold text-dark mb-1" style={{ fontSize: '0.75rem' }}>Loại dự án <span className="text-danger">*</span></Form.Label>
          <Form.Select
            className="shadow-none fw-medium text-dark"
            size="sm"
            style={{ fontSize: '0.85rem' }}
            value={projectForm.type || 'personal'}
            onChange={e => setProjectForm({ ...projectForm, type: e.target.value })}
          >
            <option value="personal">Dự án cá nhân</option>
            <option value="group">Dự án nhóm</option>
          </Form.Select>
        </Form.Group>

        <Row className="mb-1">
          <Col xs={6}>
            <Form.Label className="fw-bold text-dark mb-1" style={{ fontSize: '0.75rem' }}>Bắt đầu <span className="text-danger">*</span></Form.Label>
            <Form.Control
              className="shadow-none fw-medium text-dark"
              size="sm"
              style={{ fontSize: '0.85rem' }}
              type="date"
              value={projectForm.startDate || ''}
              onChange={e => setProjectForm({ ...projectForm, startDate: e.target.value })}
            />
          </Col>
          <Col xs={6}>
            <Form.Label className="fw-bold text-dark  mb-1" style={{ fontSize: '0.75rem' }}>Kết thúc <span className="text-danger">*</span></Form.Label>
            <Form.Control
              className="shadow-none fw-medium text-dark"
              size="sm"
              style={{ fontSize: '0.85rem' }}
              type="date"
              value={projectForm.endDate || ''}
              onChange={e => setProjectForm({ ...projectForm, endDate: e.target.value })}
            />
          </Col>
        </Row>

        {projectForm.type === 'group' && (
          <>
            <Form.Group className="">
              <Form.Label className="fw-bold text-dark mb-1" style={{ fontSize: '0.75rem' }}>Vai trò</Form.Label>
              <Form.Select
                className="shadow-none fw-medium text-dark"
                size="sm"
                style={{ fontSize: '0.85rem' }}
                value={projectForm.role || 'member'}
                onChange={e => setProjectForm({ ...projectForm, role: e.target.value })}
              >
                <option value="member">Thành viên</option>
                <option value="leader">Trưởng nhóm</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label className="fw-bold text-dark  mb-1" style={{ fontSize: '0.75rem' }}>Nhiệm vụ</Form.Label>
              <Form.Control
                className="shadow-none fw-medium text-dark"
                size="sm"
                style={{ fontSize: '0.85rem' }}
                placeholder="Ví dụ: Lập trình viên..."
                value={projectForm.task || ''}
                onChange={e => setProjectForm({ ...projectForm, task: e.target.value })}
              />
            </Form.Group>
          </>
        )}

        <Form.Group className="mb-1">
          <Form.Label className="fw-bold text-dark  mb-1" style={{ fontSize: '0.75rem' }}>Mô tả dự án <span className="text-danger">*</span></Form.Label>
          <Form.Control
            className="shadow-none p-2 rounded-2 mt-1 fw-medium text-dark"
            as="textarea"
            rows={4}
            style={{ fontSize: '0.85rem' }}
            placeholder="Mô tả các tính năng chính, kết quả đạt được..."
            value={projectForm.description || ''}
            onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
          />
        </Form.Group>

        <div className="d-flex gap-2 mt-auto pt-1">
          <Button size="sm" variant="primary" className="flex-grow-1 rounded" style={{ fontSize: '0.85rem' }} onClick={saveProjectDetail} disabled={!projectForm.projectName}>{isAddingProject ? 'Thêm dự án' : 'Lưu dự án'}</Button>
          <Button size="sm" variant="light" className="rounded text-dark border" style={{ fontSize: '0.85rem' }} onClick={closeProjectDetail}>Hủy</Button>
        </div>
      </div>
    </div>
  );
}
