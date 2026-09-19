import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { masterDataService } from '../services/masterDataService';
import Button from './Button';

export default function ProjectFilter({ filters, setFilters }) {
  // Lấy danh sách ngành (Department)
  const { data: deptRes, isLoading: isDeptLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: masterDataService.getDepartments
  });

  const departments = deptRes?.data || [];

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

  const handleApply = () => {
    setFilters({ ...localFilters, page: 1 });
  };

  const handleReset = () => {
    const resetState = {
      ...filters,
      search: '',
      departmentId: '',
      status: '',
      minGrade: '',
      maxGrade: '',
      deadline: '',
      page: 1
    };
    setLocalFilters(resetState);
    setFilters(resetState);
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm border border-secondary-subtle">
      <h6 className="mb-4 fw-bold text-secondary text-uppercase">Bộ lọc</h6>

      <Form>
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Ngành học<span className="text-danger ms-1">*</span></Form.Label>
          <Form.Select
            name="departmentId"
            value={localFilters.departmentId}
            onChange={handleFilterChange}
            disabled={isDeptLoading}
            className="text-secondary"
          >
            <option value="">Tất cả ngành học</option>
            {departments.map(dep => (
              <option key={dep._id} value={dep._id}>{dep.name}</option>
            ))}
          </Form.Select>
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
