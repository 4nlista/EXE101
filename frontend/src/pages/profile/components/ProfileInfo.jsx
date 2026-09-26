import React from 'react';
import { Mail, Phone, MapPin, Calendar, Award, User } from 'lucide-react';
import { Card, Form } from 'react-bootstrap';

export default function ProfileInfo({
  profileData,
  isOwner,
  isEditMode,
  editData,
  setEditData,
  privacyData,
  togglePrivacy,
  errors = {}
}) {
  return (
    <Card className="profile-card border-0 mb-3 shadow-sm">
      <Card.Body className="p-3">
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <User size={18} className="text-secondary" />
            Giới thiệu
          </h6>
        </div>

        {/* Email */}
        {(isOwner || profileData.email) && (
          <div className="profile-info-item py-2 border-bottom">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-1 flex-wrap" style={{ fontSize: '0.85rem' }}>
                <Mail size={14} className="text-secondary flex-shrink-0 me-1" />
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
              <div className="d-flex align-items-center gap-1 flex-wrap" style={{ flex: 1, fontSize: '0.85rem' }}>
                <Phone size={14} className="text-secondary flex-shrink-0 me-1" />
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
              <div className="d-flex align-items-center gap-1 flex-wrap" style={{ flex: 1, fontSize: '0.85rem' }}>
                <MapPin size={14} className="text-secondary flex-shrink-0 me-1" />
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
              <div className="d-flex align-items-center gap-1 flex-wrap" style={{ flex: 1, fontSize: '0.85rem' }}>
                <Calendar size={14} className="text-secondary flex-shrink-0 me-1" />
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
        {(isOwner || profileData.gpa !== undefined) && (
          <div className="profile-info-item py-2">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-1 flex-wrap" style={{ flex: 1, fontSize: '0.85rem' }}>
                <Award size={14} className="text-secondary flex-shrink-0 me-1" />
                <span className="fw-bold text-dark me-1">GPA<span className="text-danger">*</span>:</span>
                {isEditMode ? (
                  <div>
                    <Form.Control
                      size="sm"
                      type="number"
                      step="0.1"
                      min="0"
                      max="4.0"
                      value={editData.gpa}
                      onChange={e => {
                        let val = e.target.value;
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          if (num > 4.0) val = '4.0';
                          if (num < 0.0) val = '0.0';
                        }
                        setEditData({ ...editData, gpa: val });
                      }}
                      placeholder="[GPA]"
                      className="d-inline-block py-0 px-2"
                      style={{ width: '85px', height: '28px', fontSize: '0.85rem' }}
                      isInvalid={!!errors.gpa}
                    />
                    {errors.gpa && (
                      <Form.Control.Feedback type="invalid" className="d-block" style={{ fontSize: '0.75rem' }}>
                        {errors.gpa}
                      </Form.Control.Feedback>
                    )}
                  </div>
                ) : (
                  <span className="text-secondary">{profileData.gpa !== undefined && profileData.gpa !== null ? Number(profileData.gpa).toFixed(1) : 'Đã ẩn'}</span>
                )}
              </div>
              {isEditMode && (
                <Form.Check
                  type="switch"
                  id="privacy-gpa"
                  checked={!!privacyData.gpa}
                  onChange={() => togglePrivacy('gpa')}
                  label=""
                  className="ms-2"
                  title={privacyData.gpa ? "Công khai" : "Riêng tư"}
                />
              )}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}


