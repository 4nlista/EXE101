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

const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await profileService.getMyProfile(userId);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

const getPublicProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await profileService.getPublicProfile(id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ người dùng.' });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let avatarUrl = req.file ? req.file.path : undefined;

    // Check size limit: 2MB (done in multer, but just to be safe if not configured)
    if (req.file && req.file.size > 2 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'Kích thước ảnh vượt quá 2MB' });
    }

    const updatedUser = await profileService.updateMyProfile(userId, req.body, avatarUrl);

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
  updateOnboardingProfile,
  getMyProfile,
  getPublicProfile,
  updateMyProfile
};
