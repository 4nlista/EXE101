import React from 'react';
import { ProgressBar, Badge, Spinner } from 'react-bootstrap';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, Lightbulb, User, GraduationCap, Code } from 'lucide-react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';

// Modal hiển thị chi tiết kết quả phân tích AI Match giữa ứng viên và dự án
export default function AiMatchModal({
  show,
  onClose,
  application,
  onReanalyze,
  isAnalyzing
}) {
  if (!application) return null;

  const applicant = application.applicantId || {};
  const matchPercent = application.matchPercent ?? 0;
  const matchReason = application.matchReason || '';
  const matchDetails = application.matchDetails || {};
  const strengths = matchDetails.strengths || [];
  const weaknesses = matchDetails.weaknesses || [];
  const recommendation = matchDetails.recommendation || '';
  const skills = applicant.mainSkills || [];

  // Xác định màu sắc theo thang điểm % phù hợp
  let scoreVariant = 'success';
  let scoreColorClass = 'text-success';
  let progressVariant = 'success';
  let scoreLabel = 'Rất phù hợp';

  if (matchPercent < 50) {
    scoreVariant = 'danger';
    scoreColorClass = 'text-danger';
    progressVariant = 'danger';
    scoreLabel = 'Ít phù hợp';
  } else if (matchPercent < 75) {
    scoreVariant = 'warning';
    scoreColorClass = 'text-warning';
    progressVariant = 'warning';
    scoreLabel = 'Khá phù hợp';
  }

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2 text-dark fs-5">
          <Sparkles size={20} className="text-warning" />
          <span>Đánh giá Phù hợp AI (UniVerse Match)</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-2">
        {/* Khối hồ sơ tóm tắt của ứng viên & Điểm số % Match */}
        <div className="bg-light p-3 rounded-3 border mb-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            {/* Thông tin ứng viên */}
            <div className="d-flex align-items-center gap-3">
              <img
                src={applicant.avatar || 'https://via.placeholder.com/50'}
                alt={applicant.name || 'Avatar'}
                className="rounded-circle border"
                style={{ width: '52px', height: '52px', objectFit: 'cover' }}
              />
              <div>
                <h6 className="fw-bold mb-1 text-dark">{applicant.name || 'Ứng viên'}</h6>
                <div className="small text-muted d-flex align-items-center gap-2">
                  <span className="d-inline-flex align-items-center gap-1">
                    <GraduationCap size={14} />
                    {applicant.majorId?.name || applicant.departmentId?.name || 'Chưa cập nhật chuyên ngành'}
                  </span>
                  {applicant.semester && <span>• Kỳ {applicant.semester}</span>}
                </div>
              </div>
            </div>

            {/* Điểm số % Match nổi bật */}
            <div className="text-end">
              <div className="d-flex align-items-baseline justify-content-end gap-1">
                <span className={`display-6 fw-bold ${scoreColorClass}`}>{matchPercent}%</span>
                <span className="small text-muted fw-semibold">Phù hợp</span>
              </div>
              <Badge bg={scoreVariant} className="px-2 py-1">
                {scoreLabel}
              </Badge>
            </div>
          </div>

          {/* Thanh đo mức độ tương thích */}
          <div className="mt-3">
            <ProgressBar
              now={matchPercent}
              variant={progressVariant}
              style={{ height: '8px' }}
              className="rounded-pill"
            />
          </div>
        </div>

        {/* Kỹ năng cá nhân của ứng viên (mainSkills) */}
        {skills.length > 0 && (
          <div className="mb-3 p-3 bg-white border rounded-3">
            <div className="small fw-semibold text-secondary mb-2 d-flex align-items-center gap-1">
              <Code size={15} /> Kỹ năng cá nhân được khai báo trong hồ sơ:
            </div>
            <div className="d-flex flex-wrap gap-1">
              {skills.map((skill, idx) => (
                <span key={idx} className="badge bg-light text-dark border fw-medium px-2 py-1">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nhận xét tổng quan của AI */}
        {matchReason && (
          <div className="mb-3 p-3 rounded-3" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div className="fw-semibold text-success d-flex align-items-center gap-1 mb-1 small">
              <Sparkles size={16} /> Nhận định tổng quan từ Gemini AI:
            </div>
            <p className="mb-0 text-dark small" style={{ lineHeight: '1.6' }}>
              {matchReason}
            </p>
          </div>
        )}

        {/* Điểm mạnh & Điểm cần lưu ý */}
        <div className="row g-3 mb-3">
          {/* Điểm mạnh */}
          <div className="col-md-6">
            <div className="h-100 p-3 bg-white border rounded-3">
              <div className="fw-semibold text-success small mb-2 d-flex align-items-center gap-1">
                <CheckCircle2 size={16} /> Điểm mạnh nổi bật:
              </div>
              {strengths.length > 0 ? (
                <ul className="mb-0 ps-3 small text-secondary" style={{ lineHeight: '1.6' }}>
                  {strengths.map((str, i) => (
                    <li key={i} className="mb-1">{str}</li>
                  ))}
                </ul>
              ) : (
                <div className="small text-muted fst-italic">Chưa có thông tin chi tiết</div>
              )}
            </div>
          </div>

          {/* Điểm cần lưu ý / Điểm còn thiếu */}
          <div className="col-md-6">
            <div className="h-100 p-3 bg-white border rounded-3">
              <div className="fw-semibold text-warning-emphasis small mb-2 d-flex align-items-center gap-1">
                <AlertCircle size={16} /> Điểm cần lưu ý:
              </div>
              {weaknesses.length > 0 ? (
                <ul className="mb-0 ps-3 small text-secondary" style={{ lineHeight: '1.6' }}>
                  {weaknesses.map((w, i) => (
                    <li key={i} className="mb-1">{w}</li>
                  ))}
                </ul>
              ) : (
                <div className="small text-muted fst-italic">Không có điểm trừ đáng kể</div>
              )}
            </div>
          </div>
        </div>

        {/* Lời khuyên & Khuyến nghị của AI */}
        {recommendation && (
          <div className="p-3 rounded-3" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
            <div className="fw-semibold text-warning-emphasis d-flex align-items-center gap-1 mb-1 small">
              <Lightbulb size={16} /> Khuyến nghị cho Chủ dự án:
            </div>
            <p className="mb-0 text-dark small" style={{ lineHeight: '1.6' }}>
              {recommendation}
            </p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between align-items-center">
        <div>
          {application.cvFileUrl && (
            <a
              href={application.cvFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-light border text-secondary"
            >
              Mở xem file CV
            </a>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="light"
            size="sm"
            onClick={() => onReanalyze(application)}
            disabled={isAnalyzing}
            className="d-inline-flex align-items-center gap-1 border text-secondary shadow-sm"
          >
            {isAnalyzing ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                <span>Đang quét lại...</span>
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                <span>Phân tích lại</span>
              </>
            )}
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
