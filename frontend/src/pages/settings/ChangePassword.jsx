import React, { useState } from 'react';
import { Container, Card, Form, Button as BsButton } from 'react-bootstrap';
import { Lock, KeyRound, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axiosClient';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/Input';
import Alert from '../../components/Alert';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setFormError('');
    
    let newErrors = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại.';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới.';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
    } else if (formData.newPassword === formData.oldPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại!';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp!';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.put('/auth/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmPassword
      });

      toast.success(response.data.message || 'Đổi mật khẩu thành công! Bạn sẽ bị đăng xuất.');
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      
      // Delay 3s and then logout
      setTimeout(() => {
        logout();
        navigate('/');
      }, 3000);
      
    } catch (error) {
      setFormError(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card className="shadow-sm rounded-2 border-0" style={{ maxWidth: '550px', width: '100%' }}>
        <Card.Body className="p-4 p-md-5">
          <Form onSubmit={handleSubmit} noValidate>
            <Alert type="danger" className="mb-4">{formError}</Alert>
            
            <Input
              label="Mật khẩu hiện tại"
              name="oldPassword"
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
              icon={KeyRound}
              value={formData.oldPassword}
              onChange={handleChange}
              error={errors.oldPassword}
              required
            />

            <Input
              label="Mật khẩu mới"
              name="newPassword"
              type="password"
              placeholder="Nhập mật khẩu mới"
              icon={ShieldCheck}
              value={formData.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              required
            />

            <Input
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              icon={ShieldCheck}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />

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
