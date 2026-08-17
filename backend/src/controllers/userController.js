const userService = require('../services/userService');

/**
 * Controller xử lý API Cập nhật hồ sơ (Onboarding)
 * PUT /api/users/profile/setup
 */
const setupProfile = async (req, res, next) => {
  try {
    // 1. Lấy userId từ JWT (middleware verifyToken đã gắn vào req.user)
    const userId = req.user.id;
    
    // 2. Lấy dữ liệu payload từ client gửi lên
    const setupData = req.body;

    // 3. Gọi logic Service để cập nhật (có thể thêm Joi validate ở đây sau nếu cần)
    const updatedUser = await userService.setupProfile(userId, setupData);

    // 4. Trả về Response thành công
    res.status(200).json({
      success: true,
      message: 'Hoàn thiện hồ sơ thành công!',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        onboardingCompleted: updatedUser.onboardingCompleted
      }
    });
  } catch (err) {
    // 5. Bắt lỗi -> errorHandler
    next(err);
  }
};

module.exports = {
  setupProfile
};
