import React from 'react';
import { Camera, SquarePen, Check, X, MessageSquare, UserPlus, Building, GraduationCap, Calendar } from 'lucide-react';
import { Button, Form } from 'react-bootstrap';
import { useDepartments, useMajors } from '../../../hooks/useMasterData';

export default function ProfileHeader({
  profileData,
  isOwner,
  isEditMode,
  editData,
  setEditData,
  privacyData,
  togglePrivacy,
  selectedImage,
  handleImageChange,
  fileInputRef,
  handleEditClick,
  handleCancelEdit,
  handleSaveProfile,
  isSaving
}) {
  const { data: departments = [] } = useDepartments();
  const { data: majors = [] } = useMajors(editData.departmentId || profileData.departmentId?._id);

  const currentDeptName = profileData.departmentId?.name || 'Chưa cập nhật ngành';
  const currentMajorName = profileData.majorId?.name || 'Chưa cập nhật chuyên ngành';

  return (
    <div className="profile-header">
      <div className="profile-cover"></div>
      <div className="profile-avatar-wrapper">
        <img
          src={selectedImage ? URL.createObjectURL(selectedImage) : (profileData.avatar || 'https://via.placeholder.com/120')}
          alt="Avatar"
        />
        {isOwner && isEditMode && (
          <label className="profile-avatar-edit-overlay">
            <Camera size={22} />
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
          </label>
        )}
      </div>

      <div className="profile-header-info">
        <div style={{ flex: 1, maxWidth: '600px' }}>
          {isEditMode ? (
            <Form.Control
              className="mb-2 fw-bold fs-5"
              value={editData.name}
              onChange={e => setEditData({ ...editData, name: e.target.value })}
              placeholder="Họ và tên *"
            />
          ) : (
            <h1 className="profile-name">{profileData.name}</h1>
          )}

          {/* Ngành, Chuyên ngành & Kỳ học với monochrome icons & Form.Switch */}
          <div className="d-flex flex-column gap-2 mt-2">
            {/* Ngành học */}
            {(isOwner || profileData.departmentId) && (
              <div className="d-flex align-items-center gap-2 text-dark small">
                <Building size={16} className="text-secondary flex-shrink-0" />
                <span className="fw-semibold">Ngành:</span>
                {isEditMode ? (
                  <Form.Select
                    size="sm"
                    value={editData.departmentId}
                    onChange={e => setEditData({ ...editData, departmentId: e.target.value, majorId: '' })}
                    style={{ maxWidth: '240px' }}
                  >
                    <option value="">-- Chọn ngành học --</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </Form.Select>
                ) : (
                  <span className="text-secondary">{currentDeptName}</span>
                )}
                {isEditMode && (
                  <Form.Check
                    type="switch"
                    id="switch-dept"
                    checked={!!privacyData.departmentId}
                    onChange={() => togglePrivacy('departmentId')}
                    label=""
                    className="ms-2"
                    title={privacyData.departmentId ? "Công khai" : "Riêng tư"}
                  />
                )}
              </div>
            )}

            {/* Chuyên ngành */}
            {(isOwner || profileData.majorId) && (
              <div className="d-flex align-items-center gap-2 text-dark small">
                <GraduationCap size={16} className="text-secondary flex-shrink-0" />
                <span className="fw-semibold">Chuyên ngành:</span>
                {isEditMode ? (
                  <Form.Select
                    size="sm"
                    value={editData.majorId}
                    onChange={e => setEditData({ ...editData, majorId: e.target.value })}
                    style={{ maxWidth: '240px' }}
                  >
                    <option value="">-- Chọn chuyên ngành --</option>
                    {majors.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </Form.Select>
                ) : (
                  <span className="text-secondary">{currentMajorName}</span>
                )}
                {isEditMode && (
                  <Form.Check
                    type="switch"
                    id="switch-major"
                    checked={!!privacyData.majorId}
                    onChange={() => togglePrivacy('majorId')}
                    label=""
                    className="ms-2"
                    title={privacyData.majorId ? "Công khai" : "Riêng tư"}
                  />
                )}
              </div>
            )}

            {/* Kỳ học */}
            {(isOwner || profileData.semester) && (
              <div className="d-flex align-items-center gap-2 text-dark small">
                <Calendar size={16} className="text-secondary flex-shrink-0" />
                <span className="fw-semibold">Kỳ học:</span>
                {isEditMode ? (
                  <Form.Control
                    size="sm"
                    type="number"
                    min="1"
                    max="9"
                    value={editData.semester}
                    onChange={e => setEditData({ ...editData, semester: e.target.value })}
                    style={{ width: '80px' }}
                  />
                ) : (
                  <span className="text-secondary">Kỳ {profileData.semester || '-'}</span>
                )}
                {isEditMode && (
                  <Form.Check
                    type="switch"
                    id="switch-semester"
                    checked={!!privacyData.semester}
                    onChange={() => togglePrivacy('semester')}
                    label=""
                    className="ms-2"
                    title={privacyData.semester ? "Công khai" : "Riêng tư"}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {isOwner ? (
            isEditMode ? (
              <>
                <Button variant="secondary" className="fw-semibold d-flex align-items-center gap-1 px-3 py-2 rounded-3" onClick={handleCancelEdit}>
                  <X size={16} /> Hủy
                </Button>
                <Button variant="success" className="fw-semibold d-flex align-items-center gap-1 px-3 py-2 rounded-3" onClick={handleSaveProfile} disabled={isSaving}>
                  <Check size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </>
            ) : (
              <Button
                variant="warning"
                className="text-white fw-bold d-flex align-items-center gap-2 px-3 py-2 shadow-sm rounded-3"
                style={{ backgroundColor: '#d97706', borderColor: '#d97706' }}
                onClick={handleEditClick}
              >
                <SquarePen size={18} /> Chỉnh sửa hồ sơ
              </Button>
            )
          ) : (
            <>
              <Button variant="primary" className="fw-semibold d-flex align-items-center gap-1 px-3 py-2 rounded-3"><MessageSquare size={16} /> Gửi tin nhắn</Button>
              <Button variant="outline-primary" className="fw-semibold d-flex align-items-center gap-1 px-3 py-2 rounded-3"><UserPlus size={16} /> Kết nối</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


