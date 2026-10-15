import React from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { Users, FolderGit2, ShieldAlert, DollarSign, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function OverviewTab({ stats, isLoading }) {
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

  return (
    <div>
      {/* 4 Thẻ chỉ số tổng quan chính */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <div className="bg-white p-3 rounded-3 border shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-medium">Tổng người dùng</span>
              <div className="p-2 rounded-2 bg-light text-secondary">
                <Users size={18} />
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{userStats.total || 0}</div>
            <div className="small text-muted mt-1 d-flex gap-2">
              <span>{userStats.vip || 0} VIP</span>
              <span>•</span>
              <span className="text-danger">{userStats.locked || 0} Bị khóa</span>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <div className="bg-white p-3 rounded-3 border shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-medium">Tổng dự án</span>
              <div className="p-2 rounded-2 bg-light text-secondary">
                <FolderGit2 size={18} />
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{projectStats.total || 0}</div>
            <div className="small text-muted mt-1 d-flex gap-2">
              <span className="text-success">{byStatus.open || 0} Đang tuyển</span>
              <span>•</span>
              <span>{byStatus.completed || 0} Hoàn thành</span>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <div className="bg-white p-3 rounded-3 border shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-medium">Hồ sơ ứng tuyển</span>
              <div className="p-2 rounded-2 bg-light text-secondary">
                <FileText size={18} />
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">{appStats.total || 0}</div>
            <div className="small text-muted mt-1 d-flex gap-2">
              <span className="text-success">{appStats.byStatus?.approved || 0} Đã duyệt</span>
              <span>•</span>
              <span>{appStats.byStatus?.pending || 0} Chờ duyệt</span>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <div className="bg-white p-3 rounded-3 border shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-medium">Tổng doanh thu gói</span>
              <div className="p-2 rounded-2 bg-light text-secondary">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="fs-3 fw-bold text-dark">
              {(revenueStats.total || 0).toLocaleString('vi-VN')} đ
            </div>
            <div className="small text-muted mt-1">Từ các gói VIP / Premium</div>
          </div>
        </Col>
      </Row>

      {/* Chi tiết phân bổ trạng thái dự án */}
      <div className="bg-white p-4 rounded-3 border shadow-sm mb-4">
        <h6 className="fw-bold text-dark mb-3">Phân bổ trạng thái dự án trên toàn hệ thống</h6>
        <Row className="g-3">
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded-2 bg-light border text-center">
              <div className="text-muted small mb-1">Đang mở tuyển</div>
              <div className="fs-5 fw-bold text-dark">{byStatus.open || 0}</div>
            </div>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded-2 bg-light border text-center">
              <div className="text-muted small mb-1">Đang thực hiện</div>
              <div className="fs-5 fw-bold text-dark">{byStatus.in_progress || 0}</div>
            </div>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded-2 bg-light border text-center">
              <div className="text-muted small mb-1">Đã hoàn thành</div>
              <div className="fs-5 fw-bold text-dark">{byStatus.completed || 0}</div>
            </div>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded-2 bg-light border text-center">
              <div className="text-muted small mb-1">Đã đóng slot</div>
              <div className="fs-5 fw-bold text-dark">{byStatus.closed || 0}</div>
            </div>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded-2 bg-light border text-center">
              <div className="text-muted small mb-1">Đã hủy</div>
              <div className="fs-5 fw-bold text-dark">{byStatus.cancelled || 0}</div>
            </div>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <div className="p-3 rounded-2 bg-light border text-center">
              <div className="text-muted small mb-1 text-danger">Đình chỉ (Admin)</div>
              <div className="fs-5 fw-bold text-danger">{byStatus.suspended || 0}</div>
            </div>
          </Col>
        </Row>
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
