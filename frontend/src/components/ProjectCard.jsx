import React, { useState } from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Heart, Clock, Users, Target } from 'lucide-react';
import Button from './Button';

export default function ProjectCard({ project }) {
  const [isSaved, setIsSaved] = useState(false); // Toggle tạm thời cho UI

  const handleSaveToggle = (e) => {
    e.stopPropagation(); // Tránh bị click vào card
    setIsSaved(!isSaved);
  };

  // Tính số ngày còn lại đến deadline
  const calculateDaysLeft = (deadlineStr) => {
    if (!deadlineStr) return 'Không xác định';
    const diff = new Date(deadlineStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `Còn ${days} ngày` : 'Hết hạn';
  };

  return (
    <Card className="mb-4 shadow-sm border-0" style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          {/* Tags / Badge */}
          <div>
            {project.departmentIds?.map((dep, idx) => (
              <Badge bg="primary" className="me-2" key={idx}>{dep.name || 'Ngành học'}</Badge>
            ))}
            <Badge bg={project.status === 'open' ? 'success' : 'secondary'}>
              {project.status === 'open' ? 'Đang tuyển' : 'Đã đóng'}
            </Badge>
          </div>
          
          {/* Nút lưu/thả tim */}
          <button className="btn btn-link text-danger p-0" onClick={handleSaveToggle} title={isSaved ? "Bỏ lưu" : "Lưu dự án"}>
            {isSaved ? <Heart size={24} fill="currentColor" /> : <Heart size={24} />}
          </button>
        </div>

        {/* Tiêu đề & Thông tin chủ dự án */}
        <Card.Title className="fw-bold mb-2 fs-5 text-dark">{project.title}</Card.Title>
        <div className="text-muted small mb-3 d-flex align-items-center">
          Đăng bởi: <strong className="ms-1 me-3 text-dark">{project.ownerId?.name || 'Ẩn danh'}</strong>
        </div>

        {/* Thông tin mô tả ngắn gọn */}
        <Card.Text className="text-secondary" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.description}
        </Card.Text>

        {/* Các thông số kỹ thuật (KPIs) */}
        <div className="d-flex flex-wrap gap-3 mb-3 mt-3">
          <div className="d-flex align-items-center text-muted small">
            <Target size={16} className="me-1 text-info" /> Mục tiêu điểm: <strong>{project.gradeTarget || 'N/A'}</strong>
          </div>
          <div className="d-flex align-items-center text-muted small">
            <Users size={16} className="me-1 text-primary" /> Vị trí tuyển: 
            <strong className="ms-1">{project.maxMembers} thành viên</strong>
          </div>
          <div className="d-flex align-items-center text-muted small">
            <Clock size={16} className="me-1 text-warning" /> Hạn chót: 
            <strong className="ms-1">{calculateDaysLeft(project.deadline)}</strong>
          </div>
        </div>

        {/* Chi tiết Vị trí (Vd: Frontend (2), Backend(1)) */}
        <div className="mb-3">
          {project.positionDetails?.map((pos, idx) => (
            <Badge bg="light" text="dark" className="me-2 border" key={idx}>
              {pos.positionName} ({pos.quantity})
            </Badge>
          ))}
        </div>

        <hr className="text-muted" />

        {/* Nút thao tác */}
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">Đăng ngày: {new Date(project.createdAt).toLocaleDateString('vi-VN')}</small>
          <Button variant="outline-primary" size="sm">Xem chi tiết</Button>
        </div>
      </Card.Body>
    </Card>
  );
}
