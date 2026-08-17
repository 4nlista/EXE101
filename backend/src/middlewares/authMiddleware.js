const jwt = require('jsonwebtoken');

/**
 * Middleware kiểm tra JWT token hợp lệ
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    // Kiểm tra Header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided or invalid format.' });
    }

    // Lấy token
    const token = authHeader.split(' ')[1];

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'universe-secret-key');
    req.user = decoded; // Gán thông tin user vào request (id, roleCode)
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

/**
 * Middleware kiểm tra quyền Admin
 * Bắt buộc phải đứng sau verifyToken
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.roleCode === 0) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. Require Admin role.' });
  }
};

/**
 * Middleware kiểm tra quyền Student/User bình thường
 * Bắt buộc phải đứng sau verifyToken
 */
const isUser = (req, res, next) => {
  if (req.user && req.user.roleCode === 1) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. Require User role.' });
  }
};

module.exports = { verifyToken, isAdmin, isUser };
