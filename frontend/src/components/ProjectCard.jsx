import React, { useState } from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Heart, Clock, Users, BookOpen } from 'lucide-react';
import Button from './Button';
import { formatCreatedDate, calculateDaysLeft } from '../utils/formatDate';

export default function ProjectCard({ project, onViewDetail }) {
  const [isSaved, setIsSaved] = useState(false); // Toggle tạm thời cho UI

  const handleSaveToggle = (e) => {
    e.stopPropagation(); // Tránh bị click vào card
    setIsSaved(!isSaved);
  };

  return (
    <Card
      className="h-100 shadow-sm border-1"
      style={{
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        borderRadius: '16px',
        backgroundColor: '#ffffff'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
      }}
    >
      <Card.Body className="d-flex flex-column p-4">
        {/* Hàng 1: Thời gian (Ngày đăng + Thời gian còn lại) đặt sát mép 2 bên */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          {project.createdAt && (
            <Badge pill bg="light" text="secondary" className="d-flex align-items-center px-2 py-1 border">
              <Clock size={12} />
              <span style={{ fontSize: '0.7rem' }}>{formatCreatedDate(project.createdAt)}</span>
            </Badge>
          )}
          <Badge pill bg="primary" className="d-flex align-items-center py-1 fw-normal text-white">
            <Clock size={12} />
            <span style={{ fontSize: '0.7rem' }}>{calculateDaysLeft(project.deadline)}</span>
          </Badge>
        </div>

        {/* Hàng 2: Tiêu đề dự án */}
        <Card.Title className="fw-bold mb-2 text-dark" style={{ fontSize: '1.0rem', lineHeight: '1.0' }}>
          {project.title}
        </Card.Title>

        {/* Ngành */}
        {project.ownerId?.departmentId?.name && (
          <div className="mb-2 ms-1">
            <Badge bg="light" text="secondary" className="d-flex align-items-center d-inline-flex px-2 py-1 border fw-normal rounded-2">
              <BookOpen size={12} className="me-1" />
              <span style={{ fontSize: '0.75rem' }}>{project.ownerId.departmentId.name}</span>
            </Badge>
          </div>
        )}

        {/* Hàng 3: Mô tả */}
        <Card.Text
          className="text-muted small mb-2 px-2"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.6'
          }}
        >
          {project.description}
        </Card.Text>

        {/* Hàng 4: Số lượng tuyển */}
        <div className="mb-3 text-dark fw-medium small d-flex align-items-center text-muted">
          <Users size={14} className="me-2 text-primary" />
          <span>Số lượng tuyển: <span style={{ color: '#ea580c' }}>{project.maxMembers} ứng viên</span></span>
        </div>

        {/* Khối thông tin*/}
        <div className="mt-auto">
          <hr className="text-muted mb-3 mt-0" style={{ opacity: 0.2 }} />

          <div className="d-flex justify-content-between align-items-center">
            {/* Trái: Avatar (6) + Tên người đăng (7) */}
            <div className="d-flex align-items-center">
              <img
                src={project.ownerId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.ownerId?.name || 'A')}&background=random`}
                alt="avatar"
                className="rounded-circle me-2"
                style={{ width: '32px', height: '32px', objectFit: 'cover', border: '1px solid #9b9595ff' }}
              />
              <span className="fw-medium text-dark small text-truncate" style={{ maxWidth: '100px' }}>
                {project.ownerId?.name || 'Ẩn danh'}
              </span>
            </div>

            {/* Phải: Nút thả tim (8) + Button Chi tiết (9) */}
            <div className="d-flex align-items-center">
              <button
                className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center me-2"
                onClick={handleSaveToggle}
                title={isSaved ? "Bỏ lưu" : "Lưu dự án"}
                style={{ width: '36px', height: '36px', border: '1px solid #b4b1b1ff' }}
              >
                {isSaved ? <Heart size={18} fill="#dc3545" className="text-danger" /> : <Heart size={18} className="text-muted" />}
              </button>
              <Button
                variant="primary"
                size="sm"
                className="px-3 py-1 fw-medium"
                style={{ backgroundColor: '#ea580c', borderColor: '#c7e0ecff' }}
                onClick={(e) => { e.stopPropagation(); onViewDetail && onViewDetail(); }}
              >
                Chi tiết
              </Button>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
