import React from 'react';
import { Card, Badge, Form } from 'react-bootstrap';
import Button from '../../../components/Button';
import CustomTable from '../../../components/CustomTable';
import { Plus, SquarePen, Trash2, Eye, Folder } from 'lucide-react';

export default function ProjectHistoryTable({
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getRoleBadge = (role) => {
    if (role === 'leader') return <Badge bg="warning" text="dark">Nhóm trưởng</Badge>;
    if (role === 'member') return <Badge bg="secondary">Thành viên</Badge>;
    return null;
  };

  return (
    <Card className="profile-card border-0 shadow-sm">
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <Folder size={18} className="text-secondary" />
            Lịch sử dự án
          </h6>
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
              <Button size="sm" variant="primary" className="d-flex align-items-center gap-1 px-3 py-1 fw-semibold" onClick={() => openProjectDetail()}>
                <Plus size={15} /> Thêm dự án
              </Button>
            )}
          </div>
        </div>

        <div>
          <CustomTable
            headers={[
              { label: 'Loại', style: { width: '10%' } },
              { label: 'Tên dự án', style: { width: '40%' } },
              { label: 'Ngày bắt đầu', style: { width: '15%' } },
              { label: 'Ngày kết thúc', style: { width: '15%' } },
              { label: 'Thao tác', className: 'text-center', style: { width: '20%' } }
            ]}
          >
            {profileData.projectHistory && profileData.projectHistory.length > 0 ? (
              profileData.projectHistory.map((proj) => (
                <tr
                  key={proj._id}
                  className={selectedProject?._id === proj._id ? 'selected bg-light' : ''}
                  style={{ borderLeft: selectedProject?._id === proj._id ? '4px solid #0d6efd' : '4px solid transparent', cursor: 'pointer', fontSize: '0.85rem' }}
                  onClick={() => openProjectDetail(proj)}
                >
                  <td className="px-3 border-0 border-bottom align-middle">
                    <Badge className="rounded-pill px-3 py-1 fw-semibold text-primary bg-primary bg-opacity-10 border-0" style={{ fontSize: '0.75rem' }}>
                      {proj.type === 'personal' ? 'Cá nhân' : 'Nhóm'}
                    </Badge>
                  </td>
                  <td className="fw-bold text-dark px-3 border-0 border-bottom align-middle">{proj.projectName}</td>
                  <td className="text-muted px-3 border-0 border-bottom align-middle">{formatDate(proj.startDate)}</td>
                  <td className="text-muted px-3 border-0 border-bottom align-middle">{formatDate(proj.endDate)}</td>
                  <td className="px-3 border-0 border-bottom text-center align-middle">
                    {!isEditMode ? (
                      <span className="text-danger fw-medium d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '0.85rem' }}>
                        <Eye size={15} /> Chi tiết
                      </span>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <span className="text-primary fw-medium d-flex align-items-center gap-1" style={{ fontSize: '0.85rem' }}>
                          <SquarePen size={15} /> Sửa
                        </span>
                        <span
                          className="text-danger fw-medium d-flex align-items-center gap-1"
                          style={{ fontSize: '0.85rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(proj._id);
                          }}
                        >
                          <Trash2 size={15} /> Xóa
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-muted p-4 border-0">Chưa có dự án nào</td>
              </tr>
            )}
          </CustomTable>
        </div>
      </Card.Body>
    </Card>
  );
}

