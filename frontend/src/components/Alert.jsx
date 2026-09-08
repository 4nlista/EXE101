import React from 'react';
import { Alert as BootstrapAlert } from 'react-bootstrap';

// Component Alert dùng để báo lỗi ở phạm vi toàn Form (Form-level error)
export default function Alert({ 
  type = 'danger', // Các màu sắc báo hiệu: 'danger' (đỏ), 'success' (xanh), 'warning' (vàng), 'info' (xanh biển)
  children,        // Nội dung chữ bên trong bảng thông báo
  dismissible = false, // Cho phép người dùng bấm [X] để tự tắt bảng hay không
  ...props 
}) {
  // Nếu không truyền chữ gì vào thì không hiển thị bảng này ra màn hình
  if (!children) return null;

  return (
    <BootstrapAlert variant={type} dismissible={dismissible} {...props}>
      {children}
    </BootstrapAlert>
  );
}
