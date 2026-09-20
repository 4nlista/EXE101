import React, { useState } from 'react';
import { Container, Row, Col, Spinner, Form } from 'react-bootstrap';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '../../services/projectService';
import ProjectCard from '../../components/ProjectCard';
import ProjectFilter from '../../components/ProjectFilter';
import ProjectDetailModal from './ProjectDetailModal';
import CreateProjectModal from './CreateProjectModal';
import Input from '../../components/Input';
import { Search } from 'lucide-react';

export default function ProjectFeed() {
  const [showCreateModal, setShowCreateModal] = useState(false);
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
    sort: 'newest'
  });

  // Gọi API thông qua React Query
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => getProjects(filters),
    keepPreviousData: true // Giúp UI mượt hơn khi chuyển trang
  });

  const projects = response?.data?.projects || [];
  const pagination = response?.data?.pagination || null;

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

                <Form.Select
                  className="text-secondary"
                  style={{ width: 'auto' }}
                  value={filters.sort || 'newest'}
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
                >
                  <option value="newest">Sắp xếp: Mới nhất</option>
                  <option value="oldest">Sắp xếp: Cũ nhất</option>
                </Form.Select>

                <Button
                  variant="primary"
                  className="text-white px-3 fw-medium"
                  style={{ backgroundColor: '#ea580c', borderColor: '#ea580c' }}
                  onClick={() => setShowCreateModal(true)}
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
                      />
                    </Col>
                  ))}
                </Row>

                {/* Phân trang cơ bản */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Button
                      variant="outline-primary"
                      className="me-2"
                      disabled={filters.page <= 1}
                      onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                    >
                      Trang trước
                    </Button>
                    <span className="d-flex align-items-center mx-2 text-muted">
                      Trang {pagination.page} / {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline-primary"
                      className="ms-2"
                      disabled={filters.page >= pagination.totalPages}
                      onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                    >
                      Trang sau
                    </Button>
                  </div>
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
    </div>
  );
}
