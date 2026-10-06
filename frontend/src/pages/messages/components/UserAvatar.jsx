import React, { useState } from 'react';
import { getInitials } from '../utils/messageHelpers';

// Bảng màu nền pastel cho initials chữ cái mềm mại (chuẩn theo UI mẫu)
const AVATAR_PALETTE = [
  { bg: '#fed7aa', text: '#9a3412' }, // cam pastel
  { bg: '#fde68a', text: '#854d0e' }, // vàng
  { bg: '#e0e7ff', text: '#3730a3' }, // chàm
  { bg: '#dcfce7', text: '#166534' }, // xanh lá
  { bg: '#fce7f3', text: '#9d174d' }, // hồng
  { bg: '#e2e8f0', text: '#334155' }, // xám đá
  { bg: '#f3f4f6', text: '#374151' }  // xám nhẹ
];

// Component Avatar người dùng: lấy từ avatar thật hoặc initials chữ cái và chấm online
export default function UserAvatar({ user, size = 42, showOnline = false, className = '' }) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = user?.avatar;
  const name = user?.name || 'Người dùng';
  const initials = getInitials(name);

  // Tính toán màu nền ngẫu nhiên ổn định dựa trên tên
  const charSum = (name.charCodeAt(0) || 0) + (name.charCodeAt(name.length - 1) || 0);
  const color = AVATAR_PALETTE[charSum % AVATAR_PALETTE.length];

  return (
    <div
      className={`position-relative d-inline-flex flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="rounded-circle object-fit-cover w-100 h-100"
          style={{ border: '1px solid rgba(0,0,0,0.06)' }}
        />
      ) : (
        <div
          className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
          style={{
            width: size,
            height: size,
            backgroundColor: color.bg,
            color: color.text,
            fontSize: size <= 32 ? '11px' : size <= 42 ? '13px' : '15px',
            border: '1px solid rgba(0,0,0,0.05)',
            userSelect: 'none'
          }}
        >
          {initials}
        </div>
      )}

      {showOnline && (
        <span
          className="position-absolute rounded-circle border border-white"
          style={{
            width: size <= 36 ? '9px' : '11px',
            height: size <= 36 ? '9px' : '11px',
            backgroundColor: '#22c55e',
            bottom: '1px',
            right: '1px'
          }}
          title="Đang hoạt động"
        />
      )}
    </div>
  );
}
