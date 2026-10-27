import React from 'react';
import { Spinner } from 'react-bootstrap';

/**
 * Quy ước màu sắc chuẩn cho StatusBadge & Badges toàn hệ thống:
 * - Màu nền tối / đậm (xanh nước biển, xanh lá cây, cam, đỏ, tím, đen): CHỮ TRẮNG (#FFFFFF)
 * - Màu nền sáng (xám, trắng): CHỮ ĐEN (#0F172A)
 */
const BADGE_CONFIG = {
  // ── Nhóm nền màu đậm / tối: CHỮ TRẮNG ──
  // Xanh nước biển (Blue / Info)
  blue: { bg: '#2563EB', color: '#FFFFFF', border: '#2563EB' },
  info: { bg: '#2563EB', color: '#FFFFFF', border: '#2563EB' },
  primary: { bg: '#2563EB', color: '#FFFFFF', border: '#2563EB' },

  // Xanh lá cây (Green / Success)
  green: { bg: '#16A34A', color: '#FFFFFF', border: '#16A34A' },
  success: { bg: '#16A34A', color: '#FFFFFF', border: '#16A34A' },

  // Cam (Orange / Warning / Brand)
  orange: { bg: '#EA580C', color: '#FFFFFF', border: '#EA580C' },
  warning: { bg: '#EA580C', color: '#FFFFFF', border: '#EA580C' },

  // Đỏ (Red / Danger)
  red: { bg: '#DC2626', color: '#FFFFFF', border: '#DC2626' },
  danger: { bg: '#DC2626', color: '#FFFFFF', border: '#DC2626' },

  // Tím (Purple)
  purple: { bg: '#7C3AED', color: '#FFFFFF', border: '#7C3AED' },

  // Đen / Tối (Dark)
  dark: { bg: '#0F172A', color: '#FFFFFF', border: '#0F172A' },

  // ── Nhóm nền sáng: CHỮ ĐEN ──
  // Xám (Gray / Neutral / Secondary)
  gray: { bg: '#F1F5F9', color: '#0F172A', border: '#CBD5E1' },
  neutral: { bg: '#F1F5F9', color: '#0F172A', border: '#CBD5E1' },
  secondary: { bg: '#F1F5F9', color: '#0F172A', border: '#CBD5E1' },
  light: { bg: '#F1F5F9', color: '#0F172A', border: '#CBD5E1' },

  // Trắng (White)
  white: { bg: '#FFFFFF', color: '#0F172A', border: '#CBD5E1' }
};

export default function StatusBadge({
  variant = 'secondary',
  icon: Icon,
  isSpinning = false,
  text,
  children,
  className = '',
  style = {},
  ...props
}) {
  const config = BADGE_CONFIG[variant] || BADGE_CONFIG.neutral;
  const content = text ?? children;

  return (
    <span
      className={`status-badge status-badge--${variant} ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.border,
        ...style
      }}
      {...props}
    >
      {isSpinning && (
        <Spinner
          animation="border"
          size="sm"
          className="flex-shrink-0"
          style={{ borderWidth: '1px', width: '10px', height: '10px', color: config.color }}
        />
      )}
      {Icon && <Icon size={12} style={{ color: config.color }} />}
      {content}
    </span>
  );
}
