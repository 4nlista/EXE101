import React, { useState } from 'react';
import { Container, Card, Form, Button as BsButton } from 'react-bootstrap';
import { Lock, KeyRound, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      // Mock API Call - Replace with real API later
      // await authService.changePassword(formData);
      setTimeout(() => {
        toast.success('Đổi mật khẩu thành công!');
        setLoading(false);
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card className="shadow-sm rounded-2 border-0" style={{ maxWidth: '550px', width: '100%' }}>
        <Card.Body className="p-4 p-md-5">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-dark">Mật khẩu hiện tại</Form.Label>
              <div className="position-relative">
                <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                  <KeyRound size={18} className="text-muted" />
                </div>
                <Form.Control
                  type="password"
                  name="oldPassword"
                  placeholder="Nhập mật khẩu hiện tại"
                  className="rounded-2 shadow-none ps-5 py-2"
                  style={{ border: '1px solid var(--bs-border-color)' }}
                  value={formData.oldPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-dark">Mật khẩu mới</Form.Label>
              <div className="position-relative">
                <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                  <ShieldCheck size={18} className="text-muted" />
                </div>
                <Form.Control
                  type="password"
                  name="newPassword"
                  placeholder="Nhập mật khẩu mới"
                  className="rounded-2 shadow-none ps-5 py-2"
                  style={{ border: '1px solid var(--bs-border-color)' }}
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-dark">Xác nhận mật khẩu mới</Form.Label>
              <div className="position-relative">
                <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                  <ShieldCheck size={18} className="text-muted" />
                </div>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu mới"
                  className="rounded-2 shadow-none ps-5 py-2"
                  style={{ border: '1px solid var(--bs-border-color)' }}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </Form.Group>

            <div className="d-flex gap-3 pt-2">
              <BsButton
                variant="light"
                className="w-50 rounded-2 fw-medium border shadow-sm"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Hủy bỏ
              </BsButton>
              <BsButton
                variant="primary"
                type="submit"
                className="w-50 rounded-2 fw-medium shadow-sm"
                disabled={loading}
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật'}
              </BsButton>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
