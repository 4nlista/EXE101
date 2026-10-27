import React, { useState, forwardRef } from 'react';
import { Form } from 'react-bootstrap';
import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';
import Button from './Button';

/**
 * Component Input tái sử dụng cho toàn bộ dự án
 * Tuân thủ quy ước 3 cấp độ báo lỗi: Cấp 1 (Field-level Error) xử lý trực tiếp tại đây
 */
const Input = forwardRef(function Input(
  {
    label,
    required = false,
    error,
    helperText,
    className = 'mb-3',
    inputClassName,
    icon: Icon,
    type = 'text',
    as,
    rows,
    disabled = false,
    isInvalid,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const isTextarea = as === 'textarea';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const hasError = Boolean(error || isInvalid);

  return (
    <Form.Group className={className}>
      {label && (
        <Form.Label className="fw-medium text-dark small w-100 mb-1">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}

      {/* Khối chứa input và icon, tách biệt khỏi phần hiển thị lỗi */}
      <div className="position-relative">
        {Icon && (
          <span
            className={clsx(
              'position-absolute ms-3',
              isTextarea ? 'top-0 mt-3' : 'top-50 translate-middle-y'
            )}
            style={{ zIndex: 10, color: 'var(--text-muted)', pointerEvents: 'none' }}
          >
            <Icon size={18} />
          </span>
        )}

        <Form.Control
          ref={ref}
          as={as}
          rows={rows}
          type={isTextarea ? undefined : currentType}
          disabled={disabled}
          isInvalid={hasError}
          className={clsx(
            Icon && 'ps-5',
            isPassword && !isTextarea && 'pe-5',
            inputClassName
          )}
          {...props}
        />

        {/* Nút bấm ẩn/hiện mật khẩu tự động tích hợp */}
        {isPassword && !isTextarea && (
          <Button
            type="button"
            variant="link"
            className="position-absolute top-50 translate-middle-y border-0 bg-transparent p-0 shadow-none d-flex align-items-center"
            style={{ right: '10px', zIndex: 10, color: 'var(--text-muted)' }}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        )}
      </div>

      {/* Hiển thị lỗi cấp độ Field-level (chữ đỏ ngay dưới ô nhập liệu) */}
      {error && (
        <Form.Control.Feedback type="invalid" className="d-block mt-1 fw-medium">
          {error}
        </Form.Control.Feedback>
      )}

      {/* Chú thích bổ sung cho ô nhập liệu (nếu có và không có lỗi đè) */}
      {helperText && !error && (
        <Form.Text className="text-muted small d-block mt-1">
          {helperText}
        </Form.Text>
      )}
    </Form.Group>
  );
});

export default Input;
