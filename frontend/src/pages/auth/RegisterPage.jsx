import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => { setToast(null); navigate('/'); }, 2500);
    return () => clearTimeout(t);
  }, [toast, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Vui lòng nhập họ và tên';
    if (!form.email) errs.email = 'Vui lòng nhập email';
    else if (!validateEmail(form.email)) errs.email = 'Email không hợp lệ';
    if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
    else if (form.password.length < 6) errs.password = 'Tối thiểu 6 ký tự';
    if (!form.confirm) errs.confirm = 'Vui lòng xác nhận mật khẩu';
    else if (form.confirm !== form.password) errs.confirm = 'Mật khẩu không khớp';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const res = register(form.email);
    setLoading(false);
    if (!res.success) {
      setErrors((p) => ({ ...p, email: res.error }));
      return;
    }
    setToast({ type: 'success', msg: 'Đăng ký thành công! Đang chuyển hướng...' });
  };

  return (
    <div className="auth-layout">
      {/* ── Left Hero (Orange variant) ── */}
      <div className="auth-hero hero-orange">
        <div className="hero-overlay" />
        
        <div className="hero-logo">
          <div className="hero-logo-dot" /> UniVerse AI
        </div>

        <div className="hero-content">
          <h1>
            Kết nối cộng đồng<br />chuyên gia và sinh viên Việt Nam.
          </h1>
          <p>
            Kết nối với các chuyên gia, sinh viên và các dự án hàng đầu. Xây dựng mạng lưới chuyên nghiệp của bạn trong một môi trường đáng tin cậy.
          </p>

          <div className="hero-testimonial">
            <div className="hero-testimonial-text">
              "UniVerse AI đã giúp tôi tìm được những người đồng đội tuyệt vời cho dự án khởi nghiệp chỉ trong vài giờ."
            </div>
            <div className="hero-testimonial-author">
              <div className="hero-testimonial-avatar">M</div>
              <div>
                <div className="hero-testimonial-name">Minh Phạm</div>
                <div className="hero-testimonial-role">Chuyên gia Phát triển Phần mềm</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-footer">
          <span>© 2024 UniVerse AI</span>
          <div className="hero-footer-links">
            <Link to="#">Bảo mật</Link>
            <Link to="#">Điều khoản</Link>
          </div>
        </div>
      </div>

      {/* ── Right Form ── */}
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <div className="form-head">
            <h2>Tạo tài khoản</h2>
            <p>Nhập thông tin của bạn để bắt đầu với UniVerse AI.</p>
          </div>

          {toast && (
            <div className="alert alert-success">
              {toast.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label className="field-label">Họ và tên</label>
              <div className="input-box">
                <User className="input-icon" size={18} />
                <input
                  name="name" type="text"
                  className={`input${errors.name ? ' err' : ''}`}
                  placeholder="Nguyễn Văn A"
                  value={form.name} onChange={handleChange}
                />
              </div>
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="field">
              <label className="field-label">Email</label>
              <div className="input-box">
                <Mail className="input-icon" size={18} />
                <input
                  name="email" type="email"
                  className={`input${errors.email ? ' err' : ''}`}
                  placeholder="email@example.com"
                  value={form.email} onChange={handleChange}
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="field">
              <label className="field-label">Mật khẩu</label>
              <div className="input-box">
                <Lock className="input-icon" size={18} />
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  className={`input${errors.password ? ' err' : ''}`}
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                />
                <button type="button" className="input-suffix" onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="field" style={{ marginBottom: 28 }}>
              <label className="field-label">Xác nhận mật khẩu</label>
              <div className="input-box">
                <Lock className="input-icon" size={18} />
                <input
                  name="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className={`input${errors.confirm ? ' err' : ''}`}
                  placeholder="••••••••"
                  value={form.confirm} onChange={handleChange}
                />
                <button type="button" className="input-suffix" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Đăng ký tài khoản'}
            </button>
          </form>

          <div className="auth-link-row">
            Đã có tài khoản? <Link to="/" className="text-link">Đăng nhập tại đây</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
