import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', // Các kiểu: 'primary', 'secondary', 'danger', 'outline', 'ghost'
  size = 'md',         // Kích thước: 'sm', 'md', 'lg'
  loading = false, 
  disabled = false, 
  className = '',
  fullWidth = false,
  style,
  ...props 
}) {
  // Dựa vào các biến truyền vào để sinh ra tên class CSS tương ứng
  const getVariantClass = () => {
    switch(variant) {
      case 'primary': return 'btn-primary';
      case 'secondary': return 'btn-secondary';
      case 'danger': return 'btn-danger';
      case 'outline': return 'btn-outline';
      case 'ghost': return 'btn-ghost';
      default: return 'btn-primary';
    }
  };

  const getSizeClass = () => {
    switch(size) {
      case 'sm': return 'btn-sm';
      case 'lg': return 'btn-lg';
      default: return 'btn-md';
    }
  };

  // Nối các class lại với nhau
  const finalClass = `btn ${getVariantClass()} ${getSizeClass()} ${fullWidth ? 'btn-full' : ''} ${className}`.trim();

  return (
    <button
      type={type}
      className={finalClass}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {/* Nếu đang loading thì hiện vòng xoay quay quay, nếu không thì thôi */}
      {loading && <span className="spinner" style={{ marginRight: '8px' }} />}
      
      {/* Nội dung bên trong nút (chữ hoặc icon) */}
      {children}
    </button>
  );
}
