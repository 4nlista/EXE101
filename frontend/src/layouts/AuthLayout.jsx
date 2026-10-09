import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LogoImg from '../assets/images/Logo.png';
import IconLoginImg from '../assets/images/Icon_login.png';

// Layout 2 cột chuẩn hóa cho các trang xác thực (Login, Register, ForgotPassword, ResetPassword)
export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  backTo,
  backText = 'Quay lại'
}) {
  return (
    <div className="auth-layout-split">
      {/* ── Cột trái: Hero & Minh họa ── */}
      <div className="auth-hero-split">
        <div className="auth-brand-wrapper">
          <img src={LogoImg} alt="UniVerse AI Logo" className="auth-brand-logo" />
          <span className="auth-brand-text">UniVerse AI</span>
        </div>
        <div className="auth-hero-content">
          <img
            src={IconLoginImg}
            alt="Authentication Illustration"
            className="auth-hero-img"
          />
          <p className="auth-hero-slogan">
            Hệ thống hỗ trợ ghép nhóm thông minh, giúp người dùng dễ dàng tìm kiếm những người thành viên phù hợp nhất dựa trên kỹ năng và chuyên ngành để nâng cao hiệu quả.
          </p>
        </div>
      </div>

      {/* ── Cột phải: Form thực thi ── */}
      <div className="auth-panel-split">
        <div className="auth-card-wrapper">
          {backTo && (
            <Link to={backTo} className="auth-back-link mb-3 d-inline-flex align-items-center gap-2 text-decoration-none text-muted">
              <ArrowLeft size={16} />
              <span>{backText}</span>
            </Link>
          )}

          <div className="auth-header text-center">
            {title && <h2 className="auth-heading">{title}</h2>}
            {subtitle && <p className="auth-subtitle mt-1">{subtitle}</p>}
          </div>

          {children}

          {footer && (
            <div className="auth-footer mt-4 text-center">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
