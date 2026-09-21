const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Route GET /api/applications/my-applications - Lấy danh sách hồ sơ user đã nộp
router.get(
  '/my-applications',
  verifyToken,
  applicationController.getMyApplications
);

// Route PATCH /api/applications/:id/cancel - Hủy đơn đang PENDING
router.patch(
  '/:id/cancel',
  verifyToken,
  applicationController.cancelApplication
);

// Route PATCH /api/applications/:id/accept-invite - Chấp nhận lời mời INVITED
router.patch(
  '/:id/accept-invite',
  verifyToken,
  applicationController.acceptInvite
);

// Route PATCH /api/applications/:id/decline-invite - Từ chối lời mời INVITED
router.patch(
  '/:id/decline-invite',
  verifyToken,
  applicationController.declineInvite
);

module.exports = router;
