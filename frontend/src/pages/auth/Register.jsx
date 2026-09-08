import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { toast } from 'react-toastify';

// Import các UI Component hạt nhân
import Input from '../../components/Input';
import Button from '../../components/Button';
import Alert from '../../components/Alert';

const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function Register() {
  const navigate = useNavigate();
  const { register, verifyOtp } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [globalErr, setGlobalErr] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // States quản lý luồng màn hình
  const [step, setStep] = useState('register'); // 'register' | 'otp'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    if (globalErr) setGlobalErr('');
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

  // Nút đăng ký (Gửi email lấy OTP)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const res = await register(form.email, form.password, form.confirm);
    setLoading(false);

    if (!res.success) {
      setGlobalErr(res.error);
      return;
    }
    toast.success('Mã xác thực đã được gửi tới Email của bạn!');
    setStep('otp');
    setGlobalErr(''); // Xóa lỗi cũ khi sang màn hình mới
  };

  // Nút xác thực OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Vui lòng nhập đúng 6 số OTP' });
      return;
    }

    setLoading(true);
    const res = await verifyOtp(form.name, form.email, otp, form.password);
    setLoading(false);

    if (!res.success) {
      setGlobalErr(res.error);
      return;
    }

    toast.success('Xác thực thành công! Đang chuyển hướng...');
    // setTimeout(() => navigate('/feed'), 1000); // Route bảo vệ sẽ tự chuyển hướng
  };

  return (
    <>
      <div className="auth-layout">
        {/* ── Left Hero (Orange variant) ── */}
        <div className="auth-hero hero-orange">
          <div className="hero-overlay" />

          <div className="hero-logo">
            <div className="hero-logo-dot" /> UniVerse AI
          </div>

          <div className="hero-content">
            <h1>Kết nối cộng đồng<br />chuyên gia và sinh viên Việt Nam.</h1>
            <p>Xây dựng mạng lưới chuyên nghiệp của bạn trong một môi trường đáng tin cậy.</p>
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

            {/* BƯỚC 1: FORM ĐĂNG KÝ */}
            {step === 'register' && (
              <>
                <div className="form-head mb-4">
                  <h2 className="fw-bold mb-2">Tạo tài khoản</h2>
                  <p className="text-muted">Nhập thông tin của bạn để bắt đầu với UniVerse AI.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  
                  {/* Form-level Error */}
                  <Alert type="danger" className="mb-4">
                    {globalErr}
                  </Alert>

                  <Input 
                    label="Họ và tên"
                    icon={User}
                    name="name" 
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={form.name} 
                    onChange={handleChange}
                    error={errors.name}
                  />

                  <Input 
                    label="Email"
                    icon={Mail}
                    name="email" 
                    type="email"
                    placeholder="email@example.com"
                    value={form.email} 
                    onChange={handleChange}
                    error={errors.email}
                  />

                  <div className="mb-3 position-relative">
                    <label className="fw-medium mb-1 d-block">Mật khẩu</label>
                    <Input 
                      icon={Lock}
                      name="password"
                      type={showPwd ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password} 
                      onChange={handleChange}
                      error={errors.password}
                      className="mb-0"
                    />
                    <button 
                      type="button" 
                      className="position-absolute border-0 bg-transparent" 
                      onClick={() => setShowPwd(!showPwd)}
                      style={{ right: '10px', top: '35px', color: 'var(--bs-gray-500)', zIndex: 20 }}
                    >
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="mb-4 position-relative">
                    <label className="fw-medium mb-1 d-block">Xác nhận mật khẩu</label>
                    <Input 
                      icon={Lock}
                      name="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.confirm} 
                      onChange={handleChange}
                      error={errors.confirm}
                      className="mb-0"
                    />
                    <button 
                      type="button" 
                      className="position-absolute border-0 bg-transparent" 
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{ right: '10px', top: '35px', color: 'var(--bs-gray-500)', zIndex: 20 }}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    variant="primary" 
                    fullWidth 
                    loading={loading}
                    className="py-2 fw-bold"
                  >
                    Đăng ký tài khoản
                  </Button>
                </form>

                <div className="auth-link-row mt-4 text-center">
                  Đã có tài khoản? <Link to="/" className="text-primary text-decoration-none fw-medium">Đăng nhập tại đây</Link>
                </div>
              </>
            )}

            {/* BƯỚC 2: NHẬP OTP */}
            {step === 'otp' && (
              <>
                <div className="form-head mb-4">
                  <h2 className="fw-bold mb-2">Xác thực Email</h2>
                  <p className="text-muted">Mã OTP 6 số đã được gửi tới <strong>{form.email}</strong>. Mã sẽ hết hạn sau 5 phút.</p>
                </div>

                <form onSubmit={handleVerifyOtp} noValidate>
                  {/* Form-level Error for OTP failures */}
                  <Alert type="danger" className="mb-4">
                    {globalErr}
                  </Alert>

                  <Input 
                    label="Mã OTP"
                    icon={KeyRound}
                    type="text"
                    maxLength="6"
                    placeholder="Nhập 6 số..."
                    value={otp} 
                    onChange={e => { setOtp(e.target.value); setErrors({}); setGlobalErr(''); }}
                    error={errors.otp}
                    className="mb-4"
                    style={{ fontSize: 16, letterSpacing: '2px' }}
                  />

                  <Button 
                    type="submit" 
                    variant="primary" 
                    fullWidth 
                    loading={loading}
                    className="py-2 fw-bold"
                  >
                    Xác nhận mã OTP
                  </Button>
                </form>

                <div className="auth-link-row mt-4 text-center">
                  <button 
                    className="text-primary text-decoration-none fw-medium bg-transparent border-0" 
                    onClick={() => { setStep('register'); setGlobalErr(''); }}
                  >
                    Quay lại
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
