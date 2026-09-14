const profileService = require('../services/profileService');

/**
 * PUT /api/user/onboarding
 * Hoàn thiện hồ sơ 4 bước
 */
const updateOnboardingProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // Lấy từ authMiddleware
    const { name, phone, departmentId } = req.body;
    let avatarUrl = req.file ? req.file.path : undefined;

    if (!name || !phone || !departmentId) {
      return res.status(400).json({ success: false, message: 'Dữ liệu hồ sơ bị thiếu hoặc không đúng định dạng. Xin vui lòng thử lại!' });
    }

    const updatedUser = await profileService.updateOnboardingProfile(userId, req.body, avatarUrl);

    res.status(200).json({
      success: true,
      message: 'Hồ sơ đã được cập nhật thành công',
      data: updatedUser
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateOnboardingProfile
};
