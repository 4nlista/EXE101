import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthLayout from '../../layouts/AuthLayout';
import * as authService from '../../services/authService';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Alert from '../../components/Alert';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // Lay email duoc truyen tu ForgotPassword qua navigate state
  const email = location.state?.email || '';

  // Neu khong co email (truy cap truc tiep URL), redirect ve trang quen mat khau
  if (!email) {
    navigate('/forgot', { replace: true });
    return null;
  }

  const [form, setForm] = useState({ newPassword: '', confirmNewPassword: '' });
  const [errors, setErrors] = useState({});
  const [globalErr, setGlobalErr] = useState('');
  const [loading, setLoading] = useState(false);

  // Xu ly thay doi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    if (globalErr) setGlobalErr('');
  };

  // Xu ly submit dat lai mat khau
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.newPassword) errs.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (form.newPassword.length < 6) errs.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!form.confirmNewPassword) errs.confirmNewPassword = 'Vui lòng xác nhận mật khẩu';
    else if (form.newPassword !== form.confirmNewPassword) errs.confirmNewPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setGlobalErr('');
    try {
      const res = await authService.resetPassword(email, form.newPassword, form.confirmNewPassword);
      if (res.success) {
        toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
        navigate('/');
      } else {
        setGlobalErr(res.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      const errorMsg = error?.message || error?.response?.data?.message || 'Có lỗi xảy ra.';
      setGlobalErr(
        errorMsg === 'Network Error'
          ? 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.'
          : errorMsg
      );
    }
    setLoading(false);
  };

  const resetFooter = (
    <span>
      Đã nhớ mật khẩu? <Link to="/" className="auth-link auth-link-underline">Đăng nhập ngay</Link>
    </span>
  );

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle={`Tạo mật khẩu mới cho tài khoản ${email}`}
      backTo="/forgot"
      footer={resetFooter}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Alert type="danger">{globalErr}</Alert>

        <Input
          label="Mật khẩu mới"
          icon={Lock}
          id="new-password"
          name="newPassword"
          type="password"
          placeholder="••••••••"
          value={form.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
        />

        <Input
          label="Xác nhận mật khẩu mới"
          icon={Lock}
          id="confirm-new-password"
          name="confirmNewPassword"
          type="password"
          placeholder="••••••••"
          value={form.confirmNewPassword}
          onChange={handleChange}
          error={errors.confirmNewPassword}
        />

        <Button type="submit" variant="primary" fullWidth loading={loading} className="py-2 fw-bold mt-3">
          Đặt lại mật khẩu
        </Button>
      </form>
    </AuthLayout>
  );
}
