import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import LogoImg from '../../assets/images/Logo.png';
import IconLoginImg from '../../assets/images/Icon_login.png';

// Import các UI Component hạt nhân
import Input from '../../components/Input';
import Button from '../../components/Button';
import Alert from '../../components/Alert';

// Hàm kiểm tra định dạng email hợp lệ
const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function Register() {
  const navigate = useNavigate();
  const { register, verifyOtp, loginWithGoogle } = useAuth();

  // State quản lý dữ liệu form: chỉ gồm email, password, confirm (không có name)
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 ô OTP
  const [errors, setErrors] = useState({});
  const [globalErr, setGlobalErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState('register'); // 'register' | 'otp'

  const otpRefs = [
    useRef(null), useRef(null), useRef(null),
    useRef(null), useRef(null), useRef(null)
  ];

  // Xử lý thay đổi dữ liệu trong các ô input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    if (globalErr) setGlobalErr('');
  };

  // Validate form đăng ký theo Business Rules (Email, Mật khẩu >= 6 ký tự, Xác nhận khớp)
  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Vui lòng nhập email';
    else if (!validateEmail(form.email)) errs.email = 'Email sai định dạng';

    if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
    else if (form.password.length < 6) errs.password = 'Mật khẩu phải có ít nhất 6 ký tự';

    if (!form.confirm) errs.confirm = 'Vui lòng xác nhận mật khẩu';
    else if (form.confirm !== form.password) errs.confirm = 'Mật khẩu xác nhận không khớp';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Bước 1: Gửi yêu cầu đăng ký để nhận mã OTP qua email
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGlobalErr('');

    const res = await register(form.email, form.password, form.confirm);
    setLoading(false);

    if (!res.success) {
      setGlobalErr(res.error === 'Network Error' ? 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.' : res.error);
      return;
    }

    toast.success('Mã xác thực OTP đã được gửi tới email của bạn!');
    setStep('otp');
    setGlobalErr('');
  };

  // Xử lý nhập từng ô OTP 6 số
  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (globalErr) setGlobalErr('');
    if (errors.otp) setErrors((p) => ({ ...p, otp: '' }));

    // Tự động focus sang ô tiếp theo
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = ['', '', '', '', '', ''];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const lastFilled = Math.min(pasted.length, 5);
    otpRefs[lastFilled].current?.focus();
  };

  // Bước 2: Xác thực mã OTP 6 số và đăng nhập
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      setErrors({ otp: 'Vui lòng nhập đủ 6 chữ số OTP' });
      return;
    }

    setLoading(true);
    setGlobalErr('');

    const res = await verifyOtp(form.email, otpValue, form.password);
    setLoading(false);

    if (!res.success) {
      setGlobalErr(res.error === 'Network Error' ? 'Không thể kết nối đến máy chủ.' : res.error);
      return;
    }

    toast.success('Đăng ký tài khoản thành công!');
    navigate('/feed');
  };

  // Gửi lại mã OTP đăng ký
  const handleResendOtp = async () => {
    setSending(true);
    setGlobalErr('');
    setOtp(['', '', '', '', '', '']);

    const res = await register(form.email, form.password, form.confirm);
    setSending(false);

    if (res.success) {
      toast.success('Mã OTP mới đã được gửi!');
    } else {
      setGlobalErr(res.error);
    }
    otpRefs[0].current?.focus();
  };

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
            alt="Register Illustration"
            className="auth-hero-img"
          />
          <p className="auth-hero-slogan">
            Hệ thống hỗ trợ ghép nhóm thông minh, giúp người dùng dễ dàng tìm kiếm những người thành viên phù hợp nhất dựa trên kỹ năng và chuyên ngành để nâng cao hiệu quả.
          </p>
        </div>
      </div>

      {/* ── Right Form ── */}
      <div className="auth-panel-split">
        <div className="auth-card-wrapper">

          {/* ════════ BƯỚC 1: FORM ĐĂNG KÝ (3 FIELDS) ════════ */}
          {step === 'register' && (
            <>
              <div className="auth-header text-center">
                <h2 className="auth-heading">Tạo tài khoản</h2>
                <p className="auth-subtitle">Nhập email và mật khẩu để bắt đầu với UniVerse AI.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                {/* Form-level Error */}
                <Alert type="danger">
                  {globalErr}
                </Alert>

                <Input 
                  label="Email"
                  icon={Mail}
                  id="register-email"
                  name="email" 
                  type="email"
                  placeholder="user@example.com"
                  value={form.email} 
                  onChange={handleChange}
                  error={errors.email}
                />

                <Input 
                  label="Mật khẩu"
                  icon={Lock}
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password} 
                  onChange={handleChange}
                  error={errors.password}
                />

                <Input 
                  label="Xác nhận mật khẩu"
                  icon={Lock}
                  id="register-confirm"
                  name="confirm"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirm} 
                  onChange={handleChange}
                  error={errors.confirm}
                />

                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  loading={loading}
                  className="py-2 fw-bold mt-3"
                >
                  Đăng ký tài khoản
                </Button>
              </form>

              <div className="auth-divider-row my-4">
                <div className="auth-divider-line"></div>
                <span style={{ padding: '0 12px' }}>HOẶC ĐĂNG KÝ VỚI</span>
                <div className="auth-divider-line"></div>
              </div>

              <div className="w-100 d-flex justify-content-center">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    const res = await loginWithGoogle(credentialResponse.credential);
                    if (!res.success) {
                      setGlobalErr(res.error === 'Network Error' ? 'Không thể kết nối đến máy chủ.' : res.error);
                      return;
                    }
                    navigate('/feed');
                  }}
                  onError={() => {
                    setGlobalErr('Đăng ký bằng Google thất bại hoặc bị hủy.');
                  }}
                  size="large"
                  theme="outline"
                  width="100%"
                />
              </div>

              <div className="auth-footer mt-4 text-center">
                Đã có tài khoản? <Link to="/" className="auth-link auth-link-underline">Đăng nhập ngay</Link>
              </div>
            </>
          )}

          {/* ════════ BƯỚC 2: XÁC THỰC OTP 6 SỐ ════════ */}
          {step === 'otp' && (
            <>
              <div className="auth-header text-center">
                <h2 className="auth-heading">Xác thực Email</h2>
                <p className="auth-subtitle">
                  Mã OTP 6 số đã được gửi tới <strong>{form.email}</strong>. Mã có hiệu lực trong 5 phút.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} noValidate>
                {/* Form-level Error */}
                <Alert type="danger">
                  {globalErr}
                </Alert>

                {/* 6 ô nhập mã OTP */}
                <div className="otp-box-wrapper" style={{ justifyContent: 'center', gap: '8px' }}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className={`otp-box${errors.otp ? ' otp-box--error' : ''}`}
                      style={{ width: '48px', height: '56px', fontSize: '24px' }}
                    />
                  ))}
                </div>

                {/* Lỗi OTP */}
                {errors.otp && (
                  <p className="text-danger text-center" style={{ fontSize: '13px', marginTop: '8px', marginBottom: '12px' }}>
                    {errors.otp}
                  </p>
                )}

                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  loading={loading}
                  className="py-2 fw-bold mt-4"
                >
                  Xác nhận mã OTP
                </Button>
              </form>

              <div className="auth-footer mt-4 text-center d-flex justify-content-between">
                <button 
                  onClick={() => { setStep('register'); setErrors({}); setGlobalErr(''); }}
                  className="auth-link auth-link-underline d-inline-flex align-items-center gap-1"
                >
                  <ArrowLeft size={16} /> Quay lại
                </button>
                <button
                  onClick={handleResendOtp}
                  disabled={sending}
                  className="auth-link auth-link-underline"
                >
                  {sending ? 'Đang gửi...' : 'Gửi lại mã'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

