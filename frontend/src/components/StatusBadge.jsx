import React from 'react';
import { Spinner } from 'react-bootstrap';

// Component StatusBadge dùng để hiển thị các huy hiệu trạng thái có màu nền và viền đồng bộ
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
  const getColors = () => {
    switch (variant) {
      case 'success':
        return 'text-success bg-success bg-opacity-10 border-success border-opacity-20';
      case 'danger':
        return 'text-danger bg-danger bg-opacity-10 border-danger border-opacity-20';
      case 'warning':
        return 'text-warning bg-warning bg-opacity-10 border-warning border-opacity-20';
      case 'primary':
        return 'text-primary bg-primary bg-opacity-10 border-primary border-opacity-20';
      case 'purple':
        return 'text-purple bg-purple bg-opacity-10 border-purple border-opacity-20';
      case 'secondary':
      default:
        return 'text-secondary bg-secondary bg-opacity-10 border-secondary border-opacity-20';
    }
  };

  const content = text ?? children;

  return (
    <span
      className={`d-inline-flex align-items-center px-3 py-1 rounded-pill border fw-medium text-nowrap ${getColors()} ${className}`}
      style={{ fontSize: '0.875rem', lineHeight: '1.0', ...style }}
      {...props}
    >
      {isSpinning && (
        <Spinner animation="border" size="sm" className="me-2 flex-shrink-0" style={{ borderWidth: '1px', width: '10px', height: '14px' }} />
      )}
      {Icon && <Icon size={14} className="me-1" />}
      {content}
    </span>
  );
}
