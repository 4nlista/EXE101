import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import LogoImg from '../../../src/assets/images/Logo.png';
import IconLoginImg from '../../../src/assets/images/Icon_login.png';

// Import các UI Component hạt nhân
import Input from '../../components/Input';
import Button from '../../components/Button';
import Alert from '../../components/Alert';

const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [globalErr, setGlobalErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    if (globalErr) setGlobalErr('');
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Vui lòng nhập email';
    else if (!validateEmail(form.email)) errs.email = 'Email sai định dạng';
    if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const res = await login(form.email, form.password, form.remember);

    setLoading(false);
    if (!res.success) {
      setGlobalErr(res.error === 'Network Error' ? 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.' : res.error);
      return;
    }

    // Đăng nhập thành công -> chuyển vào Feed
    navigate('/feed');
  };

  // Xóa hàm handleGoogle cũ vì đã chuyển sang dùng GoogleLogin component

  return (
    <div className="auth-layout-split">
      {/* ── Left Hero ── */}
      <div className="auth-hero-split">
        <div className="auth-brand-wrapper">
          <img src={LogoImg} alt="UniVerse AI Logo" className="auth-brand-logo" />
          <span className="auth-brand-text">UniVerse AI</span>
        </div>
        <div className="auth-hero-content">
          <img
            src={IconLoginImg}
            alt="Login Illustration"
            className="auth-hero-img"
          />
          <p className="auth-hero-slogan">
            Hệ thống hỗ trợ ghép nhóm thông minh, giúp người dùng dễ dàng tìm kiếm những người thành viên phù hợp nhất dựa trên kỹ năng và chuyên ngành để nâng cao hiệu quả.
          </p>
        </div>
      </div>

      {/* ── Right Form ── */}
      <div className="auth-panel-split">
        <div className="auth-panel-inner-split">

          <div className="auth-header">
            <h2 className="auth-heading">Đăng nhập</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            
            {/* Lỗi Form-level (Hiển thị bằng Component Alert) */}
            <Alert type="danger" className="mb-4">
              {globalErr}
            </Alert>

            {/* Email Input */}
            <Input 
              label="Email"
              icon={Mail}
              id="email" 
              name="email" 
              type="email"
              placeholder="user@example.com"
              value={form.email} 
              onChange={handleChange}
              error={errors.email}
            />

            {/* Password Input (có nút show/hide tự động từ Component Input) */}
            <Input 
              label={
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>Mật khẩu</span>
                  <Link to="/forgot" className="text-decoration-none" style={{ fontSize: '14px', color: 'var(--primary)' }}>Quên mật khẩu?</Link>
                </div>
              }
              icon={Lock}
              id="password" 
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password} 
              onChange={handleChange}
              error={errors.password}
            />

            {/* Remember Checkbox */}
            <div className="auth-check-row mb-4">
              <input
                type="checkbox" id="remember" name="remember"
                checked={form.remember} onChange={handleChange}
                className="auth-checkbox"
              />
              <label htmlFor="remember" className="auth-label" style={{ cursor: 'pointer', fontWeight: 500 }}>
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Nút Submit sử dụng Button Component */}
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              loading={loading}
              className="py-2 fw-bold"
            >
              Đăng nhập →
            </Button>
            
          </form>

          <div className="auth-divider-row my-4">
            <div className="auth-divider-line"></div>
            <span style={{ padding: '0 12px' }}>HOẶC ĐĂNG NHẬP VỚI</span>
            <div className="auth-divider-line"></div>
          </div>

          <div className="w-100 d-flex justify-content-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setGoogleLoading(true);
                const res = await loginWithGoogle(credentialResponse.credential);
                setGoogleLoading(false);
                if (!res.success) {
                  setGlobalErr(res.error === 'Network Error' ? 'Không thể kết nối đến máy chủ.' : res.error);
                  return;
                }
                navigate('/feed');
              }}
              onError={() => {
                setGlobalErr('Đăng nhập Google thất bại hoặc bị hủy.');
              }}
              size="large"
              theme="outline"
              width="100%"
            />
          </div>

          <div className="auth-footer mt-4 text-center">
            Chưa có tài khoản? <Link to="/register" className="auth-link">Đăng ký ngay</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
