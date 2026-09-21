const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middlewares/authMiddleware');
const uploadCloud = require('../utils/uploadCloud');

// [GET] Lấy hồ sơ cá nhân của mình
router.get('/my-profile', verifyToken, profileController.getMyProfile);

// [GET] Lấy hồ sơ công khai của người dùng khác
router.get('/:id/profile', verifyToken, profileController.getPublicProfile);

// [PUT] Cập nhật thiết lập hồ sơ 4 bước (Onboarding)
router.put('/onboarding', verifyToken, uploadCloud.single('avatar'), profileController.updateOnboardingProfile);

// [PUT] Cập nhật hồ sơ cá nhân (Profile page)
router.put('/my-profile', verifyToken, uploadCloud.single('avatar'), profileController.updateMyProfile);

module.exports = router;
