import React from 'react';
import { Table } from 'react-bootstrap';

// Bảng dữ liệu dùng chung — header uppercase nhỏ, hover nhẹ, khung bo góc lg
export default function CustomTable({ headers, children, className = '' }) {
  return (
    <div className={`table-responsive data-table ${className}`}>
      <Table hover className="align-middle mb-0">
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                className={header.className || ''}
                style={header.style}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="border-top-0">
          {children}
        </tbody>
      </Table>
    </div>
  );
}
