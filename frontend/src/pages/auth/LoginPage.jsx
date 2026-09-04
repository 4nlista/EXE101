import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [globalErr, setGlobalErr] = useState('');
  const [showPwd, setShowPwd] = useState(false);
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

    // Gọi hàm login từ Context (đã được sửa thành async gọi API thực tế)
    const res = await login(form.email, form.password, form.remember);

    setLoading(false);
    if (!res.success) {
      setGlobalErr(res.error);
      return;
    }

    // Đăng nhập thành công -> chuyển vào Feed
    navigate('/feed');
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await new Promise((r) => setTimeout(r, 1300));
    loginWithGoogle();
    setGoogleLoading(false);
    navigate('/feed');
  };

  return (
    <div className="auth-layout-split">
      {/* ── Left Hero ── */}
      <div className="auth-hero-split">
        <img
          src="/images/Icon_login.png"
          alt="Login Illustration"
          className="auth-hero-img"
        />
      </div>

      {/* ── Right Form ── */}
      <div className="auth-panel-split">
        <div className="auth-panel-inner-split">

          <div className="auth-header">
            <h1 className="auth-logo-text">UniVerse AI</h1>
            <h2 className="auth-heading">Chào mừng trở lại UniVerse AI</h2>
          </div>

          {/* Reserved height container to prevent layout shift on error */}
          <div className="auth-error-container">
            {globalErr && (
              <div className="auth-error-message">
                {globalErr === 'Network Error'
                  ? 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.'
                  : globalErr}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-input-group">
              <div className="auth-label-row">
                <label className="auth-label" htmlFor="email">Email</label>
              </div>
              <div className="auth-input-wrapper">
                <Mail className="auth-icon-left" size={18} />
                <input
                  id="email" name="email" type="email"
                  className={`auth-input${errors.email ? ' err' : ''}`}
                  placeholder="user@example.com"
                  value={form.email} onChange={handleChange}
                />
              </div>
              {errors.email && <span className="auth-error-text">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="auth-input-group">
              <div className="auth-label-row">
                <label className="auth-label" htmlFor="password">Mật khẩu</label>
                <Link to="/forgot" className="auth-link">Quên mật khẩu?</Link>
              </div>
              <div className="auth-input-wrapper">
                <Lock className="auth-icon-left" size={18} />
                <input
                  id="password" name="password"
                  type={showPwd ? 'text' : 'password'}
                  className={`auth-input${errors.password ? ' err' : ''}`}
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                />
                <button
                  type="button" className="auth-icon-right"
                  onClick={() => setShowPwd(v => !v)}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="auth-error-text">{errors.password}</span>}
            </div>

            {/* Remember */}
            <div className="auth-check-row">
              <input
                type="checkbox" id="remember" name="remember"
                checked={form.remember} onChange={handleChange}
                className="auth-checkbox"
              />
              <label htmlFor="remember" className="auth-label" style={{ cursor: 'pointer', fontWeight: 500 }}>
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
            >
              {loading ? <span className="spinner" style={{ borderTopColor: 'white' }} /> : 'Đăng nhập →'}
            </button>
          </form>

          <div className="auth-divider-row">
            <div className="auth-divider-line"></div>
            <span style={{ padding: '0 12px' }}>HOẶC ĐĂNG NHẬP VỚI</span>
            <div className="auth-divider-line"></div>
          </div>

          <button
            type="button" className="auth-btn-google"
            onClick={handleGoogle} disabled={googleLoading}
          >
            {googleLoading ? (
              <span className="spinner spinner-dark" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Đăng nhập bằng Google
          </button>

          <div className="auth-footer">
            Chưa có tài khoản? <Link to="/register" className="auth-link">Đăng ký truy cập</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
