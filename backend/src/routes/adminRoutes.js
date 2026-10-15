const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Tất cả các route bên dưới bắt buộc phải ĐĂNG NHẬP và CÓ QUYỀN ADMIN (roleCode: 0)
router.use(verifyToken, isAdmin);

// 1. Dashboard & Thống kê
router.get('/stats', adminController.getSystemStats);

// 2. Quản lý người dùng
router.get('/users', adminController.getUsersList);
router.put('/users/:id/lock', adminController.lockUser);
router.put('/users/:id/unlock', adminController.unlockUser);

// 3. Kiểm duyệt dự án
router.get('/projects', adminController.getProjectsList);
router.post('/projects/:id/moderate', adminController.moderateProject);

// 4. Quản lý Chuyên ngành
router.get('/majors', adminController.getMajorsList);
router.post('/majors', adminController.createMajor);
router.put('/majors/:id/toggle', adminController.toggleMajorStatus);

// 5. Quản lý Kỹ năng
router.get('/skills', adminController.getSkillsList);
router.post('/skills', adminController.createSkill);
router.put('/skills/:id/approve', adminController.approveSkill);

// 6. Trợ lý Gemini AI Quản trị
router.post('/ai-chat', adminController.aiChat);

module.exports = router;
