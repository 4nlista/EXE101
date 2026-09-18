import React, { useState } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '../../services/projectService';
import ProjectCard from '../../components/ProjectCard';
import ProjectFilter from '../../components/ProjectFilter';

export default function ProjectFeed() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    departmentId: '',
    status: '',
    gradeTarget: ''
  });

  // Gọi API thông qua React Query
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => getProjects(filters),
    keepPreviousData: true // Giúp UI mượt hơn khi chuyển trang
  });

  const projects = response?.data?.data?.projects || [];
  const pagination = response?.data?.data?.pagination || null;

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">

      <Container className="py-5 flex-grow-1">
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold">Bảng tin Dự án</h2>
            <p className="text-muted">Khám phá và tham gia các dự án thú vị từ sinh viên toàn trường.</p>
          </Col>
        </Row>

        <Row>
          {/* Cột trái: Bộ lọc (3 phần) */}
          <Col md={3}>
            <ProjectFilter filters={filters} setFilters={setFilters} />
          </Col>

          {/* Cột phải: Danh sách dự án (9 phần) */}
          <Col md={9}>
            {isLoading && (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Đang tải danh sách dự án...</p>
              </div>
            )}

            {isError && (
              <Alert variant="danger">
                Có lỗi xảy ra khi tải dữ liệu: {error?.message}
              </Alert>
            )}

            {!isLoading && !isError && projects.length === 0 && (
              <div className="text-center py-5 bg-white rounded border shadow-sm">
                <h5 className="text-muted mb-0">Không tìm thấy dự án nào phù hợp với bộ lọc.</h5>
              </div>
            )}

            {!isLoading && !isError && projects.length > 0 && (
              <>
                {projects.map(project => (
                  <ProjectCard key={project._id} project={project} />
                ))}

                {/* Phân trang cơ bản */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <button 
                      className="btn btn-outline-primary me-2"
                      disabled={filters.page <= 1}
                      onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                    >
                      Trang trước
                    </button>
                    <span className="d-flex align-items-center mx-2 text-muted">
                      Trang {pagination.page} / {pagination.totalPages}
                    </span>
                    <button 
                      className="btn btn-outline-primary ms-2"
                      disabled={filters.page >= pagination.totalPages}
                      onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
