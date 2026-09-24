import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Container, Card, Spinner } from 'react-bootstrap';
import { CheckCircle, XCircle } from 'lucide-react';
import paymentService from '../../services/paymentService';
import Button from '../../components/Button';

import { TRANSACTION_STATUS } from '../../constants/transactionEnum';

export default function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading, success, failed
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!location.search) {
        navigate('/subscription');
        return;
      }
      try {
        const res = await paymentService.verifyPayment(location.search);
        if (res.success) {
          setStatus(TRANSACTION_STATUS.SUCCESS);
          setMessage(res.message);
        } else {
          setStatus(TRANSACTION_STATUS.FAILED);
          setMessage(res.message);
        }
      } catch (error) {
        setStatus(TRANSACTION_STATUS.FAILED);
        setMessage(error.response?.data?.message || 'Lỗi xác thực giao dịch');
      }
    };

    verifyPayment();
  }, [location.search, navigate]);

  return (
    <Container className="py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <Card className="text-center shadow border-0" style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Body className="p-5">
          {status === 'loading' && (
            <>
              <Spinner animation="border" variant="primary" className="mb-3" />
              <h5 className="text-muted">Đang xác thực giao dịch...</h5>
            </>
          )}

          {status === TRANSACTION_STATUS.SUCCESS && (
            <>
              <CheckCircle size={60} className="text-success mb-3 mx-auto d-block" />
              <h4 className="fw-bold text-success mb-3">Thanh toán thành công!</h4>
              <p className="text-muted mb-4">{message}</p>
              <Button variant="primary" className="w-100" onClick={() => window.location.href = '/subscription'}>Quay lại Gói dịch vụ</Button>
            </>
          )}

          {status === TRANSACTION_STATUS.FAILED && (
            <>
              <XCircle size={60} className="text-danger mb-3 mx-auto d-block" />
              <h4 className="fw-bold text-danger mb-3">Thanh toán thất bại</h4>
              <p className="text-muted mb-4">{message}</p>
              <Link to="/subscription">
                <Button variant="outline-danger" className="w-100">Thử lại</Button>
              </Link>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
