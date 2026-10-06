import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from './Button';

const ConfirmActionModal = ({ show, onHide, onConfirm, title, message, confirmText = 'Xác nhận', variant = 'primary', isLoading = false }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-0 text-muted">{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark text-white" onClick={onHide} disabled={isLoading}>
          Hủy bỏ
        </Button>
        <Button variant={`${variant} text-dark`} onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmActionModal;
