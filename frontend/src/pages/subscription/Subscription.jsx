import React, { useState } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import paymentService from '../../services/paymentService';
import { useAuth } from '../../contexts/AuthContext';
import { PACKAGE_TYPE } from '../../constants/subscriptionEnum';
import { formatDate, calculateDaysLeft } from '../../utils/formatDate';

// Cấu hình thông tin các gói dịch vụ (Clean SaaS)
const SUBSCRIPTION_PACKAGES = [
  {
    id: PACKAGE_TYPE.FREE,
    title: 'Cơ bản',
    description: 'Dành cho sinh viên bắt đầu tìm kiếm dự án và kết nối nhóm.',
    priceText: 'Miễn phí',
    period: '',
    amount: 0,
    isPopular: false,
    features: [
      'Xem các bài đăng dự án',
      'Nộp hồ sơ ứng tuyển',
      'Nhắn tin và trao đổi trực tiếp',
      'Đăng tối đa 3 dự án / tháng',
    ],
  },
  {
    id: PACKAGE_TYPE.VIP,
    title: 'VIP',
    description: 'Dành cho sinh viên năng động muốn tìm kiếm nhóm nhanh chóng.',
    priceText: '59.000đ',
    period: '/ tháng',
    amount: 59000,
    isPopular: true,
    features: [
      'Mọi quyền lợi của gói Cơ bản',
      'Đăng tối đa 10 dự án / tháng',
      'AI Đề xuất dự án phù hợp nhất',
      'Huy hiệu VIP trên hồ sơ cá nhân',
    ],
  },
  {
    id: PACKAGE_TYPE.PREMIUM,
    title: 'Premium',
    description: 'Dành cho trưởng nhóm, dự án khởi nghiệp hoặc đồ án lớn.',
    priceText: '139.000đ',
    period: '/ tháng',
    amount: 139000,
    isPopular: false,
    features: [
      'Mọi quyền lợi của gói VIP',
      'Đăng dự án KHÔNG GIỚI HẠN',
      'AI Match - Phân tích CV & chấm điểm phù hợp tự động',
      'Hỗ trợ ưu tiên và đẩy tin bài đăng',
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
    <Container className="py-5" style={{ maxWidth: '1100px' }}>
      {/* Header trang */}
      <div className="text-center mb-5">
        <div className="page-header mb-2">
          <h1 className="page-header__title">Gói dịch vụ</h1>
          <p className="page-header__subtitle">
            Chọn gói tài khoản phù hợp với nhu cầu phát triển dự án và kết nối nhóm của bạn.
          </p>
        </div>
      </div>

      {/* Danh sách 3 gói */}
      <Row className="justify-content-center g-4">
        {SUBSCRIPTION_PACKAGES.map((pkg) => {
          const isCurrent = isCurrentPackage(pkg.id);
          const isFree = pkg.id === PACKAGE_TYPE.FREE;
          const isVipDisabled = pkg.id === PACKAGE_TYPE.VIP && isCurrentPackage(PACKAGE_TYPE.PREMIUM);

          return (
            <Col key={pkg.id} lg={4} md={6}>
              <div
                className="h-100 bg-white rounded p-4 d-flex flex-column position-relative"
                style={{
                  border: pkg.isPopular ? '2px solid var(--primary)' : '1px solid var(--border)',
                  boxShadow: pkg.isPopular ? 'var(--shadow-md)' : 'var(--shadow-xs)'
                }}
              >
                {/* Badge Phổ biến */}
                {pkg.isPopular && (
                  <div className="position-absolute" style={{ top: '-12px', left: '50%', transform: 'translateX(-50%)' }}>
                    <span className="status-badge status-badge--warning px-3 py-1 shadow-sm">
                      Phổ biến
                    </span>
                  </div>
                )}

                {/* Tiêu đề & Mô tả */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h3 className="fw-semibold text-dark fs-5 mb-0">{pkg.title}</h3>
                    {isCurrent && (
                      <span className="status-badge status-badge--success">
                        Gói hiện tại
                      </span>
                    )}
                  </div>
                  <p className="text-muted small mb-3" style={{ minHeight: '38px', lineHeight: '1.4' }}>
                    {pkg.description}
                  </p>

                  <div className="d-flex align-items-baseline gap-1">
                    <span className="fs-2 fw-bold text-dark">{pkg.priceText}</span>
                    {pkg.period && <span className="text-muted small">{pkg.period}</span>}
                  </div>

                  {isCurrent && currentUser?.subscriptionEndDate && !isFree && (
                    <div className="text-muted small mt-1">
                      Còn {calculateDaysLeft(currentUser.subscriptionEndDate)} ({formatDate(currentUser.subscriptionEndDate).split(' ')[0]})
                    </div>
                  )}
                </div>

                <hr className="my-0 mb-4" />

                {/* Danh sách tính năng */}
                <div className="flex-grow-1 mb-4">
                  <div className="text-muted small fw-medium text-uppercase mb-3" style={{ letterSpacing: '0.04em' }}>
                    Quyền lợi bao gồm:
                  </div>
                  <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="d-flex align-items-start text-dark small">
                        <Check size={16} className="text-secondary me-2 mt-0.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Nút hành động */}
                <div className="mt-auto pt-2">
                  {isFree ? (
                    <Button
                      variant="secondary"
                      className="w-100 fw-medium"
                      disabled
                    >
                      {isCurrent ? 'Đang sử dụng' : 'Gói mặc định'}
                    </Button>
                  ) : (
                    <Button
                      variant={pkg.isPopular ? 'primary' : 'outline-primary'}
                      className="w-100 fw-medium"
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
              </div>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}
