import React from 'react';
import { Spinner } from 'react-bootstrap';

export default function StatusBadge({ variant = 'secondary', icon: Icon, isSpinning = false, text }) {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return 'text-dark bg-success bg-opacity-10 border-success border-opacity-25';
      case 'danger':
        return 'text-danger bg-danger bg-opacity-10 border-danger border-opacity-25';
      case 'warning':
        return 'text-warning bg-warning bg-opacity-10 border-warning border-opacity-25';
      case 'primary':
        return 'text-primary bg-primary bg-opacity-10 border-primary border-opacity-25';
      case 'purple':
        return 'text-purple bg-purple bg-opacity-10 border-purple border-opacity-25';
      case 'secondary':
      default:
        return 'text-secondary bg-secondary bg-opacity-10 border-secondary border-opacity-25';
    }
  };

  return (
    <span
      className={`d-inline-flex align-items-center px-3 py-1 rounded-pill border fw-medium text-nowrap ${getColors()}`}
      style={{ fontSize: '0.875rem', lineHeight: '1.2' }}
    >
      {isSpinning && (
        <Spinner animation="border" size="sm" className="me-2 flex-shrink-0" style={{ borderWidth: '2px', width: '14px', height: '14px' }} />
      )}
      {text}
    </span>
  );
}
