import React, { useState } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { Users, FolderGit2, DollarSign, FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { PROJECT_STATUS, APPLICATION_STATUS } from '../../../constants';

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
          <div className="stat-card">
            <div className="stat-card__icon">
              <Users size={18} />
            </div>
            <div>
              <div className="stat-card__label">Tổng người dùng</div>
              <div className="stat-card__value">{userStats.total || 0}</div>
              <div className="small text-muted mt-2 d-flex gap-2 align-items-center">
                <span className="status-badge status-badge--warning">
                  {userStats.vip || 0} VIP
                </span>
                <span className="status-badge status-badge--danger">
                  {userStats.locked || 0} Khóa
                </span>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <div className="stat-card">
            <div className="stat-card__icon">
              <FolderGit2 size={18} />
            </div>
            <div>
              <div className="stat-card__label">Tổng dự án</div>
              <div className="stat-card__value">{projectStats.total || 0}</div>
              <div className="small text-muted mt-2 d-flex gap-2 align-items-center">
                <span className="status-badge status-badge--success">
                  {byStatus[PROJECT_STATUS.OPEN] || 0} Đang mở
                </span>
                <span className="status-badge status-badge--neutral">
                  {byStatus[PROJECT_STATUS.COMPLETED] || 0} Xong
                </span>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <div className="stat-card">
            <div className="stat-card__icon">
              <FileText size={18} />
            </div>
            <div>
              <div className="stat-card__label">Hồ sơ ứng tuyển</div>
              <div className="stat-card__value">{appStats.total || 0}</div>
              <div className="small text-muted mt-2 d-flex gap-2 align-items-center">
                <span className="status-badge status-badge--success">
                  {appStats.byStatus?.[APPLICATION_STATUS.APPROVED] || 0} Đã duyệt
                </span>
                <span className="status-badge status-badge--warning">
                  {appStats.byStatus?.[APPLICATION_STATUS.PENDING] || 0} Chờ duyệt
                </span>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <div className="stat-card stat-card--success">
            <div className="stat-card__icon">
              <DollarSign size={18} />
            </div>
            <div>
              <div className="stat-card__label">Tổng doanh thu gói</div>
              <div className="stat-card__value">
                {(revenueStats.total || 0).toLocaleString('vi-VN')} đ
              </div>
              <div className="small text-muted mt-2">
                <span className="status-badge status-badge--success">
                  Gói VIP & Premium
                </span>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Chi tiết phân bổ trạng thái dự án */}
      <div className="card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-semibold text-dark mb-0">Phân bổ trạng thái dự án trên toàn hệ thống</h6>
          <span className="text-muted small">Thời gian thực</span>
        </div>
        <Row className="g-3">
          {/* 1. Đang mở tuyển */}
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded text-center border" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <div className="small text-muted mb-1">Đang mở tuyển</div>
              <div className="fs-5 fw-bold text-dark">{byStatus[PROJECT_STATUS.OPEN] || 0}</div>
            </div>
          </Col>

          {/* 2. Đang thực hiện */}
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded text-center border" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <div className="small text-muted mb-1">Đang thực hiện</div>
              <div className="fs-5 fw-bold text-dark">{byStatus[PROJECT_STATUS.IN_PROGRESS] || 0}</div>
            </div>
          </Col>

          {/* 3. Đã hoàn thành */}
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded text-center border" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <div className="small text-muted mb-1">Đã hoàn thành</div>
              <div className="fs-5 fw-bold text-dark">{byStatus[PROJECT_STATUS.COMPLETED] || 0}</div>
            </div>
          </Col>

          {/* 4. Đã đóng slot */}
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded text-center border" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <div className="small text-muted mb-1">Đã đóng slot</div>
              <div className="fs-5 fw-bold text-dark">{byStatus[PROJECT_STATUS.CLOSED] || 0}</div>
            </div>
          </Col>

          {/* 5. Đã hủy */}
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded text-center border" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <div className="small text-muted mb-1">Đã hủy</div>
              <div className="fs-5 fw-bold text-dark">{byStatus[PROJECT_STATUS.CANCELLED] || 0}</div>
            </div>
          </Col>

          {/* 6. Đình chỉ / Vi phạm */}
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded text-center border" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <div className="small text-muted mb-1">Đình chỉ</div>
              <div className="fs-5 fw-bold text-dark">{byStatus[PROJECT_STATUS.SUSPENDED] || 0}</div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Biểu đồ Doanh thu theo 12 tháng gần nhất */}
      <div className="card p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h6 className="fw-semibold text-dark mb-1 d-flex align-items-center gap-2">
              <TrendingUp size={16} className="text-secondary" /> Doanh thu theo 12 tháng gần nhất
            </h6>
            <div className="text-muted small">Biến động doanh thu gói VIP & Premium qua các tháng</div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <span className="text-muted small">Tháng này: </span>
              <span className="fw-semibold text-dark me-3">{currentMonthRevenue.toLocaleString('vi-VN')} đ</span>
              <span className="text-muted small">Tổng 12 tháng: </span>
              <span className="fw-semibold text-dark fs-6">{(total12MonthsRevenue || 0).toLocaleString('vi-VN')} đ</span>
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
                      <div className="fw-semibold">{item.fullLabel}</div>
                      <div className="text-white fw-bold mt-1">{(item.revenue || 0).toLocaleString('vi-VN')} đ</div>
                      <div className="text-white-50">{item.count || 0} giao dịch</div>
                    </div>
                  )}

                  {/* Thanh Bar */}
                  <div className="w-100 d-flex flex-column justify-content-end" style={{ height: '140px' }}>
                    <div
                      className="w-100 rounded-top"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: item.revenue > 0
                          ? (isCurrentMonth ? 'var(--primary)' : 'var(--primary-hover)')
                          : 'var(--border)',
                        opacity: isHovered ? 1 : 0.85,
                        transition: 'all 0.15s ease'
                      }}
                    />
                  </div>

                  {/* Nhãn tháng */}
                  <div
                    className={`mt-2 small text-center text-nowrap ${isCurrentMonth ? 'fw-semibold text-dark' : 'text-muted'}`}
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
          <div className="stat-card">
            <div className="stat-card__icon">
              <CheckCircle size={18} />
            </div>
            <div>
              <div className="stat-card__label">Sinh viên mới trong 7 ngày qua</div>
              <div className="stat-card__value">+{userStats.newThisWeek || 0}</div>
            </div>
          </div>
        </Col>
        <Col md={6}>
          <div className="stat-card">
            <div className="stat-card__icon">
              <Clock size={18} />
            </div>
            <div>
              <div className="stat-card__label">Dự án mới trong 7 ngày qua</div>
              <div className="stat-card__value">+{projectStats.newThisWeek || 0}</div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
