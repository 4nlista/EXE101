import React from 'react';
import { Card, Badge, Button, Form, Table, Row, Col } from 'react-bootstrap';
import { Plus, SquarePen, Trash2 } from 'lucide-react';

export default function ProjectHistorySplitView({
  profileData,
  isOwner,
  isEditMode,
  privacyData,
  togglePrivacy,
  selectedProject,
  isAddingProject,
  projectForm,
  setProjectForm,
  openProjectDetail,
  closeProjectDetail,
  saveProjectDetail,
  handleDeleteProject
}) {
  if (!isOwner && !profileData.projectHistory) return null;

  return (
    <Card className="profile-card border-0 shadow-sm">
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <h5 className="fw-bold text-dark mb-0 fs-6">Lịch sử dự án</h5>
          <div className="d-flex align-items-center gap-2">
            {isEditMode && (
              <Form.Check 
                type="switch"
                id="privacy-projectHistory"
                checked={!!privacyData.projectHistory}
                onChange={() => togglePrivacy('projectHistory')}
                label=""
                className="me-2"
                title={privacyData.projectHistory ? "Công khai" : "Riêng tư"}
              />
            )}
            {isEditMode && !selectedProject && !isAddingProject && (
              <Button size="sm" variant="success" className="d-flex align-items-center gap-1 px-3 py-1 fw-semibold" style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }} onClick={() => openProjectDetail()}>
                <Plus size={15}/> Thêm dự án
              </Button>
            )}
          </div>
        </div>

        <div className={`split-view-container ${(selectedProject || isAddingProject) ? 'active' : ''}`}>
          
          {/* MASTER TABLE */}
          <div className="split-view-master">
            <div className="table-responsive rounded-2 border overflow-hidden">
              <Table hover className="proj-history-table mb-0 align-middle">
                <thead>
                  <tr style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>
                    <th className="py-2 px-3 text-white fw-semibold" style={{ backgroundColor: '#0f766e' }}>Loại</th>
                    <th className="py-2 px-3 text-white fw-semibold" style={{ backgroundColor: '#0f766e' }}>Tên dự án</th>
                    <th className="py-2 px-3 text-white fw-semibold" style={{ backgroundColor: '#0f766e' }}>Thời gian</th>
                    {isEditMode && <th className="py-2 px-3 text-white fw-semibold text-end" style={{ backgroundColor: '#0f766e' }}>Thao tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {profileData.projectHistory && profileData.projectHistory.length > 0 ? (
                    profileData.projectHistory.map((proj) => (
                      <tr key={proj._id} className={selectedProject?._id === proj._id ? 'selected' : ''}>
                        <td className="px-3">
                          <Badge bg={proj.type === 'personal' ? 'info' : 'primary'} className="rounded-pill px-2 py-1">
                            {proj.type === 'personal' ? 'Cá nhân' : 'Nhóm'}
                          </Badge>
                        </td>
                        <td className="fw-semibold text-dark px-3">{proj.projectName}</td>
                        <td className="text-muted small px-3">
                          {proj.startDate ? new Date(proj.startDate).getFullYear() : '?'} - {proj.endDate ? new Date(proj.endDate).getFullYear() : 'Hiện tại'}
                        </td>
                        {isEditMode && (
                          <td className="text-end px-3">
                            <Button 
                              size="sm" 
                              variant="light" 
                              className="me-1 border-0 rounded-2" 
                              style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '4px 8px' }}
                              onClick={() => openProjectDetail(proj)}
                              title="Chỉnh sửa"
                            >
                              <SquarePen size={15}/>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="light" 
                              className="border-0 rounded-2" 
                              style={{ backgroundColor: '#ffe4e6', color: '#e11d48', padding: '4px 8px' }}
                              onClick={() => handleDeleteProject(proj._id)}
                              title="Xóa"
                            >
                              <Trash2 size={15}/>
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isEditMode ? 4 : 3} className="text-center text-muted p-4">Chưa có dự án nào</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>

          {/* DETAIL PANEL (Only shows in Edit Mode when selected) */}
          <div className="split-view-detail border rounded-3 bg-light shadow-sm">
            <div className="detail-header p-3 border-bottom d-flex justify-content-between align-items-center bg-white">
              <h6 className="mb-0 fw-bold text-dark">{isAddingProject ? 'Thêm dự án mới' : 'Chỉnh sửa dự án'}</h6>
              <button className="btn-close" onClick={closeProjectDetail}></button>
            </div>
            <div className="detail-body p-3">
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-dark">Tên dự án *</Form.Label>
                <Form.Control size="sm" value={projectForm.projectName || ''} onChange={e => setProjectForm({...projectForm, projectName: e.target.value})} />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-dark">Loại dự án *</Form.Label>
                <Form.Select size="sm" value={projectForm.type || 'personal'} onChange={e => setProjectForm({...projectForm, type: e.target.value})}>
                  <option value="personal">Dự án cá nhân</option>
                  <option value="group">Dự án nhóm</option>
                </Form.Select>
              </Form.Group>

              <Row className="mb-3">
                <Col xs={6}>
                  <Form.Label className="small fw-bold text-dark">Bắt đầu</Form.Label>
                  <Form.Control size="sm" type="date" value={projectForm.startDate || ''} onChange={e => setProjectForm({...projectForm, startDate: e.target.value})} />
                </Col>
                <Col xs={6}>
                  <Form.Label className="small fw-bold text-dark">Kết thúc</Form.Label>
                  <Form.Control size="sm" type="date" value={projectForm.endDate || ''} onChange={e => setProjectForm({...projectForm, endDate: e.target.value})} />
                </Col>
              </Row>

              {projectForm.type === 'group' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-dark">Vai trò</Form.Label>
                    <Form.Select size="sm" value={projectForm.role || 'member'} onChange={e => setProjectForm({...projectForm, role: e.target.value})}>
                      <option value="member">Thành viên</option>
                      <option value="leader">Trưởng nhóm</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-dark">Nhiệm vụ</Form.Label>
                    <Form.Control size="sm" value={projectForm.task || ''} onChange={e => setProjectForm({...projectForm, task: e.target.value})} />
                  </Form.Group>
                </>
              )}

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-dark">Mô tả dự án</Form.Label>
                <Form.Control as="textarea" rows={4} size="sm" value={projectForm.description || ''} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button size="sm" variant="success" style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }} onClick={saveProjectDetail} disabled={!projectForm.projectName}>Lưu dự án</Button>
                <Button size="sm" variant="secondary" onClick={closeProjectDetail}>Hủy</Button>
              </div>
            </div>
          </div>

        </div>
      </Card.Body>
    </Card>
  );
}

