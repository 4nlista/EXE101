const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const applicationController = require('../controllers/applicationController');
const { verifyToken } = require('../middlewares/authMiddleware');
const uploadCloudCV = require('../utils/uploadCloudCV');

// Route GET /api/projects
router.get('/', projectController.getProjects);

// Route POST /api/projects - Tạo dự án mới
router.post(
  '/',
  verifyToken,
  projectController.createProject
);

// Route POST /api/projects/:projectId/apply - Ứng tuyển vào dự án
router.post(
  '/:projectId/apply',
  verifyToken,
  uploadCloudCV.single('cvFile'),
  applicationController.createApplication
);

// Route GET /api/projects/:projectId/application-status - Kiểm tra trạng thái ứng tuyển
router.get(
  '/:projectId/application-status',
  verifyToken,
  applicationController.checkApplicationStatus
);

// Route GET /api/projects/my-projects - Lấy danh sách dự án của user
router.get(
  '/my-projects',
  verifyToken,
  projectController.getMyProjects
);

// Route GET /api/projects/my-projects/stats - Thống kê dự án
router.get(
  '/my-projects/stats',
  verifyToken,
  projectController.getMyProjectStats
);

// Route GET /api/projects/check-limit - Kiểm tra giới hạn tạo dự án
router.get(
  '/check-limit',
  verifyToken,
  projectController.checkProjectLimit
);

// Route GET /api/projects/:projectId - Lấy chi tiết dự án
router.get(
  '/:projectId',
  projectController.getProjectDetail
);

// Route PATCH /api/projects/:projectId - Sửa dự án
router.patch(
  '/:projectId',
  verifyToken,
  projectController.updateProject
);

// Route DELETE /api/projects/:projectId - Xóa dự án
router.delete(
  '/:projectId',
  verifyToken,
  projectController.deleteProject
);

// Route GET /api/projects/:projectId/applicants - Danh sách ứng viên & thành viên
router.get(
  '/:projectId/applicants',
  verifyToken,
  projectController.getProjectApplicants
);

// Route PATCH /api/projects/:projectId/applicants/:applicationId/approve
router.patch(
  '/:projectId/applicants/:applicationId/approve',
  verifyToken,
  projectController.approveApplicant
);

// Route PATCH /api/projects/:projectId/applicants/:applicationId/reject
router.patch(
  '/:projectId/applicants/:applicationId/reject',
  verifyToken,
  projectController.rejectApplicant
);

// Route POST /api/projects/:projectId/applicants/:applicationId/invite
router.post(
  '/:projectId/applicants/:applicationId/invite',
  verifyToken,
  projectController.inviteApplicant
);

// Route DELETE /api/projects/:projectId/members/:userId - Kick thành viên
router.delete(
  '/:projectId/members/:userId',
  verifyToken,
  projectController.kickMember
);

module.exports = router;
