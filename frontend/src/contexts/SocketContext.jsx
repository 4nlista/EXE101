import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getUnreadCount } from '../services/messageService';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8686';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated, currentUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Khởi tạo socket và lấy initial unread count khi user đăng nhập
  useEffect(() => {
    let newSocket;

    const initConnection = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token && isAuthenticated && currentUser) {
        // Fetch initial unread count from API
        try {
          const res = await getUnreadCount();
          if (res.success) {
            setTotalUnreadCount(res.data);
          }
        } catch (err) {
          console.error("Lỗi lấy số lượng tin nhắn chưa đọc:", err);
        }

        // Initialize socket
        newSocket = io(SOCKET_URL, {
          auth: { token }
        });

        // Listen for real-time unread updates from backend
        newSocket.on('unread_count_update', (data) => {
          if (data && typeof data.totalUnreadCount === 'number') {
            setTotalUnreadCount(data.totalUnreadCount);
          }
        });

        setSocket(newSocket);
      }
    };

    if (isAuthenticated) {
      initConnection();
    } else {
      // Disconnect on logout
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setTotalUnreadCount(0);
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, currentUser]);

  return (
    <SocketContext.Provider value={{ socket, totalUnreadCount, setTotalUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
