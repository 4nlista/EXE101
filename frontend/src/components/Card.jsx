import React from 'react';
import { Card as BootstrapCard } from 'react-bootstrap';
import clsx from 'clsx';

// Component Card bọc ngoài chuẩn hóa bo góc, đổ bóng và nền trắng cho toàn hệ thống
const Card = ({ children, className, ...props }) => {
  return (
    <BootstrapCard
      className={clsx('border shadow-sm rounded-3 bg-white', className)}
      {...props}
    >
      {children}
    </BootstrapCard>
  );
};

// Phần đầu Card
Card.Header = ({ children, className, ...props }) => {
  return (
    <BootstrapCard.Header
      className={clsx('bg-white border-bottom py-3 px-4 fw-semibold', className)}
      {...props}
    >
      {children}
    </BootstrapCard.Header>
  );
};

// Phần thân Card
Card.Body = ({ children, className, ...props }) => {
  return (
    <BootstrapCard.Body
      className={clsx('p-4', className)}
      {...props}
    >
      {children}
    </BootstrapCard.Body>
  );
};

// Tiêu đề Card
Card.Title = ({ children, className, ...props }) => {
  return (
    <BootstrapCard.Title
      className={clsx('fw-bold mb-2', className)}
      {...props}
    >
      {children}
    </BootstrapCard.Title>
  );
};

// Mô tả / Đoạn văn bản trong Card
Card.Text = ({ children, className, ...props }) => {
  return (
    <BootstrapCard.Text
      className={className}
      {...props}
    >
      {children}
    </BootstrapCard.Text>
  );
};

// Tiêu đề phụ của Card
Card.Subtitle = ({ children, className, ...props }) => {
  return (
    <BootstrapCard.Subtitle
      className={className}
      {...props}
    >
      {children}
    </BootstrapCard.Subtitle>
  );
};

// Hình ảnh trong Card
Card.Img = ({ className, ...props }) => {
  return (
    <BootstrapCard.Img
      className={className}
      {...props}
    />
  );
};

// Phần chân Card
Card.Footer = ({ children, className, ...props }) => {
  return (
    <BootstrapCard.Footer
      className={clsx('bg-light border-top py-3 px-4', className)}
      {...props}
    >
      {children}
    </BootstrapCard.Footer>
  );
};

export default Card;
