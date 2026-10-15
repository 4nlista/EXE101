const jwt = require('jsonwebtoken');
const { ROLE_CODE } = require('../constants/roleEnum');
const { IS_ACTIVE } = require('../constants/userEnum');
const User = require('../models/User');

/**
 * Middleware kiểm tra JWT token hợp lệ và tài khoản không bị khóa
 */
const verifyToken = async (req, res, next) => {
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
    
    // Kiểm tra trạng thái tài khoản trong Database để chặn ngay nếu vừa bị Admin khóa
    const dbUser = await User.findById(decoded.id).select('isActive roleCode lockReason');
    if (!dbUser) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại hoặc đã bị xóa.' });
    }

    if (dbUser.isActive === IS_ACTIVE.LOCKED) {
      const lockMsg = dbUser.lockReason
        ? `Tài khoản của bạn đã bị khóa bởi Quản trị viên. Lý do: ${dbUser.lockReason}`
        : 'Tài khoản của bạn đã bị khóa bởi Quản trị viên.';
      return res.status(403).json({ success: false, message: lockMsg });
    }

    req.user = {
      id: decoded.id,
      roleCode: dbUser.roleCode
    };
    
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
  if (req.user && req.user.roleCode === ROLE_CODE.ADMIN) {
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
  if (req.user && req.user.roleCode === ROLE_CODE.USER) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. Require User role.' });
  }
};

/**
 * Middleware tùy chọn: Giải mã token nếu có trong Authorization header, không ném lỗi nếu không có
 */
const optionalVerifyToken = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'universe-secret-key');
      req.user = decoded;
    }
  } catch (error) {
    // Không chặn request nếu token không hợp lệ hoặc hết hạn
  }
  next();
};

module.exports = { verifyToken, optionalVerifyToken, isAdmin, isUser };

