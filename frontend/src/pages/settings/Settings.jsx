import React, { useState } from 'react';
import { Settings, CreditCard, Moon, Sun, ArrowUpRight, ArrowDownRight, Clock, Plus } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('wallet');
  const [showTopup, setShowTopup] = useState(true);
  const [topupAmount, setTopupAmount] = useState();


  const handleTopup = () => {

    return (
      <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 32, minHeight: 'calc(100vh - 65px)' }}>

        {/* Sidebar Settings */}
        <div style={{ width: 250 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: 'var(--text-primary)' }}>Cài đặt</h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => setActiveTab('general')}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, border: 'none', background: activeTab === 'general' ? 'var(--bg-subtle)' : 'transparent', color: activeTab === 'general' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
            >
              <Settings size={18} /> Đổi mật khẩu
            </button>

            <button
              onClick={() => setActiveTab('theme')}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, border: 'none', background: activeTab === 'theme' ? 'var(--bg-subtle)' : 'transparent', color: activeTab === 'theme' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
            >
              <Sun size={18} /> Giao diện
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: 32, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>

          {activeTab === 'general' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Cài đặt chung</h2>

              <div style={{ background: 'var(--bg-subtle)', padding: 24, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 24 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Đổi mật khẩu</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Mật khẩu hiện tại</label>
                    <input type="password" placeholder="Nhập mật khẩu hiện tại" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Mật khẩu mới</label>
                    <input type="password" placeholder="Nhập mật khẩu mới" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Xác nhận mật khẩu mới</label>
                    <input type="password" placeholder="Nhập lại mật khẩu mới" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                  <button className="btn btn-primary" style={{ width: 'max-content', marginTop: 8 }}>Cập nhật mật khẩu</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Giao diện</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Tùy chỉnh giao diện Sáng / Tối.</p>
              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  onClick={() => document.documentElement.removeAttribute('data-theme')}
                  style={{ flex: 1, padding: 20, borderRadius: 12, border: '2px solid var(--primary)', background: '#fff', color: '#1f2937', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                >
                  <Sun size={24} /> Giao diện Sáng
                </button>
                <button
                  onClick={() => document.documentElement.setAttribute('data-theme', 'dark')}
                  style={{ flex: 1, padding: 20, borderRadius: 12, border: '1px solid var(--border)', background: '#111827', color: '#fff', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                >
                  <Moon size={24} /> Giao diện Tối
                </button>
              </div>
              <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>* Dark mode áp dụng lên toàn bộ hệ thống.</p>
            </div>
          )}
        </div>

      </div>
    );
  }
}