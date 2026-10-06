import React, { useState, useEffect } from 'react';
import { Row, Col, Card, ProgressBar, Spinner } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Button from '../../../components/Button';
import { getProjectReviewStatus, createReview } from '../../../services/reviewService';
import ConfirmActionModal from '../../../components/ConfirmActionModal';

export default function ReviewTab({ projectId }) {
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState(null);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getProjectReviewStatus(projectId);
      if (res.success) {
        setReviewData(res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải dữ liệu đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchReviews();
    }
  }, [projectId]);

  const handleOpenReviewModal = (member) => {
    setSelectedMember(member);
    setRating(0);
    setHoverRating(0);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedMember(null);
    setRating(0);
    setHoverRating(0);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await createReview({
        projectId,
        revieweeId: selectedMember.userId,
        rating
      });
      if (res.success) {
        toast.success('Gửi đánh giá thành công!');
        handleCloseReviewModal();
        fetchReviews(); // Reload data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Đang tải dữ liệu đánh giá...</p>
      </div>
    );
  }

  if (!reviewData) return null;

  const { members, myReviewProgress, isExpired, reviewDeadline } = reviewData;
  const [reviewedCount, totalCount] = myReviewProgress.split('/').map(Number);
  const progressPercent = totalCount === 0 ? 0 : Math.round((reviewedCount / totalCount) * 100);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold mb-1">Đánh giá thành viên</h5>
          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
            Dự án đã kết thúc. Hãy dành 1 phút để đánh giá hiệu suất của đồng đội nhé!
          </p>
          {reviewDeadline && (
            <p className="text-danger mb-0 mt-1" style={{ fontSize: '13px', fontWeight: '500' }}>
              {isExpired ? 'Đã hết hạn đánh giá' : `Hạn chót đánh giá: ${new Date(reviewDeadline).toLocaleDateString('vi-VN')}`}
            </p>
          )}
        </div>
        <div className="text-end" style={{ width: '200px' }}>
          <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
            <span className="text-muted">Đã đánh giá:</span>
            <span className="fw-semibold text-primary">{myReviewProgress}</span>
          </div>
          <ProgressBar now={progressPercent} variant="success" style={{ height: '8px' }} />
        </div>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-4 text-muted">Không có thành viên nào khác để đánh giá.</div>
      ) : (
        <Row className="g-3">
          {members.map((member) => (
            <Col md={6} lg={4} key={member.userId}>
              <Card className="border shadow-sm rounded-4 h-100">
                <Card.Body className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={member.avatar || 'https://via.placeholder.com/48'}
                      alt="Avatar"
                      className="rounded-circle border"
                      style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="fw-bold text-dark">{member.name}</div>
                      <div className="text-muted" style={{ fontSize: '12px' }}>
                        Vai trò: <span className="fw-medium">{member.role === 'Leader' ? 'Leader' : 'Thành viên'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {member.hasBeenReviewedByMe ? (
                      <div className="d-flex align-items-center justify-content-center text-warning bg-warning bg-opacity-10 rounded px-2 py-1 border border-warning border-opacity-25">
                        <FaStar className="me-1" />
                        <span className="fw-bold" style={{ fontSize: '14px' }}>{member.myRating}</span>
                      </div>
                    ) : (
                      <Button
                        variant="primary text-white"
                        size="sm"
                        className="rounded-pill px-3"
                        disabled={isExpired}
                        onClick={() => handleOpenReviewModal(member)}
                      >
                        Đánh giá
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Review Modal */}
      {selectedMember && (
        <ConfirmActionModal
          show={showReviewModal}
          onHide={handleCloseReviewModal}
          onConfirm={handleSubmitReview}
          isLoading={isSubmitting}
          title={`Đánh giá ${selectedMember.name}`}
          variant="primary"
          confirmText="Gửi đánh giá"
          message={
            <div className="text-center py-3">
              <p className="mb-3">Bạn đánh giá hiệu quả làm việc của <strong>{selectedMember.name}</strong> như thế nào?</p>
              <div className="d-flex justify-content-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={36}
                    style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                    color={(hoverRating || rating) >= star ? '#ffc107' : '#e4e5e9'}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
              <div className="mt-2 text-muted" style={{ fontSize: '13px' }}>
                {rating === 1 && 'Rất tệ'}
                {rating === 2 && 'Tệ'}
                {rating === 3 && 'Bình thường'}
                {rating === 4 && 'Tốt'}
                {rating === 5 && 'Tuyệt vời'}
                {rating === 0 && 'Chưa chọn'}
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
