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
  // Nút xác nhận: 'danger' cho thao tác phá hủy, còn lại dùng màu primary duy nhất
  const confirmVariant = (variant || '').toLowerCase().includes('danger') ? 'danger' : 'primary';

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {typeof message === 'string' ? (
          <p className="mb-0">{message}</p>
        ) : (
          message
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onHide} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} loading={isLoading}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmActionModal;
