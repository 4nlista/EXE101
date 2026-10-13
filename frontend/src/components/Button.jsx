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

  // Xử lý variant: Loại bỏ hoàn toàn outline để mọi nút luôn có nền solid rõ ràng
  let rawVariant = variant || 'primary';
  let extraClasses = [];

  // Tách nếu variant bị truyền kèm class (ví dụ "danger text-dark")
  if (typeof rawVariant === 'string' && rawVariant.includes(' ')) {
    const parts = rawVariant.split(' ');
    rawVariant = parts[0];
    extraClasses.push(...parts.slice(1));
  }

  // Triệt tiêu hoàn toàn outline-* sang solid tương ứng (không dùng outline trong suốt)
  if (typeof rawVariant === 'string' && rawVariant.startsWith('outline-')) {
    rawVariant = rawVariant.replace('outline-', '');
    if (rawVariant === 'secondary') rawVariant = 'light';
  }

  let normalizedVariant = rawVariant;
  let contrastClass = '';

  // Kiểm tra xem class truyền vào có yêu cầu chữ đen (text-dark) không
  const hasDarkText = (className && className.includes('text-dark')) || extraClasses.includes('text-dark');

  if (normalizedVariant === 'cancel' || normalizedVariant === 'light') {
    normalizedVariant = 'light';
    contrastClass = 'text-dark border bg-light fw-medium shadow-sm';
  } else if (normalizedVariant === 'warning') {
    contrastClass = 'text-dark fw-medium';
  } else if (hasDarkText) {
    contrastClass = 'text-dark fw-medium';
  } else if (['primary', 'success', 'danger', 'dark', 'secondary'].includes(normalizedVariant)) {
    contrastClass = 'text-white fw-medium';
  }

  return (
    <BootstrapButton
      variant={normalizedVariant}
      className={clsx(fullWidth && 'w-100', contrastClass, extraClasses, className)}
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
