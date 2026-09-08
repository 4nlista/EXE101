import React from 'react';
import { Button as BootstrapButton, Spinner } from 'react-bootstrap';
import clsx from 'clsx';

// Nút bấm dùng chung cho toàn hệ thống, tự động nhận màu sắc và CSS từ React-Bootstrap
export default function Button({
  children,      // Nội dung text hoặc icon bên trong nút
  loading = false, // Trạng thái đang tải (gọi API)
  fullWidth = false, // Kéo giãn nút 100% chiều ngang nếu = true
  className,     // Class CSS mở rộng nếu cần
  ...props       // Các thuộc tính còn lại (variant, size, onClick, type...)
}) {
  return (
    <BootstrapButton
      // Trộn class w-100 (của bootstrap) nếu fullWidth = true
      className={clsx(fullWidth && 'w-100', className)}
      // Khóa nút nếu đang loading hoặc bị disabled từ ngoài truyền vào
      disabled={loading || props.disabled}
      {...props}
    >
      {/* Hiện vòng xoay mượt mà của Bootstrap khi đang xử lý (loading) */}
      {loading && (
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
          className="me-2"
        />
      )}

      {/* Nội dung thực tế của nút */}
      {children}
    </BootstrapButton>
  );
}
