const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

// Map lưu trữ socket.id tương ứng với userId
// Để dễ dàng gửi tin nhắn cá nhân: userSockets.get(userId)
const userSockets = new Map();

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
    console.log(`User connected: ${socket.userId} with socket ID: ${socket.id}`);
    userSockets.set(socket.userId.toString(), socket.id);

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
      userSockets.delete(socket.userId.toString());
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

// Hàm tiện ích để gửi event tới 1 user cụ thể
const emitToUser = (userId, eventName, data) => {
  const socketId = userSockets.get(userId.toString());
  if (socketId && io) {
    io.to(socketId).emit(eventName, data);
  }
};

module.exports = {
  initSocket,
  getIo,
  emitToUser
};
