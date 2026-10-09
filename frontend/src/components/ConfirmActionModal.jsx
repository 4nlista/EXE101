import React from 'react';
import Modal from './Modal';
import Button from './Button';

// Modal xác nhận hành động dùng chung cho toàn hệ thống
const ConfirmActionModal = ({
  show,
  onHide,
  onConfirm,
  title = 'Xác nhận hành động',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'primary',
  isLoading = false
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {typeof message === 'string' ? (
          <p className="mb-0 text-muted">{message}</p>
        ) : (
          message
        )}
      </Modal.Body>
      <Modal.Footer>
        {/* Nút Hủy: nền sáng rõ ràng, viền phân tách, chữ dark (không dùng outline) */}
        <Button variant="cancel" onClick={onHide} disabled={isLoading}>
          {cancelText}
        </Button>
        {/* Nút Xác nhận: nền đậm, chữ trắng sáng */}
        <Button variant={variant} onClick={onConfirm} loading={isLoading}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmActionModal;
