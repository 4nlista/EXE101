import React, { useState, useEffect } from 'react';
import { Card, Badge, Dropdown, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { FaSearch, FaEllipsisV, FaRegClock, FaCheckCircle, FaTimesCircle, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ConfirmActionModal from '../../components/ConfirmActionModal';
import Button from '../../components/Button';
import { getMyApplications, cancelApplication, acceptInvite, declineInvite } from '../../services/applicationService';
import { APPLICATION_STATUS } from '../../constants/applicationEnum';
import { formatDate } from '../../utils/formatDate';
import StatusBadge from '../../components/StatusBadge';

export default function MyApplicationsTab() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await getMyApplications({ status: statusFilter, search, limit: 20 });
      if (res.success) {
        setApplications(res.data.applications);
      }
    } catch (error) {
      toast.error('Lỗi khi tải hồ sơ đã nộp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, search]);

  const handleAction = async (action, appId) => {
    try {
      if (action === 'cancel') {
        const res = await cancelApplication(appId);
        if (res.success) toast.success('Hủy đơn thành công');
        setShowCancelModal(false);
      } else if (action === 'accept') {
        const res = await acceptInvite(appId);
        if (res.success) toast.success('Đã chấp nhận tham gia dự án');
        setShowAcceptModal(false);
      } else if (action === 'decline') {
        const res = await declineInvite(appId);
        if (res.success) toast.success('Đã từ chối lời mời');
        setShowDeclineModal(false);
      }
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case APPLICATION_STATUS.PENDING:
        return <StatusBadge variant="warning" text="Đang chờ duyệt" />;
      case APPLICATION_STATUS.APPROVED:
        return <StatusBadge variant="success" text="Đã duyệt" />;
      case APPLICATION_STATUS.REJECTED:
        return <StatusBadge variant="danger" text="Đã từ chối" />;
      case APPLICATION_STATUS.INVITED:
        return <StatusBadge variant="primary" text="Được mời" />;
      default:
        return null;
    }
  };

  return (
    <Row>
      <Col md={3}>
        <div className="bg-light p-3 rounded-4 border">
          <h6 className="fw-bold mb-3">Trạng thái hồ sơ</h6>
          <Form>
            {['', APPLICATION_STATUS.PENDING, APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.REJECTED, APPLICATION_STATUS.INVITED].map((statusValue, idx) => (
              <Form.Check
                key={idx}
                type="radio"
                id={`status-radio-${idx}`}
                name="statusFilter"
                label={
                  statusValue === '' ? 'Tất cả' :
                    statusValue === APPLICATION_STATUS.PENDING ? 'Đang chờ duyệt' :
                      statusValue === APPLICATION_STATUS.APPROVED ? 'Đã duyệt' :
                        statusValue === APPLICATION_STATUS.REJECTED ? 'Đã từ chối' : 'Được mời'
                }
                checked={statusFilter === statusValue}
                onChange={() => setStatusFilter(statusValue)}
                className="mb-2 text-muted"
              />
            ))}
          </Form>

          <h6 className="fw-bold mt-4 mb-3">Tìm kiếm</h6>
          <InputGroup>
            <InputGroup.Text className="bg-white"><FaSearch className="text-muted" /></InputGroup.Text>
            <Form.Control
              placeholder="Tên dự án..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-start-0 ps-0 shadow-none"
            />
          </InputGroup>
        </div>
      </Col>

      <Col md={9}>
        <div className="d-flex flex-column gap-3">
          {loading ? (
            <div className="text-center py-4 text-muted">Đang tải...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-5 text-muted bg-light rounded-4 border">
              Bạn chưa nộp hồ sơ nào
            </div>
          ) : (
            applications.map(app => (
              <Card key={app._id} className="border shadow-sm rounded-4">
                <Card.Body className="d-flex align-items-center py-3 px-4">
                  {/* Cột 1: Thông tin dự án */}
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <h6 className="fw-bold mb-1 text-truncate text-primary">{app.projectId?.title || 'Dự án đã bị xóa'}</h6>
                    <div className="text-muted d-flex gap-2 align-items-center mb-1" style={{ fontSize: '13px' }}>
                      <span className="text-truncate">{app.projectId?.departmentIds?.map(d => d.name).join(' · ')}</span>
                    </div>
                    <div className="text-muted d-flex gap-2 align-items-center" style={{ fontSize: '12px' }}>
                      <FaRegClock />
                      <span>Nộp hồ sơ: {formatDate(app.createdAt)}</span>
                      <span>·</span>
                      <span>Hạn ứng tuyển: {app.projectId?.deadline ? formatDate(app.projectId.deadline) : 'Không có'}</span>
                    </div>
                  </div>

                  {/* Cột 2: Nghiên cứu */}
                  <div className="mx-3" style={{ width: '130px' }}>
                    <Button variant="outline-secondary" className="w-100 rounded-pill py-1 d-flex align-items-center justify-content-center gap-1" disabled title="Tính năng dành cho gói VIP/Premium">
                      <FaStar className="text-warning" />
                      Nghiên cứu
                    </Button>
                  </div>

                  {/* Cột 3: Trạng thái */}
                  <div className="mx-3 text-center" style={{ width: '130px' }}>
                    {getStatusBadge(app.status)}
                  </div>

                  {/* Cột 4: Hành động */}
                  <div className="ms-2 d-flex align-items-center gap-2" style={{ width: '140px' }}>
                    <Button
                      variant="outline-primary"
                      className="rounded-pill px-3 py-1"
                      onClick={() => window.open(app.cvFileUrl, '_blank')}
                    >
                      Xem chi tiết
                    </Button>
                    <Dropdown align="end">
                      <Dropdown.Toggle as="div" className="btn btn-link text-muted p-1" style={{ cursor: 'pointer' }}>
                        <FaEllipsisV />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="border shadow-sm rounded-3">
                        {app.status === APPLICATION_STATUS.PENDING && (
                          <Dropdown.Item onClick={() => { setSelectedAppId(app._id); setShowCancelModal(true); }} className="text-danger">
                            Hủy đơn
                          </Dropdown.Item>
                        )}
                        {app.status === APPLICATION_STATUS.INVITED && (
                          <>
                            <Dropdown.Item onClick={() => { setSelectedAppId(app._id); setShowAcceptModal(true); }} className="text-success">
                              <FaCheckCircle className="me-2" /> Chấp nhận tham gia
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => { setSelectedAppId(app._id); setShowDeclineModal(true); }} className="text-danger">
                              <FaTimesCircle className="me-2" /> Từ chối
                            </Dropdown.Item>
                          </>
                        )}
                        {app.status !== APPLICATION_STATUS.PENDING && app.status !== APPLICATION_STATUS.INVITED && (
                          <Dropdown.Item disabled>Không có hành động</Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      </Col>

      <ConfirmActionModal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        onConfirm={() => handleAction('cancel', selectedAppId)}
        title="Hủy đơn đăng ký"
        message="Bạn có chắc chắn muốn hủy đơn đăng ký vào dự án này không?"
        confirmText="Hủy đơn"
        variant="danger"
      />
      <ConfirmActionModal
        show={showAcceptModal}
        onHide={() => setShowAcceptModal(false)}
        onConfirm={() => handleAction('accept', selectedAppId)}
        title="Chấp nhận tham gia"
        message="Bạn đồng ý tham gia dự án này chứ?"
        confirmText="Đồng ý"
        variant="success"
      />
      <ConfirmActionModal
        show={showDeclineModal}
        onHide={() => setShowDeclineModal(false)}
        onConfirm={() => handleAction('decline', selectedAppId)}
        title="Từ chối lời mời"
        message="Bạn có chắc chắn muốn từ chối lời mời này không?"
        confirmText="Từ chối"
        variant="danger"
      />
    </Row>
  );
}
