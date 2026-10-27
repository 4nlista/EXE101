import React, { forwardRef } from 'react';
import { Form } from 'react-bootstrap';
import clsx from 'clsx';

/**
 * Component Select tái sử dụng cho toàn bộ dự án
 */
const Select = forwardRef(function Select(
  {
    label,
    required = false,
    error,
    helperText,
    className = 'mb-3',
    selectClassName,
    icon: Icon,
    children,
    disabled = false,
    isInvalid,
    ...props
  },
  ref
) {
  const hasError = Boolean(error || isInvalid);

  return (
    <Form.Group className={className}>
      {label && (
        <Form.Label className="fw-medium text-dark small w-100 mb-1">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}

      <div className="position-relative">
        {Icon && (
          <span
            className="position-absolute top-50 translate-middle-y ms-3"
            style={{ zIndex: 10, color: 'var(--text-muted)', pointerEvents: 'none' }}
          >
            <Icon size={18} />
          </span>
        )}

        <Form.Select
          ref={ref}
          disabled={disabled}
          isInvalid={hasError}
          className={clsx(Icon && 'ps-5', selectClassName)}
          {...props}
        >
          {children}
        </Form.Select>
      </div>

      {/* Hiển thị lỗi cấp độ Field-level */}
      {error && (
        <Form.Control.Feedback type="invalid" className="d-block mt-1 fw-medium">
          {error}
        </Form.Control.Feedback>
      )}

      {/* Chú thích bổ sung cho ô lựa chọn */}
      {helperText && !error && (
        <Form.Text className="text-muted small d-block mt-1">
          {helperText}
        </Form.Text>
      )}
    </Form.Group>
  );
});

export default Select;
