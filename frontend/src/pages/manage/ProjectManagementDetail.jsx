import React, { useState, useEffect } from 'react';
import { Container, Badge, Nav, Table, Card, Row, Col, Form } from 'react-bootstrap';
import { FaArrowLeft, FaEdit, FaStar, FaRegFileAlt, FaDownload } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import ConfirmActionModal from '../../components/ConfirmActionModal';
import {
  getProjectDetail,
  getProjectApplicants,
  approveApplicant,
  rejectApplicant,
  inviteApplicant,
  kickMember
} from '../../services/projectService';
import { initConversation } from '../../services/messageService';
import { APPLICATION_STATUS } from '../../constants/applicationEnum';
import { PROJECT_STATUS } from '../../constants/projectEnum';
import { formatDate } from '../../utils/formatDate';
import UpdateProjectModal from './UpdateProjectModal';

export default function ProjectManagementDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('applicants');
  const [loading, setLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // States cho bộ lọc
  const [sortTime, setSortTime] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: null, appId: null, userId: null, name: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, appRes] = await Promise.all([
        getProjectDetail(projectId),
        getProjectApplicants(projectId)
      ]);
      if (projRes.success) setProject(projRes.data);
      if (appRes.success) {
        setApplications(appRes.data.applications);
        setMembers(appRes.data.projectMembers);
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu dự án');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleConfirmAction = async () => {
    try {
      if (confirmAction.type === 'approve') {
        await approveApplicant(projectId, confirmAction.appId);
        toast.success(`Đã duyệt ứng viên ${confirmAction.name}`);
      } else if (confirmAction.type === 'reject') {
        await rejectApplicant(projectId, confirmAction.appId);
        toast.success(`Đã từ chối ứng viên ${confirmAction.name}`);
      } else if (confirmAction.type === 'invite') {
        await inviteApplicant(projectId, confirmAction.appId);
        toast.success(`Đã gửi lời mời tham gia dự án đến ${confirmAction.name}`);
      } else if (confirmAction.type === 'kick') {
        await kickMember(projectId, confirmAction.userId);
        toast.success(`Đã xóa thành viên ${confirmAction.name} khỏi dự án`);
      }
      setShowConfirm(false);
      fetchData(); // Reload dữ liệu để cập nhật danh sách ứng viên và thành viên
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleStartChat = async (targetUserId) => {
    try {
      setLoading(true);
      const res = await initConversation(targetUserId);
      if (res.success) {
        navigate('/messages', { state: { conversationId: res.data._id } });
      }
    } catch (error) {
      toast.error('Không thể bắt đầu cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case APPLICATION_STATUS.PENDING:
        return <Badge bg="warning" text="dark" className="rounded-pill px-3 py-2 bg-opacity-25 fw-normal">Đang xử lý</Badge>;
      case APPLICATION_STATUS.APPROVED:
        return <Badge bg="success" className="rounded-pill px-3 py-2 fw-normal">Đã duyệt</Badge>;
      case APPLICATION_STATUS.REJECTED:
        return <Badge bg="danger" className="rounded-pill px-3 py-2 fw-normal">Từ chối</Badge>;
      case APPLICATION_STATUS.INVITED:
        return <Badge bg="info" className="rounded-pill px-3 py-2 fw-normal">Được mời</Badge>;
      default:
        return null;
    }
  };

  // Logic lọc và sắp xếp ứng viên
  const filteredApplications = [...applications]
    .filter(app => filterStatus === 'ALL' || app.status === filterStatus)
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortTime === 'newest' ? timeB - timeA : timeA - timeB;
    });

  // Xuất CSV
  const exportToCSV = () => {
    const headers = ['STT', 'Ten Ung Vien', 'Nganh Hoc', 'Thoi Gian Nop', 'Trang Thai', 'Link CV'];
    const rows = filteredApplications.map((app, idx) => [
      idx + 1,
      app.applicantId?.name || '',
      app.applicantId?.majorId?.name || app.applicantId?.departmentId?.name || '',
      formatDate(app.createdAt),
      app.status,
      app.cvFileUrl || ''
    ]);

    // Thêm BOM \uFEFF để Excel nhận diện UTF-8 tiếng Việt
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + headers.join(',') + '\n'
      + rows.map(e => e.map(item => `"${item}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `danh-sach-ung-vien.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !project) return <Container className="py-5 text-center">Đang tải...</Container>;

  return (
    <Container className="py-4" style={{ maxWidth: '1200px' }}>
      <Button variant="light" className="mb-4 d-flex align-items-center gap-2 rounded-pill px-3 py-2 shadow-sm border" onClick={() => navigate('/manage')}>
        <FaArrowLeft /> Quay lại
      </Button>

      {/* Thông tin dự án */}
      <div className="bg-white rounded-4 shadow-sm border p-4 mb-4">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div className="d-flex gap-3">
            <div className="bg-light rounded-3 d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
              <FaRegFileAlt size={32} className="text-primary" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <h4 className="fw-bold mb-0">{project.title}</h4>
                <Badge bg={project.status === PROJECT_STATUS.OPEN ? 'warning' : 'secondary'} className="rounded-pill px-3 py-1 bg-opacity-25 text-dark">
                  {project.status === PROJECT_STATUS.OPEN ? 'Đang tuyển' : 'Đã đóng'}
                </Badge>
              </div>
              <div className="text-muted" style={{ fontSize: '13px' }}>
                Đăng bởi: <span className="fw-semibold text-dark">{project.ownerId?.name || 'Bạn'}</span>
                <span className="mx-2">•</span>
                {formatDate(project.createdAt)}
              </div>
            </div>
          </div>

          <div className="text-end">
            <div className="mb-2 text-muted fw-semibold" style={{ fontSize: '14px' }}>
              <span className="text-primary">{members.length} / {project.maxMembers}</span> thành viên
            </div>
            <div className="progress mb-3" style={{ height: '6px', width: '200px' }}>
              <div
                className="progress-bar bg-warning"
                style={{ width: `${Math.min(100, (members.length / project.maxMembers) * 100)}%` }}
              />
            </div>
            <Button variant="primary" className="rounded-pill px-3" onClick={() => setShowUpdateModal(true)}>
              <FaEdit className="me-0" /> Chỉnh sửa
            </Button>
          </div>
        </div>

        <Row className="g-3 border-top border-bottom py-2 mb-3">
          <Col md={5} className="border-end">
            <div className="text-dark mb-1 fw-bold" style={{ fontSize: '13px' }}>Ngành</div>
            <div className="">{project.departmentIds?.map(d => d.name).join(', ')}</div>
          </Col>
          <Col md={3} className="border-end ">
            <div className="text-dark mb-1 fw-bold" style={{ fontSize: '13px' }}>Mục tiêu điểm</div>
            <div className="">{project.gradeTarget ? `${project.gradeTarget} / 10` : 'Không có'}</div>
          </Col>
          <Col md={3}>
            <div className="text-dark mb-1 fw-bold" style={{ fontSize: '13px' }}>Hạn ứng tuyển</div>
            <div className="">{project.deadline ? formatDate(project.deadline) : 'Không có'}</div>
          </Col>
        </Row>

        <Row className="g-4">
          <Col md={6}>
            <h6 className="fw-bold mb-2">Tổng quan dự án</h6>
            <p className="text-muted" style={{ fontSize: '13px', whiteSpace: 'pre-line' }}>{project.description}</p>
          </Col>
          <Col md={6}>
            <h6 className="fw-bold mb-2">Yêu cầu ứng viên</h6>
            <p className="text-muted" style={{ fontSize: '14px', whiteSpace: 'pre-line' }}>{project.candidateRequirements}</p>
          </Col>
        </Row>
      </div>

      {/* Header section for Tabs and Filters */}
      <div className="d-flex flex-wrap justify-content-between align-items-end mb-3 border-bottom">
        <Nav variant="tabs" className="border-bottom-0" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav.Item>
            <Nav.Link eventKey="applicants" className={activeTab === 'applicants' ? 'fw-bold text-dark border-bottom border-primary border-3' : 'text-muted'}>
              Danh sách ứng viên
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="members" className={activeTab === 'members' ? 'fw-bold text-dark border-bottom border-primary border-3' : 'text-muted'}>
              Thành viên dự án
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {activeTab === 'applicants' && (
          <div className="d-flex flex-wrap gap-2 mb-2">
            <Form.Select size="sm" value={sortTime} onChange={(e) => setSortTime(e.target.value)} style={{ width: '150px' }}>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </Form.Select>
            <Form.Select size="sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '160px' }}>
              <option value="ALL">Tất cả trạng thái</option>
              <option value={APPLICATION_STATUS.PENDING}>Đang xử lý</option>
              <option value={APPLICATION_STATUS.APPROVED}>Đã duyệt</option>
              <option value={APPLICATION_STATUS.REJECTED}>Từ chối</option>
            </Form.Select>
            <Button variant="secondary text-dark" size="sm" className="d-flex align-items-center gap-1 rounded px-3" onClick={exportToCSV}>
              <FaDownload /> Export CSV
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="rounded-4 shadow-sm border p-4">
        {activeTab === 'applicants' && (
          <div className="table-responsive">
            <Table striped hover className="align-middle border-top border-bottom mb-2 ">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 text-muted fw-semibold border-0 text-center" style={{ width: '60px' }}>STT</th>
                  <th className="py-3 text-muted fw-semibold border-0">Ứng viên</th>
                  <th className="py-3 text-muted fw-semibold border-0">Thời gian nộp</th>
                  <th className="py-3 text-muted fw-semibold border-0">Nghiên cứu</th>
                  <th className="py-3 text-muted fw-semibold border-0 text-center">Trạng thái</th>
                  <th className="py-3 text-muted fw-semibold border-0 text-center">CV</th>
                  <th className="py-3 text-muted fw-semibold border-0 text-center" style={{ width: '180px' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">Không tìm thấy ứng viên nào phù hợp</td>
                  </tr>
                ) : (
                  filteredApplications.map((app, idx) => (
                    <tr key={app._id}>
                      <td className="text-center text-muted">{idx + 1}</td>
                      <td>
                        <div 
                          className="d-flex align-items-center gap-3 hover-opacity"
                          style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                          onClick={() => {
                            if (app.applicantId?._id) {
                              navigate(`/profile/${app.applicantId._id}`);
                            }
                          }}
                        >
                          <img
                            src={app.applicantId?.avatar || 'https://via.placeholder.com/40'}
                            alt="Avatar"
                            className="rounded-circle"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-semibold text-dark hover-primary text-primary-hover">{app.applicantId?.name}</div>
                            <div className="text-muted" style={{ fontSize: '12px' }}>{app.applicantId?.majorId?.name || app.applicantId?.departmentId?.name || 'Chưa cập nhật'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted">{formatDate(app.createdAt)}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="rounded-pill d-flex align-items-center gap-1" disabled title="Tính năng VIP/Premium">
                          <FaStar className="text-warning" /> Match
                        </Button>
                      </td>
                      <td className="text-center">{getStatusBadge(app.status)}</td>
                      <td className="text-center">
                        <a
                          href={app.cvFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm rounded-pill text-white"
                          style={{ backgroundColor: '#515253ff', borderColor: '#f7f7f7ff' }}
                        >
                          Xem CV
                        </a>
                      </td>
                      <td className="text-center">
                        {app.status === APPLICATION_STATUS.PENDING && (
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => {
                                setConfirmAction({ type: 'approve', appId: app._id, name: app.applicantId?.name });
                                setShowConfirm(true);
                              }}
                            >Duyệt</Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setConfirmAction({ type: 'reject', appId: app._id, name: app.applicantId?.name });
                                setShowConfirm(true);
                              }}
                            >Từ chối</Button>
                          </div>
                        )}
                        {app.status === APPLICATION_STATUS.APPROVED && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStartChat(app.applicantId._id)}
                          >Nhắn tin</Button>
                        )}
                        {app.status === APPLICATION_STATUS.REJECTED && (
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => {
                              setConfirmAction({ type: 'invite', appId: app._id, name: app.applicantId?.name });
                              setShowConfirm(true);
                            }}
                          >Mời tham gia</Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}

        {activeTab === 'members' && (
          <Row className="g-4">
            {members.length === 0 ? (
              <Col><div className="text-center py-4 text-muted">Chưa có thành viên nào được duyệt</div></Col>
            ) : (
              members.map((member) => (
                <Col md={3} key={member.userId._id}>
                  <Card className="border shadow-sm rounded-4 text-center h-100">
                    <Card.Body className="d-flex flex-column align-items-center p-4">
                      <img
                        src={member.userId.avatar || 'https://via.placeholder.com/64'}
                        alt="Avatar"
                        className="rounded-circle mb-3 border"
                        style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                      />
                      <h6 className="fw-bold mb-1">{member.userId.name}</h6>
                      <p className="text-muted mb-3" style={{ fontSize: '13px' }}>{member.userId?.majorId?.name || member.userId?.departmentId?.name || 'Chưa cập nhật'}</p>

                      <div className="d-flex flex-column gap-2 mt-auto w-100">
                        <div className="d-flex gap-2 w-100">
                          <Button
                            variant="info text-white"
                            className="w-50 rounded-pill"
                            onClick={() => navigate(`/profile/${member.userId._id}`)}
                            style={{ fontSize: '13px' }}
                          >Profile</Button>
                          <Button
                            variant="primary"
                            className="w-50 rounded-pill text-white"
                            onClick={() => handleStartChat(member.userId._id)}
                            style={{ fontSize: '13px' }}
                          >Nhắn tin</Button>
                        </div>
                        <Button
                          variant="warning"
                          className="w-100 rounded-pill py-1"
                          onClick={() => {
                            setConfirmAction({ type: 'kick', userId: member.userId._id, name: member.userId.name });
                            setShowConfirm(true);
                          }}
                          style={{ fontSize: '13px' }}
                        >Xóa khỏi dự án</Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        )}
      </div>

      <ConfirmActionModal
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        onConfirm={handleConfirmAction}
        title={
          confirmAction.type === 'approve' ? 'Duyệt ứng viên' :
            confirmAction.type === 'reject' ? 'Từ chối ứng viên' :
              confirmAction.type === 'invite' ? 'Mời tham gia' : 'Xóa thành viên'
        }
        message={
          confirmAction.type === 'approve' ? `Bạn có chắc chắn muốn duyệt ứng viên ${confirmAction.name} vào dự án không?` :
            confirmAction.type === 'reject' ? `Bạn có chắc chắn muốn từ chối ứng viên ${confirmAction.name} không?` :
              confirmAction.type === 'invite' ? `Bạn có muốn gửi lời mời tham gia dự án đến ${confirmAction.name}?` :
                `Bạn có chắc chắn muốn xóa thành viên ${confirmAction.name} khỏi dự án không?`
        }
        confirmText={
          confirmAction.type === 'approve' ? 'Duyệt' :
            confirmAction.type === 'reject' ? 'Từ chối' :
              confirmAction.type === 'invite' ? 'Mời' : 'Xóa'
        }
        variant={
          confirmAction.type === 'approve' || confirmAction.type === 'invite' ? 'success' : 'danger'
        }
      />

      <UpdateProjectModal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        project={project}
        onSuccess={(updatedData) => setProject({ ...project, ...updatedData })}
      />
    </Container>
  );
}
