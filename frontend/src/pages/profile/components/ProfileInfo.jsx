import React from 'react';
import { Mail, Phone, MapPin, Calendar, Award } from 'lucide-react';
import { Card, Form } from 'react-bootstrap';

export default function ProfileInfo({
  profileData,
  isOwner,
  isEditMode,
  editData,
  setEditData,
  privacyData,
  togglePrivacy
}) {
  return (
    <Card className="profile-card border-0 mb-3 shadow-sm">
      <Card.Body className="p-3">
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
          <h5 className="fw-bold text-dark mb-0 fs-6">Giới thiệu</h5>
        </div>

        {/* Email */}
        {(isOwner || profileData.email) && (
          <div className="profile-info-item py-2 border-bottom">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-1 flex-wrap">
                <Mail size={15} className="text-secondary flex-shrink-0 me-1" />
                <span className="fw-bold text-dark me-1">Email<span className="text-danger">*</span>:</span>
                {isEditMode ? (
                  <span className="text-muted fw-medium">[{profileData.email}]</span>
                ) : (
                  <span className="text-secondary">{profileData.email || 'Đã ẩn'}</span>
                )}
              </div>
              {isEditMode && (
                <Form.Check
                  type="switch"
                  id="privacy-email"
                  checked={!!privacyData.email}
                  onChange={() => togglePrivacy('email')}
                  label=""
                  className="ms-2"
                  title={privacyData.email ? "Công khai" : "Riêng tư"}
                />
              )}
            </div>
          </div>
        )}

        {/* Phone */}
        {(isOwner || profileData.phone) && (
          <div className="profile-info-item py-2 border-bottom">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-1 flex-wrap" style={{ flex: 1 }}>
                <Phone size={15} className="text-secondary flex-shrink-0 me-1" />
                <span className="fw-bold text-dark me-1">Số điện thoại<span className="text-danger">*</span>:</span>
                {isEditMode ? (
                  <Form.Control
                    size="sm"
                    value={editData.phone}
                    onChange={e => setEditData({ ...editData, phone: e.target.value })}
                    placeholder="[Nhập SĐT]"
                    className="d-inline-block py-0 px-2"
                    style={{ width: '150px', height: '28px', fontSize: '0.85rem' }}
                  />
                ) : (
                  <span className="text-secondary">{profileData.phone || 'Đã ẩn'}</span>
                )}
              </div>
              {isEditMode && (
                <Form.Check
                  type="switch"
                  id="privacy-phone"
                  checked={!!privacyData.phone}
                  onChange={() => togglePrivacy('phone')}
                  label=""
                  className="ms-2"
                  title={privacyData.phone ? "Công khai" : "Riêng tư"}
                />
              )}
            </div>
          </div>
        )}

        {/* Address */}
        {(isOwner || profileData.address) && (
          <div className="profile-info-item py-2 border-bottom">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-1 flex-wrap" style={{ flex: 1 }}>
                <MapPin size={15} className="text-secondary flex-shrink-0 me-1" />
                <span className="fw-bold text-dark me-1">Địa chỉ:</span>
                {isEditMode ? (
                  <Form.Control
                    size="sm"
                    value={editData.address}
                    onChange={e => setEditData({ ...editData, address: e.target.value })}
                    placeholder="[Nhập địa chỉ]"
                    className="d-inline-block py-0 px-2"
                    style={{ width: '150px', height: '28px', fontSize: '0.85rem' }}
                  />
                ) : (
                  <span className="text-secondary">{profileData.address || 'Đã ẩn'}</span>
                )}
              </div>
              {isEditMode && (
                <Form.Check
                  type="switch"
                  id="privacy-address"
                  checked={!!privacyData.address}
                  onChange={() => togglePrivacy('address')}
                  label=""
                  className="ms-2"
                  title={privacyData.address ? "Công khai" : "Riêng tư"}
                />
              )}
            </div>
          </div>
        )}

        {/* DOB */}
        {(isOwner || profileData.dob) && (
          <div className="profile-info-item py-2 border-bottom">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-1 flex-wrap" style={{ flex: 1 }}>
                <Calendar size={15} className="text-secondary flex-shrink-0 me-1" />
                <span className="fw-bold text-dark me-1">Ngày sinh<span className="text-danger">*</span>:</span>
                {isEditMode ? (
                  <Form.Control
                    size="sm"
                    type="date"
                    value={editData.dob}
                    onChange={e => setEditData({ ...editData, dob: e.target.value })}
                    className="d-inline-block py-0 px-2"
                    style={{ width: '145px', height: '28px', fontSize: '0.85rem' }}
                  />
                ) : (
                  <span className="text-secondary">{profileData.dob ? new Date(profileData.dob).toLocaleDateString('vi-VN') : 'Đã ẩn'}</span>
                )}
              </div>
              {isEditMode && (
                <Form.Check
                  type="switch"
                  id="privacy-dob"
                  checked={!!privacyData.dob}
                  onChange={() => togglePrivacy('dob')}
                  label=""
                  className="ms-2"
                  title={privacyData.dob ? "Công khai" : "Riêng tư"}
                />
              )}
            </div>
          </div>
        )}

        {/* GPA */}
        {(isOwner || profileData.gradeGoal !== undefined) && (
          <div className="profile-info-item py-2">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-1 flex-wrap" style={{ flex: 1 }}>
                <Award size={15} className="text-secondary flex-shrink-0 me-1" />
                <span className="fw-bold text-dark me-1">GPA<span className="text-danger">*</span>:</span>
                {isEditMode ? (
                  <Form.Control
                    size="sm"
                    type="number"
                    step="0.1"
                    min="0"
                    max="4"
                    value={editData.gradeGoal}
                    onChange={e => setEditData({ ...editData, gradeGoal: e.target.value })}
                    placeholder="[GPA]"
                    className="d-inline-block py-0 px-2"
                    style={{ width: '85px', height: '28px', fontSize: '0.85rem' }}
                  />
                ) : (
                  <span className="text-secondary">{profileData.gradeGoal !== undefined && profileData.gradeGoal !== null ? Number(profileData.gradeGoal).toFixed(1) : 'Đã ẩn'}</span>
                )}
              </div>
              {isEditMode && (
                <Form.Check
                  type="switch"
                  id="privacy-gradeGoal"
                  checked={!!privacyData.gradeGoal}
                  onChange={() => togglePrivacy('gradeGoal')}
                  label=""
                  className="ms-2"
                  title={privacyData.gradeGoal ? "Công khai" : "Riêng tư"}
                />
              )}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}


