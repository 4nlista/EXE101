import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Modal } from 'react-bootstrap';
import { Check, Star, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../../components/Button';
import paymentService from '../../services/paymentService';
import { useAuth } from '../../contexts/AuthContext';

export default function Subscription() {
  const { currentUser, fetchMyProfile } = useAuth();
  const [loadingType, setLoadingType] = useState(null);

  // States cho SePay QR Modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, success, failed
  
  const pollingInterval = useRef(null);

  const handlePayment = async (packageType, amount) => {
    try {
      setLoadingType(packageType);
      const res = await paymentService.createPayment(packageType, amount);
      if (res.success && res.data) {
        setQrData(res.data);
        setPaymentStatus('pending');
        setShowQrModal(true);
        startPolling(res.data.orderId);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán');
    } finally {
      setLoadingType(null);
    }
  };

  const startPolling = (orderId) => {
    // Clear nếu đang có
    if (pollingInterval.current) clearInterval(pollingInterval.current);

    // Bắt đầu gọi API mỗi 3 giây
    pollingInterval.current = setInterval(async () => {
      try {
        const res = await paymentService.checkPaymentStatus(orderId);
        if (res.success && res.status !== 'pending') {
          // Khi backend trả về trạng thái khác pending (success hoặc failed)
          setPaymentStatus(res.status); // res.status có thể là 'success' hoặc 'failed'
          clearInterval(pollingInterval.current);
          
          if (res.status === 'success') {
            await fetchMyProfile(); // Reload data user để lấy package mới
          }
        }
      } catch (error) {
        console.error('Lỗi khi polling trạng thái:', error);
      }
    }, 3000);
  };

  // Dọn dẹp interval khi đóng component
  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  const handleCloseModal = () => {
    setShowQrModal(false);
    if (pollingInterval.current) clearInterval(pollingInterval.current);
  };

  const isCurrentPackage = (type) => currentUser?.currentPackage === type;

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold mb-3">Nâng cấp tài khoản</h2>
        <p className="text-muted">Chọn gói dịch vụ phù hợp để mở khóa các tính năng tuyệt vời nhất từ hệ thống</p>
      </div>

      <Row className="justify-content-center g-4">
        {/* FREE */}
        <Col md={4}>
          <Card className={`h-100 border-0 shadow-sm ${isCurrentPackage('free') ? 'border-primary border-2' : ''}`}>
            <Card.Body className="p-4 d-flex flex-column">
              <div className="text-center mb-4">
                <h4 className="fw-bold text-dark mb-1">Cơ bản</h4>
                <div className="fs-2 fw-bold text-primary mb-2">0đ <span className="fs-6 text-muted fw-normal">/ tháng</span></div>
                {isCurrentPackage('free') && <Badge bg="primary" className="mb-2">Gói hiện tại</Badge>}
              </div>
              <div className="flex-grow-1">
                <ul className="list-unstyled mb-0">
                  <li className="d-flex align-items-start mb-3 text-muted"><Check size={20} className="text-success me-2 mt-1 flex-shrink-0" /> Xem các bài đăng dự án</li>
                  <li className="d-flex align-items-start mb-3 text-muted"><Check size={20} className="text-success me-2 mt-1 flex-shrink-0" /> Nộp hồ sơ tham gia</li>
                  <li className="d-flex align-items-start mb-3 text-muted"><Check size={20} className="text-success me-2 mt-1 flex-shrink-0" /> Nhắn tin / kết nối</li>
                  <li className="d-flex align-items-start mb-3 text-muted"><Check size={20} className="text-success me-2 mt-1 flex-shrink-0" /> Đăng tối đa 3 dự án / tháng</li>
                </ul>
              </div>
              <Button variant="outline-secondary" className="w-100 mt-4" disabled>Đang sử dụng</Button>
            </Card.Body>
          </Card>
        </Col>

        {/* VIP */}
        <Col md={4}>
          <Card className={`h-100 border-0 shadow ${isCurrentPackage('vip') ? 'border-warning border-2' : 'border-top-warning border-top-4'}`}>
            <Card.Body className="p-4 d-flex flex-column">
              <div className="text-center mb-4">
                <h4 className="fw-bold text-dark mb-1">VIP</h4>
                <div className="fs-2 fw-bold text-warning mb-2">59.000đ <span className="fs-6 text-muted fw-normal">/ tháng</span></div>
                {isCurrentPackage('vip') && <Badge bg="warning" text="dark" className="mb-2">Gói hiện tại</Badge>}
              </div>
              <div className="flex-grow-1">
                <ul className="list-unstyled mb-0">
                  <li className="d-flex align-items-start mb-3"><Check size={20} className="text-success me-2 mt-1 flex-shrink-0" /> <b>Mọi quyền lợi của Cơ bản</b></li>
                  <li className="d-flex align-items-start mb-3"><Check size={20} className="text-success me-2 mt-1 flex-shrink-0" /> Đăng tối đa 10 dự án / tháng</li>
                  <li className="d-flex align-items-start mb-3"><Check size={20} className="text-success me-2 mt-1 flex-shrink-0" /> <span className="text-primary fw-semibold">AI Đề xuất dự án phù hợp</span></li>
                </ul>
              </div>
              <Button 
                variant={isCurrentPackage('vip') ? "outline-warning" : "warning"} 
                className="w-100 mt-4 text-dark fw-bold"
                onClick={() => handlePayment('vip', 59000)}
                disabled={loadingType !== null || isCurrentPackage('premium')}
              >
                {loadingType === 'vip' ? <Spinner size="sm" /> : (isCurrentPackage('vip') ? 'Gia hạn gói' : 'Nâng cấp ngay')}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* PREMIUM */}
        <Col md={4}>
          <Card className={`h-100 border-0 shadow-lg ${isCurrentPackage('premium') ? 'border-danger border-2' : 'bg-dark text-white'}`}>
            <Card.Body className="p-4 d-flex flex-column relative">
              <div className="position-absolute top-0 end-0 p-3"><Star className="text-warning" fill="currentColor" /></div>
              <div className="text-center mb-4">
                <h4 className={`fw-bold mb-1 ${isCurrentPackage('premium') ? 'text-dark' : 'text-white'}`}>PREMIUM</h4>
                <div className={`fs-2 fw-bold mb-2 ${isCurrentPackage('premium') ? 'text-danger' : 'text-danger'}`}>139.000đ <span className="fs-6 opacity-75 fw-normal text-light">/ tháng</span></div>
                {isCurrentPackage('premium') && <Badge bg="danger" className="mb-2">Gói hiện tại</Badge>}
              </div>
              <div className="flex-grow-1">
                <ul className="list-unstyled mb-0">
                  <li className="d-flex align-items-start mb-3"><Check size={20} className="text-success me-2 mt-1 flex-shrink-0" /> <b>Mọi quyền lợi của VIP</b></li>
                  <li className="d-flex align-items-start mb-3"><Check size={20} className="text-success me-2 mt-1 flex-shrink-0" /> Đăng dự án KHÔNG GIỚI HẠN</li>
                  <li className="d-flex align-items-start mb-3"><Check size={20} className="text-success me-2 mt-1 flex-shrink-0" /> <span className="text-warning fw-semibold">AI Match - Phân tích độ phù hợp của Ứng viên tự động</span></li>
                </ul>
              </div>
              <Button 
                variant="danger" 
                className="w-100 mt-4 fw-bold"
                onClick={() => handlePayment('premium', 139000)}
                disabled={loadingType !== null}
              >
                {loadingType === 'premium' ? <Spinner size="sm" /> : (isCurrentPackage('premium') ? 'Gia hạn gói' : 'Nâng cấp ngay')}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal QR Thanh Toán SePay */}
      <Modal show={showQrModal} onHide={handleCloseModal} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Thanh toán bằng QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          {paymentStatus === 'pending' && qrData && (
            <>
              <p className="text-muted mb-4">
                Mở ứng dụng ngân hàng và quét mã bên dưới. <br/>
                Hệ thống sẽ <strong>duyệt tự động</strong> trong 5 giây sau khi bạn chuyển khoản thành công.
              </p>
              
              <div className="bg-light p-3 rounded d-inline-block mb-3 border">
                <img src={qrData.qrUrl} alt="Mã VietQR" style={{ width: '250px', height: '250px', objectFit: 'contain' }} />
              </div>

              <div className="text-start bg-light p-3 rounded mb-3 fs-6">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Số tiền:</span>
                  <strong className="text-danger">{qrData.amount.toLocaleString('vi-VN')} VND</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Nội dung (BẮT BUỘC):</span>
                  <strong>{qrData.content}</strong>
                </div>
              </div>

              <div className="d-flex justify-content-center align-items-center text-primary mt-2">
                <Spinner animation="border" size="sm" className="me-2" />
                <span>Đang chờ thanh toán...</span>
              </div>
            </>
          )}

          {paymentStatus === 'success' && (
            <div className="py-4">
              <CheckCircle size={60} className="text-success mb-3 mx-auto d-block" />
              <h4 className="fw-bold text-success mb-2">Thanh toán thành công!</h4>
              <p className="text-muted">Gói dịch vụ của bạn đã được kích hoạt.</p>
              <Button variant="primary" className="mt-3 px-4" onClick={handleCloseModal}>Xong</Button>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="py-4">
              <AlertCircle size={60} className="text-danger mb-3 mx-auto d-block" />
              <h4 className="fw-bold text-danger mb-2">Thanh toán không hợp lệ</h4>
              <p className="text-muted">Giao dịch của bạn có vấn đề (Ví dụ: Chuyển thiếu tiền). Xin vui lòng liên hệ Admin.</p>
              <Button variant="danger" className="mt-3 px-4" onClick={handleCloseModal}>Đóng</Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
