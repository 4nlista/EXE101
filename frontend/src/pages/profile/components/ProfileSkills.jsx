import React from 'react';
import { Card, Badge, Form } from 'react-bootstrap';
import CreatableSelect from 'react-select/creatable';
import { useSkills } from '../../../hooks/useMasterData';

export default function ProfileSkills({
  profileData,
  isOwner,
  isEditMode,
  editData,
  setEditData,
  privacyData,
  togglePrivacy
}) {
  const { data: skillOptions = [] } = useSkills();

  if (!isOwner && !profileData.mainSkills) return null;

  // Convert array of strings to/from react-select format [{value, label}]
  const currentSelectValues = Array.isArray(editData.mainSkills)
    ? editData.mainSkills.map(s => (typeof s === 'string' ? { value: s, label: s } : s))
    : (typeof editData.mainSkills === 'string' && editData.mainSkills
      ? editData.mainSkills.split(',').map(s => s.trim()).filter(Boolean).map(s => ({ value: s, label: s }))
      : []);

  const handleSkillsChange = (newValues) => {
    setEditData({
      ...editData,
      mainSkills: newValues ? newValues.map(v => v.value) : []
    });
  };

  return (
    <Card className="profile-card border-0 shadow-sm">
      <Card.Body className="p-3">
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
          <h5 className="fw-bold text-dark mb-0 fs-6">Kỹ năng chuyên môn</h5>
          {isEditMode && (
            <Form.Check
              type="switch"
              id="privacy-mainSkills"
              checked={!!privacyData.mainSkills}
              onChange={() => togglePrivacy('mainSkills')}
              label=""
              className="ms-2"
              title={privacyData.mainSkills ? "Công khai" : "Riêng tư"}
            />
          )}
        </div>
        {isEditMode ? (
          <div>
            <CreatableSelect
              isMulti
              options={skillOptions}
              value={currentSelectValues}
              onChange={handleSkillsChange}
              placeholder="Chọn hoặc nhập kỹ năng..."
              className="basic-multi-select"
              classNamePrefix="select"
            />
            <small className="text-muted d-block mt-1" style={{ fontSize: '0.78rem' }}>
              Gõ để tìm kiếm hoặc nhấn Enter để tạo kỹ năng mới.
            </small>
          </div>
        ) : (
          <div className="d-flex flex-wrap gap-2">
            {profileData.mainSkills && profileData.mainSkills.length > 0 ? (
              profileData.mainSkills.map((skill, idx) => (
                <Badge key={idx} bg="light" text="dark" className="border px-3 py-2 fw-medium rounded-pill" style={{ fontSize: '0.85rem' }}>
                  {skill}
                </Badge>
              ))
            ) : (
              <span className="text-muted small">Chưa có kỹ năng</span>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}


