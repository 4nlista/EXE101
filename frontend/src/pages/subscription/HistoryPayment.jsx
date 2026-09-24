import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Row, Col, Spinner } from 'react-bootstrap';
import { AlertCircle, ReceiptText, CheckCircle2, ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import StatusBadge from '../../components/StatusBadge';
import CustomTable from '../../components/CustomTable';
import Button from '../../components/Button';

export default function HistoryPayment() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [packageFilter, setPackageFilter] = useState('');

  const getStatusText = (status) => {
    switch (status) {
      case 'SUCCESS': return 'Thành công';
      case 'FAILED': return 'Thất bại';
      case 'PENDING': return 'Đang xử lý';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getMyTransactions(fromDate, toDate);
      if (res.success) {
        setTransactions(res.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử giao dịch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fromDate, toDate]); // Auto fetch when date changes

  const getPackageName = (description) => {
    if (!description) return 'Gói dịch vụ';
    const descLower = description.toLowerCase();
    if (descLower.includes('vip')) return 'Gói VIP';
    if (descLower.includes('premium')) return 'Gói PREMIUM';
    return description;
  };

  const filteredTransactions = transactions.filter(tx => {
    let match = true;
    if (packageFilter) {
      const pkgName = getPackageName(tx.description);
      if (pkgName !== packageFilter) match = false;
    }
    return match;
  });

  const handleExport = () => {
    toast.info("Tính năng Export đang được phát triển.");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${month}/${yyyy} - ${hh}:${mm}:${ss}`;
  };

  return (
    <Container className="py-4" style={{ maxWidth: '1200px' }}>
      <Button variant="light" className="mb-4 d-flex align-items-center gap-2 rounded-pill px-3 py-2 shadow-sm border" onClick={() => navigate('/feed')}>
        <ArrowLeft size={16} /> Quay lại
      </Button>

      <div className="d-flex align-items-center mb-4">
        <ReceiptText size={28} className="me-2 text-primary" />
        <h2 className="fw-bold mb-0 text-dark">Lịch sử thanh toán</h2>
      </div>

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">

          {/* Thanh Filter */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
            {/* Box bên trái: Các bộ lọc & Nút Export */}
            <div className="d-flex align-items-center gap-3">
              <Form.Select
                className="shadow-none border"
                style={{ width: '160px' }}
                value={packageFilter}
                onChange={(e) => setPackageFilter(e.target.value)}
              >
                <option value="">Gói dịch vụ</option>
                <option value="Gói VIP">Gói VIP</option>
                <option value="Gói PREMIUM">Gói PREMIUM</option>
              </Form.Select>

              <Button variant="secondary" className="d-flex align-items-center border-2" onClick={handleExport}>
                <Download size={16} /> Export
              </Button>
            </div>

            {/* Box bên phải: Date Range */}
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small text-nowrap fw-medium">Từ ngày</span>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="shadow-none border"
                />
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small text-nowrap fw-medium">Đến ngày</span>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate}
                  className="shadow-none border"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <CustomTable
              headers={[
                { label: <span>Mã Giao Dịch <span className="text-danger">*</span></span>, style: { width: '30%' } },
                { label: <span>Dịch vụ <span className="text-danger">*</span></span>, style: { width: '15%' } },
                { label: <span>Thời gian <span className="text-danger">*</span></span>, style: { width: '25%' } },
                { label: <span>Số tiền <span className="text-danger">*</span></span>, style: { width: '15%' } },
                { label: <span>Trạng thái <span className="text-danger">*</span></span>, className: 'text-center', style: { width: '15%' } }
              ]}
            >
              {filteredTransactions.map((tx) => (
                <tr key={tx._id} className="border-bottom border-light">
                  <td className="py-2 px-3">
                    <span className="text-primary fw-medium font-monospace" style={{ fontSize: '0.85rem' }}>
                      {tx.sepayTransactionId || tx._id.toString().slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="fw-semibold text-dark">{getPackageName(tx.description)}</span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                      {formatDate(tx.createdAt)}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <span className="fw-semibold text-danger">
                      {tx.amount.toLocaleString('vi-VN')}đ
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <StatusBadge
                      variant={tx.status?.toUpperCase() === 'SUCCESS' ? 'success' : tx.status?.toUpperCase() === 'FAILED' ? 'danger' : 'warning'}
                      icon={tx.status?.toUpperCase() === 'SUCCESS' ? CheckCircle2 : AlertCircle}
                      text={getStatusText(tx.status?.toUpperCase())}
                    />
                  </td>
                </tr>
              ))}
            </CustomTable>
          ) : (
            <div className="text-center py-5 bg-light rounded-3">
              <AlertCircle size={48} className="text-muted mb-3 opacity-50" />
              <h5 className="text-muted fw-bold">Không tìm thấy giao dịch nào</h5>
              <p className="text-muted mb-0 small">Thử thay đổi khoảng thời gian lọc hoặc thực hiện thanh toán mới.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
