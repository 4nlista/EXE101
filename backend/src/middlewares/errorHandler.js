/**
 * Global Error Handler Middleware
 * Bắt và format tất cả lỗi trả về cho client theo cấu trúc chuẩn
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error]:', err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    // Trả về stack trace nếu ở môi trường dev để dễ debug
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
