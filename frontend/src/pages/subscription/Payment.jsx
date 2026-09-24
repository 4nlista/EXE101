import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Spinner, Row, Col, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Copy, Clock } from 'lucide-react';
import Button from '../../components/Button';
import paymentService from '../../services/paymentService';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { TRANSACTION_STATUS } from '../../constants/transactionEnum';

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { fetchMyProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(TRANSACTION_STATUS.PENDING);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
  const [errorMsg, setErrorMsg] = useState('');

  const pollingInterval = useRef(null);
  const countdownInterval = useRef(null);

  useEffect(() => {
    fetchTransaction();
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [orderId]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getTransactionInfo(orderId);
      if (res.success && res.data) {
        setQrData(res.data);

        // Calculate time left (60 mins from createdAt)
        const createdTime = new Date(res.data.createdAt).getTime();
        const now = new Date().getTime();
        const diffInSeconds = Math.floor((createdTime + 60 * 60 * 1000 - now) / 1000);

        if (diffInSeconds <= 0) {
          setPaymentStatus(TRANSACTION_STATUS.FAILED);
          setErrorMsg('Đơn hàng đã hết hạn (quá 60 phút)');
        } else {
          setTimeLeft(diffInSeconds);
          startPolling(orderId);
          startCountdown(diffInSeconds);
        }
      }
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || 'Không tìm thấy giao dịch hoặc giao dịch đã hết hạn');
      setPaymentStatus(TRANSACTION_STATUS.FAILED);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (id) => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    pollingInterval.current = setInterval(async () => {
      try {
        const res = await paymentService.checkPaymentStatus(id);
        if (res.success && res.status !== TRANSACTION_STATUS.PENDING) {
          setPaymentStatus(res.status);
          clearInterval(pollingInterval.current);
          clearInterval(countdownInterval.current);

          if (res.status === TRANSACTION_STATUS.SUCCESS) {
            await fetchMyProfile();
          }
        }
      } catch (error) {
        console.error('Lỗi khi polling trạng thái thanh toán:', error);
      }
    }, 3000);
  };

  const startCountdown = (initialTime) => {
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    let current = initialTime;
    countdownInterval.current = setInterval(() => {
      current -= 1;
      setTimeLeft(current);
      if (current <= 0) {
        clearInterval(countdownInterval.current);
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        setPaymentStatus(TRANSACTION_STATUS.FAILED);
        setErrorMsg('Đơn hàng đã hết hạn (quá 60 phút)');
      }
    }, 1000);
  };

  const handleCancel = async () => {
    try {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      await paymentService.cancelPayment(orderId);
      navigate('/subscription');
    } catch (error) {
      console.error(error);
      navigate('/subscription');
    }
  };

  const handleMockPayment = async () => {
    try {
      await paymentService.mockPayment(orderId);
    } catch (error) {
      console.error(error);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Có thể thêm thư viện Toast ở đây nếu muốn hiển thị thông báo "Đã copy"
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang tải thông tin giao dịch...</p>
      </Container>
    );
  }

  return (
    <Container className="py-1" style={{ maxWidth: '1200px' }}>


      {/* BODY: THÔNG TIN THANH TOÁN CHI TIẾT */}
      <Card className="border-2 shadow-sm rounded-4">
        <Card.Body className="p-0">
          {paymentStatus === TRANSACTION_STATUS.PENDING && qrData && (
            <Row className="g-0">

              {/* CỘT TRÁI: MÃ QR */}
              <Col md={5} className="border-end p-4 p-md-5 d-flex flex-column align-items-center justify-content-center bg-light rounded-start-4">
                <h5 className="fw-bold text-dark mb-4 text-center">Quét Mã QR</h5>

                <div className="bg-white p-2 rounded-3 border mb-4 shadow-sm position-relative">
                  <img src={qrData.qrUrl} alt="Mã VietQR" style={{ width: '100%', maxWidth: '280px', height: 'auto', objectFit: 'contain' }} />
                </div>

                <div className="mb-3 mt-2">
                  <StatusBadge 
                    variant="primary" 
                    isSpinning={true}
                    text="Đang chờ thanh toán..." 
                  />
                </div>

                <div className="d-flex align-items-center text-danger fw-bold fs-5 mt-2">
                  <Clock size={20} className="me-2" />
                  {formatTime(timeLeft)}
                </div>
              </Col>

              {/* CỘT PHẢI: THÔNG TIN CHUYỂN KHOẢN & LƯU Ý */}
              <Col md={7} className="p-2 p-md-3 d-flex flex-column">
                <h5 className="fw-bold text-dark text-center">Thông tin chuyển khoản</h5>

                {/* BẢNG THÔNG TIN CÓ NÚT COPY */}
                <div className="border rounded-3 mb-4 bg-white p-3">

                  {/* Số tiền */}
                  <div className="mb-4">
                    <div className="text-dark fw-bold mb-2">Số tiền <span className="text-danger">*</span></div>
                    <div className="d-flex align-items-center justify-content-between p-3 bg-light border rounded">
                      <div className="fw-bold text-danger fs-4">{qrData.amount.toLocaleString('vi-VN')} đ</div>
                      <button className="btn btn-sm btn-outline-secondary d-flex align-items-center" onClick={() => copyToClipboard(qrData.amount.toString())}>
                        <Copy size={14} className="me-1" /> Copy
                      </button>
                    </div>
                  </div>

                  {/* Nội dung CK */}
                  <div className="mb-2">
                    <div className="text-dark fw-bold mb-2">Nội dung chuyển khoản <span className="text-danger">*</span></div>
                    <div className="d-flex align-items-center justify-content-between p-3 bg-light border rounded">
                      <div className="fw-bold text-primary fs-5">{qrData.content}</div>
                      <button className="btn btn-sm btn-outline-secondary d-flex align-items-center" onClick={() => copyToClipboard(qrData.content)}>
                        <Copy size={14} className="me-1" /> Copy
                      </button>
                    </div>
                  </div>
                </div>

                {/* KHUNG LƯU Ý VÀNG */}
                <div className="bg-warning bg-opacity-10 border border-warning text-dark p-3 rounded-3 mb-4 d-flex align-items-start">
                  <AlertCircle size={20} className="text-danger me-2 flex-shrink-0 mt-1" />
                  <div>
                    Lưu ý: Vui lòng giữ nguyên nội dung chuyển khoản <strong>{qrData.content}</strong> để xác nhận thanh toán tự động.
                  </div>
                </div>

                <div className="border-top d-flex justify-content-between align-items-center">
                  <Button variant="dark" onClick={handleCancel} className="fw-bold">
                    Hủy giao dịch
                  </Button>

                  {/* CHỈ HIỂN THỊ KHI TEST/DEV */}
                  <div className="text-end">
                    <Button variant="success" size="sm" onClick={handleMockPayment} className="shadow-sm">
                      Giả lập thành công
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          )}

          {/* MÀN HÌNH THÀNH CÔNG */}
          {paymentStatus === TRANSACTION_STATUS.SUCCESS && (
            <div className="py-5 text-center px-4">
              <CheckCircle size={90} className="text-success mb-4 mx-auto d-block" />
              <h2 className="fw-bold text-success mb-3">Thanh toán thành công!</h2>
              <p className="text-muted fs-5 mb-5">Hệ thống đã xác nhận giao dịch. Gói dịch vụ của bạn đã được nâng cấp.</p>
              <Button variant="primary" className="px-5 py-3 fw-bold fs-5 shadow-sm rounded-pill" onClick={() => navigate('/subscription')}>
                Về trang Bảng giá
              </Button>
            </div>
          )}

          {/* MÀN HÌNH THẤT BẠI */}
          {paymentStatus === TRANSACTION_STATUS.FAILED && (
            <div className="py-5 text-center px-4">
              <AlertCircle size={90} className="text-danger mb-4 mx-auto d-block" />
              <h2 className="fw-bold text-danger mb-3">Giao dịch đã kết thúc</h2>
              <p className="text-muted fs-5 mb-5">{errorMsg || 'Giao dịch bị từ chối, hết hạn hoặc đã bị hủy.'}</p>
              <Button variant="danger" className="px-5 py-3 fw-bold fs-5 shadow-sm rounded-pill" onClick={() => navigate('/subscription')}>
                Thử lại thanh toán
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Thêm CSS cho border-end responsive */}
      <style>{`
        @media (min-width: 768px) {
          .border-end-md {
            border-right: 1px solid #dee2e6 !important;
          }
        }
      `}</style>
    </Container>
  );
}
