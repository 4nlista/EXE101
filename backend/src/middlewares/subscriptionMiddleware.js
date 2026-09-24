const User = require('../models/User');
const { PACKAGE_TYPE } = require('../constants/subscriptionEnum');

/**
 * Middleware yêu cầu người dùng phải có gói tối thiểu để sử dụng tính năng
 * @param {Array} allowedPackages - Danh sách các gói được phép (VD: [PACKAGE_TYPE.VIP, PACKAGE_TYPE.PREMIUM])
 */
const requirePackage = (allowedPackages) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(401).json({ success: false, message: 'Người dùng không tồn tại' });
      }

      const currentPackage = user.currentPackage || PACKAGE_TYPE.FREE;

      if (!allowedPackages.includes(currentPackage)) {
        return res.status(403).json({
          success: false,
          message: 'Tính năng này yêu cầu nâng cấp gói dịch vụ cao hơn để sử dụng.',
          requiresUpgrade: true
        });
      }

      next();
    } catch (error) {
      console.error('Subscription Middleware Error:', error);
      res.status(500).json({ success: false, message: 'Lỗi kiểm tra quyền truy cập' });
    }
  };
};

module.exports = {
  requirePackage
};
