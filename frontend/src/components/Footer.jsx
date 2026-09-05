import React from 'react';

// component Footer dành cho dự án
export default function Footer() {
  return (
    <footer className="layout-footer">
      <div className="layout-footer-left">
        <strong>UniVerse</strong> © 2026 UniVerse - Dự án công nghệ
      </div>
      <div className="layout-footer-right">
        <a href="#">Chính sách bảo mật</a>
        <a href="#">Điều khoản sử dụng</a>
        <a href="#">Hỗ trợ</a>
        <a href="#">Trung tâm nghề nghiệp</a>
      </div>
    </footer>
  );
}
