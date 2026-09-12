import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import LogoImg from '../../../src/assets/images/Logo.png';
import IconLoginImg from '../../../src/assets/images/Icon_login.png';
import * as authService from '../../services/authService';

// Import các UI Component hạt nhân
import Input from '../../components/Input';
import Button from '../../components/Button';
import Alert from '../../components/Alert';

const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Bước 1: Nhập email | Bước 2: Nhập mật khẩu mới
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ newPassword: '', confirmNewPassword: '' });
  const [errors, setErrors] = useState({});
  const [globalErr, setGlobalErr] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Xử lý Bước 1: Kiểm tra email ──
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email) errs.email = 'Vui lòng nhập email';
    else if (!validateEmail(email)) errs.email = 'Email sai định dạng';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setGlobalErr('');
    try {
      const res = await authService.forgotPassword(email);
      if (res.success) {
        // Email hợp lệ, chuyển sang bước nhập mật khẩu mới
        setStep(2);
        setErrors({});
      } else {
        setGlobalErr(res.message || 'Không thể xác minh email.');
      }
    } catch (error) {
      setGlobalErr(error.message === 'Network Error'
        ? 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.'
        : error.message);
    }
    setLoading(false);
  };

  // ── Xử lý Bước 2: Đặt lại mật khẩu ──
  const handleResetPassword = async (e) => {
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
        setGlobalErr(res.message || 'Đặt lại mật khẩu thất bại.');
      }
    } catch (error) {
      setGlobalErr(error.message === 'Network Error'
        ? 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.'
        : error.message);
    }
    setLoading(false);
  };

  // Xử lý khi gõ vào input mật khẩu
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    if (globalErr) setGlobalErr('');
  };

  return (
    <div className="auth-layout-split">
      {/* ── Left Hero (Tái sử dụng layout từ Login) ── */}
      <div className="auth-hero-split">
        <div className="auth-brand-wrapper">
          <img src={LogoImg} alt="UniVerse AI Logo" className="auth-brand-logo" />
          <span className="auth-brand-text">UniVerse AI</span>
        </div>
        <div className="auth-hero-content">
          <img
            src={IconLoginImg}
            alt="Forgot Password Illustration"
            className="auth-hero-img"
          />
          <p className="auth-hero-slogan">
            Hệ thống hỗ trợ ghép nhóm thông minh, giúp người dùng dễ dàng tìm kiếm những người thành viên phù hợp nhất dựa trên kỹ năng và chuyên ngành để nâng cao hiệu quả.
          </p>
        </div>
      </div>

      {/* ── Right Form ── */}
      <div className="auth-panel-split">
        <div className="auth-panel-inner-split d-flex align-items-center justify-content-center">

          {/* Wrapper Card cho Form */}
          <div className="auth-card-wrapper">
            {/* ════════ BƯỚC 1: NHẬP EMAIL ════════ */}
            {step === 1 && (
              <>
                <div className="auth-header text-center">
                  <h2 className="auth-heading">Quên mật khẩu</h2>
                  <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '8px' }}>
                    Nhập email liên kết với tài khoản của bạn để đặt lại mật khẩu.
                  </p>
                </div>

                <form onSubmit={handleCheckEmail} noValidate>
                  {/* Lỗi Form-level */}
                  <Alert type="danger">{globalErr}</Alert>

                  <Input
                    label="Email"
                    icon={Mail}
                    id="forgot-email"
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({}); if (globalErr) setGlobalErr(''); }}
                    error={errors.email}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                    className="py-2 fw-bold mt-3"
                  >
                    Tiếp tục →
                  </Button>
                </form>

                <div className="auth-footer mt-4 text-center">
                  <Link to="/" className="auth-link d-inline-flex align-items-center gap-1 auth-link-underline">
                    <ArrowLeft size={16} /> Quay lại đăng nhập
                  </Link>
                </div>
              </>
            )}

            {/* ════════ BƯỚC 2: NHẬP MẬT KHẨU MỚI ════════ */}
            {step === 2 && (
              <>
                <div className="auth-header text-center">
                  <h2 className="auth-heading">Đặt lại mật khẩu</h2>
                  <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '8px' }}>
                    Nhập mật khẩu mới cho tài khoản <strong>{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleResetPassword} noValidate>
                  {/* Lỗi Form-level */}
                  <Alert type="danger">{globalErr}</Alert>

                  <Input
                    label="Mật khẩu mới"
                    icon={Lock}
                    id="new-password"
                    name="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={form.newPassword}
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
                    error={errors.confirmNewPassword}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                    className="py-2 fw-bold mt-3"
                  >
                    Đặt lại mật khẩu
                  </Button>
                </form>

                <div className="auth-footer mt-4 text-center">
                  <button
                    onClick={() => { setStep(1); setErrors({}); setGlobalErr(''); setForm({ newPassword: '', confirmNewPassword: '' }); }}
                    className="auth-link d-inline-flex align-items-center gap-1 auth-link-underline"
                  >
                    <ArrowLeft size={16} /> Nhập lại email
                  </button>
                </div>
              </>
            )}

          </div> {/* End Wrapper Card */}
        </div>
      </div>
    </div>
  );
}
