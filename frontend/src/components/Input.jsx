import React from 'react';
import { Form } from 'react-bootstrap';
import clsx from 'clsx';

// Component Input dùng chung, hỗ trợ hiển thị lỗi tại chỗ (Field-level error)
export default function Input({
  label,         // Tên nhãn của ô nhập (VD: "Mật khẩu")
  error,         // Chuỗi thông báo lỗi, nếu có sẽ tự động báo viền đỏ (VD: "Mật khẩu quá ngắn")
  className,     // Các class CSS bổ sung
  icon: Icon,    // Component Icon hiển thị bên trong ô (từ lucide-react)
  ...props       // Các thuộc tính mặc định của thẻ input (type, placeholder, value, onChange...)
}) {
  return (
    <Form.Group className={clsx('mb-3', className)}>
      {/* Hiển thị tiêu đề Label (nếu được truyền vào) */}
      {label && <Form.Label className="fw-medium">{label}</Form.Label>}

      <div className="position-relative">
        {/* Nếu truyền vào Icon, đặt nó ở góc trái ô nhập */}
        {Icon && (
          <span
            className="position-absolute top-50 translate-middle-y ms-3"
            style={{ zIndex: 10, color: 'var(--bs-gray-500)' }}
          >
            <Icon size={18} />
          </span>
        )}

        {/* Thẻ input thực tế */}
        <Form.Control
          // Nếu có Icon thì lùi chữ sang phải (ps-5) để không bị đè lên Icon
          className={clsx(Icon && 'ps-5')}
          // Nếu có chuỗi lỗi (error), Bootstrap sẽ tự bôi đỏ viền
          isInvalid={!!error}
          {...props}
        />

        {/* Thông báo lỗi chữ màu đỏ ở ngay dưới ô nhập */}
        {error && (
          <Form.Control.Feedback type="invalid">
            {error}
          </Form.Control.Feedback>
        )}
      </div>
    </Form.Group>
  );
}
