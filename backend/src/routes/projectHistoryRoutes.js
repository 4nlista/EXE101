const express = require('express');
const router = express.Router();
const projectHistoryController = require('../controllers/projectHistoryController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Tất cả các API ProjectHistory đều yêu cầu đăng nhập
router.use(verifyToken);

// [POST] Thêm mới lịch sử dự án
router.post('/', projectHistoryController.createProjectHistory);

// [PUT] Cập nhật lịch sử dự án
router.put('/:id', projectHistoryController.updateProjectHistory);

// [DELETE] Xóa lịch sử dự án
router.delete('/:id', projectHistoryController.deleteProjectHistory);

module.exports = router;
