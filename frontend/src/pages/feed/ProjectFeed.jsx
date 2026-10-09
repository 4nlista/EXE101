import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import Select from '../../components/Select';
import Pagination from '../../components/Pagination';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProjects, getProjectDetail } from '../../services/projectService';
import ProjectCard from '../../components/ProjectCard';
import ProjectFilter from '../../components/ProjectFilter';
import ProjectDetailModal from './ProjectDetailModal';
import CreateProjectModal from './CreateProjectModal';
import OnboardingRequiredModal from '../../components/OnboardingRequiredModal';
import Input from '../../components/Input';
import { Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ProjectFeed() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 9,
    search: '',
    departmentId: '',
    role: '',
    minGrade: '',
    maxGrade: '',
    deadline: '',
    sort: 'newest',
    onlyLiked: false
  });

  const location = useLocation();

  // Tự động mở ProjectDetailModal nếu có state từ trang khác truyền sang (VD: Click thông báo)
  useEffect(() => {
    const openProjectId = location.state?.openProjectId;
    if (openProjectId) {
      const fetchProject = async () => {
        try {
          const res = await getProjectDetail(openProjectId);
          if (res.data) {
            setSelectedProject(res.data);
          }
        } catch (error) {
          console.error('Lỗi khi fetch dự án từ thông báo:', error);
        }
      };
      fetchProject();
      // Xóa state để không bị mở lại khi người dùng F5 hoặc điều hướng lung tung
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Gọi API thông qua React Query
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => getProjects(filters),
    keepPreviousData: true // Giúp UI mượt hơn khi chuyển trang
  });

  const projects = response?.data?.projects || [];
  const pagination = response?.data?.pagination || null;

  const handleCreateProjectClick = () => {
    if (currentUser && !currentUser.onboardingCompleted) {
      setShowOnboardingModal(true);
      return;
    }
    setShowCreateModal(true);
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f0f2f5' }}>

      <Container fluid className="py-4 px-4 flex-grow-1">
        <Row>
          {/* Cột trái: Bộ lọc (3 phần) */}
          <Col xl={3} lg={3} md={4} className="mb-4">
            <ProjectFilter filters={filters} setFilters={setFilters} />
          </Col>

          {/* Cột phải: Main Content (9 phần) */}
          <Col xl={9} lg={9} md={8}>

            {/* Banner nhắc nhở hoàn tất hồ sơ cho người dùng chưa onboarding */}
            {currentUser && !currentUser.onboardingCompleted && (
              <div className="bg-white border border-warning border-opacity-75 rounded-3 p-3 mb-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 shadow-sm">
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-5">⚡</span>
                  <div>
                    <div className="fw-semibold text-dark" style={{ fontSize: '0.92rem' }}>
                      Hồ sơ của bạn chưa hoàn thiện
                    </div>
                    <div className="text-secondary small">
                      Hãy bổ sung thông tin cá nhân để bắt đầu ứng tuyển vào dự án và trải nghiệm tính năng ghép nhóm AI!
                    </div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/onboarding')}
                  className="text-nowrap fw-medium"
                  style={{ backgroundColor: '#ea580c', borderColor: '#ea580c' }}
                >
                  Hoàn tất hồ sơ ngay →
                </Button>
              </div>
            )}

            {/* Top Bar */}
            <div className="bg-white p-3 rounded shadow-sm border border-primary border-opacity-25 mb-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
              <div className="mb-2 mb-md-0">
                <h4 className="fw-bold mb-1">Bảng tin dự án</h4>
                <p className="text-muted small mb-0">Tìm kiếm các nhóm phù hợp với kỹ năng của bạn.</p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: '250px' }}>
                  <Input
                    type="text"
                    placeholder="Tìm kiếm tên dự án..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    icon={Search}
                    className="mb-0"
                  />
                </div>

                <Select
                  className="mb-0 text-secondary"
                  style={{ width: 'auto' }}
                  value={filters.sort || 'newest'}
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
                >
                  <option value="newest">Sắp xếp: Mới nhất</option>
                  <option value="oldest">Sắp xếp: Cũ nhất</option>
                </Select>

                <Button
                  variant="primary"
                  className="text-white px-3 fw-medium"
                  style={{ backgroundColor: '#ea580c', borderColor: '#ea580c' }}
                  onClick={handleCreateProjectClick}
                >
                  +Tạo bài đăng
                </Button>
              </div>
            </div>

            {/* Trạng thái Loading / Lỗi */}
            {isLoading && (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Đang tải danh sách dự án...</p>
              </div>
            )}

            {isError && (
              <Alert type="danger" className="text-center">
                Có lỗi xảy ra khi tải dữ liệu: {error?.message || 'Lỗi không xác định'}
              </Alert>
            )}

            {!isLoading && !isError && projects.length === 0 && (
              <div className="text-center py-5 bg-white rounded shadow-sm">
                <p className="text-muted mb-0">Không tìm thấy dự án nào phù hợp với bộ lọc.</p>
              </div>
            )}

            {/* Grid danh sách dự án */}
            {!isLoading && !isError && projects.length > 0 && (
              <>
                <Row className="g-4">
                  {projects.map(project => (
                    <Col xl={4} lg={4} md={6} sm={12} key={project._id}>
                      <ProjectCard
                        project={project}
                        onViewDetail={() => setSelectedProject(project)}
                        onLikeChange={() => {
                          if (filters.onlyLiked) {
                            queryClient.invalidateQueries(['projects']);
                          }
                        }}
                      />
                    </Col>
                  ))}
                </Row>

                {/* Phân trang chuẩn */}
                {pagination && pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => setFilters(p => ({ ...p, page }))}
                    className="mt-4"
                  />
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>

      {/* Modal Xem chi tiết & Ứng tuyển */}
      <ProjectDetailModal
        project={selectedProject}
        show={!!selectedProject}
        onHide={() => setSelectedProject(null)}
      />

      {/* Modal Tạo bài đăng */}
      <CreateProjectModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
      />

      {/* Modal Cảnh báo yêu cầu hoàn tất hồ sơ */}
      <OnboardingRequiredModal
        show={showOnboardingModal}
        onHide={() => setShowOnboardingModal(false)}
        actionTitle="tạo bài đăng dự án mới"
      />
    </div>
  );
}
