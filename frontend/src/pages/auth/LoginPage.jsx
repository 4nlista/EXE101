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
    <div className="auth-layout" style={{ flexDirection: 'row', height: '100vh', overflow: 'hidden' }}>
      {/* ── Left Hero ── */}
      <div className="auth-hero" style={{ 
        flex: 1, 
        backgroundColor: '#DCCABF', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '40px'
      }}>
        <img
          src="/images/Icon_login.png"
          alt="Login Illustration"
          style={{ 
            maxWidth: '100%', 
            maxHeight: '80%',
            objectFit: 'contain',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)' // Giả lập phần khung nền nếu ảnh là transparent
          }}
        />
      </div>

      {/* ── Right Form ── */}
      <div className="auth-panel" style={{ 
        flex: 1, 
        backgroundColor: '#FAF5ED', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '32px 48px', // Giảm padding dọc một chút để form ôm sát hơn
        overflowY: 'auto'     // Nếu màn hình quá bé, chỉ cuộn bên phải chứ không cuộn toàn bộ trang
      }}>
        <div className="auth-panel-inner" style={{ width: '100%', maxWidth: '420px', margin: 'auto 0' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ color: '#C65D2B', fontSize: '28px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>
              UniVerse AI
            </h1>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
              Chào mừng trở lại NexLink
            </h2>
            <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.5' }}>
              Nhập thông tin xác thực của bạn để truy cập mạng lưới học thuật và nghề nghiệp của bạn.
            </p>
          </div>

          {globalErr && (
            <div className="alert alert-error" style={{ marginBottom: '24px' }}>
              <span>⚠️</span> {globalErr}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="field" style={{ marginBottom: '20px' }}>
              <label className="field-label" htmlFor="email" style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '8px', display: 'block' }}>
                Địa chỉ Email
              </label>
              <div className="input-box" style={{ position: 'relative' }}>
                <Mail className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  id="email" name="email" type="email"
                  className={`input${errors.email ? ' err' : ''}`}
                  placeholder="nguoidung@email.com"
                  value={form.email} onChange={handleChange}
                  style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', fontSize: '15px' }}
                />
              </div>
              {errors.email && <span className="field-error" style={{ color: '#EF4444', fontSize: '13px', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="field" style={{ marginBottom: '20px' }}>
              <div className="field-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label htmlFor="password" style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563' }}>Mật khẩu</label>
                <Link to="/forgot" className="field-label-link" style={{ fontSize: '13px', color: '#C65D2B', fontWeight: '600', textDecoration: 'none' }}>Quên mật khẩu?</Link>
              </div>
              <div className="input-box" style={{ position: 'relative' }}>
                <Lock className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  id="password" name="password"
                  type={showPwd ? 'text' : 'password'}
                  className={`input${errors.password ? ' err' : ''}`}
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                  style={{ width: '100%', padding: '12px 40px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', fontSize: '15px' }}
                />
                <button
                  type="button" className="input-suffix"
                  onClick={() => setShowPwd(v => !v)}
                  tabIndex={-1}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 0 }}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="field-error" style={{ color: '#EF4444', fontSize: '13px', marginTop: '4px', display: 'block' }}>{errors.password}</span>}
            </div>

            {/* Remember */}
            <div className="check-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <input
                type="checkbox" id="remember" name="remember"
                checked={form.remember} onChange={handleChange}
                style={{ width: '16px', height: '16px', accentColor: '#C65D2B', cursor: 'pointer', borderRadius: '4px', border: '1px solid #D1D5DB' }}
              />
              <label htmlFor="remember" style={{ fontSize: '14px', color: '#6B7280', cursor: 'pointer' }}>Ghi nhớ đăng nhập</label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full btn-lg" 
              disabled={loading}
              style={{ width: '100%', padding: '14px', backgroundColor: '#C65D2B', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              {loading ? <span className="spinner" style={{ borderTopColor: 'white' }} /> : 'Đăng nhập →'}
            </button>
          </form>

          <div className="auth-divider" style={{ display: 'flex', alignItems: 'center', textAlign: 'center', margin: '32px 0', color: '#9CA3AF', fontSize: '12px', fontWeight: '600' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
            <span style={{ padding: '0 12px' }}>HOẶC TIẾP TỤC VỚI</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
          </div>

          <button
            type="button" className="btn-google"
            onClick={handleGoogle} disabled={googleLoading}
            style={{ width: '100%', padding: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#374151', transition: 'background-color 0.2s' }}
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

          <div className="auth-link-row" style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: '#6B7280' }}>
            Chưa có tài khoản? <Link to="/register" className="text-link" style={{ color: '#C65D2B', fontWeight: '600', textDecoration: 'none' }}>Đăng ký truy cập</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
