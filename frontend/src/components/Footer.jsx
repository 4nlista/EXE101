import React from 'react';

// component Footer dành cho dự án
export default function Footer() {
  return (
    <footer className="layout-footer">
      <div className="layout-footer-left">
        <strong className="text-dark">UniVerse</strong> © 2026 UniVerse AI - Dự án công nghệ
      </div>
      <div className="layout-footer-right">
        <a href="#">Chính sách bảo mật</a>
        <a href="#" className="ms-3">Điều khoản sử dụng</a>
        <a href="#" className="ms-3">Hỗ trợ</a>
        <a href="#" className="ms-3">Trung tâm nghề nghiệp</a>
      </div>
    </footer>
  );
}
