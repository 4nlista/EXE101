import React, { useState } from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Heart, Clock, Users, Target } from 'lucide-react';
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
      className="h-100 shadow-sm"
      style={{
        transition: 'transform 0.2s',
        cursor: 'pointer',
        borderColor: '#c0c2c5',
        borderWidth: '1px'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <Card.Body className="d-flex flex-column pt-3">
        {/* Hàng 1: Thời gian (Ngày đăng + Thời gian còn lại) đặt sát mép 2 bên */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          {project.createdAt && (
            <Badge pill bg="light" text="secondary" className="d-flex align-items-center px-2 py-1 border fw-normal">
              <Clock size={12} className="me-1" />
              <span style={{ fontSize: '0.65rem' }}>{formatCreatedDate(project.createdAt)}</span>
            </Badge>
          )}
          <Badge pill className="d-flex align-items-center px-2 py-1 fw-normal text-white">
            <Clock size={12} className="me-1" />
            <span style={{ fontSize: '0.65rem' }}>{calculateDaysLeft(project.deadline)}</span>
          </Badge>
        </div>

        {/* Ngành */}
        {project.ownerId?.departmentId?.name && (
          <div className="d-flex align-items-center gap-1 mt-1 text-muted" style={{ fontSize: '12px' }}>
            <span className="text-dark small">{project.ownerId.departmentId.name}</span>
          </div>
        )}

        {/* Hàng 2: Tiêu đề dự án (3) */}
        <Card.Title className="fw-bold mb-2 fs-6 text-dark" style={{ lineHeight: '1.0' }}>
          {project.title}
        </Card.Title>

        {/* Hàng 3: Mô tả (4) */}
        <Card.Text
          className="text-secondary small mb-3"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.5'
          }}
        >
          {project.description}
        </Card.Text>

        {/* Hàng 4: Số lượng tuyển (5) */}
        <div className="mb-2 text-dark fw-bold small">
          Số lượng tuyển: <span style={{ color: '#a05b0cff' }}>{project.maxMembers} ứng viên</span>
        </div>

        {/* Khối thông tin*/}
        <div className="mt-auto">
          <hr className="text-muted mb-3 mt-1" style={{ opacity: 0.15 }} />

          <div className="d-flex justify-content-between align-items-center">
            {/* Trái: Avatar (6) + Tên người đăng (7) */}
            <div className="d-flex align-items-center">
              <img
                src={project.ownerId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.ownerId?.name || 'A')}&background=random`}
                alt="avatar"
                className="rounded-circle me-2"
                style={{ width: '32px', height: '32px', objectFit: 'cover', border: '1px solid #eee' }}
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
