import React from 'react';
import { Modal as BootstrapModal } from 'react-bootstrap';
import clsx from 'clsx';

// Bọc lại Bootstrap Modal để dùng chung
const Modal = ({ children, className, ...props }) => {
  return (
    <BootstrapModal className={clsx(className)} {...props}>
      {children}
    </BootstrapModal>
  );
};

Modal.Header = ({ children, className, ...props }) => {
  return (
    <BootstrapModal.Header className={clsx('border-0 pb-0', className)} {...props}>
      {children}
    </BootstrapModal.Header>
  );
};

Modal.Title = ({ children, className, ...props }) => {
  return (
    <BootstrapModal.Title className={clsx('fw-bold fs-4', className)} {...props}>
      {children}
    </BootstrapModal.Title>
  );
};

Modal.Body = ({ children, className, ...props }) => {
  return (
    <BootstrapModal.Body className={clsx('pt-2 px-4 pb-4', className)} {...props}>
      {children}
    </BootstrapModal.Body>
  );
};

Modal.Footer = ({ children, className, ...props }) => {
  return (
    <BootstrapModal.Footer className={clsx('bg-light border-top shadow-sm px-4 py-2 m-0', className)} {...props}>
      {children}
    </BootstrapModal.Footer>
  );
};

export default Modal;
