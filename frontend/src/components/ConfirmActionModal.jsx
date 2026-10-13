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
  // Chuẩn hóa màu sắc nút xác nhận: nền solid màu nổi bật, chữ đen (text-dark), triệt tiêu cảm giác outline
  const normalizedVariant = (variant || '').toLowerCase();
  let confirmStyle = {
    backgroundColor: '#fed7aa',
    borderColor: '#fb923c',
    color: '#111827'
  };

  if (normalizedVariant.includes('danger')) {
    confirmStyle = {
      backgroundColor: '#fca5a5',
      borderColor: '#f87171',
      color: '#111827'
    };
  } else if (normalizedVariant.includes('warning')) {
    confirmStyle = {
      backgroundColor: '#fde047',
      borderColor: '#eab308',
      color: '#111827'
    };
  } else if (normalizedVariant.includes('success')) {
    confirmStyle = {
      backgroundColor: '#86efac',
      borderColor: '#4ade80',
      color: '#111827'
    };
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold text-dark">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {typeof message === 'string' ? (
          <p className="mb-0 text-secondary">{message}</p>
        ) : (
          message
        )}
      </Modal.Body>
      <Modal.Footer className="border-top-0 pt-0">
        {/* Nút Hủy: nền sáng rõ ràng, viền phân tách, chữ dark (không dùng outline) */}
        <Button variant="cancel" onClick={onHide} disabled={isLoading} className="px-3">
          {cancelText}
        </Button>
        {/* Nút Xác nhận: nền solid rõ nét, chữ đen (text-dark fw-bold), không outline */}
        <Button
          onClick={onConfirm}
          loading={isLoading}
          className="text-dark fw-bold border shadow-sm px-3"
          style={confirmStyle}
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmActionModal;
