import React, { useState, useEffect } from 'react';
import { Dropdown, Form, InputGroup } from 'react-bootstrap';
import { FaSearch, FaEllipsisV, FaLaptopCode } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import StatsCards from './StatsCards';
import ConfirmActionModal from '../../components/ConfirmActionModal';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Pagination from '../../components/Pagination';
import { getMyProjects, getMyProjectStats, deleteProject } from '../../services/projectService';
import { PROJECT_STATUS } from '../../constants/projectEnum';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/formatDate';

export default function MyProjectsTab() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 5;

  // Lấy thống kê các dự án của tôi
  const fetchStats = async () => {
    try {
      const res = await getMyProjectStats();
      if (res.success) setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Tải danh sách dự án theo trang (Server-side Pagination)
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await getMyProjects({ search, status: statusFilter, page, limit: ITEMS_PER_PAGE });
      if (res.success) {
        setProjects(res.data.projects || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter, page]);

  const handleDeleteClick = (id) => {
    setSelectedProjectId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await deleteProject(selectedProjectId);
      if (res.success) {
        toast.success('Hủy dự án thành công');
        setShowDeleteModal(false);
        fetchStats();
        fetchProjects();
      }
    } catch (error) {
      toast.error(error?.message || 'Xóa dự án thất bại');
    }
  };

  return (
    <div>
      <StatsCards stats={stats} />

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <h5 className="fw-semibold mb-0 text-dark">Danh sách dự án</h5>
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-end" style={{ maxWidth: '520px' }}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{ width: '180px' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value={PROJECT_STATUS.OPEN}>Đang tuyển</option>
            <option value={PROJECT_STATUS.IN_PROGRESS}>Đang thực hiện</option>
            <option value={PROJECT_STATUS.COMPLETED}>Kết thúc</option>
            <option value={PROJECT_STATUS.CLOSED}>Đã đóng</option>
            <option value={PROJECT_STATUS.CANCELLED}>Đã hủy</option>
          </Form.Select>

          <InputGroup style={{ width: '240px' }}>
            <InputGroup.Text className="bg-white text-muted">
              <FaSearch size={13} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Tìm kiếm dự án..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
        </div>
      </div>

      <div className="d-flex flex-column gap-2">
        {loading ? (
          <div className="text-center py-4 text-muted">Đang tải...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-5 text-muted bg-white border rounded">
            Bạn chưa có dự án nào
          </div>
        ) : (
          projects.map(project => (
            <Card key={project._id} className="card">
              <Card.Body className="d-flex align-items-center py-3 px-4 gap-3">
                {/* Cột 1: Icon + Tên dự án + Ngành học */}
                <div className="d-flex align-items-center gap-3" style={{ flex: '1 1 0', minWidth: '0' }}>
                  <div
                    className="rounded d-flex align-items-center justify-content-center border flex-shrink-0"
                    style={{ width: '38px', height: '38px', backgroundColor: 'var(--bg-subtle)' }}
                  >
                    <FaLaptopCode size={18} className="text-secondary" />
                  </div>
                  <div style={{ minWidth: '0', flex: '1 1 0' }}>
                    <h6 className="fw-semibold mb-0 text-truncate text-dark" style={{ fontSize: '14px' }} title={project.title}>
                      {project.title}
                    </h6>
                    <div className="d-flex align-items-center gap-1 text-muted text-truncate mt-1" style={{ fontSize: '12px' }}>
                      <span className="text-truncate">
                        {project.departmentIds?.map(d => d?.name || d).filter(Boolean).join(' · ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cột 2: Hạn ứng tuyển */}
                <div style={{ width: '140px', flex: '0 0 140px' }} className="flex-shrink-0">
                  <div className="text-muted small">
                    Hạn ứng tuyển
                  </div>
                  <div className="text-dark fw-medium small text-truncate mt-0">
                    {formatDate(project.deadline)}
                  </div>
                </div>

                {/* Cột 3: Thành viên + Progress bar */}
                <div style={{ width: '130px', flex: '0 0 130px' }} className="flex-shrink-0">
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: '12px' }}>
                    <span className="text-muted">Thành viên</span>
                    <span className="fw-semibold text-dark">{project.members?.length || 0}/{project.maxMembers}</span>
                  </div>
                  <div className="progress" style={{ height: '4px' }}>
                    <div
                      className="progress-bar"
                      style={{ width: `${Math.min(100, ((project.members?.length || 0) / project.maxMembers) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Cột 4: Trạng thái */}
                <div style={{ width: '130px', flex: '0 0 130px' }} className="d-flex justify-content-center flex-shrink-0">
                  <StatusBadge
                    variant={
                      project.status === PROJECT_STATUS.OPEN ? 'warning' :
                        project.status === PROJECT_STATUS.IN_PROGRESS ? 'primary' :
                          project.status === PROJECT_STATUS.COMPLETED ? 'success' :
                            project.status === PROJECT_STATUS.CANCELLED ? 'danger' : 'secondary'
                    }
                    text={
                      project.status === PROJECT_STATUS.OPEN ? 'Đang tuyển' :
                        project.status === PROJECT_STATUS.IN_PROGRESS ? 'Đang thực hiện' :
                          project.status === PROJECT_STATUS.COMPLETED ? 'Kết thúc' :
                            project.status === PROJECT_STATUS.CANCELLED ? 'Đã hủy' : 'Đã đóng'
                    }
                  />
                </div>

                {/* Cột 5: Nút Quản lý & Dropdown */}
                <div style={{ width: '120px', flex: '0 0 120px' }} className="d-flex align-items-center justify-content-end gap-2 flex-shrink-0">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="fw-medium px-3"
                    onClick={() => navigate(`/manage/${project._id}`)}
                  >
                    Quản lý
                  </Button>
                  <Dropdown align="end">
                    <Dropdown.Toggle as="div" className="btn btn-link text-muted p-1" style={{ cursor: 'pointer' }}>
                      <FaEllipsisV size={13} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {project.status !== PROJECT_STATUS.CANCELLED && (project.members?.length || 0) < (project.maxMembers / 2) && (
                        <Dropdown.Item onClick={() => handleDeleteClick(project._id)} className="text-danger fw-medium">
                          Hủy dự án
                        </Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </Card.Body>
            </Card>
          ))
        )}
      </div>

      {/* Phân trang server-side */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
        disabled={loading}
        className="mt-4"
      />

      <ConfirmActionModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Hủy dự án"
        message="Bạn có chắc chắn muốn hủy bài đăng dự án này? Thao tác này không thể hoàn tác và chỉ có thể thực hiện khi số thành viên chưa đạt mức tối thiểu (50%)."
        confirmText="Hủy dự án"
        variant="danger"
      />
    </div>
  );
}
