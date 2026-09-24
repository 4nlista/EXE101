import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Form, Row, Col, Spinner } from 'react-bootstrap';
import { Search, AlertCircle, ReceiptText } from 'lucide-react';
import moment from 'moment';
import api from '../../services/api';

export default function HistoryPayment() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let url = '/payment/my-transactions';
      const params = new URLSearchParams();
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        setTransactions(res.data.data);
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

  return (
    <Container className="py-5" style={{ maxWidth: '1000px' }}>
      <div className="d-flex align-items-center mb-4">
        <ReceiptText size={28} className="me-2 text-primary" />
        <h2 className="fw-bold mb-0 text-dark">Lịch sử thanh toán</h2>
      </div>

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <Row className="mb-4 align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold text-muted small">Từ ngày</Form.Label>
                <Form.Control 
                  type="date" 
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold text-muted small">Đến ngày</Form.Label>
                <Form.Control 
                  type="date" 
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate}
                />
              </Form.Group>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : transactions.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0 text-muted rounded-start" style={{ width: '25%' }}>Mã Giao Dịch</th>
                    <th className="border-0 text-muted" style={{ width: '25%' }}>Dịch vụ</th>
                    <th className="border-0 text-muted" style={{ width: '20%' }}>Thời gian</th>
                    <th className="border-0 text-muted" style={{ width: '15%' }}>Số tiền</th>
                    <th className="border-0 text-muted rounded-end text-center" style={{ width: '15%' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: 'none' }}>
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td>
                        <span className="text-primary fw-medium font-monospace" style={{ fontSize: '0.9rem' }}>
                          {tx.sepayTransactionId || tx._id.toString().slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold text-dark">{getPackageName(tx.description)}</span>
                      </td>
                      <td>
                        <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                          {moment(tx.createdAt).format('HH:mm - DD/MM/YYYY')}
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold text-danger">
                          {tx.amount.toLocaleString('vi-VN')}đ
                        </span>
                      </td>
                      <td className="text-center">
                        <Badge bg="success" className="px-3 py-2 rounded-pill fw-medium">
                          Thành công
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
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
