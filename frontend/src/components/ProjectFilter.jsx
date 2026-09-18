import React from 'react';
import { Form } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { masterDataService } from '../../services/masterDataService';

export default function ProjectFilter({ filters, setFilters }) {
  // Lấy danh sách ngành (Department)
  const { data: deptRes, isLoading: isDeptLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: masterDataService.getDepartments
  });

  const departments = deptRes?.data || [];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset về trang 1 mỗi khi đổi filter
    }));
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm border">
      <h5 className="mb-4 fw-bold">Bộ lọc tìm kiếm</h5>
      
      <Form>
        <Form.Group className="mb-3">
          <Form.Label className="text-muted small fw-bold text-uppercase">Từ khóa</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Tìm theo tên dự án..."
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="text-muted small fw-bold text-uppercase">Ngành học</Form.Label>
          <Form.Select 
            name="departmentId"
            value={filters.departmentId}
            onChange={handleFilterChange}
            disabled={isDeptLoading}
          >
            <option value="">Tất cả ngành học</option>
            {departments.map(dep => (
              <option key={dep._id} value={dep._id}>{dep.name}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="text-muted small fw-bold text-uppercase">Trạng thái</Form.Label>
          <Form.Select 
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="open">Đang tuyển</option>
            <option value="closed">Đã đóng</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="text-muted small fw-bold text-uppercase">Mục tiêu điểm số</Form.Label>
          <Form.Select 
            name="gradeTarget"
            value={filters.gradeTarget}
            onChange={handleFilterChange}
          >
            <option value="">Mọi mức điểm</option>
            <option value="9.0">Từ 9.0 trở xuống</option>
            <option value="8.0">Từ 8.0 trở xuống</option>
            <option value="7.0">Từ 7.0 trở xuống</option>
            <option value="6.0">Từ 6.0 trở xuống</option>
          </Form.Select>
        </Form.Group>
      </Form>
    </div>
  );
}
