import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Users, CheckCircle, Clock, CheckSquare, FileText, XCircle } from 'lucide-react';

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const data = [
    {
      title: 'Đang tuyển',
      count: stats.openProjects || 0,
      desc: 'Dự án đang mở tuyển thành viên',
      icon: <Users size={18} />,
      borderClass: ''
    },
    {
      title: 'Đã đủ thành viên',
      count: stats.closedProjects || 0,
      desc: 'Dự án đã đủ số lượng',
      icon: <CheckCircle size={18} />,
      borderClass: ''
    },
    {
      title: 'Đang thực hiện',
      count: stats.inProgressProjects || 0,
      desc: 'Dự án đang tiến hành',
      icon: <Clock size={18} />,
      borderClass: ''
    },
    {
      title: 'Đã kết thúc',
      count: stats.completedProjects || 0,
      desc: 'Dự án đã hoàn thành',
      icon: <CheckSquare size={18} />,
      borderClass: ''
    },
    {
      title: 'Hồ sơ chờ duyệt',
      count: stats.pendingApplications || 0,
      desc: 'Ứng viên đang chờ bạn duyệt',
      icon: <FileText size={18} />,
      borderClass: stats.pendingApplications > 0 ? 'stat-card--warning' : ''
    },
    {
      title: 'Đã hủy',
      count: stats.cancelledProjects || 0,
      desc: 'Dự án đã bị hủy bỏ',
      icon: <XCircle size={18} />,
      borderClass: ''
    }
  ];

  return (
    <Row className="g-3 mb-4">
      {data.map((item, idx) => (
        <Col lg={4} md={6} sm={12} key={idx}>
          <div className={`stat-card ${item.borderClass}`}>
            <div className="stat-card__icon">
              {item.icon}
            </div>
            <div>
              <div className="stat-card__label">{item.title}</div>
              <div className="stat-card__value">{item.count}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                {item.desc}
              </div>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );
}
