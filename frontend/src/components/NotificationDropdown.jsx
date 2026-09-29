import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Spinner } from 'react-bootstrap';
import { Bell, Check, CheckCircle2, User, FileText, Gift, Zap } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import notificationService from '../services/notificationService';
import { NOTIFICATION_TYPE } from '../constants/notificationEnum';
import { toast } from 'react-toastify';
import { getProjectDetail } from '../services/projectService';

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

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const { socket, unreadNotificationCount, setUnreadNotificationCount } = useSocket();
  const [show, setShow] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' or 'UNREAD'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Load notifications
  const fetchNotifications = async (filter) => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications({ limit: 10, skip: 0, filter });
      if (res.success) {
        setNotifications(res.data.notifications);
      }
    } catch (error) {
      console.error('Lỗi tải thông báo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchNotifications(activeTab);
    }
  }, [show, activeTab]);

  // Lắng nghe real-time notification
  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (newNotif) => {
      // Nếu đang mở dropdown, thêm vào đầu mảng (nếu thỏa mãn tab)
      if (show) {
        if (activeTab === 'ALL' || (activeTab === 'UNREAD' && !newNotif.isRead)) {
          setNotifications(prev => [newNotif, ...prev]);
        }
      }
    };
    socket.on('new_notification', handleNewNotification);
    return () => socket.off('new_notification', handleNewNotification);
  }, [socket, show, activeTab]);

  // Click ra ngoài thì đóng
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
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
    setShow(false); // Close dropdown
    
    // Mark as read if unread
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

    // Redirect
    if (notif.type === NOTIFICATION_TYPE.SUBSCRIPTION) {
      if (notif.content?.toLowerCase().includes('thanh toán')) navigate('/transactions');
      else navigate('/subscription');
    } else if (notif.type === NOTIFICATION_TYPE.APPLICATION || notif.type === NOTIFICATION_TYPE.INVITATION_ACCEPTED) {
      // Có người đăng ký vào dự án hoặc chấp nhận lời mời -> Vào thẳng trang quản lý dự án đó
      if (notif.referenceId) navigate(`/manage/${notif.referenceId}`);
    } else if (notif.type === NOTIFICATION_TYPE.APPROVED) {
      // Đơn được duyệt
      navigate('/manage');
    } else if (
      notif.type === NOTIFICATION_TYPE.INVITATION ||
      notif.type === NOTIFICATION_TYPE.REJECTED ||
      notif.type === NOTIFICATION_TYPE.MEMBER_KICKED
    ) {
      // Đối với Lời mời, Từ chối, Bị kick -> Kiểm tra và mở popup chi tiết dự án
      if (notif.referenceId) {
        try {
          const res = await getProjectDetail(notif.referenceId);
          const project = res.data;
          if (!project) {
            toast.error('Dự án này không còn tồn tại!');
            return;
          }
          // Nếu là INVITATION và dự án đã đóng, báo lỗi (còn Bị từ chối thì cứ cho xem luyến tiếc)
          if (notif.type === NOTIFICATION_TYPE.INVITATION && (project.status === 'CLOSED' || project.status === 'COMPLETED')) {
            toast.error('Dự án này đã đủ người hoặc đã kết thúc!');
            return;
          }
          navigate('/feed', { state: { openProjectId: notif.referenceId } });
        } catch (error) {
          toast.error('Dự án này không còn tồn tại hoặc đã bị xóa!');
        }
      }
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case NOTIFICATION_TYPE.SUBSCRIPTION: return <CrownIcon />;
      case NOTIFICATION_TYPE.APPLICATION:
      case NOTIFICATION_TYPE.INVITATION:
      case NOTIFICATION_TYPE.INVITATION_ACCEPTED: return <User size={20} className="text-primary" />;
      case NOTIFICATION_TYPE.APPROVED: return <CheckCircle2 size={20} className="text-success" />;
      case NOTIFICATION_TYPE.REJECTED:
      case NOTIFICATION_TYPE.MEMBER_KICKED: return <FileText size={20} className="text-danger" />;
      default: return <Bell size={20} className="text-secondary" />;
    }
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button className="nav-icon-btn border-0 bg-transparent" onClick={() => setShow(!show)}>
        <Bell size={20} />
        {unreadNotificationCount > 0 && (
          <Badge
            pill
            bg="danger"
            className="position-absolute"
            style={{ top: '0', right: '0', fontSize: '0.65rem', padding: '0.25em 0.4em' }}
          >
            {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
          </Badge>
        )}
      </button>

      {show && (
        <div 
          className="position-absolute bg-white shadow-sm rounded-2 border"
          style={{
            top: '45px', right: '-60px', width: '360px', zIndex: 1050,
            maxHeight: '500px', display: 'flex', flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Thông báo</h5>
            {unreadNotificationCount > 0 && (
              <button 
                className="btn btn-link p-0 text-decoration-none text-muted d-flex align-items-center gap-1"
                style={{ fontSize: '0.85rem' }}
                onClick={handleMarkAllRead}
              >
                <Check size={16} /> Đánh dấu đã xem
              </button>
            )}
          </div>

          <div className="d-flex px-3 pt-2 gap-2 pb-2 border-bottom">
            <button 
              className={`btn btn-sm rounded-2 px-3 ${activeTab === 'ALL' ? 'btn-primary shadow-sm' : 'btn-light text-dark fw-medium border'}`}
              onClick={() => setActiveTab('ALL')}
            >
              Tất cả
            </button>
            <button 
              className={`btn btn-sm rounded-2 px-3 ${activeTab === 'UNREAD' ? 'btn-primary shadow-sm' : 'btn-light text-dark fw-medium border'}`}
              onClick={() => setActiveTab('UNREAD')}
            >
              Chưa đọc
            </button>
          </div>

          {/* List */}
          <div className="overflow-auto mt-2 pb-2 flex-grow-1" style={{ maxHeight: '380px' }}>
            {loading ? (
              <div className="text-center p-4"><Spinner animation="border" size="sm" /></div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-4 text-muted">
                <p className="mb-0">Bạn không có thông báo nào.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  className="d-flex p-3 border-bottom position-relative align-items-center transition-all"
                  style={{ 
                    cursor: 'pointer', 
                    backgroundColor: notif.isRead ? '#fff' : '#f8f9fa',
                  }}
                  onClick={() => handleNotificationClick(notif)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = notif.isRead ? '#f8f9fa' : '#eaf2fa';
                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
                    e.currentTarget.style.zIndex = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = notif.isRead ? '#fff' : '#f8f9fa';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.zIndex = '0';
                  }}
                >
                  {/* Icon Wrapper */}
                  <div className="rounded-2 d-flex align-items-center justify-content-center bg-light flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                    {getIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="ms-3 flex-grow-1 pe-3">
                    <div className="fw-medium text-dark mb-1" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                      {notif.content}
                    </div>
                    <div className="text-primary fw-medium" style={{ fontSize: '0.75rem' }}>
                      {timeAgo(notif.createdAt)}
                    </div>
                  </div>

                  {/* Blue dot for unread */}
                  {!notif.isRead && (
                    <div className="rounded-circle bg-primary position-absolute" style={{ width: '10px', height: '10px', right: '16px', top: '50%', transform: 'translateY(-50%)' }}></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer View All */}
          <div className="p-2 text-center border-top bg-light" style={{ borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}>
            <button 
              className="btn btn-link text-decoration-none fw-semibold w-100 p-1"
              style={{ fontSize: '0.9rem' }}
              onClick={() => { setShow(false); navigate('/notifications'); }}
            >
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const CrownIcon = () => (
  <div className="d-flex align-items-center justify-content-center bg-warning bg-opacity-25 rounded-2" style={{ width: '100%', height: '100%' }}>
    <Zap size={20} className="text-warning" />
  </div>
);
