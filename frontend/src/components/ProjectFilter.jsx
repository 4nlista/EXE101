import React, { useState, useEffect } from 'react';
import { Form, Badge } from 'react-bootstrap';
import { useDepartments } from '../hooks/useMasterData';
import Button from './Button';
import { Heart, X } from 'lucide-react';

export default function ProjectFilter({ filters, setFilters }) {
  // Lấy danh sách ngành (Department)
  const { data: rawDepartments, isLoading: isDeptLoading } = useDepartments();
  const departments = Array.isArray(rawDepartments) ? rawDepartments : (rawDepartments?.data || []);

  // State local để giữ giá trị tạm trước khi bấm Lọc
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync lại localFilters nếu filters gốc thay đổi từ bên ngoài (ví dụ đổi trang)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Danh sách ID các ngành đang chọn
  const selectedDeptIds = Array.isArray(localFilters.departmentIds)
    ? localFilters.departmentIds
    : (localFilters.departmentId ? [localFilters.departmentId] : []);

  // Khi chọn một ngành từ dropdown -> thêm vào mảng ngành đang lọc
  const handleSelectDepartment = (e) => {
    const deptId = e.target.value;
    if (!deptId) return;
    if (!selectedDeptIds.includes(deptId)) {
      setLocalFilters(prev => ({
        ...prev,
        departmentIds: [...selectedDeptIds, deptId],
        departmentId: ''
      }));
    }
  };

  // Xóa một ngành khỏi danh sách đang lọc
  const handleRemoveDepartment = (deptId) => {
    setLocalFilters(prev => ({
      ...prev,
      departmentIds: selectedDeptIds.filter(id => id !== deptId),
      departmentId: ''
    }));
  };

  const handleApply = () => {
    setFilters({ ...localFilters, page: 1 });
  };

  const handleReset = () => {
    const resetState = {
      ...filters,
      search: '',
      departmentId: '',
      departmentIds: [],
      status: '',
      minGrade: '',
      maxGrade: '',
      deadline: '',
      onlyLiked: false,
      page: 1
    };
    setLocalFilters(resetState);
    setFilters(resetState);
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel__title">Bộ lọc</div>

      <Form>
        {/* Bộ lọc dự án yêu thích */}
        <Form.Group className="mb-4 p-2 rounded bg-light border">
          <Form.Check
            type="switch"
            id="onlyLikedSwitch"
            label={
              <span className="fw-medium text-dark d-inline-flex align-items-center gap-1" style={{ fontSize: 'var(--text-sm)' }}>
                Đã thả tim <Heart size={14} fill="#dc3545" className="text-danger" />
              </span>
            }
            checked={Boolean(localFilters.onlyLiked)}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, onlyLiked: e.target.checked }))}
            className="fw-medium"
          />
        </Form.Group>

        {/* Ngành học (Chọn qua select và gom vào danh sách tags) */}
        <Form.Group className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <Form.Label className="fw-medium mb-0">Ngành học</Form.Label>
            {selectedDeptIds.length > 0 && (
              <span
                role="button"
                className="text-muted small"
                style={{ cursor: 'pointer', fontSize: '0.75rem' }}
                onClick={() => setLocalFilters(prev => ({ ...prev, departmentIds: [], departmentId: '' }))}
              >
                Xóa hết ({selectedDeptIds.length})
              </span>
            )}
          </div>

          <Form.Select
            value=""
            onChange={handleSelectDepartment}
            disabled={isDeptLoading}
            className="text-secondary mb-2"
          >
            <option value="">-- Chọn ngành cần lọc --</option>
            {departments.map(dep => {
              const isSelected = selectedDeptIds.includes(dep._id);
              return (
                <option key={dep._id} value={dep._id} disabled={isSelected}>
                  {isSelected ? `✓ ${dep.name}` : dep.name}
                </option>
              );
            })}
          </Form.Select>

          {/* Các ngành đã chọn hiển thị dưới dạng tag badge */}
          {selectedDeptIds.length > 0 ? (
            <div className="d-flex flex-wrap gap-1">
              {selectedDeptIds.map(id => {
                const dep = departments.find(d => d._id === id);
                const deptName = dep ? dep.name : id;
                return (
                  <Badge
                    key={id}
                    bg="light"
                    text="dark"
                    className="border d-inline-flex align-items-center gap-1 py-1 px-2 fw-normal"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <span>{deptName}</span>
                    <X
                      size={12}
                      role="button"
                      className="text-danger ms-1"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleRemoveDepartment(id)}
                    />
                  </Badge>
                );
              })}
            </div>
          ) : (
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
              Mặc định: Tất cả ngành học
            </div>
          )}
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="fw-medium mb-1">Mục tiêu điểm<span className="text-danger ms-1">*</span></Form.Label>
          <div className="d-flex align-items-center">
            <Form.Control
              type="number"
              placeholder="Min"
              name="minGrade"
              value={localFilters.minGrade || ''}
              onChange={handleFilterChange}
              step="0.5"
              min="0"
              max="10"
            />
            <span className="mx-2 text-muted">-</span>
            <Form.Control
              type="number"
              placeholder="Max"
              name="maxGrade"
              value={localFilters.maxGrade || ''}
              onChange={handleFilterChange}
              step="0.5"
              min="0"
              max="10"
            />
          </div>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="fw-medium mb-1">Hạn chót<span className="text-danger ms-1">*</span></Form.Label>
          <Form.Select
            name="deadline"
            value={localFilters.deadline || ''}
            onChange={handleFilterChange}
            className="text-secondary"
          >
            <option value="">Bất cứ lúc nào</option>
            <option value="3">Trong 3 ngày tới</option>
            <option value="7">Trong 7 ngày tới</option>
            <option value="14">Trong 14 ngày tới</option>
          </Form.Select>
        </Form.Group>

        <div className="d-flex gap-2 mt-4">
          <Button variant="secondary" onClick={handleReset} className="flex-fill">Xóa</Button>
          <Button variant="primary" onClick={handleApply} className="flex-fill">Lọc</Button>
        </div>
      </Form>
    </div>
  );
}
