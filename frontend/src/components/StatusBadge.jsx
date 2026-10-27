import React from 'react';
import { Spinner } from 'react-bootstrap';

// Map các variant cũ (theo tên màu Bootstrap) sang 5 tông trạng thái chuẩn
const VARIANT_TONE = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  primary: 'info',
  purple: 'info',
  neutral: 'neutral',
  secondary: 'neutral',
  light: 'neutral',
  dark: 'neutral'
};

// Component StatusBadge: nền nhạt + chữ cùng tông, không dùng nền đậm
export default function StatusBadge({
  variant = 'secondary',
  icon: Icon,
  isSpinning = false,
  text,
  children,
  className = '',
  style = {},
  ...props
}) {
  const tone = VARIANT_TONE[variant] || 'neutral';
  const content = text ?? children;

  return (
    <span
      className={`status-badge status-badge--${tone} ${className}`}
      style={style}
      {...props}
    >
      {isSpinning && (
        <Spinner animation="border" size="sm" className="flex-shrink-0" style={{ borderWidth: '1px', width: '10px', height: '10px' }} />
      )}
      {Icon && <Icon size={12} />}
      {content}
    </span>
  );
}
