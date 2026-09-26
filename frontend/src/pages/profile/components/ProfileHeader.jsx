import React from 'react';
import { Camera, SquarePen, Check, X, MessageSquare, UserPlus, Building, GraduationCap, CalendarDays } from 'lucide-react';
import { Form } from 'react-bootstrap';
import Button from '../../../components/Button';
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
  isSaving,
  handleStartChat
}) {
  const { data: rawDepartments } = useDepartments();
  const { data: rawMajors } = useMajors(editData.departmentId || profileData.departmentId?._id);

  const departments = Array.isArray(rawDepartments) ? rawDepartments : [];
  const majors = Array.isArray(rawMajors) ? rawMajors : [];

  const currentDeptName = profileData.departmentId?.name || 'Chưa cập nhật ngành';
  const currentMajorName = profileData.majorId?.name || 'Chưa cập nhật chuyên ngành';

  return (
    <div className="profile-header">
      {/* Layout ngang: avatar | tên + thông tin | nút hành động */}
      <div className="profile-header-info">

        {/* Avatar */}
        <div className="profile-avatar-wrapper">
          <img
            src={selectedImage ? URL.createObjectURL(selectedImage) : (profileData.avatar || 'https://via.placeholder.com/80')}
            alt="Avatar"
          />
          {isOwner && isEditMode && (
            <label className="profile-avatar-edit-overlay">
              <Camera size={18} />
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
            </label>
          )}
        </div>

        {/* Tên & thông tin */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isEditMode ? (
            <Form.Control
              className="mb-2 fw-bold"
              style={{ fontSize: '1.1rem', maxWidth: '320px' }}
              value={editData.name}
              onChange={e => setEditData({ ...editData, name: e.target.value })}
              placeholder="Họ và tên *"
            />
          ) : (
            <h1 className="profile-name">{profileData.name}</h1>
          )}

          {/* Meta info hàng ngang */}
          <div className="d-flex flex-wrap gap-3 align-items-center mt-1">

            {/* Ngành học */}
            {(isOwner || profileData.departmentId) && (
              <div className="d-flex align-items-center gap-1 text-dark small">
                <Building size={15} className="text-secondary flex-shrink-0" />
                <span className="fw-semibold text-muted">Ngành:</span>
                {isEditMode ? (
                  <Form.Select
                    size="sm"
                    value={editData.departmentId}
                    onChange={e => setEditData({ ...editData, departmentId: e.target.value, majorId: '' })}
                    style={{ maxWidth: '200px' }}
                  >
                    <option value="">-- Chọn ngành --</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </Form.Select>
                ) : (
                  <span className="text-dark fw-medium">{currentDeptName}</span>
                )}
                {isEditMode && (
                  <Form.Check type="switch" id="switch-dept" checked={!!privacyData.departmentId} onChange={() => togglePrivacy('departmentId')} label="" title={privacyData.departmentId ? "Công khai" : "Riêng tư"} />
                )}
              </div>
            )}

            {/* Chuyên ngành */}
            {(isOwner || profileData.majorId) && (
              <div className="d-flex align-items-center gap-1 text-dark small">
                <GraduationCap size={15} className="text-secondary flex-shrink-0" />
                <span className="fw-semibold text-muted">Chuyên ngành:</span>
                {isEditMode ? (
                  <Form.Select
                    size="sm"
                    value={editData.majorId}
                    onChange={e => setEditData({ ...editData, majorId: e.target.value })}
                    style={{ maxWidth: '200px' }}
                  >
                    <option value="">-- Chọn chuyên ngành --</option>
                    {majors.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </Form.Select>
                ) : (
                  <span className="text-dark fw-medium">{currentMajorName}</span>
                )}
                {isEditMode && (
                  <Form.Check type="switch" id="switch-major" checked={!!privacyData.majorId} onChange={() => togglePrivacy('majorId')} label="" title={privacyData.majorId ? "Công khai" : "Riêng tư"} />
                )}
              </div>
            )}

            {/* Kỳ học */}
            {(isOwner || profileData.semester) && (
              <div className="d-flex align-items-center gap-1 text-dark small">
                <CalendarDays size={15} className="text-secondary flex-shrink-0" />
                <span className="fw-semibold text-muted">Kỳ học:</span>
                {isEditMode ? (
                  <Form.Control
                    size="sm"
                    type="number"
                    min="1"
                    max="9"
                    value={editData.semester}
                    onChange={e => setEditData({ ...editData, semester: e.target.value })}
                    style={{ width: '65px' }}
                  />
                ) : (
                  <span className="text-dark fw-medium">Kỳ {profileData.semester || '-'}</span>
                )}
                {isEditMode && (
                  <Form.Check type="switch" id="switch-semester" checked={!!privacyData.semester} onChange={() => togglePrivacy('semester')} label="" title={privacyData.semester ? "Công khai" : "Riêng tư"} />
                )}
              </div>
            )}

          </div>
        </div>

        {/* Nút hành động */}
        <div className="profile-actions">
          {isOwner ? (
            isEditMode ? (
              <>
                <Button variant="secondary" className="fw-semibold text-dark d-flex align-items-center gap-1 px-3 py-2" onClick={handleCancelEdit}>
                  <X size={16} /> Hủy
                </Button>
                <Button variant="primary" className="fw-semibold d-flex align-items-center gap-1 px-3 py-2" onClick={handleSaveProfile} disabled={isSaving}>
                  <Check size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                className="text-white fw-bold d-flex align-items-center gap-2 px-3 py-2"
                onClick={handleEditClick}
              >
                <SquarePen size={16} /> Chỉnh sửa hồ sơ
              </Button>
            )
          ) : (
            <>
              <Button variant="primary" className="fw-semibold d-flex align-items-center gap-1 px-3 py-2" onClick={handleStartChat}><MessageSquare size={16} /> Gửi tin nhắn</Button>
              <Button variant="secondary" className="fw-semibold d-flex align-items-center gap-1 px-3 py-2"><UserPlus size={16} /> Kết nối</Button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
