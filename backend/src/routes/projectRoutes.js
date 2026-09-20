const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const applicationController = require('../controllers/applicationController');
const { verifyToken } = require('../middlewares/authMiddleware');
const uploadCloudCV = require('../utils/uploadCloudCV');

// Route GET /api/projects
router.get('/', projectController.getProjects);

// Route POST /api/projects/:projectId/apply - Ứng tuyển vào dự án
router.post(
  '/:projectId/apply',
  verifyToken,
  uploadCloudCV.single('cvFile'),
  applicationController.createApplication
);

module.exports = router;
