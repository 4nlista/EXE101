import React, { useState } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { Users, FolderGit2, DollarSign, FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function OverviewTab({ stats, isLoading }) {
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState(null);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="secondary" size="sm" />
        <div className="text-muted small mt-2">Đang tải số liệu thống kê...</div>
      </div>
    );
  }

  const userStats = stats?.users || {};
  const projectStats = stats?.projects || {};
  const appStats = stats?.applications || {};
  const revenueStats = stats?.revenue || {};
  const byStatus = projectStats.byStatus || {};
  const monthlyRevenue = revenueStats.monthly || [];

  // Tính toán số liệu doanh thu 12 tháng
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue || 0), 100000);
  const total12MonthsRevenue = monthlyRevenue.reduce((sum, m) => sum + (m.revenue || 0), 0);
  const currentMonthRevenue = monthlyRevenue.length > 0 ? (monthlyRevenue[monthlyRevenue.length - 1].revenue || 0) : 0;

  return (
    <div>
      {/* 4 Thẻ chỉ số tổng quan chính */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <div className="bg-white p-3 rounded-3 border shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-medium">Tổng người dùng</span>
              <div className="p-2 rounded-2 bg-primary bg-opacity-10 text-primary">
                <Users size={18} />
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{userStats.total || 0}</div>
            <div className="small text-muted mt-2 d-flex gap-2 align-items-center">
              <span className="badge border" style={{ backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}>
                {userStats.vip || 0} VIP
              </span>
              <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
                {userStats.locked || 0} Bị khóa
              </span>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <div className="bg-white p-3 rounded-3 border shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-medium">Tổng dự án</span>
              <div className="p-2 rounded-2 bg-success bg-opacity-10 text-success">
                <FolderGit2 size={18} />
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{projectStats.total || 0}</div>
            <div className="small text-muted mt-2 d-flex gap-2 align-items-center">
              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                {byStatus.open || 0} Đang tuyển
              </span>
              <span className="badge border" style={{ backgroundColor: '#f5f3ff', color: '#6d28d9', borderColor: '#ddd6fe' }}>
                {byStatus.completed || 0} Hoàn thành
              </span>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <div className="bg-white p-3 rounded-3 border shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-medium">Hồ sơ ứng tuyển</span>
              <div className="p-2 rounded-2" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                <FileText size={18} />
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{appStats.total || 0}</div>
            <div className="small text-muted mt-2 d-flex gap-2 align-items-center">
              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                {appStats.byStatus?.approved || 0} Đã duyệt
              </span>
              <span className="badge bg-warning bg-opacity-10 text-warning-emphasis border border-warning border-opacity-25">
                {appStats.byStatus?.pending || 0} Chờ duyệt
              </span>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <div className="bg-white p-3 rounded-3 border shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-medium">Tổng doanh thu gói</span>
              <div className="p-2 rounded-2" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                <DollarSign size={18} />
              </div>
            </div>
            <div className="fs-3 fw-bold text-success">
              {(revenueStats.total || 0).toLocaleString('vi-VN')} đ
            </div>
            <div className="small text-muted mt-2">
              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                Gói VIP & Premium
              </span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Chi tiết phân bổ trạng thái dự án - Quy ước màu sắc trực quan */}
      <div className="bg-white p-4 rounded-3 border shadow-sm mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold text-dark mb-0">Phân bổ trạng thái dự án trên toàn hệ thống</h6>
          <span className="text-muted small">Cập nhật thời gian thực</span>
        </div>
        <Row className="g-3">
          {/* 1. Đang mở tuyển: Xanh lá */}
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded-3 text-center border" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div className="small fw-semibold mb-1 text-success">Đang mở tuyển</div>
              <div className="fs-4 fw-bold text-success">{byStatus.open || 0}</div>
            </div>
          </Col>

          {/* 2. Đang thực hiện: Xanh dương */}
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded-3 text-center border" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
              <div className="small fw-semibold mb-1 text-primary">Đang thực hiện</div>
              <div className="fs-4 fw-bold text-primary">{byStatus.in_progress || 0}</div>
            </div>
          </Col>

          {/* 3. Đã hoàn thành: Tím */}
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded-3 text-center border" style={{ backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' }}>
              <div className="small fw-semibold mb-1" style={{ color: '#6d28d9' }}>Đã hoàn thành</div>
              <div className="fs-4 fw-bold" style={{ color: '#7c3aed' }}>{byStatus.completed || 0}</div>
            </div>
          </Col>

          {/* 4. Đã đóng slot: Vàng cam */}
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded-3 text-center border" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
              <div className="small fw-semibold mb-1" style={{ color: '#b45309' }}>Đã đóng slot</div>
              <div className="fs-4 fw-bold" style={{ color: '#d97706' }}>{byStatus.closed || 0}</div>
            </div>
          </Col>

          {/* 5. Đã hủy: Đỏ */}
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded-3 text-center border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
              <div className="small fw-semibold mb-1 text-danger">Đã hủy</div>
              <div className="fs-4 fw-bold text-danger">{byStatus.cancelled || 0}</div>
            </div>
          </Col>

          {/* 6. Đình chỉ / Vi phạm: Đỏ sẫm */}
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded-3 text-center border" style={{ backgroundColor: '#fff1f2', borderColor: '#fecdd3' }}>
              <div className="small fw-semibold mb-1" style={{ color: '#be123c' }}>Đình chỉ (Admin)</div>
              <div className="fs-4 fw-bold" style={{ color: '#be123c' }}>{byStatus.suspended || 0}</div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Biểu đồ Doanh thu theo 12 tháng gần nhất */}
      <div className="bg-white p-4 rounded-3 border shadow-sm mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <TrendingUp size={18} className="text-secondary" /> Doanh thu theo 12 tháng gần nhất
            </h6>
            <div className="text-muted small">Biến động doanh thu gói VIP & Premium qua các tháng</div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <span className="text-muted small">Tháng này: </span>
              <span className="fw-bold text-dark me-3">{currentMonthRevenue.toLocaleString('vi-VN')} đ</span>
              <span className="text-muted small">Tổng 12 tháng: </span>
              <span className="fw-bold text-success fs-6">{total12MonthsRevenue.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>

        {/* Cột biểu đồ 12 tháng */}
        <div className="pt-3 pb-2 px-1">
          <div className="d-flex align-items-end justify-content-between gap-2" style={{ height: '170px' }}>
            {monthlyRevenue.map((item, idx) => {
              const heightPercent = item.revenue > 0 ? Math.max(16, Math.round((item.revenue / maxRevenue) * 100)) : 8;
              const isHovered = hoveredMonthIndex === idx;
              const isCurrentMonth = idx === monthlyRevenue.length - 1;

              return (
                <div
                  key={`${item.year}-${item.month}`}
                  className="flex-grow-1 d-flex flex-column align-items-center position-relative"
                  style={{ height: '100%', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredMonthIndex(idx)}
                  onMouseLeave={() => setHoveredMonthIndex(null)}
                >
                  {/* Tooltip khi hover */}
                  {isHovered && (
                    <div
                      className="position-absolute bg-dark text-white p-2 rounded shadow-sm text-center text-nowrap"
                      style={{
                        bottom: '105%',
                        zIndex: 1050,
                        fontSize: '0.75rem',
                        lineHeight: '1.2'
                      }}
                    >
                      <div className="fw-bold">{item.fullLabel}</div>
                      <div className="text-success fw-semibold mt-1">{(item.revenue || 0).toLocaleString('vi-VN')} đ</div>
                      <div className="text-white-50">{item.count || 0} lượt giao dịch</div>
                    </div>
                  )}

                  {/* Thanh Bar */}
                  <div className="w-100 d-flex flex-column justify-content-end" style={{ height: '140px' }}>
                    <div
                      className="w-100 rounded-top transition-all"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: item.revenue > 0
                          ? (isCurrentMonth ? '#059669' : '#10b981')
                          : '#e5e7eb',
                        opacity: isHovered ? 1 : 0.85,
                        boxShadow: isHovered ? '0 4px 10px rgba(16, 185, 129, 0.3)' : 'none',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    />
                  </div>

                  {/* Nhãn tháng */}
                  <div
                    className={`mt-2 small text-center text-nowrap ${isCurrentMonth ? 'fw-bold text-success' : 'text-muted'}`}
                    style={{ fontSize: '0.72rem' }}
                  >
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tóm tắt tăng trưởng tuần qua */}
      <Row className="g-3">
        <Col md={6}>
          <div className="bg-white p-3 rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small">Sinh viên mới đăng ký trong 7 ngày qua</div>
              <div className="fs-4 fw-bold text-dark mt-1">+{userStats.newThisWeek || 0} người dùng</div>
            </div>
            <div className="p-3 rounded-circle bg-light text-secondary">
              <CheckCircle size={24} />
            </div>
          </div>
        </Col>
        <Col md={6}>
          <div className="bg-white p-3 rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small">Dự án mới tạo trong 7 ngày qua</div>
              <div className="fs-4 fw-bold text-dark mt-1">+{projectStats.newThisWeek || 0} dự án</div>
            </div>
            <div className="p-3 rounded-circle bg-light text-secondary">
              <Clock size={24} />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
