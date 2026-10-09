import React from 'react';
import { Button as BootstrapButton, Spinner } from 'react-bootstrap';
import clsx from 'clsx';

// Nút bấm dùng chung cho toàn hệ thống, tự động nhận màu sắc và chuẩn hóa tương phản CSS
export default function Button({
  children,          // Nội dung text hoặc icon bên trong nút
  loading = false,   // Trạng thái đang tải (gọi API)
  isLoading,         // Alias hỗ trợ cả isLoading và loading
  fullWidth = false, // Kéo giãn nút 100% chiều ngang nếu = true
  className,         // Class CSS mở rộng nếu cần
  variant = 'primary', // Biến thể màu sắc: 'primary', 'secondary', 'success', 'danger', 'cancel', 'light'...
  ...props           // Các thuộc tính còn lại (size, onClick, type...)
}) {
  const isSpinning = loading || isLoading || false;

  // Quy ước tương phản:
  // - Nút Hủy ('cancel') hoặc Nút nền sáng ('light'): nền sáng rõ ràng (#f8fafc hoặc bg-light) kèm viền, chữ PHẢI TỐI (text-dark fw-medium). Tuyệt đối không dùng outline trong suốt.
  // - Nút Hành động ('primary', 'success', 'danger', 'dark', 'secondary'): nền đậm, chữ PHẢI TRẮNG/SÁNG (text-white).
  // - Nút Cảnh báo ('warning'): nền vàng, chữ PHẢI TỐI (text-dark).
  let normalizedVariant = variant;
  let contrastClass = '';

  // Tự động chuẩn hóa nếu có code cũ truyền 'outline-*' để tránh nút trong suốt khó nhìn
  if (typeof normalizedVariant === 'string' && normalizedVariant.startsWith('outline-')) {
    const baseVariant = normalizedVariant.replace('outline-', '');
    if (baseVariant === 'secondary' || baseVariant === 'light') {
      normalizedVariant = 'light';
      contrastClass = 'text-dark border bg-light fw-medium shadow-sm';
    } else {
      normalizedVariant = baseVariant;
      contrastClass = ['warning', 'light'].includes(baseVariant) ? 'text-dark fw-medium' : 'text-white fw-medium';
    }
  } else if (variant === 'cancel') {
    normalizedVariant = 'light';
    contrastClass = 'text-dark border bg-light fw-medium shadow-sm';
  } else if (variant === 'light') {
    contrastClass = 'text-dark border bg-light fw-medium';
  } else if (variant === 'warning') {
    contrastClass = 'text-dark fw-medium';
  } else if (['primary', 'success', 'danger', 'dark', 'secondary'].includes(variant)) {
    contrastClass = 'text-white fw-medium';
  }

  return (
    <BootstrapButton
      variant={normalizedVariant}
      className={clsx(fullWidth && 'w-100', contrastClass, className)}
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
          className="me-2"
        />
      )}

      {/* Nội dung thực tế của nút */}
      {children}
    </BootstrapButton>
  );
}
