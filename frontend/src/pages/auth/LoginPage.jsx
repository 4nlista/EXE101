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
    if (!form.email) errs.email = 'Vui lòng nhập địa chỉ email';
    else if (!validateEmail(form.email)) errs.email = 'Email không đúng định dạng';
    if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const res = login(form.email, form.password, form.remember);
    setLoading(false);
    if (!res.success) { setGlobalErr(res.error); return; }
    navigate('/dashboard');
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await new Promise((r) => setTimeout(r, 1300));
    loginWithGoogle();
    setGoogleLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="auth-layout">
      {/* ── Left Hero ── */}
      <div className="auth-hero">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
          alt="Team collaboration"
          className="hero-bg-img"
        />
        <div className="hero-overlay" />
        
        <div className="hero-logo">
          <div className="hero-logo-dot" /> UniVerse AI
        </div>

        <div className="hero-content">
          <span className="hero-tag">Nền tảng kết nối</span>
          <h1>
            Kết nối.<br />
            Hợp tác.<br />
            Sáng tạo.
          </h1>
          <p>
            Mạng lưới nghề nghiệp hàng đầu dành cho sinh viên, freelancer và chuyên gia trên toàn quốc.
          </p>

          <div className="hero-stats">
            <div>
              <div className="hero-stat-n">12K+</div>
              <div className="hero-stat-l">Chuyên gia & Sinh viên</div>
            </div>
            <div>
              <div className="hero-stat-n">3.4K+</div>
              <div className="hero-stat-l">Dự án hoàn thành</div>
            </div>
          </div>
        </div>

        <div className="hero-footer">
          <span>© 2024 UniVerse AI</span>
          <div className="hero-footer-links">
            <Link to="#">Điều khoản</Link>
            <Link to="#">Bảo mật</Link>
          </div>
        </div>
      </div>

      {/* ── Right Form ── */}
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <div className="panel-logo">
            <div className="panel-logo-mark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div className="panel-logo-text">UniVerse AI</div>
          </div>

          <div className="form-head">
            <h2>Chào mừng trở lại</h2>
            <p>Nhập thông tin xác thực để truy cập mạng lưới của bạn.</p>
          </div>

          {globalErr && (
            <div className="alert alert-error">
              <span>⚠️</span> {globalErr}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="field">
              <label className="field-label" htmlFor="email">Địa chỉ Email</label>
              <div className="input-box">
                <Mail className="input-icon" size={18} />
                <input
                  id="email" name="email" type="email"
                  className={`input${errors.email ? ' err' : ''}`}
                  placeholder="nguoidung@email.com"
                  value={form.email} onChange={handleChange}
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="field">
              <div className="field-label">
                <label htmlFor="password">Mật khẩu</label>
                <Link to="/forgot" className="field-label-link">Quên mật khẩu?</Link>
              </div>
              <div className="input-box">
                <Lock className="input-icon" size={18} />
                <input
                  id="password" name="password"
                  type={showPwd ? 'text' : 'password'}
                  className={`input${errors.password ? ' err' : ''}`}
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                />
                <button
                  type="button" className="input-suffix"
                  onClick={() => setShowPwd(v => !v)}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {/* Remember */}
            <div className="check-row" style={{ marginTop: 20, marginBottom: 24 }}>
              <input
                type="checkbox" id="remember" name="remember"
                checked={form.remember} onChange={handleChange}
              />
              <label htmlFor="remember">Ghi nhớ đăng nhập</label>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Đăng nhập'}
            </button>
          </form>

          <div className="auth-divider">HOẶC TIẾP TỤC VỚI</div>

          <button
            type="button" className="btn-google"
            onClick={handleGoogle} disabled={googleLoading}
          >
            {googleLoading ? (
              <span className="spinner spinner-dark" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Đăng nhập bằng Google
          </button>

          <div className="auth-link-row">
            Chưa có tài khoản? <Link to="/register" className="text-link">Đăng ký truy cập</Link>
          </div>
          
          <div style={{ marginTop: 24, padding: '12px', background: 'var(--bg-subtle)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
              Tài khoản demo:
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              demo@universe.ai / Demo@123
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
