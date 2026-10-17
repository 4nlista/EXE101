import React, { useState } from 'react';
import { Table, Form, Row, Col, Spinner } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, GraduationCap, Tag, Check, Eye, EyeOff, Search, BookOpen } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { useDepartments } from '../../../hooks/useMasterData';
import Button from '../../../components/Button';
import CreateDepartmentModal from './CreateDepartmentModal';
import CreateMajorModal from './CreateMajorModal';
import CreateSkillModal from './CreateSkillModal';
import { toast } from 'react-toastify';

export default function MasterDataTab() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState('departments'); // 'departments' | 'majors' | 'skills'

  // Ngành học state
  const [showDeptModal, setShowDeptModal] = useState(false);

  // Chuyên ngành state
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [showMajorModal, setShowMajorModal] = useState(false);

  // Kỹ năng state
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillModal, setShowSkillModal] = useState(false);

  // Lấy danh sách ngành học (cho dropdown filter)
  const { data: rawDepartments } = useDepartments();
  const departments = Array.isArray(rawDepartments) ? rawDepartments : (rawDepartments?.data || []);

  // Query danh sách ngành học dành riêng cho Admin
  const { data: adminDeptResponse, isLoading: isDeptsLoading } = useQuery({
    queryKey: ['adminDepartments'],
    queryFn: () => adminService.getDepartments(),
    enabled: activeSubTab === 'departments'
  });
  const adminDepartments = adminDeptResponse?.data || adminDeptResponse || [];

  // Query danh sách chuyên ngành
  const { data: majorsResponse, isLoading: isMajorsLoading } = useQuery({
    queryKey: ['adminMajors', selectedDeptId],
    queryFn: () => adminService.getMajors(selectedDeptId),
    enabled: activeSubTab === 'majors'
  });
  const majors = majorsResponse?.data || majorsResponse || [];

  // Query danh sách kỹ năng
  const { data: skillsResponse, isLoading: isSkillsLoading } = useQuery({
    queryKey: ['adminSkills', skillSearch],
    queryFn: () => adminService.getSkills({ search: skillSearch }),
    enabled: activeSubTab === 'skills'
  });
  const skills = skillsResponse?.data || skillsResponse || [];

  // Mutation bật/tắt ngành học
  const toggleDeptMutation = useMutation({
    mutationFn: (deptId) => adminService.toggleDepartmentStatus(deptId),
    onSuccess: (res) => {
      toast.success(res?.message || 'Cập nhật trạng thái ngành học thành công.');
      queryClient.invalidateQueries(['adminDepartments']);
      queryClient.invalidateQueries(['departments']);
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi khi cập nhật trạng thái ngành học.');
    }
  });

  // Mutation bật/tắt chuyên ngành
  const toggleMajorMutation = useMutation({
    mutationFn: (majorId) => adminService.toggleMajorStatus(majorId),
    onSuccess: (res) => {
      toast.success(res?.message || 'Cập nhật trạng thái chuyên ngành thành công.');
      queryClient.invalidateQueries(['adminMajors']);
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi khi cập nhật chuyên ngành.');
    }
  });

  // Mutation duyệt kỹ năng
  const approveSkillMutation = useMutation({
    mutationFn: (skillId) => adminService.approveSkill(skillId),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã phê duyệt kỹ năng thành công.');
      queryClient.invalidateQueries(['adminSkills']);
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi khi phê duyệt kỹ năng.');
    }
  });

  return (
    <div>
      {/* Sub-tab chuyển đổi giữa Ngành học, Chuyên ngành và Kỹ năng */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
        <div className="d-inline-flex p-1 bg-white rounded-pill border shadow-sm">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-medium ${activeSubTab === 'departments' ? 'btn-primary text-white' : 'btn-link text-secondary text-decoration-none'}`}
            onClick={() => setActiveSubTab('departments')}
          >
            <BookOpen size={16} className="me-1" /> Ngành học
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-medium ${activeSubTab === 'majors' ? 'btn-primary text-white' : 'btn-link text-secondary text-decoration-none'}`}
            onClick={() => setActiveSubTab('majors')}
          >
            <GraduationCap size={16} className="me-1" /> Chuyên ngành
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-medium ${activeSubTab === 'skills' ? 'btn-primary text-white' : 'btn-link text-secondary text-decoration-none'}`}
            onClick={() => setActiveSubTab('skills')}
          >
            <Tag size={16} className="me-1" /> Từ điển Kỹ năng
          </button>
        </div>

        <div>
          {activeSubTab === 'departments' ? (
            <Button
              variant="primary"
              size="sm"
              className="d-inline-flex align-items-center gap-1 shadow-sm"
              onClick={() => setShowDeptModal(true)}
            >
              <Plus size={16} /> Thêm ngành học
            </Button>
          ) : activeSubTab === 'majors' ? (
            <div className="d-flex align-items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="d-inline-flex align-items-center gap-1 shadow-sm"
                onClick={() => setShowDeptModal(true)}
              >
                <Plus size={16} /> Thêm ngành học
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="d-inline-flex align-items-center gap-1 shadow-sm"
                onClick={() => setShowMajorModal(true)}
              >
                <Plus size={16} /> Thêm chuyên ngành
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="d-inline-flex align-items-center gap-1 shadow-sm"
              onClick={() => setShowSkillModal(true)}
            >
              <Plus size={16} /> Thêm kỹ năng mới
            </Button>
          )}
        </div>
      </div>

      {/* NỘI DUNG 1: QUẢN LÝ NGÀNH HỌC */}
      {activeSubTab === 'departments' && (
        <div className="bg-white p-3 rounded-3 border shadow-sm">
          {isDeptsLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="secondary" size="sm" />
              <div className="text-muted small mt-2">Đang tải danh sách ngành học...</div>
            </div>
          ) : adminDepartments.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <BookOpen size={36} className="opacity-50 mb-2" />
              <div className="fw-medium">Chưa có ngành học nào trong hệ thống</div>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover align="middle" className="mb-0 text-nowrap">
                <thead className="table-light small text-secondary">
                  <tr>
                    <th>Tên ngành học</th>
                    <th>Mô tả</th>
                    <th>Số chuyên ngành</th>
                    <th>Trạng thái</th>
                    <th className="text-end">Hành động</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {adminDepartments.map((d) => (
                    <tr key={d._id}>
                      <td className="fw-semibold text-dark">{d.name}</td>
                      <td className="text-muted text-truncate" style={{ maxWidth: '320px' }} title={d.description}>
                        {d.description || <span className="text-secondary opacity-75 fst-italic">Chưa có mô tả</span>}
                      </td>
                      <td>
                        <span className="fw-medium text-dark">{d.majorCount || 0}</span> chuyên ngành
                      </td>
                      <td>
                        {d.isActive ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle fw-medium">Hiển thị</span>
                        ) : (
                          <span className="badge bg-light text-muted border fw-normal">Đã ẩn</span>
                        )}
                      </td>
                      <td className="text-end">
                        <Button
                          variant="light"
                          size="sm"
                          className="border text-secondary shadow-sm d-inline-flex align-items-center gap-1"
                          onClick={() => toggleDeptMutation.mutate(d._id)}
                          disabled={toggleDeptMutation.isLoading}
                        >
                          {d.isActive ? (
                            <>
                              <EyeOff size={14} /> Ẩn đi
                            </>
                          ) : (
                            <>
                              <Eye size={14} /> Hiện lại
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* NỘI DUNG 2: QUẢN LÝ CHUYÊN NGÀNH */}
      {activeSubTab === 'majors' && (
        <div className="bg-white p-3 rounded-3 border shadow-sm">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="small text-muted text-nowrap">Lọc theo ngành học:</span>
            <Form.Select
              size="sm"
              style={{ maxWidth: '280px' }}
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="rounded-pill text-secondary"
            >
              <option value="">Tất cả ngành học</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </Form.Select>
          </div>

          {isMajorsLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="secondary" size="sm" />
              <div className="text-muted small mt-2">Đang tải danh sách chuyên ngành...</div>
            </div>
          ) : majors.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <GraduationCap size={36} className="opacity-50 mb-2" />
              <div className="fw-medium">Chưa có chuyên ngành nào trong ngành này</div>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover align="middle" className="mb-0 text-nowrap">
                <thead className="table-light small text-secondary">
                  <tr>
                    <th>Tên chuyên ngành</th>
                    <th>Ngành học</th>
                    <th>Trạng thái</th>
                    <th className="text-end">Hành động</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {majors.map((m) => (
                    <tr key={m._id}>
                      <td className="fw-semibold text-dark">{m.name}</td>
                      <td className="text-muted">{m.departmentId?.name || 'Không rõ'}</td>
                      <td>
                        {m.isActive ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle fw-medium">Hiển thị</span>
                        ) : (
                          <span className="badge bg-light text-muted border fw-normal">Đã ẩn</span>
                        )}
                      </td>
                      <td className="text-end">
                        <Button
                          variant="light"
                          size="sm"
                          className="border text-secondary shadow-sm d-inline-flex align-items-center gap-1"
                          onClick={() => toggleMajorMutation.mutate(m._id)}
                          disabled={toggleMajorMutation.isLoading}
                        >
                          {m.isActive ? (
                            <>
                              <EyeOff size={14} /> Ẩn đi
                            </>
                          ) : (
                            <>
                              <Eye size={14} /> Hiện lại
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* NỘI DUNG 3: QUẢN LÝ KỸ NĂNG */}
      {activeSubTab === 'skills' && (
        <div className="bg-white p-3 rounded-3 border shadow-sm">
          <div className="position-relative mb-3" style={{ maxWidth: '350px' }}>
            <Search size={16} className="position-absolute text-muted" style={{ top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
            <Form.Control
              size="sm"
              type="text"
              className="ps-5 rounded-pill bg-light border"
              placeholder="Tìm kiếm kỹ năng..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
            />
          </div>

          {isSkillsLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="secondary" size="sm" />
              <div className="text-muted small mt-2">Đang tải từ điển kỹ năng...</div>
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Tag size={36} className="opacity-50 mb-2" />
              <div className="fw-medium">Không tìm thấy kỹ năng nào</div>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover align="middle" className="mb-0 text-nowrap">
                <thead className="table-light small text-secondary">
                  <tr>
                    <th>Tên kỹ năng</th>
                    <th>Lượt sử dụng</th>
                    <th>Phê duyệt</th>
                    <th className="text-end">Hành động</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {skills.map((s) => (
                    <tr key={s._id}>
                      <td className="fw-semibold text-dark">{s.name}</td>
                      <td>
                        <span className="fw-medium text-dark">{s.usageCount || 1}</span> lần
                      </td>
                      <td>
                        {s.isApproved ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle fw-medium">Đã duyệt</span>
                        ) : (
                          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-medium">Chờ duyệt</span>
                        )}
                      </td>
                      <td className="text-end">
                        {!s.isApproved && (
                          <Button
                            variant="light"
                            size="sm"
                            className="border text-primary fw-medium shadow-sm d-inline-flex align-items-center gap-1"
                            onClick={() => approveSkillMutation.mutate(s._id)}
                            disabled={approveSkillMutation.isLoading}
                          >
                            <Check size={14} /> Duyệt kỹ năng
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Modal tạo ngành học */}
      <CreateDepartmentModal
        show={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries(['adminDepartments']);
          queryClient.invalidateQueries(['departments']);
        }}
      />

      {/* Modal tạo chuyên ngành */}
      <CreateMajorModal
        show={showMajorModal}
        initialDeptId={selectedDeptId}
        onClose={() => setShowMajorModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries(['adminMajors']);
          queryClient.invalidateQueries(['adminDepartments']);
        }}
      />

      {/* Modal tạo kỹ năng */}
      <CreateSkillModal
        show={showSkillModal}
        onClose={() => setShowSkillModal(false)}
        onSuccess={() => queryClient.invalidateQueries(['adminSkills'])}
      />
    </div>
  );
}
