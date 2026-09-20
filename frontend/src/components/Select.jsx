import React from 'react';
import { Form } from 'react-bootstrap';
import clsx from 'clsx';

export default function Select({
  label,
  error,
  className,
  icon: Icon,
  children,
  ...props
}) {
  return (
    <Form.Group className={className !== undefined ? className : 'mb-3'}>
      {label && (
        <Form.Label className="fw-bold w-100 mb-1">
          {label}
        </Form.Label>
      )}

      <div className="position-relative">
        {Icon && (
          <span
            className="position-absolute top-50 translate-middle-y ms-3"
            style={{ zIndex: 10, color: 'var(--bs-gray-500)', pointerEvents: 'none' }}
          >
            <Icon size={18} />
          </span>
        )}

        <Form.Select
          className={clsx(Icon && 'ps-5', error && 'is-invalid')}
          {...props}
        >
          {children}
        </Form.Select>
      </div>

      {error && (
        <div className="invalid-feedback d-block mt-1 fw-medium" style={{ fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
    </Form.Group>
  );
}

