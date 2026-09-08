import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [countdown, setCountdown] = useState(60);
  const [otpErr, setOtpErr] = useState('');
  const [isShake, setIsShake] = useState(false);

  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) { setErr('Vui lòng nhập email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('Email không hợp lệ'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setStep(2);
    setCountdown(60);
    setOtpErr('');
  };

  const handleOtpChange = (idx, val) => {
    if (!/^[0-9]*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 3) otpRefs[idx + 1].current.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs[idx - 1].current.focus();
    }
  };

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 4) {
      setOtpErr('Vui lòng nhập đủ 4 số'); setIsShake(true);
      setTimeout(() => setIsShake(false), 400); return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    
    if (code !== '1234') { // Mock check
      setOtpErr('Mã xác nhận không đúng'); setIsShake(true);
      setTimeout(() => setIsShake(false), 400); return;
    }
    navigate('/');
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(60);
    setOtp(['', '', '', '']);
    setOtpErr('');
    otpRefs[0].current.focus();
  };

  return (
    <div className="page-center">
      <div className="auth-card">
        {step === 1 && (
          <div className="step-content">
            <div className="auth-card-icon"><KeyRound size={22} /></div>
            <h2>Quên mật khẩu?</h2>
            <p className="subtitle">Nhập email liên kết với tài khoản của bạn, chúng tôi sẽ gửi mã khôi phục.</p>
            
            <form onSubmit={handleSendCode}>
              <div className="field" style={{ marginBottom: 24 }}>
                <label className="field-label">Email</label>
                <div className="input-box">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email" className={`input${err ? ' err' : ''}`}
                    placeholder="email@example.com"
                    value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); }}
                  />
                </div>
                {err && <span className="field-error">{err}</span>}
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Gửi mã xác nhận'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link to="/" className="back-link"><ArrowLeft size={16} /> Quay lại đăng nhập</Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <div className="auth-card-icon"><Mail size={22} /></div>
            <h2>Kiểm tra Email</h2>
            <p className="subtitle">
              Mã xác nhận gồm 4 số đã được gửi đến<br />
              <strong>{email}</strong>
            </p>

            <div className={`otp-row ${isShake ? 'otp-shake' : ''}`}>
              {otp.map((v, i) => (
                <input
                  key={i} ref={otpRefs[i]}
                  type="text" maxLength={1}
                  className={`otp-box ${v ? 'filled' : ''} ${otpErr ? 'err' : ''}`}
                  value={v}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                />
              ))}
            </div>

            {otpErr && (
              <div style={{ textAlign: 'center', color: 'var(--error)', fontSize: '0.8rem', marginBottom: '12px' }}>
                {otpErr}
              </div>
            )}

            <button onClick={verifyOtp} className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Xác nhận mã'}
            </button>

            <div className="otp-resend-row">
              {countdown > 0 ? (
                <div className="otp-timer">Gửi lại mã sau <span className="t">{countdown}s</span></div>
              ) : (
                <div>Bạn không nhận được mã? <button onClick={handleResend} className="resend-btn">Gửi lại mã</button></div>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button onClick={() => setStep(1)} className="back-link"><ArrowLeft size={16} /> Nhập lại email</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
