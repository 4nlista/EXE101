import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FaUserFriends, FaCheckCircle, FaFileAlt } from 'react-icons/fa';

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const data = [
    {
      title: 'Đang tuyển',
      count: stats.openProjects || 0,
      desc: 'dự án đang mở tuyển thành viên',
      icon: <FaUserFriends size={24} className="text-warning" />,
      bgColor: '#fff8eb',
      iconBg: '#ffedd5'
    },
    {
      title: 'Đã đủ thành viên',
      count: stats.closedProjects || 0,
      desc: 'dự án đã đủ số lượng thành viên',
      icon: <FaCheckCircle size={24} className="text-secondary" />,
      bgColor: '#f8f9fa',
      iconBg: '#e9ecef'
    },
    {
      title: 'Đang thực hiện',
      count: stats.inProgressProjects || 0,
      desc: 'dự án team đang làm việc',
      icon: <FaUserFriends size={24} className="text-primary" />,
      bgColor: '#eff6ff',
      iconBg: '#dbeafe'
    },
    {
      title: 'Đã kết thúc',
      count: stats.completedProjects || 0,
      desc: 'dự án đã hoàn thành',
      icon: <FaCheckCircle size={24} className="text-success" />,
      bgColor: '#f0fdf4',
      iconBg: '#dcfce7'
    },
    {
      title: 'Hồ sơ chờ duyệt',
      count: stats.pendingApplications || 0,
      desc: 'ứng viên đang chờ bạn xét duyệt',
      icon: <FaFileAlt size={24} className="text-info" />,
      bgColor: '#e0f2fe',
      iconBg: '#bae6fd'
    }
  ];

  return (
    <Row className="g-3 mb-4">
      {data.map((item, idx) => (
        <Col md={4} key={idx}>
          <Card className="border-0 shadow-sm h-100 rounded-4" style={{ backgroundColor: item.bgColor }}>
            <Card.Body className="d-flex align-items-center">
              <div 
                className="d-flex align-items-center justify-content-center rounded-3 me-3 flex-shrink-0" 
                style={{ width: '48px', height: '48px', backgroundColor: item.iconBg }}
              >
                {item.icon}
              </div>
              <div>
                <h6 className="mb-0 text-muted fw-semibold" style={{ fontSize: '13px' }}>{item.title}</h6>
                <h3 className="mb-0 fw-bold">{item.count}</h3>
                <small className="text-muted" style={{ fontSize: '12px' }}>{item.desc}</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
