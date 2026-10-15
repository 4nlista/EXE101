import React, { useState, useEffect } from 'react';
import { Table, Form, Spinner, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Lock, Unlock, ShieldAlert, Users } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import Button from '../../../components/Button';
import Pagination from '../../../components/Pagination';
import LockUserModal from './LockUserModal';
import { toast } from 'react-toastify';

export default function UserManagementTab() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal khóa user
  const [selectedUserToLock, setSelectedUserToLock] = useState(null);

  // Debounce tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['adminUsers', debouncedSearch, statusFilter, packageFilter, currentPage],
    queryFn: () => adminService.getUsers({
      search: debouncedSearch,
      status: statusFilter,
      packageType: packageFilter,
      page: currentPage,
      limit: 10
    }),
    keepPreviousData: true
  });

  const users = response?.data?.users || response?.users || [];
  const pagination = response?.data?.pagination || response?.pagination || null;

  // Mutation mở khóa tài khoản
  const unlockMutation = useMutation({
    mutationFn: (userId) => adminService.unlockUser(userId),
    onSuccess: (_, userId) => {
      toast.success('Mở khóa tài khoản thành công.');
      queryClient.invalidateQueries(['adminUsers']);
      queryClient.invalidateQueries(['adminStats']);
    },
    onError: (err) => {
      toast.error(err.message || 'Không thể mở khóa tài khoản.');
    }
  });

  const handleUnlock = (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn mở khóa tài khoản cho "${user.name}"?`)) {
      unlockMutation.mutate(user._id);
    }
  };

  return (
    <div>
      {/* Bộ lọc và Tìm kiếm */}
      <div className="bg-white p-3 rounded-3 border shadow-sm mb-3">
        <Row className="g-2 align-items-center">
          <Col xs={12} md={5}>
            <div className="position-relative">
              <Search size={16} className="position-absolute text-muted" style={{ top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
              <Form.Control
                size="sm"
                type="text"
                className="ps-5 rounded-pill bg-light border"
                placeholder="Tìm theo họ tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Col>

          <Col xs={6} md={3}>
            <Form.Select
              size="sm"
              className="rounded-pill bg-light border text-secondary"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Bị khóa</option>
            </Form.Select>
          </Col>

          <Col xs={6} md={3}>
            <Form.Select
              size="sm"
              className="rounded-pill bg-light border text-secondary"
              value={packageFilter}
              onChange={(e) => {
                setPackageFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả gói dịch vụ</option>
              <option value="free">Gói Miễn phí</option>
              <option value="vip">Gói VIP</option>
              <option value="premium">Gói Premium</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {/* Bảng danh sách người dùng */}
      <div className="bg-white rounded-3 border shadow-sm p-3">
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="secondary" size="sm" />
            <div className="text-muted small mt-2">Đang tải danh sách người dùng...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Users size={36} className="opacity-50 mb-2" />
            <div className="fw-medium">Không tìm thấy người dùng nào</div>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover align="middle" className="mb-0 text-nowrap">
              <thead className="table-light small text-secondary">
                <tr>
                  <th>Thành viên</th>
                  <th>Vai trò / Gói</th>
                  <th>Chuyên ngành</th>
                  <th>Dự án chủ trì</th>
                  <th>Trạng thái</th>
                  <th className="text-end">Hành động</th>
                </tr>
              </thead>
              <tbody className="small">
                {users.map((u) => {
                  const isLocked = u.isActive === 2;
                  const isVip = u.currentPackage === 'vip' || u.currentPackage === 'premium';
                  const majorOrDept = u.majorId?.name || u.departmentId?.name || 'Chưa cập nhật';

                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="rounded-circle" style={{ width: '36px', height: '36px', objectFit: 'cover' }} />
                          ) : (
                            <div className="rounded-circle d-flex align-items-center justify-content-center bg-secondary text-white fw-bold" style={{ width: '36px', height: '36px' }}>
                              {u.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div>
                            <div className="fw-semibold text-dark">{u.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.78rem' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="d-flex flex-column gap-1">
                          <span className="badge bg-light text-secondary border fw-normal text-start" style={{ width: 'fit-content' }}>
                            {u.roleCode === 0 ? 'Quản trị viên' : 'Sinh viên'}
                          </span>
                          {isVip && (
                            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-medium text-start" style={{ width: 'fit-content' }}>
                              {u.currentPackage.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="text-muted">{majorOrDept}</td>
                      <td>
                        <span className="fw-medium text-dark">{u.hostedProjectsCount || 0}</span> dự án
                      </td>

                      <td>
                        {isLocked ? (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-medium d-inline-flex align-items-center gap-1">
                            <Lock size={12} /> Đã khóa
                          </span>
                        ) : (
                          <span className="badge bg-success-subtle text-success border border-success-subtle fw-medium">
                            Hoạt động
                          </span>
                        )}
                        {isLocked && u.lockReason && (
                          <div className="text-muted text-truncate mt-1" style={{ maxWidth: '150px', fontSize: '0.75rem' }} title={u.lockReason}>
                            Lý do: {u.lockReason}
                          </div>
                        )}
                      </td>

                      <td className="text-end">
                        {u.roleCode === 0 ? (
                          <span className="text-muted small">Mặc định</span>
                        ) : isLocked ? (
                          <Button
                            variant="light"
                            size="sm"
                            className="border text-success fw-medium shadow-sm d-inline-flex align-items-center gap-1"
                            onClick={() => handleUnlock(u)}
                            disabled={unlockMutation.isLoading}
                          >
                            <Unlock size={14} /> Mở khóa
                          </Button>
                        ) : (
                          <Button
                            variant="light"
                            size="sm"
                            className="border text-danger fw-medium shadow-sm d-inline-flex align-items-center gap-1"
                            onClick={() => setSelectedUserToLock(u)}
                          >
                            <Lock size={14} /> Khóa
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

      {/* Modal khóa user */}
      <LockUserModal
        user={selectedUserToLock}
        show={Boolean(selectedUserToLock)}
        onClose={() => setSelectedUserToLock(null)}
        onSuccess={() => {
          queryClient.invalidateQueries(['adminUsers']);
          queryClient.invalidateQueries(['adminStats']);
        }}
      />
    </div>
  );
}
