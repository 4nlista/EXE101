import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import paymentService from '../../services/paymentService';
import { useAuth } from '../../contexts/AuthContext';
import { PACKAGE_TYPE } from '../../constants/subscriptionEnum';
import { TRANSACTION_STATUS } from '../../constants/transactionEnum';
import { formatDate, calculateDaysLeft } from '../../utils/formatDate';

// Cấu hình thông tin các gói dịch vụ (Tái sử dụng dữ liệu - Clean Code)
const SUBSCRIPTION_PACKAGES = [
  {
    id: PACKAGE_TYPE.FREE,
    title: 'Cơ bản',
    priceText: 'Miễn phí',
    period: '',
    amount: 0,
    bgColor: '#f8fafc', // Màu xám xanh nhẹ thanh lịch
    borderColor: '#cbd5e1',
    headerBg: '#e2e8f0',
    hoverClass: 'sub-card-free',
    badgeText: null,
    buttonVariant: 'secondary',
    buttonStyle: { backgroundColor: '#cbd5e1', color: '#475569' },
    features: [
      'Xem các bài đăng dự án',
      'Nộp hồ sơ tham gia',
      'Nhắn tin / kết nối',
      'Đăng tối đa 3 dự án / tháng',
    ],
  },
  {
    id: PACKAGE_TYPE.VIP,
    title: 'VIP',
    priceText: '59.000đ',
    period: '/ tháng',
    amount: 59000,
    bgColor: '#fffbeb', // Màu vàng kem nhẹ nổi bật
    borderColor: '#facc15',
    headerBg: '#fef08a',
    hoverClass: 'sub-card-vip',
    badgeText: 'Phổ biến',
    badgeBg: 'warning',
    buttonVariant: 'warning',
    buttonStyle: { backgroundColor: '#f59e0b', color: '#000000', borderColor: '#f59e0b' },
    features: [
      'Mọi quyền lợi của Cơ bản',
      'Đăng tối đa 10 dự án / tháng',
      'AI Đề xuất dự án phù hợp',
    ],
  },
  {
    id: PACKAGE_TYPE.PREMIUM,
    title: 'PREMIUM',
    priceText: '139.000đ',
    period: '/ tháng',
    amount: 139000,
    bgColor: '#fff1f2', // Màu hồng dâu nhẹ cao cấp
    borderColor: '#f87171',
    headerBg: '#fecdd3',
    hoverClass: 'sub-card-premium',
    badgeText: 'Cao cấp nhất',
    badgeBg: 'danger',
    buttonVariant: 'danger',
    buttonStyle: { backgroundColor: '#770a0aff', color: '#ffffff', borderColor: '#ef4444' },
    features: [
      'Mọi quyền lợi của VIP',
      'Đăng dự án KHÔNG GIỚI HẠN',
      'AI Match - Phân tích độ phù hợp của Ứng viên tự động',
    ],
  },
];

