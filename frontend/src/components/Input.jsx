import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

export default function Input({
  label,
  error,
  className,
  icon: Icon,
  type = 'text',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <Form.Group className={clsx('mb-3', className)}>
      {label && (
        <Form.Label className="fw-medium w-100 mb-1">
          {label}
        </Form.Label>
      )}

      {/* Khối chứa input và icon, tách biệt khỏi phần hiển thị lỗi để tránh lỗi lệch icon (align center) */}
      <div className="position-relative">
        {Icon && (
          <span
            className="position-absolute top-50 translate-middle-y ms-3"
            style={{ zIndex: 10, color: 'var(--bs-gray-500)', pointerEvents: 'none' }}
          >
            <Icon size={18} />
          </span>
        )}

        <Form.Control
          type={currentType}
          className={clsx(Icon && 'ps-5', isPassword && 'pe-5')}
          {...props}
        />

        {/* Nút bấm ẩn hiện mật khẩu tự động tích hợp */}
        {isPassword && (
          <button
            type="button"
            className="position-absolute top-50 translate-middle-y border-0 bg-transparent"
            style={{ right: '10px', zIndex: 10, color: 'var(--bs-gray-500)' }}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {/* Tách Form.Control.Feedback ra ngoài div.position-relative để không làm hỏng chiều cao của div */}
      {error && (
        <Form.Control.Feedback type="invalid" className="d-block mt-1 fw-medium" style={{ fontSize: '0.875rem' }}>
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
}
