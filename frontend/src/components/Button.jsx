import React from 'react';
import { Button as BootstrapButton, Spinner } from 'react-bootstrap';
import clsx from 'clsx';

// Nút bấm dùng chung cho toàn hệ thống — màu sắc lấy từ bootstrap-overrides.css
export default function Button({
  children,          // Nội dung text hoặc icon bên trong nút
  loading = false,   // Trạng thái đang tải (gọi API)
  isLoading,         // Alias hỗ trợ cả isLoading và loading
  loadingText,       // Text hiển thị khi đang loading
  fullWidth = false, // Kéo giãn nút 100% chiều ngang nếu = true
  className,         // Class CSS mở rộng nếu cần
  variant = 'primary', // Biến thể: 'primary', 'outline-primary', 'secondary', 'light', 'cancel', 'danger'...
  ...props           // Các thuộc tính còn lại (size, onClick, type...)
}) {
  const isSpinning = loading || isLoading || false;

  // Tách nếu variant bị truyền kèm class (ví dụ "danger text-dark")
  const [rawVariant = 'primary', ...extraClasses] = String(variant || 'primary').split(' ');

  // Các biến thể nền sáng cũ ('cancel', 'white', 'gray') quy về 'light' (nút phụ trung tính)
  const ALIAS_VARIANTS = { cancel: 'light', white: 'light', gray: 'secondary' };
  const normalizedVariant = ALIAS_VARIANTS[rawVariant] || rawVariant;

  return (
    <BootstrapButton
      variant={normalizedVariant}
      className={clsx(fullWidth && 'w-100', extraClasses, className)}
      disabled={isSpinning || props.disabled}
      type={props.type || 'button'}
      {...props}
    >
      {/* Hiện vòng xoay khi đang xử lý (loading) */}
      {isSpinning && (
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
          className={loadingText || children ? "me-2" : ""}
        />
      )}

      {/* Nội dung thực tế của nút */}
      {isSpinning && loadingText ? loadingText : children}
    </BootstrapButton>
  );
}