export default function Subscription() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loadingType, setLoadingType] = useState(null);

  // Gửi yêu cầu khởi tạo thanh toán
  const handlePayment = async (packageType, amount) => {
    try {
      setLoadingType(packageType);
      const res = await paymentService.createPayment(packageType, amount);
      if (res.success && res.data && res.data.orderId) {
        navigate(`/payment/${res.data.orderId}`);
      }
    } catch (error) {
      alert(error?.message || error?.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán');
    } finally {
      setLoadingType(null);
    }
  };

  // Kiểm tra gói hiện tại của người dùng
  const isCurrentPackage = (type) => currentUser?.currentPackage === type;

  return (
    <Container className="py-5">
      {/* CSS hiệu ứng hover elevation & đổ bóng theo màu gói */}
      <style>{`
        .sub-card {
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          overflow: hidden;
        }
        .sub-card-free:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 32px rgba(100, 116, 139, 0.22) !important;
          border-color: #cbd5e1 !important;
        }
        .sub-card-vip:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 36px rgba(245, 158, 11, 0.28) !important;
          border-color: #f59e0b !important;
        }
        .sub-card-premium:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 36px rgba(239, 68, 68, 0.3) !important;
          border-color: #ef4444 !important;
        }
      `}</style>

      {/* Header trang */}
      <div className="text-center mb-5">
        <h2 className="fw-bold mb-3 text-dark">Nâng cấp tài khoản</h2>
        <p className="text-muted fs-6" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Chọn gói dịch vụ phù hợp để mở khóa các tính năng tuyệt vời nhất từ hệ thống.
        </p>
      </div>

      {/* Danh sách các Card gói dịch vụ */}
      <Row className="justify-content-center g-4">
        {SUBSCRIPTION_PACKAGES.map((pkg) => {
          const isCurrent = isCurrentPackage(pkg.id);
          const isFree = pkg.id === PACKAGE_TYPE.FREE;
          const isVipDisabled = pkg.id === PACKAGE_TYPE.VIP && isCurrentPackage(PACKAGE_TYPE.PREMIUM);

          return (
            <Col key={pkg.id} md={4}>
              <Card
                className={`h-100 sub-card ${pkg.hoverClass} position-relative`}
                style={{
                  backgroundColor: pkg.bgColor,
                  border: isCurrent ? '2.5px solid #16a34a' : `2px solid ${pkg.borderColor}`,
                }}
              >
                {/* Badge nhãn nổi bật */}
                {pkg.badgeText && (
                  <div className="position-absolute top-0 end-0 p-3" style={{ zIndex: 2 }}>
                    <Badge bg={pkg.badgeBg} text={pkg.badgeBg === 'warning' ? 'dark' : 'white'} className="px-2 py-1 shadow-sm">
                      {pkg.badgeText}
                    </Badge>
                  </div>
                )}

                <Card.Body className="p-4 d-flex flex-column">
                  {/* Khung Tiêu đề & Giá gói với màu nền riêng */}
                  <div className="text-center p-3 mb-4 rounded-3 shadow-sm" style={{ backgroundColor: pkg.headerBg }}>
                    <h4 className="fw-bold text-dark mb-2">{pkg.title}</h4>
                    <div className="fs-2 fw-bold text-dark mb-1">
                      {pkg.priceText}
                      {pkg.period && <span className="fs-6 text-muted fw-normal"> {pkg.period}</span>}
                    </div>
                    {isCurrent ? (
                      <div className="d-flex flex-column align-items-center">
                        <Badge bg="success" className="px-3 py-1 shadow-sm mb-1">Gói hiện tại</Badge>
                        {currentUser?.subscriptionEndDate && !isFree && (
                          <small className="text-dark" style={{ fontSize: '1.0rem' }}>
                            {calculateDaysLeft(currentUser.subscriptionEndDate)} ({formatDate(currentUser.subscriptionEndDate).split(' ')[0]})
                          </small>
                        )}
                      </div>
                    ) : (
                      <div style={{ height: '40px' }}></div>
                    )}
                  </div>

                  {/* Danh sách tính năng */}
                  <div className="flex-grow-1 my-2">
                    <ul className="list-unstyled mb-0">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="d-flex align-items-start mb-3 text-dark">
                          <Check size={18} className="text-success me-2 mt-1 flex-shrink-0" />
                          <span className="fw-medium">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Nút thao tác */}
                  <div className="mt-4 pt-2">
                    {isFree ? (
                      <Button variant="light" style={pkg.buttonStyle} className="w-100 fw-bold border-0 shadow-sm" disabled>
                        {isCurrent ? 'Đang sử dụng' : 'Gói mặc định'}
                      </Button>
                    ) : (
                      <Button
                        variant={pkg.buttonVariant}
                        style={pkg.buttonStyle}
                        className="w-100 fw-bold border-0 shadow-sm"
                        onClick={() => handlePayment(pkg.id, pkg.amount)}
                        disabled={loadingType !== null || isCurrentPackage(pkg.id) || isVipDisabled}
                      >
                        {loadingType === pkg.id ? (
                          <Spinner size="sm" animation="border" />
                        ) : isCurrent ? (
                          'Gia hạn gói'
                        ) : (
                          'Nâng cấp ngay'
                        )}
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

    </Container>
  );
}

