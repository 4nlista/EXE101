import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

/**
 * Modal nhắc nhở người dùng hoàn tất hồ sơ Onboarding trước khi thực hiện hành động cốt lõi
 * @param {boolean} show - Trạng thái hiển thị modal
 * @param {function} onHide - Hàm đóng modal
 * @param {string} actionTitle - Tên hành động cần chặn (VD: 'ứng tuyển vào dự án này', 'tạo bài đăng dự án mới')
 */
export default function OnboardingRequiredModal({
  show,
  onHide,
  actionTitle = 'thực hiện thao tác này'
}) {
  const navigate = useNavigate();

  const handleGoOnboarding = () => {
    onHide();
    navigate('/onboarding');
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-1">
        <div className="d-flex align-items-center gap-2">
          <div
            className="p-2 rounded-circle d-flex align-items-center justify-content-center"
            style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}
          >
            <Sparkles size={20} />
          </div>
          <Modal.Title className="fs-5 fw-bold mb-0 text-dark">
            Cần hoàn tất hồ sơ
          </Modal.Title>
        </div>
      </Modal.Header>

      <Modal.Body className="py-3 px-4">
        <p className="text-secondary mb-3" style={{ fontSize: '0.925rem', lineHeight: '1.6' }}>
          Bạn cần hoàn tất hồ sơ cá nhân (thông tin liên hệ, chuyên ngành, kỹ năng, GPA) trước khi <strong>{actionTitle}</strong> để các thành viên khác có thể kết nối và đánh giá sự phù hợp.
        </p>

        <div className="p-3 bg-light rounded-3 border">
          <div className="small text-secondary">
            ⚡ Chỉ mất khoảng <strong>1 - 2 phút</strong> để hoàn thành 4 bước thiết lập cơ bản.
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-2 pb-3 px-4 d-flex justify-content-end gap-2 bg-transparent">
        <Button variant="cancel" onClick={onHide}>
          Để sau
        </Button>
        <Button
          variant="primary"
          onClick={handleGoOnboarding}
          className="d-inline-flex align-items-center gap-1 shadow-sm"
          style={{ backgroundColor: '#ea580c', borderColor: '#ea580c' }}
        >
          Hoàn tất hồ sơ ngay <ArrowRight size={16} />
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
