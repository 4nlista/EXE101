import React, { useState, useEffect } from 'react';
import { Dropdown, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { FaSearch, FaEllipsisV, FaRegClock, FaCheckCircle, FaTimesCircle, FaStar, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ConfirmActionModal from '../../components/ConfirmActionModal';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { getMyApplications, cancelApplication, acceptInvite, declineInvite } from '../../services/applicationService';
import { getProjectDetail } from '../../services/projectService';
import { APPLICATION_STATUS } from '../../constants/applicationEnum';
import { formatDate } from '../../utils/formatDate';
import StatusBadge from '../../components/StatusBadge';
import ProjectDetailModal from '../feed/ProjectDetailModal';
import CustomTable from '../../components/CustomTable';
import Pagination from '../../components/Pagination';
import { PROJECT_STATUS } from '../../constants/projectEnum';
import ReviewTab from './components/ReviewTab';

const ACTION_TYPES = {
  CANCEL: 'cancel', // Hủy đơn tham gia
  ACCEPT: 'accept', // Chấp nhận đơn tham gia
  DECLINE: 'decline'  // từ chối - thành viên bấm từ chối lời mời của chủ dự án
};

export default function MyApplicationsTab() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const ITEMS_PER_PAGE = 5;

  // Modals state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);

  // Project detail modal
  const [selectedProject, setSelectedProject] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProjectId, setReviewProjectId] = useState(null);

  // Tải danh sách hồ sơ ứng tuyển theo trang (Server-side Pagination)
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await getMyApplications({ status: statusFilter, search, page, limit: ITEMS_PER_PAGE });
      if (res.success) {
        setApplications(res.data.applications || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (error) {
      toast.error('Lỗi khi tải hồ sơ đã nộp');
    } finally {
      setLoading(false);
    }
  };
  const handleRowClick = async (projectId) => {
    if (!projectId) return;
    try {
      const res = await getProjectDetail(projectId);
      if (res.success) {
        setSelectedProject(res.data);
      }
    } catch (error) {
      toast.error('Không thể tải thông tin chi tiết dự án');
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, search, page]);

  // hàm xử lý hành động với applicationId
  const handleAction = async (action, appId) => {
    try {
      if (action === ACTION_TYPES.CANCEL) {
        const res = await cancelApplication(appId);
        if (res.success) toast.success('Hủy đơn thành công');
        setShowCancelModal(false);
      } else if (action === ACTION_TYPES.ACCEPT) {
        const res = await acceptInvite(appId);
        if (res.success) toast.success('Đã chấp nhận tham gia dự án');
        setShowAcceptModal(false);
      } else if (action === ACTION_TYPES.DECLINE) {
        const res = await declineInvite(appId);
        if (res.success) toast.success('Đã từ chối lời mời');
        setShowDeclineModal(false);
      }
      fetchApplications();
    } catch (error) {
      toast.error(error?.message || 'Có lỗi xảy ra');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case APPLICATION_STATUS.PENDING:
        return <StatusBadge variant="warning" text="Đang chờ" />;
      case APPLICATION_STATUS.APPROVED:
        return <StatusBadge variant="success" text="Đã duyệt" />;
      case APPLICATION_STATUS.REJECTED:
        return <StatusBadge variant="danger" text="Đã từ chối" />;
      case APPLICATION_STATUS.INVITED:
        return <StatusBadge variant="primary" text="Được mời" />;
      case APPLICATION_STATUS.EXPIRED:
        return <StatusBadge variant="secondary" text="Đã hết hạn" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-4 shadow-sm border p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <h5 className="fw-bold mb-0 text-dark">Hồ sơ đã nộp</h5>

        <div className="d-flex flex-wrap gap-3 align-items-center flex-grow-1 justify-content-end" style={{ maxWidth: '600px' }}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="shadow-none border rounded-pill"
            style={{ width: '180px' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value={APPLICATION_STATUS.PENDING}>Đang chờ duyệt</option>
            <option value={APPLICATION_STATUS.APPROVED}>Đã duyệt</option>
            <option value={APPLICATION_STATUS.REJECTED}>Đã từ chối</option>
            <option value={APPLICATION_STATUS.INVITED}>Được mời</option>
            <option value={APPLICATION_STATUS.EXPIRED}>Đã hết hạn</option>
          </Form.Select>

          <InputGroup style={{ width: '250px' }}>
            <InputGroup.Text className="bg-white border-end-0 rounded-start-pill text-muted px-3">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Tìm kiếm dự án..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="border-start-0 shadow-none rounded-end-pill ps-0"
            />
          </InputGroup>
        </div>
      </div>
      <CustomTable
        headers={[
          { label: 'STT', className: 'text-center text-dark fw-bold', style: { width: '5%' } },
          { label: 'Dự án', className: 'text-dark fw-bold', style: { width: '39%' } },
          { label: 'Thời gian nộp', className: 'text-dark fw-bold', style: { width: '15%' } },
          { label: 'Hạn chót', className: 'text-dark fw-bold', style: { width: '15%' } },
          { label: 'Trạng thái', className: 'text-center text-dark fw-bold', style: { width: '13%' } },
          { label: 'Hành động', className: 'text-center text-dark fw-bold', style: { width: '13%' } }
        ]}
      >
        {loading ? (
          <tr>
            <td colSpan="6" className="text-center py-4 text-muted">Đang tải...</td>
          </tr>
        ) : applications.length === 0 ? (
          <tr>
            <td colSpan="6" className="text-center py-5 text-muted">Bạn chưa nộp hồ sơ nào</td>
          </tr>
        ) : (
          applications.map((app, idx) => (
            <tr
              key={app._id}
              onClick={() => handleRowClick(app.projectId?._id)}
              style={{ cursor: 'pointer' }}
            >
              <td className="text-center" onClick={(e) => e.stopPropagation()}>
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <Form.Check type="checkbox" />
                  <span className="text-muted">{(page - 1) * ITEMS_PER_PAGE + idx + 1}</span>
                </div>
              </td>
              <td>
                <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '250px' }}>
                  {app.projectId?.title || 'Dự án đã bị xóa'}
                </div>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {app.projectId?.departmentIds?.map(d => (
                    <Badge key={d._id} bg="secondary" className="bg-opacity-50 text-dark fw-normal px-2 py-1">
                      {d.name}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="text-muted" style={{ fontSize: '14px' }}>{formatDate(app.createdAt)}</td>
              <td className="text-muted" style={{ fontSize: '14px' }}>
                {app.projectId?.deadline ? formatDate(app.projectId.deadline) : 'Không có'}
              </td>
              <td className="text-center">
                {getStatusBadge(app.status)}
              </td>
              <td onClick={(e) => e.stopPropagation()}>
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <Button
                    variant="cancel"
                    className="rounded-pill px-3 py-1 text-dark"
                    style={{ fontSize: '12px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(app.cvFileUrl, '_blank');
                    }}
                  >
                    Xem CV
                  </Button>
                  <Dropdown align="end" onClick={(e) => e.stopPropagation()}>
                    <Dropdown.Toggle as="div" className="btn btn-link text-muted p-1" style={{ cursor: 'pointer' }}>
                      <FaEllipsisV />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="border shadow-sm rounded-3 text-center mt-1" style={{ minWidth: '120px', fontSize: '13px', padding: '4px 0' }}>
                      {app.status === APPLICATION_STATUS.PENDING && (
                        <Dropdown.Item onClick={() => { setSelectedAppId(app._id); setShowCancelModal(true); }} className="text-danger py-1 fw-bold">
                          Hủy đơn
                        </Dropdown.Item>
                      )}
                      {app.status === APPLICATION_STATUS.INVITED && (
                        <>
                          <Dropdown.Item onClick={() => { setSelectedAppId(app._id); setShowAcceptModal(true); }} className="text-success py-1">
                            <FaCheckCircle className="me-1" /> Chấp nhận
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => { setSelectedAppId(app._id); setShowDeclineModal(true); }} className="text-danger py-1">
                            <FaTimesCircle className="me-1" /> Từ chối
                          </Dropdown.Item>
                        </>
                      )}
                      {app.status === APPLICATION_STATUS.APPROVED && app.projectId?.status === PROJECT_STATUS.COMPLETED && (
                        <Dropdown.Item 
                          onClick={() => { setReviewProjectId(app.projectId._id); setShowReviewModal(true); }} 
                          className="text-primary py-1 fw-bold"
                        >
                          <FaStar className="me-1" /> Đánh giá đồng đội
                        </Dropdown.Item>
                      )}
                      {app.status !== APPLICATION_STATUS.PENDING && app.status !== APPLICATION_STATUS.INVITED && !(app.status === APPLICATION_STATUS.APPROVED && app.projectId?.status === PROJECT_STATUS.COMPLETED) && (
                        <Dropdown.Item disabled className="py-1">Không có hành động</Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </td>
            </tr>
          ))
        )}
      </CustomTable>

      {/* Phân trang server-side */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
        disabled={loading}
        className="mt-4"
      />

      <ConfirmActionModal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        onConfirm={() => handleAction(ACTION_TYPES.CANCEL, selectedAppId)}
        title="Hủy đơn đăng ký"
        message="Bạn có chắc chắn muốn hủy đơn đăng ký vào dự án này không?"
        confirmText="Hủy đơn"
        variant="danger"
      />
      <ConfirmActionModal
        show={showAcceptModal}
        onHide={() => setShowAcceptModal(false)}
        onConfirm={() => handleAction(ACTION_TYPES.ACCEPT, selectedAppId)}
        title="Chấp nhận tham gia"
        message="Bạn đồng ý tham gia dự án này chứ?"
        confirmText="Đồng ý"
        variant="success"
      />
      <ConfirmActionModal
        show={showDeclineModal}
        onHide={() => setShowDeclineModal(false)}
        onConfirm={() => handleAction(ACTION_TYPES.DECLINE, selectedAppId)}
        title="Từ chối lời mời"
        message="Bạn có chắc chắn muốn từ chối lời mời này không?"
        confirmText="Từ chối"
        variant="danger"
      />

      {/* Modal Xem Dự Án */}
      {selectedProject && (
        <ProjectDetailModal
          show={!!selectedProject}
          onHide={() => setSelectedProject(null)}
          project={selectedProject}
        />
      )}

      {/* Modal Đánh giá đồng đội */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold">Đánh giá đồng đội</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          {reviewProjectId && <ReviewTab projectId={reviewProjectId} />}
        </Modal.Body>
      </Modal>
    </div>
  );
}
