const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

// Map lưu trữ Set các socket.id tương ứng với userId (hỗ trợ mở nhiều tab)
const userSockets = new Map();
// Map lưu trữ thời điểm hoạt động/ngắt kết nối gần nhất của user (ISO string)
const userLastSeen = new Map();

// Kiểm tra xem một người dùng có đang online không
const isUserOnline = (userId) => {
  if (!userId) return false;
  const uid = userId.toString();
  return userSockets.has(uid) && userSockets.get(uid).size > 0;
};

// Lấy thời điểm hoạt động gần nhất
const getUserLastSeen = (userId) => {
  if (!userId) return null;
  return userLastSeen.get(userId.toString()) || null;
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Trong thực tế nên config domain cụ thể
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'universe-secret-key');
      socket.userId = decoded.id;
      if (!socket.userId) {
        return next(new Error('Authentication error: Invalid token payload'));
      }
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId.toString();
    const User = require('./models/User');

    // Quản lý nhiều kết nối/tab cho cùng 1 user
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Cập nhật mốc thời gian hoạt động vào database
    User.findByIdAndUpdate(userId, { lastActiveAt: new Date() }).catch(() => {});

    // Gửi danh sách các user đang online cho socket vừa kết nối
    socket.emit('online_users_list', Array.from(userSockets.keys()));

    // Gửi bảng thời điểm hoạt động gần nhất của các user trong hệ thống
    socket.emit('user_last_seen_list', Object.fromEntries(userLastSeen));

    // Nếu đây là socket đầu tiên của user (vừa chuyển sang Online) -> thông báo cho mọi người
    if (userSockets.get(userId).size === 1) {
      socket.broadcast.emit('user_status_changed', {
        userId,
        isOnline: true
      });
    }

    // Join user room for multi-device support
    socket.join(`user:${socket.userId}`);

    // Tham gia room của conversation (dùng chung cho chat 1-1 và group)
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Rời room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      if (userSockets.has(userId)) {
        const sockets = userSockets.get(userId);
        sockets.delete(socket.id);
        // Nếu user đã đóng hết toàn bộ tab kết nối -> đánh dấu offline
        if (sockets.size === 0) {
          userSockets.delete(userId);
          const lastSeen = new Date().toISOString();
          userLastSeen.set(userId, lastSeen);

          // Cập nhật mốc offline vào database
          User.findByIdAndUpdate(userId, { lastActiveAt: new Date(lastSeen) }).catch(() => {});

          // Phát sự kiện user offline cùng thời điểm lastSeen
          io.emit('user_status_changed', {
            userId,
            isOnline: false,
            lastSeen
          });
        }
      }
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

// Hàm tiện ích để gửi event tới 1 user cụ thể (hỗ trợ nhiều tab/thiết bị qua user room)
const emitToUser = (userId, eventName, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(eventName, data);
  }
};

module.exports = {
  initSocket,
  getIo,
  emitToUser,
  isUserOnline,
  getUserLastSeen
};
