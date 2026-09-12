import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import LogoImg from '../../assets/images/Logo.png';
import IconLoginImg from '../../assets/images/Icon_login.png';
import * as authService from '../../services/authService';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Alert from '../../components/Alert';

const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function ForgotPassword() {
  const navigate = useNavigate();

  // step 1: nhập email | step 2: nhập OTP
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']); // 4 ô OTP
  const [errors, setErrors] = useState({});
  const [globalErr, setGlobalErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false); // trạng thái gửi lại mã
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // ── Xử lý Bước 1: Gửi OTP ──
  const handleSendOtp = async (e) => {
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
        toast.success('Mã OTP đã được gửi tới email của bạn!');
        setStep(2);
        setErrors({});
      } else {
        setGlobalErr(res.message || 'Không thể gửi OTP. Vui lòng thử lại.');
      }
    } catch (error) {
      const errorMsg = error?.message || error?.response?.data?.message || 'Có lỗi xảy ra.';
      setGlobalErr(errorMsg === 'Network Error'
        ? 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.'
        : errorMsg);
    }
    setLoading(false);
  };

  // ── Xử lý nhập từng ô OTP ──
  const handleOtpChange = (index, value) => {
    // Chỉ nhận số, mỗi ô 1 ký tự
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (globalErr) setGlobalErr('');
    if (errors.otp) setErrors((p) => ({ ...p, otp: '' }));
    // Tự động focus sang ô tiếp theo
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Backspace: xóa và quay lại ô trước
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    // Hỗ trợ paste 4 số cùng lúc
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newOtp = ['', '', '', ''];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const lastFilled = Math.min(pasted.length, 3);
    otpRefs[lastFilled].current?.focus();
  };

  // ── Xử lý Bước 2: Xác thực OTP ──
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    const errs = {};
    if (otpValue.length < 4) errs.otp = 'Vui lòng nhập đủ 4 số';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setGlobalErr('');
    try {
      const res = await authService.verifyForgotOtp(email, otpValue);
      if (res.success) {
        // OTP đúng -> chuyển sang trang đặt lại mật khẩu, trả email theo
        navigate('/reset-password', { state: { email } });
      } else {
        setGlobalErr(res.message || 'Mã OTP không chính xác.');
      }
    } catch (error) {
      const errorMsg = error?.message || error?.response?.data?.message || 'Có lỗi xảy ra.';
      setGlobalErr(errorMsg === 'Network Error'
        ? 'Không thể kết nối đến máy chủ.'
        : errorMsg);
    }
    setLoading(false);
  };

  // ── Gửi lại OTP ──
  const handleResendOtp = async () => {
    setSending(true);
    setGlobalErr('');
    setOtp(['', '', '', '']);
    try {
      const res = await authService.forgotPassword(email);
      if (res.success) {
        toast.success('Mã OTP mới đã được gửi!');
      } else {
        setGlobalErr(res.message);
      }
    } catch (error) {
      const errorMsg = error?.message || error?.response?.data?.message || 'Có lỗi xảy ra.';
      setGlobalErr(errorMsg);
    }
    setSending(false);
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
          <img src={IconLoginImg} alt="Forgot Password Illustration" className="auth-hero-img" />
          <p className="auth-hero-slogan">
            Hệ thống hỗ trợ ghép nhóm thông minh, giúp người dùng dễ dàng tìm kiếm những người thành viên phù hợp nhất dựa trên kỹ năng và chuyên ngành để nâng cao hiệu quả.
          </p>
        </div>
      </div>

      {/* ── Right Form ── */}
      <div className="auth-panel-split">
        <div className="auth-card-wrapper">

          {/* ════════ BƯỚC 1: NHẬP EMAIL ════════ */}
          {step === 1 && (
            <>
              <div className="auth-header text-center">
                <h2 className="auth-heading">Quên mật khẩu</h2>
                <p className="auth-subtitle">
                  Nhập email liên kết với tài khoản của bạn để nhận mã xác thực.
                </p>
              </div>

              <form onSubmit={handleSendOtp} noValidate>
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

                <Button type="submit" variant="primary" fullWidth loading={loading} className="py-2 fw-bold mt-3">
                  Gửi mã OTP
                </Button>
              </form>

              <div className="auth-footer mt-4 text-center">
                <Link to="/" className="auth-link d-inline-flex align-items-center gap-1 auth-link-underline">
                  <ArrowLeft size={16} /> Quay lại đăng nhập
                </Link>
              </div>
            </>
          )}

          {/* ════════ BƯỚC 2: NHẬP OTP ════════ */}
          {step === 2 && (
            <>
              <div className="auth-header text-center">
                <h2 className="auth-heading">Nhập mã OTP</h2>
                <p className="auth-subtitle">
                  Mã 4 số đã được gửi tới <strong>{email}</strong>. Có hiệu lực trong 15 phút.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} noValidate>
                <Alert type="danger">{globalErr}</Alert>

                {/* 4 ô nhập OTP */}
                <div className="otp-box-wrapper">
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
                    />
                  ))}
                </div>

                {/* Lỗi OTP */}
                {errors.otp && (
                  <p className="text-danger text-center" style={{ fontSize: '13px', marginTop: '-8px', marginBottom: '12px' }}>
                    {errors.otp}
                  </p>
                )}

                <Button type="submit" variant="primary" fullWidth loading={loading} className="py-2 fw-bold mt-2">
                  Xác nhận
                </Button>
              </form>

              <div className="auth-footer mt-4 text-center d-flex justify-content-between">
                <button
                  onClick={() => { setStep(1); setOtp(['', '', '', '']); setErrors({}); setGlobalErr(''); }}
                  className="auth-link auth-link-underline d-inline-flex align-items-center gap-1"
                >
                  <ArrowLeft size={16} /> Nhập lại email
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
