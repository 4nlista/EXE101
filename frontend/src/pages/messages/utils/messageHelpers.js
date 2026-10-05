import { MESSAGE_STATUS } from '../../../constants/messageEnum';

// Danh mục icon cảm xúc phổ biến chia theo từng nhóm
export const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Cảm xúc',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳',
      '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫',
      '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳',
      '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭',
      '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
      '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢'
    ]
  },
  {
    id: 'gestures',
    name: 'Cử chỉ',
    emojis: [
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
      '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '👏',
      '🙌', '👐', '🤲', '🙏', '✍️', '💪', '🧠', '👀', '👁️', '👂'
    ]
  },
  {
    id: 'hearts',
    name: 'Trái tim',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌',
      '💯', '💢', '💥', '💫', '💬', '💭', '💤'
    ]
  },
  {
    id: 'objects',
    name: 'Biểu tượng',
    emojis: [
      '🔥', '✨', '🌟', '⭐', '🎉', '🎊', '🚀', '💡', '📌', '📍',
      '🎯', '🏆', '🥇', '🥈', '🥉', '☕', '🍕', '🍔', '🎂', '🍻',
      '🥂', '🎁', '🔔', '📢', '💻', '📱', '📦', '🔑', '🔒', '⏳',
      '⏰', '📅', '📈', '📊', '📝', '📎', '📁', '📂', '💎', '🍀'
    ]
  }
];

// Trích xuất 2 chữ cái đầu của tên người dùng để làm avatar viết tắt
export const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Định dạng thời gian cho item hội thoại bên sidebar: "10:24" (nếu hôm nay) hoặc "23/09"
export const formatSidebarTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  if (d.toDateString() === now.toDateString()) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
};

// Định dạng giờ phút hiển thị bên dưới bóng tin nhắn: "20:35"
export const formatMessageTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Định dạng nhãn ngày ngăn cách giữa các tin nhắn: "Thứ 3, 23 tháng 9, 2025"
export const formatSeparatorDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dayName = days[d.getDay()];
  return `${dayName}, ${d.getDate()} tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
};

// Kiểm tra xem 2 mốc thời gian có cùng ngày hay không
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// Định dạng trạng thái hoạt động: "Đang hoạt động" hoặc "Hoạt động X phút trước"
export const formatActivityStatus = (isOnline, lastSeenTime) => {
  if (isOnline) {
    return {
      text: 'Đang hoạt động',
      isOnline: true
    };
  }

  if (!lastSeenTime) {
    return {
      text: 'Chưa hoạt động gần đây',
      isOnline: false
    };
  }

  const diffMs = Date.now() - new Date(lastSeenTime).getTime();
  if (isNaN(diffMs) || diffMs < 0) {
    return { text: 'Không hoạt động', isOnline: false };
  }

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) {
    return { text: 'Hoạt động vài giây trước', isOnline: false };
  }
  if (diffMinutes < 60) {
    return { text: `Hoạt động ${diffMinutes} phút trước`, isOnline: false };
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return { text: `Hoạt động ${diffHours} giờ trước`, isOnline: false };
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return { text: `Hoạt động ${diffDays} ngày trước`, isOnline: false };
  }

  const d = new Date(lastSeenTime);
  const pad = (n) => n.toString().padStart(2, '0');
  return {
    text: `Hoạt động ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
    isOnline: false
  };
};

// Lấy cấu hình hiển thị trạng thái tin nhắn từ enum MESSAGE_STATUS
export const getMessageStatusConfig = (status) => {
  switch (status) {
    case MESSAGE_STATUS.READ:
      return { label: 'Đã xem', isRead: true, isDelivered: false };
    case MESSAGE_STATUS.DELIVERED:
      return { label: 'Đã nhận', isRead: false, isDelivered: true };
    case MESSAGE_STATUS.SENT:
    default:
      return { label: 'Đã gửi', isRead: false, isDelivered: false };
  }
};
