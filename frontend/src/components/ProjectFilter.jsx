import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useDepartments } from '../hooks/useMasterData';
import Button from './Button';
import { Heart } from 'lucide-react';

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

  const selectedDeptIds = Array.isArray(localFilters.departmentIds)
    ? localFilters.departmentIds
    : (localFilters.departmentId ? [localFilters.departmentId] : []);

  const handleDeptToggle = (deptId) => {
    setLocalFilters(prev => {
      const current = Array.isArray(prev.departmentIds)
        ? [...prev.departmentIds]
        : (prev.departmentId ? [prev.departmentId] : []);
      const next = current.includes(deptId)
        ? current.filter(id => id !== deptId)
        : [...current, deptId];
      return {
        ...prev,
        departmentIds: next,
        departmentId: ''
      };
    });
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
    <div className="bg-white p-4 rounded shadow-sm border border-secondary-subtle">
      <h6 className="mb-4 fw-bold text-secondary text-uppercase">Bộ lọc</h6>

      <Form>
        {/* Bộ lọc dự án yêu thích */}
        <Form.Group className="mb-4 p-2 rounded bg-light border">
          <Form.Check
            type="switch"
            id="onlyLikedSwitch"
            label={
              <span className="fw-semibold text-dark d-inline-flex align-items-center gap-1">
                Đã thả tim <Heart size={14} fill="#dc3545" className="text-danger" />
              </span>
            }
            checked={Boolean(localFilters.onlyLiked)}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, onlyLiked: e.target.checked }))}
            className="fw-medium"
          />
        </Form.Group>

        {/* Bộ lọc nhiều ngành học (Many-to-Many) */}
        <Form.Group className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <Form.Label className="fw-bold mb-0">Ngành học</Form.Label>
            {selectedDeptIds.length > 0 && (
              <span
                role="button"
                className="text-primary small"
                style={{ cursor: 'pointer', fontSize: '0.75rem' }}
                onClick={() => setLocalFilters(prev => ({ ...prev, departmentIds: [], departmentId: '' }))}
              >
                Bỏ chọn ({selectedDeptIds.length})
              </span>
            )}
          </div>
          <div
            className="p-2 border rounded bg-light"
            style={{ maxHeight: '160px', overflowY: 'auto' }}
          >
            {isDeptLoading ? (
              <div className="text-muted small py-2 text-center">Đang tải ngành...</div>
            ) : departments.length === 0 ? (
              <div className="text-muted small py-2 text-center">Không có dữ liệu ngành</div>
            ) : (
              departments.map(dep => {
                const isChecked = selectedDeptIds.includes(dep._id);
                return (
                  <Form.Check
                    key={dep._id}
                    type="checkbox"
                    id={`filter-dept-${dep._id}`}
                    label={<span className="small text-dark">{dep.name}</span>}
                    checked={isChecked}
                    onChange={() => handleDeptToggle(dep._id)}
                    className="mb-1"
                  />
                );
              })
            )}
          </div>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Mục tiêu điểm<span className="text-danger ms-1">*</span></Form.Label>
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
          <Form.Label className="fw-bold">Hạn chót<span className="text-danger ms-1">*</span></Form.Label>
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
          <Button variant="secondary" onClick={handleReset} className="flex-fill text-white border-0" style={{ backgroundColor: '#484a4dff' }}>Xóa</Button>
          <Button variant="primary" onClick={handleApply} className="flex-fill" style={{ backgroundColor: '#cb3b14ff', borderColor: '#e0e0e0ff' }}>Lọc</Button>
        </div>
      </Form>
    </div>
  );
}
