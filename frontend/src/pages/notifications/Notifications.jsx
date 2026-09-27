import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button as BsButton, Pagination } from 'react-bootstrap';
import { Bell, Check, CheckCircle2, User, FileText, Zap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import { NOTIFICATION_TYPE } from '../../constants/notificationEnum';
import { useSocket } from '../../contexts/SocketContext';
import { toast } from 'react-toastify';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "vừa xong";
  let interval = seconds / 31536000;
  if (interval >= 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval >= 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval >= 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval >= 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  return Math.floor(interval) + " phút trước";
};

export default function Notifications() {
  const navigate = useNavigate();
  const { setUnreadNotificationCount } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const LIMIT = 10;

  const fetchNotifications = async (filter, pageNum) => {
    try {
      setLoading(true);
      const skip = (pageNum - 1) * LIMIT;
      const res = await notificationService.getNotifications({ limit: LIMIT, skip, filter });
      if (res.success) {
        setNotifications(res.data.notifications);
        setTotalPages(Math.ceil(res.data.total / LIMIT));
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchNotifications(activeTab, 1);
  }, [activeTab]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchNotifications(activeTab, newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationService.markAllAsRead();
      if (res.success) {
        setUnreadNotificationCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đánh dấu đã đọc');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif._id);
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      } catch (error) {
        console.error(error);
        toast.error('Lỗi khi cập nhật trạng thái thông báo.');
      }
    }

    if (notif.type === NOTIFICATION_TYPE.SUBSCRIPTION) {
      if (notif.content?.toLowerCase().includes('thanh toán')) navigate('/transactions');
      else navigate('/subscription');
    } else if (notif.type === NOTIFICATION_TYPE.APPLICATION) {
      // Có người đăng ký vào dự án của mình
      if (notif.referenceId) navigate(`/manage/${notif.referenceId}`);
    } else if (notif.type === NOTIFICATION_TYPE.APPROVED) {
      // Đơn được duyệt
      navigate('/manage');
    } else if (notif.type === NOTIFICATION_TYPE.INVITATION) {
      // Được mời -> Xem chi tiết dự án. (Nếu dự án kết thúc, trang project detail sẽ chịu trách nhiệm báo lỗi).
      if (notif.referenceId) navigate(`/project/${notif.referenceId}`);
    }
    // Các loại khác (REJECTED, MEMBER_KICKED...): Chỉ click đọc, không điều hướng.
  };

  const getIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPE.SUBSCRIPTION:
        return <div className="d-flex align-items-center justify-content-center bg-warning bg-opacity-25 rounded-2" style={{ width: '100%', height: '100%' }}><Zap size={20} className="text-warning" /></div>;
      case NOTIFICATION_TYPE.APPLICATION:
      case NOTIFICATION_TYPE.INVITATION:
      case NOTIFICATION_TYPE.INVITATION_ACCEPTED:
        return <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-2" style={{ width: '100%', height: '100%' }}><User size={20} className="text-primary" /></div>;
      case NOTIFICATION_TYPE.APPROVED:
        return <div className="d-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-2" style={{ width: '100%', height: '100%' }}><CheckCircle2 size={20} className="text-success" /></div>;
      case NOTIFICATION_TYPE.REJECTED:
      case NOTIFICATION_TYPE.MEMBER_KICKED:
        return <div className="d-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-2" style={{ width: '100%', height: '100%' }}><FileText size={20} className="text-danger" /></div>;
      default:
        return <div className="d-flex align-items-center justify-content-center bg-secondary bg-opacity-10 rounded-2" style={{ width: '100%', height: '100%' }}><Bell size={20} className="text-secondary" /></div>;
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <BsButton 
            variant="light" 
            className="rounded-circle p-2 d-flex align-items-center justify-content-center bg-white shadow-sm border"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={22} className="text-dark" />
          </BsButton>
          <h2 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <Bell size={28} className="text-primary" />
            Thông báo
          </h2>
        </div>
        <BsButton variant="light" onClick={handleMarkAllRead} className="d-flex align-items-center gap-2 text-primary shadow-sm border-0 fw-medium">
          <Check size={18} /> Đánh dấu tất cả đã đọc
        </BsButton>
      </div>

      <Card className="shadow-sm rounded-2 overflow-hidden border">
        <div className="d-flex px-4 pt-3 pb-2 border-bottom bg-white gap-3">
          <button
            className={`btn rounded-2 px-4 py-2 ${activeTab === 'ALL' ? 'btn-primary shadow-sm' : 'btn-light text-dark fw-medium border'}`}
            onClick={() => setActiveTab('ALL')}
          >
            Tất cả
          </button>
          <button
            className={`btn rounded-2 px-4 py-2 ${activeTab === 'UNREAD' ? 'btn-primary shadow-sm' : 'btn-light text-dark fw-medium border'}`}
            onClick={() => setActiveTab('UNREAD')}
          >
            Chưa đọc
          </button>
        </div>

        <Card.Body className="p-0">
          {loading && page === 1 ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Đang tải thông báo...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div className="mb-3">
                <Bell size={48} className="text-light" style={{ opacity: 0.5 }} />
              </div>
              <h5>Bạn không có thông báo nào</h5>
              <p>Khi có sự kiện mới, thông báo sẽ hiển thị ở đây.</p>
            </div>
          ) : (
            <>
              <div className="list-group list-group-flush">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className="list-group-item list-group-item-action d-flex p-3 border-bottom position-relative align-items-center transition-all"
                    style={{
                      cursor: 'pointer',
                      backgroundColor: notif.isRead ? '#fff' : '#f8f9fa',
                      borderLeft: notif.isRead ? '4px solid transparent' : '4px solid var(--bs-primary)'
                    }}
                    onClick={() => handleNotificationClick(notif)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = notif.isRead ? '#f8f9fa' : '#eaf2fa';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                      e.currentTarget.style.zIndex = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = notif.isRead ? '#fff' : '#f8f9fa';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.zIndex = '0';
                    }}
                  >
                    <div className="flex-shrink-0 me-3" style={{ width: '48px', height: '48px' }}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-grow-1 pe-4">
                      <h6 className="fw-semibold mb-1 text-dark" style={{ fontSize: '1rem' }}>{notif.title}</h6>
                      <p className="mb-1 text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                        {notif.content}
                      </p>
                      <small className="text-primary fw-medium" style={{ fontSize: '0.75rem' }}>
                        {timeAgo(notif.createdAt)}
                      </small>
                    </div>
                    {!notif.isRead && (
                      <div className="rounded-circle bg-primary position-absolute" style={{ width: '12px', height: '12px', right: '24px', top: '50%', transform: 'translateY(-50%)' }}></div>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center p-3 bg-light border-top">
                  <Pagination className="mb-0">
                    <Pagination.Prev 
                      onClick={() => handlePageChange(page - 1)} 
                      disabled={page === 1 || loading} 
                    />
                    {[...Array(totalPages)].map((_, idx) => (
                      <Pagination.Item 
                        key={idx + 1} 
                        active={page === idx + 1}
                        onClick={() => handlePageChange(idx + 1)}
                        disabled={loading}
                      >
                        {idx + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next 
                      onClick={() => handlePageChange(page + 1)} 
                      disabled={page === totalPages || loading} 
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
