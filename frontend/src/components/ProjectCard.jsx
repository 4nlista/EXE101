import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import { Heart, Clock, Users, BookOpen, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import Card from './Card';
import { formatCreatedDate, calculateDaysLeft } from '../utils/formatDate';
import { toggleLikeProject } from '../services/projectService';

export default function ProjectCard({
  project,
  onViewDetail,
  onLikeChange,
  matchPercent,
  aiReason,
  aiReasonBg = 'var(--primary-light)',
  aiReasonColor = 'var(--text-primary)',
  cardBg = 'var(--bg-surface)'
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
      className="feed-project-card h-100 p-3"
      onClick={() => onViewDetail && onViewDetail()}
      style={{
        backgroundColor: cardBg,
        cursor: 'pointer'
      }}
    >
      <Card.Body className="d-flex flex-column p-0">
        {/* Huy hiệu Match % khi được gợi ý từ AI */}
        {matchPercent && (
          <div className="mb-2">
            <span className="status-badge status-badge--success">
              <Sparkles size={12} />
              <span>{matchPercent}% Phù hợp</span>
            </span>
          </div>
        )}

        {/* Hàng 1: Thời gian (Ngày đăng + Thời gian còn lại) */}
        <div className="d-flex justify-content-between align-items-center mb-2 gap-1 flex-wrap">
          {project.createdAt && (
            <span className="status-badge status-badge--neutral">
              <Clock size={11} />
              <span>{formatCreatedDate(project.createdAt)}</span>
            </span>
          )}
          {project.deadline && (
            <span className="status-badge status-badge--warning">
              <Clock size={11} />
              <span>{calculateDaysLeft(project.deadline)}</span>
            </span>
          )}
        </div>

        {/* Hàng 2: Tiêu đề dự án */}
        <Card.Title className="fw-semibold mb-2 text-dark" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
          {project.title}
        </Card.Title>

        {/* Ngành tuyển dụng của dự án */}
        {project.departmentTargets && project.departmentTargets.length > 0 ? (
          <div className="mb-2 d-flex flex-wrap gap-1">
            {project.departmentTargets.map((target, idx) => (
              <span
                key={target._id || idx}
                className="status-badge status-badge--neutral"
                style={{ fontSize: '0.72rem' }}
              >
                <BookOpen size={11} className="flex-shrink-0" />
                <span>{target.departmentId?.name || 'Ngành'}</span>
              </span>
            ))}
          </div>
        ) : (project.departmentIds && project.departmentIds.length > 0) ? (
          <div className="mb-2 d-flex flex-wrap gap-1">
            {project.departmentIds.map((dept, idx) => (
              <span
                key={dept._id || idx}
                className="status-badge status-badge--neutral"
                style={{ fontSize: '0.72rem' }}
              >
                <BookOpen size={11} className="flex-shrink-0" />
                <span>{dept.name || dept}</span>
              </span>
            ))}
          </div>
        ) : project.ownerId?.departmentId?.name ? (
          <div className="mb-2">
            <span
              className="status-badge status-badge--neutral text-truncate"
              style={{ maxWidth: '100%', fontSize: '0.72rem' }}
            >
              <BookOpen size={11} className="flex-shrink-0" />
              <span className="text-truncate">{project.ownerId?.departmentId?.name}</span>
            </span>
          </div>
        ) : null}

        {/* Hàng 3: Mô tả */}
        <Card.Text
          className="text-muted small mb-2"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            lineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.5',
            fontSize: '0.8125rem'
          }}
        >
          {project.description}
        </Card.Text>

        {/* Lý do AI gợi ý (nếu có) */}
        {aiReason && (
          <div
            className="p-2 rounded-2 mb-2 border small"
            style={{
              backgroundColor: aiReasonBg,
              color: aiReasonColor,
              borderColor: 'rgba(234, 88, 12, 0.18)',
              fontSize: '0.75rem',
              lineHeight: '1.4'
            }}
          >
            <span className="fw-semibold" style={{ color: 'var(--primary)' }}>Gợi ý AI:</span> {aiReason}
          </div>
        )}

        {/* Hàng 4: Số lượng tuyển */}
        {project.maxMembers !== undefined && (
          <div className="mb-2 text-muted small d-flex align-items-center">
            <Users size={13} className="me-1 text-secondary flex-shrink-0" />
            <span style={{ fontSize: '0.75rem' }}>
              Số lượng tuyển: <span className="fw-semibold" style={{ color: 'var(--primary)' }}>{project.maxMembers} ứng viên</span>
            </span>
          </div>
        )}

        {/* Khối thông tin */}
        <div className="mt-auto pt-2">
          <hr className="my-2" />

          <div className="d-flex justify-content-between align-items-center gap-1">
            {/* Trái: Avatar + Tên người đăng */}
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
                style={{ width: '26px', height: '26px', objectFit: 'cover', border: '1px solid var(--border)' }}
              />
              <span className="fw-medium text-dark small text-truncate" style={{ minWidth: 0, fontSize: '0.78rem' }}>
                {project.ownerId?.name || 'Ẩn danh'}
              </span>
            </div>

            {/* Phải: Nút thả tim + Button Chi tiết */}
            <div className="d-flex align-items-center flex-shrink-0 gap-1">
              <Button
                variant="light"
                className="rounded-circle p-0 d-flex align-items-center justify-content-center"
                onClick={handleSaveToggle}
                title={isSaved ? "Bỏ lưu" : "Lưu dự án"}
                style={{ width: '30px', height: '30px', border: '1px solid var(--border)', flexShrink: 0 }}
              >
                {isSaved ? <Heart size={14} fill="#dc3545" className="text-danger" /> : <Heart size={14} className="text-muted" />}
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="px-2 py-1 fw-medium flex-shrink-0"
                style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
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
