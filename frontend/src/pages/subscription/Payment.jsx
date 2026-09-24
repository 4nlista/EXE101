import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Spinner, Row, Col, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Copy, Clock } from 'lucide-react';
import Button from '../../components/Button';
import paymentService from '../../services/paymentService';
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
    <Container className="py-2" style={{ maxWidth: '1200px' }}>


      {/* BODY: THÔNG TIN THANH TOÁN CHI TIẾT */}
      <Card className="border-2 shadow-sm rounded-4">
        <Card.Body className="p-0">
          {paymentStatus === TRANSACTION_STATUS.PENDING && qrData && (
            <Row className="g-0">

              {/* CỘT TRÁI: MÃ QR */}
              <Col md={5} className="border-end p-4 p-md-5 d-flex flex-column align-items-center justify-content-center bg-light rounded-start-4">
                <h5 className="fw-bold text-dark mb-4 text-center">Mở App Ngân hàng quét mã QR</h5>

                <div className="bg-white p-2 rounded-3 border mb-4 shadow-sm position-relative">
                  <img src={qrData.qrUrl} alt="Mã VietQR" style={{ width: '100%', maxWidth: '280px', height: 'auto', objectFit: 'contain' }} />
                </div>

                <div className="d-flex justify-content-center align-items-center text-primary mb-3 fw-medium bg-white px-3 py-2 rounded-pill shadow-sm">
                  <Spinner animation="grow" size="sm" className="me-2 text-primary" style={{ width: '1rem', height: '1rem' }} />
                  Đang chờ thanh toán...
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
                <div className="border rounded-3 mb-4 overflow-hidden bg-white">
                  {/* Row 1: Ngân hàng */}
                  <div className="d-flex border-bottom p-3 align-items-center">
                    <div className="text-muted w-25">Ngân hàng</div>
                    <div className="fw-bold flex-grow-1">MBBank</div>
                  </div>
                  {/* Row 2: Thụ hưởng */}
                  <div className="d-flex border-bottom p-3 align-items-center">
                    <div className="text-muted w-25">Thụ hưởng</div>
                    <div className="fw-bold flex-grow-1">NGUYEN BAO AN</div>
                  </div>
                  {/* Row 3: Số tài khoản */}
                  <div className="d-flex border-bottom p-3 align-items-center">
                    <div className="text-muted w-25">Số tài khoản</div>
                    <div className="fw-bold flex-grow-1 text-dark fs-5">0396697192</div>
                    <button className="btn btn-sm btn-light border text-primary" onClick={() => copyToClipboard('0396697192')}>
                      <Copy size={14} className="me-1" /> Copy
                    </button>
                  </div>
                  {/* Row 4: Số tiền */}
                  <div className="d-flex border-bottom p-3 align-items-center">
                    <div className="text-muted w-25">Số tiền</div>
                    <div className="fw-bold flex-grow-1 text-danger fs-5">{qrData.amount.toLocaleString('vi-VN')} đ</div>
                    <button className="btn btn-sm btn-light border text-primary" onClick={() => copyToClipboard(qrData.amount.toString())}>
                      <Copy size={14} className="me-1" /> Copy
                    </button>
                  </div>
                  {/* Row 5: Nội dung */}
                  <div className="d-flex p-3 align-items-center bg-light">
                    <div className="text-muted w-25">Nội dung CK</div>
                    <div className="fw-bold flex-grow-1 text-primary fs-5">{qrData.content}</div>
                    <button className="btn btn-sm btn-light border text-primary" onClick={() => copyToClipboard(qrData.content)}>
                      <Copy size={14} className="me-1" /> Copy
                    </button>
                  </div>
                </div>

                {/* KHUNG LƯU Ý VÀNG */}
                <Alert variant="warning" className="border-warning border-opacity-50 text-dark p-3 rounded-3 mb-auto shadow-sm">
                  <strong><AlertCircle size={16} className="me-1 mb-1 text-danger" />Lưu ý quan trọng:</strong><br />
                  Vui lòng chuyển <strong>chính xác Số tiền</strong> và giữ nguyên <strong>Nội dung chuyển khoản</strong> để hệ thống tự động xác nhận ngay lập tức. Mọi sự sai sót có thể dẫn đến việc treo đơn hàng.
                </Alert>

                <div className="mt-4 pt-4 border-top d-flex justify-content-between align-items-center">
                  <Button variant="outline-dark" onClick={handleCancel} className="fw-bold px-4 py-2">
                    Hủy giao dịch
                  </Button>

                  {/* CHỈ HIỂN THỊ KHI TEST/DEV */}
                  <div className="text-end">
                    <Button variant="success" size="sm" onClick={handleMockPayment} className="shadow-sm">
                      TEST: Giả lập thành công
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
