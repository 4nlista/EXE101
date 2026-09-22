import React, { useState, useEffect } from 'react';
import { Card, Badge, Dropdown, Form, InputGroup } from 'react-bootstrap';
import { FaSearch, FaEllipsisV, FaLaptopCode } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import StatsCards from './StatsCards';
import ConfirmActionModal from '../../components/ConfirmActionModal';
import Button from '../../components/Button';
import { getMyProjects, getMyProjectStats, deleteProject } from '../../services/projectService';
import { PROJECT_STATUS } from '../../constants/projectEnum';
import { formatDate } from '../../utils/formatDate';

export default function MyProjectsTab() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const res = await getMyProjectStats();
      if (res.success) setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await getMyProjects({ search, limit: 20 });
      if (res.success) {
        setProjects(res.data.projects);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchProjects();
  }, [search]);

  const handleDeleteClick = (id) => {
    setSelectedProjectId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await deleteProject(selectedProjectId);
      if (res.success) {
        toast.success('Xóa dự án thành công');
        setShowDeleteModal(false);
        fetchStats();
        fetchProjects();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa dự án thất bại');
    }
  };

  return (
    <div>
      <StatsCards stats={stats} />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Danh sách dự án</h5>
        <div className="d-flex gap-2" style={{ width: '300px' }}>
          <InputGroup>
            <InputGroup.Text className="bg-white border-end-0">
              <FaSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Tìm kiếm dự án của bạn..."
              className="border-start-0 ps-0 shadow-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>

      <div className="d-flex flex-column gap-3">
        {loading ? (
          <div className="text-center py-4 text-muted">Đang tải...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-5 text-muted bg-light rounded-4">
            Bạn chưa có dự án nào
          </div>
        ) : (
          projects.map(project => (
            <Card key={project._id} className="border-0 shadow-sm rounded-4">
              <Card.Body className="d-flex align-items-center py-3">
                <div className="bg-light rounded-3 d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px' }}>
                  <FaLaptopCode size={24} className="text-primary" />
                </div>

                <div className="flex-grow-1" style={{ minWidth: '0' }}>
                  <h6 className="fw-bold mb-1 text-truncate">{project.title}</h6>
                  <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '13px' }}>
                    <span>•</span>
                    <span className="text-truncate">{project.departmentIds?.map(d => d.name).join(' · ')}</span>

                  </div>
                </div>

                <div className="mx-5">
                  <div className="text-dark mb-1 fw-bold" style={{ fontSize: '12px' }}>Hạn ứng tuyển</div>
                  <div className="text-muted" style={{ fontSize: '13px' }}>
                    {formatDate(project.deadline)}
                  </div>
                </div>

                <div className="mx-4" style={{ width: '150px' }}>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
                    <span className="text-muted">Thành viên</span>
                    <span className="fw-semibold">{project.members?.length || 0}/{project.maxMembers}</span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div
                      className="progress-bar bg-success"
                      style={{ width: `${Math.min(100, ((project.members?.length || 0) / project.maxMembers) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mx-4 text-center" style={{ width: '120px' }}>
                  <Badge
                    bg={project.status === PROJECT_STATUS.OPEN ? 'warning' : 'success'}
                    text={project.status === PROJECT_STATUS.OPEN ? 'dark' : 'light'}
                    className="rounded-pill px-3 py-2 fw-normal bg-opacity-25"
                  >
                    {project.status === PROJECT_STATUS.OPEN ? 'Đang tuyển' : 'Đã đủ thành viên'}
                  </Badge>
                </div>

                <div className="ms-2 d-flex align-items-center gap-2">
                  <Button
                    variant="secondary text-dark border-2"
                    className="rounded-pill px-3"
                    onClick={() => navigate(`/manage/${project._id}`)}
                  >
                    Quản lý
                  </Button>
                  <Dropdown align="end">
                    <Dropdown.Toggle as="div" className="btn btn-link text-muted p-1" style={{ cursor: 'pointer' }}>
                      <FaEllipsisV />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="border-1 shadow-sm rounded-5">
                      <Dropdown.Item onClick={() => handleDeleteClick(project._id)} className="text-danger">
                        Xóa bài đăng
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </Card.Body>
            </Card>
          ))
        )}
      </div>

      <ConfirmActionModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xóa dự án"
        message="Bạn có chắc chắn muốn xóa bài đăng dự án này? Thao tác này không thể hoàn tác."
        confirmText="Xóa dự án"
        variant="danger"
      />
    </div>
  );
}
