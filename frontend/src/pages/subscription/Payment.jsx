import React, { useState, useEffect, useRef } from 'react';
import { Container, Spinner, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Copy, Clock, ArrowLeft } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import paymentService from '../../services/paymentService';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { TRANSACTION_STATUS } from '../../constants/transactionEnum';
import { toast } from 'react-toastify';

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { fetchMyProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(TRANSACTION_STATUS.PENDING);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
  const [errorMsg, setErrorMsg] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  const pollingInterval = useRef(null);
  const countdownInterval = useRef(null);
  const redirectTimer = useRef(null);

  useEffect(() => {
    fetchTransaction();
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      if (redirectTimer.current) clearInterval(redirectTimer.current);
    };
  }, [orderId]);

  // Tự động xóa QR và chuyển hướng về trang Bảng giá khi đơn hết hạn
  const triggerAutoRedirect = (msg) => {
    setQrData(null); // Xóa ngay ảnh QR để khách không thể quét nhầm đơn cũ
    setPaymentStatus(TRANSACTION_STATUS.FAILED);
    if (msg) setErrorMsg(msg);
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);

    let count = 5;
    setRedirectCountdown(count);
    if (redirectTimer.current) clearInterval(redirectTimer.current);
    redirectTimer.current = setInterval(() => {
      count -= 1;
      setRedirectCountdown(count);
      if (count <= 0) {
        clearInterval(redirectTimer.current);
        navigate('/subscription');
      }
    }, 1000);
  };

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getTransactionInfo(orderId);
      if (res.success && res.data) {
        setQrData(res.data);

        // Tính thời gian còn lại (60 phút từ thời điểm tạo đơn)
        const createdTime = new Date(res.data.createdAt).getTime();
        const now = new Date().getTime();
        const diffInSeconds = Math.floor((createdTime + 60 * 60 * 1000 - now) / 1000);

        if (diffInSeconds <= 0) {
          triggerAutoRedirect('Đơn hàng đã hết hạn thanh toán (quá 60 phút).');
        } else {
          setTimeLeft(diffInSeconds);
          startPolling(orderId);
          startCountdown(diffInSeconds);
        }
      }
    } catch (error) {
      triggerAutoRedirect(error?.response?.data?.message || 'Không tìm thấy giao dịch hoặc giao dịch đã hết hạn.');
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
          if (pollingInterval.current) clearInterval(pollingInterval.current);
          if (countdownInterval.current) clearInterval(countdownInterval.current);

          if (res.status === TRANSACTION_STATUS.SUCCESS) {
            setPaymentStatus(TRANSACTION_STATUS.SUCCESS);
            await fetchMyProfile();
          } else if (res.status === TRANSACTION_STATUS.FAILED) {
            triggerAutoRedirect('Đơn hàng đã hết hạn hoặc bị hủy.');
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
        triggerAutoRedirect('Đơn hàng đã hết hạn thanh toán (quá 60 phút).');
      }
    }, 1000);
  };

  const handleCancel = async () => {
    try {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      if (redirectTimer.current) clearInterval(redirectTimer.current);
      await paymentService.cancelPayment(orderId);
      navigate('/subscription');
    } catch (error) {
      console.error(error);
      navigate('/subscription');
    }
  };

  const handleMockPayment = async () => {
    try {
      toast.info('Đang xử lý giả lập thanh toán...');
      await paymentService.mockPayment(orderId);
      toast.success('Giả lập thành công! Hệ thống đang cập nhật...');
    } catch (error) {
      toast.error(error?.message || 'Giả lập thanh toán thất bại');
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
                      <Button variant="cancel" size="sm" className="d-flex align-items-center text-dark" onClick={() => copyToClipboard(qrData.amount.toString())}>
                        <Copy size={14} className="me-1" /> Copy
                      </Button>
                    </div>
                  </div>

                  {/* Nội dung CK */}
                  <div className="mb-2">
                    <div className="text-dark fw-bold mb-2">Nội dung chuyển khoản <span className="text-danger">*</span></div>
                    <div className="d-flex align-items-center justify-content-between p-3 bg-light border rounded">
                      <div className="fw-bold text-primary fs-5">{qrData.content}</div>
                      <Button variant="cancel" size="sm" className="d-flex align-items-center text-dark" onClick={() => copyToClipboard(qrData.content)}>
                        <Copy size={14} className="me-1" /> Copy
                      </Button>
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
                  <Button variant="cancel" onClick={handleCancel} className="fw-bold text-dark">
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

          {/* MÀN HÌNH THẤT BẠI / HẾT HẠN */}
          {paymentStatus === TRANSACTION_STATUS.FAILED && (
            <div className="py-5 text-center px-4">
              <AlertCircle size={80} className="text-danger mb-4 mx-auto d-block" />
              <h2 className="fw-bold text-danger mb-3">Đơn hàng đã hết hạn thanh toán</h2>
              <p className="text-muted fs-5 mb-2">{errorMsg || 'Mã QR đã hết hạn hiệu lực để đảm bảo an toàn giao dịch.'}</p>
              <p className="text-muted mb-4">
                Đang tự động chuyển về trang Bảng giá sau <strong className="text-danger fs-5">{redirectCountdown ?? 5}s</strong> để bạn tạo đơn thanh toán mới...
              </p>
              <Button
                variant="cancel"
                className="px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 border shadow-sm text-dark"
                onClick={() => {
                  if (redirectTimer.current) clearInterval(redirectTimer.current);
                  navigate('/subscription');
                }}
              >
                <ArrowLeft size={18} /> Quay lại
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
