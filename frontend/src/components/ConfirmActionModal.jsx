import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from './Button';

const ConfirmActionModal = ({ show, onHide, onConfirm, title, message, confirmText = 'Xác nhận', isLoading = false }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-0 text-muted">{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary text-dark" onClick={onHide} disabled={isLoading}>
          Hủy
        </Button>
        <Button variant="primary text-white" onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmActionModal;
