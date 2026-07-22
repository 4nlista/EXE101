import React, { useState } from 'react';
import { Settings, CreditCard, Moon, Sun, ArrowUpRight, ArrowDownRight, Clock, Plus } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('wallet');
  const [balance, setBalance] = useState(50000);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState(50000);

  // Fake transactions
  const transactions = [
    { id: 1, type: 'up', title: 'Nạp tiền vào ví', amount: '+50,000đ', time: '10:30, 22/07/2026', status: 'Thành công' },
    { id: 2, type: 'down', title: 'Đăng bài VIP', amount: '-50,000đ', time: '09:15, 21/07/2026', status: 'Thành công' }
  ];

  const handleTopup = () => {
    // Fake VNPay integration popup
    alert(`Đang chuyển hướng sang cổng thanh toán VNPay để nạp ${topupAmount.toLocaleString()}đ...`);
    setTimeout(() => {
      setBalance(prev => prev + topupAmount);
      setShowTopup(false);
      alert('Nạp tiền thành công! Số dư đã được cộng.');
    }, 1000);
  };

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
            <Settings size={18} /> Cài đặt chung
          </button>

          <button 
            onClick={() => setActiveTab('theme')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, border: 'none', background: activeTab === 'theme' ? 'var(--bg-subtle)' : 'transparent', color: activeTab === 'theme' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
          >
            <Sun size={18} /> Giao diện
          </button>

          <button 
            onClick={() => setActiveTab('wallet')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, border: 'none', background: activeTab === 'wallet' ? 'var(--bg-subtle)' : 'transparent', color: activeTab === 'wallet' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
          >
            <CreditCard size={18} /> Số dư & Nạp tiền
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 32, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        {activeTab === 'general' && (
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Cài đặt chung</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Tính năng này đang được phát triển...</p>
          </div>
        )}

        {activeTab === 'theme' && (
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Giao diện</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Tùy chỉnh giao diện Sáng / Tối.</p>
            <div style={{ display: 'flex', gap: 16 }}>
               <button style={{ flex: 1, padding: 20, borderRadius: 12, border: '2px solid var(--primary)', background: '#fff', color: '#1f2937', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <Sun size={24} /> Giao diện Sáng
               </button>
               <button style={{ flex: 1, padding: 20, borderRadius: 12, border: '1px solid var(--border)', background: '#111827', color: '#fff', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', opacity: 0.8 }}>
                  <Moon size={24} /> Giao diện Tối
               </button>
            </div>
            <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>* Dark mode đang trong giai đoạn Beta.</p>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 6 }}>Quản lý Số dư & Giao dịch</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>Nạp tiền vào ví để đăng bài tuyển dụng Premium, nổi bật tin đăng.</p>

            {/* Balance Card */}
            <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #C2410C 100%)', borderRadius: 16, padding: 32, color: 'white', position: 'relative', overflow: 'hidden', marginBottom: 32, boxShadow: '0 10px 25px -5px rgba(234, 88, 12, 0.4)' }}>
              
              <div style={{ position: 'absolute', right: -20, top: -20, width: 150, height: 150, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', right: 80, bottom: -40, width: 100, height: 100, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.9, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <CreditCard size={18} /> Số dư khả dụng
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 24 }}>
                  {balance.toLocaleString()}đ
                </div>

                <button 
                  onClick={() => setShowTopup(true)}
                  style={{ background: 'white', color: 'var(--primary-dark)', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                >
                  <Plus size={18} /> Nạp tiền ngay
                </button>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Lịch sử giao dịch</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {transactions.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.type === 'up' ? '#D1FAE5' : '#FEE2E2', color: t.type === 'up' ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {t.type === 'up' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {t.time}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: t.type === 'up' ? '#059669' : '#DC2626', marginBottom: 4 }}>
                      {t.amount}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: 99, display: 'inline-block' }}>
                      {t.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* Topup Modal */}
      {showTopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg)', width: 400, borderRadius: 16, padding: 32, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', position: 'relative' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>Nạp tiền vào ví</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>Chọn mệnh giá bạn muốn nạp. Thanh toán an toàn qua VNPay.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[50000, 100000, 200000, 500000].map(amt => (
                <button 
                  key={amt}
                  onClick={() => setTopupAmount(amt)}
                  style={{ padding: '12px 0', borderRadius: 8, border: topupAmount === amt ? '2px solid var(--primary)' : '1px solid var(--border)', background: topupAmount === amt ? 'rgba(234, 88, 12, 0.05)' : 'var(--bg)', color: topupAmount === amt ? 'var(--primary)' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {amt.toLocaleString()}đ
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setShowTopup(false)}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button 
                onClick={handleTopup}
                style={{ flex: 2, padding: 12, borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                Tiếp tục VNPay
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
