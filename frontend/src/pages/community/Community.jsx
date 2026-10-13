import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Clock, Users, ChevronRight, GraduationCap } from 'lucide-react';
import { profileService } from '../../services/profileService';
import { useDepartments } from '../../hooks/useMasterData';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';

const RECENT_KEY = 'universe_recent_community_searches';

export default function Community() {
  const navigate = useNavigate();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Lịch sử tìm kiếm gần đây (lưu local)
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) {
        setRecentUsers(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Debounce tìm kiếm khi gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Lấy danh sách ngành học để lọc nhanh
  const { data: rawDepartments } = useDepartments();
  const departments = Array.isArray(rawDepartments) ? rawDepartments : (rawDepartments?.data || []);

  // Query danh sách người dùng trong cộng đồng
  const { data: response, isLoading } = useQuery({
    queryKey: ['communityUsers', debouncedSearch, selectedDept, currentPage],
    queryFn: () => profileService.getCommunityUsers({
      search: debouncedSearch,
      departmentId: selectedDept || undefined,
      page: currentPage,
      limit: 12
    }),
    keepPreviousData: true
  });

  const users = response?.data?.data?.users || [];
  const pagination = response?.data?.data?.pagination || null;

  // Xử lý khi click vào người dùng -> Lưu vào lịch sử & chuyển đến Profile
  const handleUserClick = (user) => {
    try {
      const userSummary = {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        deptName: user.departmentId?.name || '',
        semester: user.semester || ''
      };
      const filtered = recentUsers.filter(u => u._id !== user._id);
      const updated = [userSummary, ...filtered].slice(0, 8);
      setRecentUsers(updated);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    navigate(`/profile/${user._id}`);
  };

  // Xóa một người khỏi lịch sử gần đây
  const handleRemoveRecent = (e, userId) => {
    e.stopPropagation();
    const updated = recentUsers.filter(u => u._id !== userId);
    setRecentUsers(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  // Xóa toàn bộ lịch sử gần đây
  const handleClearAllRecent = () => {
    setRecentUsers([]);
    localStorage.removeItem(RECENT_KEY);
  };

  const isSearching = debouncedSearch.trim().length > 0 || Boolean(selectedDept);

  return (
    <div className="min-vh-100 py-4" style={{ backgroundColor: '#f0f2f5' }}>
      <Container style={{ maxWidth: '720px' }}>
        {/* Card khung tìm kiếm chính phong cách Facebook */}
        <div className="bg-white rounded-3 shadow-sm border p-3 mb-3">
          {/* Thanh tìm kiếm */}
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="position-relative flex-grow-1">
              <Search
                size={18}
                className="position-absolute text-muted"
                style={{ top: '50%', left: '14px', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-control rounded-pill ps-5 pe-5 py-2 border-0 bg-light"
                style={{ fontSize: '0.95rem' }}
                placeholder="Tìm kiếm sinh viên, bạn bè theo họ tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn btn-link position-absolute p-0 text-muted"
                  style={{ top: '50%', right: '14px', transform: 'translateY(-50%)', textDecoration: 'none' }}
                  onClick={() => setSearchTerm('')}
                  title="Xóa tìm kiếm"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Dropdown lọc theo ngành */}
            <div style={{ minWidth: '160px' }}>
              <Form.Select
                size="sm"
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-pill py-2 text-secondary border bg-light"
                style={{ fontSize: '0.85rem' }}
              >
                <option value="">Tất cả ngành</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </Form.Select>
            </div>
          </div>
        </div>

        {/* Nội dung kết quả */}
        <div className="bg-white rounded-3 shadow-sm border p-3">
          {/* Trường hợp 1: Người dùng chưa tìm kiếm và có lịch sử gần đây */}
          {!isSearching && recentUsers.length > 0 && (
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2 px-2">
                <span className="fw-bold text-dark fs-6 d-flex align-items-center gap-1">
                  <Clock size={16} className="text-secondary" /> Gần đây
                </span>
                <span
                  role="button"
                  className="text-primary small"
                  style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                  onClick={handleClearAllRecent}
                >
                  Xóa tất cả
                </span>
              </div>

              <div className="d-flex flex-column gap-1">
                {recentUsers.map((user) => (
                  <div
                    key={user._id}
                    className="d-flex align-items-center justify-content-between p-2 rounded-2 hover-bg"
                    style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                    onClick={() => navigate(`/profile/${user._id}`)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="rounded-circle"
                          style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center bg-secondary text-white fw-bold"
                          style={{ width: '44px', height: '44px', fontSize: '1.1rem' }}
                        >
                          {user.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}

                      <div>
                        <div className="fw-semibold text-dark" style={{ fontSize: '0.95rem' }}>
                          {user.name}
                        </div>
                        <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                          {user.deptName || 'Thành viên'} {user.semester ? `• Kỳ ${user.semester}` : ''}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-link p-1 text-muted"
                      style={{ textDecoration: 'none' }}
                      onClick={(e) => handleRemoveRecent(e, user._id)}
                      title="Xóa khỏi lịch sử"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <hr className="my-3 opacity-25" />
            </div>
          )}

          {/* Tiêu đề danh sách */}
          <div className="px-2 mb-2 d-flex justify-content-between align-items-center">
            <span className="fw-bold text-dark fs-6 d-flex align-items-center gap-2">
              <Users size={16} className="text-secondary" />
              {isSearching ? `Kết quả tìm kiếm (${pagination?.total || 0})` : 'Cộng đồng sinh viên'}
            </span>
          </div>

          {/* Danh sách người dùng */}
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="secondary" size="sm" />
              <div className="text-muted small mt-2">Đang tìm kiếm...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted mb-2">
                <Users size={40} strokeWidth={1.5} className="text-secondary opacity-50" />
              </div>
              <h6 className="fw-bold text-dark">Không tìm thấy sinh viên nào</h6>
              <p className="text-muted small mb-0">
                {searchTerm ? `Không có kết quả khớp với "${searchTerm}". Hãy thử kiểm tra lại họ tên.` : 'Chưa có thành viên nào.'}
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-1">
              {users.map((user) => {
                const deptName = user.departmentId?.name || '';
                const majorName = user.majorId?.name || '';

                return (
                  <div
                    key={user._id}
                    className="d-flex align-items-center justify-content-between p-2 rounded-2 hover-bg"
                    style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="rounded-circle"
                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center bg-secondary text-white fw-bold"
                          style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}
                        >
                          {user.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}

                      <div>
                        <div className="fw-semibold text-dark" style={{ fontSize: '0.95rem' }}>
                          {user.name}
                        </div>
                        <div className="text-muted small d-flex align-items-center gap-1 flex-wrap" style={{ fontSize: '0.8rem' }}>
                          {deptName && (
                            <span>{deptName}</span>
                          )}
                          {majorName && (
                            <>
                              <span>•</span>
                              <span>{majorName}</span>
                            </>
                          )}
                          {user.semester && (
                            <>
                              <span>•</span>
                              <span>Kỳ {user.semester}</span>
                            </>
                          )}
                        </div>

                        {/* Kỹ năng nếu có */}
                        {user.mainSkills && user.mainSkills.length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {user.mainSkills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="badge bg-light text-secondary border fw-normal"
                                style={{ fontSize: '0.7rem' }}
                              >
                                {skill}
                              </span>
                            ))}
                            {user.mainSkills.length > 3 && (
                              <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                                +{user.mainSkills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nút xem trang cá nhân bên phải */}
                    <div className="d-flex align-items-center gap-2">
                      <Button
                        variant="light"
                        size="sm"
                        className="d-none d-sm-inline-flex border shadow-sm px-3 text-dark fw-medium"
                        style={{ fontSize: '0.8rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user);
                        }}
                      >
                        Xem hồ sơ
                      </Button>
                      <ChevronRight size={18} className="text-muted d-sm-none" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Phân trang nếu có nhiều trang */}
          {pagination && pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
