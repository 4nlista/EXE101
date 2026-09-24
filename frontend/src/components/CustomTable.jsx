import React from 'react';
import { Table } from 'react-bootstrap';

export default function CustomTable({ headers, children, className = '' }) {
  return (
    <div className={`table-responsive border bg-white ${className}`}>
      <Table hover className="align-middle mb-0" style={{ fontSize: '0.875rem' }}>
        <thead style={{ backgroundColor: '#f8f9fa' }}>
          <tr>
            {headers.map((header, idx) => (
              <th 
                key={idx} 
                className={`py-2 px-3 text-muted fw-semibold border-bottom border-light ${header.className || ''}`}
                style={{ 
                  backgroundColor: 'transparent', 
                  whiteSpace: 'nowrap', 
                  fontSize: '0.85rem',
                  ...header.style 
                }}
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
