import React, { useState, useEffect } from 'react';
import { Table, Form, Spinner, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, FolderGit2, ShieldAlert, CheckCircle, RotateCcw } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { PROJECT_STATUS } from '../../../constants';
import Button from '../../../components/Button';
import Pagination from '../../../components/Pagination';
import StatusBadge from '../../../components/StatusBadge';
import ModerateProjectModal from './ModerateProjectModal';
import { toast } from 'react-toastify';

export default function ProjectModerationTab() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal kiểm duyệt
  const [selectedProjectToModerate, setSelectedProjectToModerate] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['adminProjects', debouncedSearch, statusFilter, currentPage],
    queryFn: () => adminService.getProjects({
      search: debouncedSearch,
      status: statusFilter,
      page: currentPage,
      limit: 10
    }),
    keepPreviousData: true
  });

  const projects = response?.data?.projects || response?.projects || [];
  const pagination = response?.data?.pagination || response?.pagination || null;

  // Mutation khôi phục dự án bị đình chỉ
  const restoreMutation = useMutation({
    mutationFn: (projectId) => adminService.moderateProject(projectId, {
      action: 'restore',
      reason: 'Dự án đã được xác thực an toàn và khôi phục hoạt động'
    }),
    onSuccess: () => {
      toast.success('Dự án đã được khôi phục hoạt động thành công.');
      queryClient.invalidateQueries(['adminProjects']);
      queryClient.invalidateQueries(['adminStats']);
    },
    onError: (err) => {
      toast.error(err.message || 'Không thể khôi phục dự án.');
    }
  });

  const handleRestore = (project) => {
    if (window.confirm(`Bạn có chắc chắn muốn khôi phục hoạt động cho dự án "${project.title}"?`)) {
      restoreMutation.mutate(project._id);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case PROJECT_STATUS.OPEN:
        // Đang mở tuyển: Nền xanh lá cây chữ trắng
        return <StatusBadge variant="green" text="Đang mở tuyển" />;
      case PROJECT_STATUS.IN_PROGRESS:
        // Đang thực hiện: Nền xanh nước biển chữ trắng
        return <StatusBadge variant="blue" text="Đang thực hiện" />;
      case PROJECT_STATUS.COMPLETED:
        // Đã hoàn thành: Nền tím chữ trắng
        return <StatusBadge variant="purple" text="Đã hoàn thành" />;
      case PROJECT_STATUS.CLOSED:
        // Đã đóng slot: Nền xám chữ đen
        return <StatusBadge variant="gray" text="Đã đóng slot" />;
      case PROJECT_STATUS.CANCELLED:
        // Đã hủy: Nền đỏ chữ trắng
        return <StatusBadge variant="red" text="Đã hủy" />;
      case PROJECT_STATUS.SUSPENDED:
        // Bị đình chỉ: Nền cam chữ trắng
        return <StatusBadge variant="orange" text="Bị đình chỉ" />;
      default:
        return <StatusBadge variant="gray" text={status} />;
    }
  };

  return (
    <div>
      {/* Bộ lọc và Tìm kiếm */}
      <div className="bg-white p-3 rounded-3 border shadow-sm mb-3">
        <Row className="g-2 align-items-center">
          <Col xs={12} md={8}>
            <div className="position-relative">
              <Search size={16} className="position-absolute text-muted" style={{ top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
              <Form.Control
                size="sm"
                type="text"
                className="ps-5 rounded-pill bg-light border"
                placeholder="Tìm dự án theo tiêu đề..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Col>

          <Col xs={12} md={4}>
            <Form.Select
              size="sm"
              className="rounded-pill bg-light border text-secondary"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả trạng thái dự án</option>
              <option value={PROJECT_STATUS.OPEN}>Đang mở tuyển</option>
              <option value={PROJECT_STATUS.IN_PROGRESS}>Đang thực hiện</option>
              <option value={PROJECT_STATUS.COMPLETED}>Đã hoàn thành</option>
              <option value={PROJECT_STATUS.CLOSED}>Đã đóng slot</option>
              <option value={PROJECT_STATUS.CANCELLED}>Đã hủy</option>
              <option value={PROJECT_STATUS.SUSPENDED}>Bị đình chỉ / vi phạm</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {/* Bảng danh sách dự án */}
      <div className="bg-white rounded-3 border shadow-sm p-3">
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="secondary" size="sm" />
            <div className="text-muted small mt-2">Đang tải danh sách bài đăng...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <FolderGit2 size={36} className="opacity-50 mb-2" />
            <div className="fw-medium">Không tìm thấy dự án nào</div>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover align="middle" className="mb-0 text-nowrap">
              <thead className="table-light small text-secondary">
                <tr>
                  <th>Tên dự án</th>
                  <th>Chủ dự án</th>
                  <th>Thành viên</th>
                  <th>Ứng tuyển</th>
                  <th>Trạng thái</th>
                  <th className="text-end">Kiểm duyệt</th>
                </tr>
              </thead>
              <tbody className="small">
                {projects.map((p) => {
                  const isSuspended = p.status === PROJECT_STATUS.SUSPENDED;
                  const ownerName = p.ownerId?.name || 'Không rõ';
                  const ownerEmail = p.ownerId?.email || '';

                  return (
                    <tr key={p._id}>
                      <td>
                        <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '240px' }} title={p.title}>
                          {p.title}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Ngày tạo: {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>

                      <td>
                        <div className="fw-medium text-dark">{ownerName}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{ownerEmail}</div>
                      </td>

                      <td>
                        <span className="fw-semibold text-dark">{p.currentMemberCount || 1}</span>
                        <span className="text-muted">/{p.maxMembers || 1} người</span>
                      </td>

                      <td>
                        <span className="fw-medium text-dark">{p.applicationCount || 0}</span> hồ sơ
                      </td>

                      <td>
                        {renderStatusBadge(p.status)}
                        {isSuspended && p.moderationReason && (
                          <div className="text-danger text-truncate mt-1" style={{ maxWidth: '160px', fontSize: '0.75rem' }} title={p.moderationReason}>
                            Lý do: {p.moderationReason}
                          </div>
                        )}
                      </td>

                      <td className="text-end">
                        {isSuspended ? (
                          <Button
                            variant="light"
                            size="sm"
                            className="border text-success fw-medium shadow-sm d-inline-flex align-items-center gap-1"
                            onClick={() => handleRestore(p)}
                            disabled={restoreMutation.isLoading}
                          >
                            <RotateCcw size={14} /> Khôi phục
                          </Button>
                        ) : (
                          <Button
                            variant="light"
                            size="sm"
                            className="border text-danger fw-medium shadow-sm d-inline-flex align-items-center gap-1"
                            onClick={() => setSelectedProjectToModerate(p)}
                          >
                            <ShieldAlert size={14} /> Gỡ bài
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}

        {/* Phân trang */}
        {pagination && pagination.totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Modal kiểm duyệt dự án */}
      <ModerateProjectModal
        project={selectedProjectToModerate}
        show={Boolean(selectedProjectToModerate)}
        onClose={() => setSelectedProjectToModerate(null)}
        onSuccess={() => {
          queryClient.invalidateQueries(['adminProjects']);
          queryClient.invalidateQueries(['adminStats']);
        }}
      />
    </div>
  );
}
