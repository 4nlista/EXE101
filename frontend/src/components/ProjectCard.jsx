import React, { useState, useEffect } from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Heart, Clock, Users, BookOpen, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { formatCreatedDate, calculateDaysLeft } from '../utils/formatDate';
import { toggleLikeProject } from '../services/projectService';

export default function ProjectCard({
  project,
  onViewDetail,
  onLikeChange,
  matchPercent,
  aiReason,
  aiReasonBg = '#fcf5ddff', // Màu nền khối Gợi ý AI (VD: '#f8f9fa', '#fff7ed', '#f1f5f9'...)
  aiReasonColor = '#1f2937', // Màu chữ khối Gợi ý AI
  cardBg = '#ffffff' // Màu nền của toàn bộ Card
}) {
  const [isSaved, setIsSaved] = useState(Boolean(project?.isLiked));
  const [loadingLike, setLoadingLike] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsSaved(Boolean(project?.isLiked));
  }, [project?.isLiked]);

  if (!project) return null;

  // Thả tim hoặc bỏ thả tim dự án
  const handleSaveToggle = async (e) => {
    e.stopPropagation(); // Tránh bị click vào card
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để lưu dự án vào danh sách yêu thích.');
      return;
    }

    if (loadingLike) return;

    const nextState = !isSaved;
    setIsSaved(nextState);
    setLoadingLike(true);

    try {
      await toggleLikeProject(project._id);
      if (onLikeChange) {
        onLikeChange(project._id, nextState);
      }
    } catch (err) {
      // Revert lại nếu có lỗi
      setIsSaved(!nextState);
      console.error('Lỗi khi thả tim dự án:', err);
    } finally {
      setLoadingLike(false);
    }
  };

  return (
    <Card
      className="h-100 shadow-sm border-1"
      onClick={() => onViewDetail && onViewDetail()}
      style={{
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        borderRadius: '16px',
        backgroundColor: cardBg
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
      <Card.Body className="d-flex flex-column p-3">
        {/* Huy hiệu Match % khi được gợi ý từ AI */}
        {matchPercent && (
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Badge bg="success" className="px-3 py-1 rounded-pill fw-semibold d-flex align-items-center gap-1 shadow-sm">
              <Sparkles size={12} />
              <span style={{ fontSize: '0.75rem' }}>{matchPercent}% Phù hợp</span>
            </Badge>
          </div>
        )}

        {/* Hàng 1: Thời gian (Ngày đăng + Thời gian còn lại) đặt sát mép 2 bên */}
        <div className="d-flex justify-content-between align-items-center mb-2 gap-1 flex-wrap">
          {project.createdAt && (
            <Badge pill bg="light" text="secondary" className="d-flex align-items-center px-2 py-1 border flex-shrink-0">
              <Clock size={11} className="me-1" />
              <span style={{ fontSize: '0.7rem' }}>{formatCreatedDate(project.createdAt)}</span>
            </Badge>
          )}
          {project.deadline && (
            <Badge pill bg="primary" className="d-flex align-items-center px-2 py-1 fw-normal text-white flex-shrink-0">
              <Clock size={11} className="me-1" />
              <span style={{ fontSize: '0.7rem' }}>{calculateDaysLeft(project.deadline)}</span>
            </Badge>
          )}
        </div>

        {/* Hàng 2: Tiêu đề dự án */}
        <Card.Title className="fw-bold mb-2 text-dark" style={{ fontSize: '0.95rem', lineHeight: '1.3' }}>
          {project.title}
        </Card.Title>

        {/* Ngành tuyển dụng của dự án */}
        {(project.departmentIds?.[0]?.name || project.ownerId?.departmentId?.name) && (
          <div className="mb-2">
            <Badge bg="light" text="secondary" className="d-flex align-items-center d-inline-flex px-2 py-1 border fw-normal rounded-2 text-truncate" style={{ maxWidth: '100%' }}>
              <BookOpen size={11} className="me-1 flex-shrink-0" />
              <span className="text-truncate" style={{ fontSize: '0.72rem' }}>
                {project.departmentIds?.[0]?.name || project.ownerId?.departmentId?.name}
              </span>
            </Badge>
          </div>
        )}

        {/* Hàng 3: Mô tả */}
        <Card.Text
          className="text-muted small mb-2"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.5',
            fontSize: '0.8rem'
          }}
        >
          {project.description}
        </Card.Text>

        {/* Lý do AI gợi ý (nếu có) */}
        {aiReason && (
          <div
            className="p-2 rounded-3 mb-2 border small"
            style={{
              backgroundColor: aiReasonBg,
              color: aiReasonColor,
              fontSize: '0.75rem',
              lineHeight: '1.4'
            }}
          >
            <span className="fw-semibold">Gợi ý AI <span className="text-danger fw-bold">*</span>:</span> {aiReason}
          </div>
        )}

        {/* Hàng 4: Số lượng tuyển */}
        {project.maxMembers !== undefined && (
          <div className="mb-2 text-dark fw-medium small d-flex align-items-center text-muted">
            <Users size={13} className="me-1 text-secondary flex-shrink-0" />
            <span style={{ fontSize: '0.75rem' }}>Số lượng tuyển: <span style={{ color: '#ea580c' }}>{project.maxMembers} ứng viên</span></span>
          </div>
        )}

        {/* Khối thông tin*/}
        <div className="mt-auto">
          <hr className="text-muted mb-2 mt-1" style={{ opacity: 0.15 }} />

          <div className="d-flex justify-content-between align-items-center gap-1">
            {/* Trái: Avatar (6) + Tên người đăng (7) */}
            <div
              className="d-flex align-items-center flex-grow-1 overflow-hidden me-1"
              style={{ cursor: 'pointer', minWidth: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                if (project.ownerId?._id) {
                  navigate(`/profile/${project.ownerId._id}`);
                }
              }}
            >
              <img
                src={project.ownerId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.ownerId?.name || 'A')}&background=random`}
                alt="avatar"
                className="rounded-circle me-1 flex-shrink-0"
                style={{ width: '26px', height: '26px', objectFit: 'cover', border: '1px solid #9b9595ff' }}
              />
              <span className="fw-medium text-dark small text-truncate hover-primary" style={{ minWidth: 0, fontSize: '0.78rem' }}>
                {project.ownerId?.name || 'Ẩn danh'}
              </span>
            </div>

            {/* Phải: Nút thả tim (8) + Button Chi tiết (9) */}
            <div className="d-flex align-items-center flex-shrink-0 gap-1">
              <button
                className="btn btn-light rounded-circle p-1 d-flex align-items-center justify-content-center"
                onClick={handleSaveToggle}
                title={isSaved ? "Bỏ lưu" : "Lưu dự án"}
                style={{ width: '30px', height: '30px', border: '1px solid #b4b1b1ff', flexShrink: 0 }}
              >
                {isSaved ? <Heart size={14} fill="#dc3545" className="text-danger" /> : <Heart size={14} className="text-muted" />}
              </button>
              <Button
                variant="primary"
                size="sm"
                className="px-2 py-1 fw-medium flex-shrink-0"
                style={{ backgroundColor: '#ea580c', borderColor: '#c7e0ecff', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
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
