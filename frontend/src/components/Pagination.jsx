import React from 'react';
import { Pagination as BsPagination } from 'react-bootstrap';

/**
 * Component phân trang tái sử dụng (Server-side & Client-side)
 * @param {number} currentPage Trang hiện tại (1-indexed)
 * @param {number} totalPages Tổng số trang
 * @param {function} onPageChange Callback khi chuyển trang (page) => void
 * @param {boolean} disabled Trạng thái vô hiệu hóa (khi đang tải)
 * @param {string} className Class tùy biến thêm
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  disabled = false,
  className = ''
}) {
  if (totalPages <= 1) return null;

  // Tính toán khoảng các trang hiển thị (tối đa 5 trang xung quanh current)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`d-flex justify-content-center align-items-center ${className}`}>
      <BsPagination className="mb-0 shadow-sm">
        <BsPagination.Prev
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || disabled}
        >
          Trước
        </BsPagination.Prev>

        {pages[0] > 1 && (
          <>
            <BsPagination.Item onClick={() => onPageChange(1)} disabled={disabled}>
              1
            </BsPagination.Item>
            {pages[0] > 2 && <BsPagination.Ellipsis disabled />}
          </>
        )}

        {pages.map((p) => (
          <BsPagination.Item
            key={p}
            active={p === currentPage}
            onClick={() => onPageChange(p)}
            disabled={disabled}
          >
            {p}
          </BsPagination.Item>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <BsPagination.Ellipsis disabled />}
            <BsPagination.Item onClick={() => onPageChange(totalPages)} disabled={disabled}>
              {totalPages}
            </BsPagination.Item>
          </>
        )}

        <BsPagination.Next
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || disabled}
        >
          Sau
        </BsPagination.Next>
      </BsPagination>
    </div>
  );
}
