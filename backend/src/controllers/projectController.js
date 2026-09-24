const projectService = require('../services/projectService');
const { createProjectSchema } = require('../validations/projectValidation');

// Lấy danh sách các projects hiển thị lên /feed
const getProjects = async (req, res, next) => {
  try {
    const result = await projectService.getProjects(req.query);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Tạo bài đăng dự án mới
const createProject = async (req, res, next) => {
  try {
    // Validate dữ liệu từ request body
    const { error, value } = createProjectSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
      // Format lỗi trả về cho client
      const errorMessage = error.details.map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }

    const ownerId = req.user.id;
    
    // Gọi service xử lý logic
    const newProject = await projectService.createProject(value, ownerId);

    return res.status(201).json({
      success: true,
      message: 'Tạo bài đăng dự án thành công.',
      data: newProject
    });
  } catch (error) {
    next(error);
  }
};

const { updateProjectSchema } = require('../validations/projectValidation');

// Route GET /api/projects/my-projects
const getMyProjects = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const result = await projectService.getMyProjects(ownerId, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Route GET /api/projects/my-projects/stats
const getMyProjectStats = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const stats = await projectService.getMyProjectStats(ownerId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

// Route GET /api/projects/:projectId
const getProjectDetail = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await projectService.getProjectDetail(projectId);
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// Route PATCH /api/projects/:projectId
const updateProject = async (req, res, next) => {
  try {
    const { error, value } = updateProjectSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map(err => err.message).join(', ');
      return res.status(400).json({ success: false, message: errorMessage });
    }
    const { projectId } = req.params;
    const ownerId = req.user.id;
    const updatedProject = await projectService.updateProject(projectId, ownerId, value);
    res.status(200).json({ success: true, message: 'Cập nhật dự án thành công', data: updatedProject });
  } catch (error) {
    next(error);
  }
};

// Route DELETE /api/projects/:projectId
const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const ownerId = req.user.id;
    await projectService.deleteProject(projectId, ownerId);
    res.status(200).json({ success: true, message: 'Xóa dự án thành công' });
  } catch (error) {
    next(error);
  }
};

// Route GET /api/projects/:projectId/applicants
const getProjectApplicants = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const ownerId = req.user.id;
    const data = await projectService.getProjectApplicants(projectId, ownerId, req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Route PATCH /api/projects/:projectId/applicants/:applicationId/approve
const approveApplicant = async (req, res, next) => {
  try {
    const { projectId, applicationId } = req.params;
    const ownerId = req.user.id;
    const data = await projectService.approveApplicant(projectId, ownerId, applicationId);
    res.status(200).json({ success: true, message: 'Duyệt ứng viên thành công', data });
  } catch (error) {
    next(error);
  }
};

// Route PATCH /api/projects/:projectId/applicants/:applicationId/reject
const rejectApplicant = async (req, res, next) => {
  try {
    const { projectId, applicationId } = req.params;
    const ownerId = req.user.id;
    await projectService.rejectApplicant(projectId, ownerId, applicationId);
    res.status(200).json({ success: true, message: 'Từ chối ứng viên thành công' });
  } catch (error) {
    next(error);
  }
};

// Route POST /api/projects/:projectId/applicants/:applicationId/invite
const inviteApplicant = async (req, res, next) => {
  try {
    const { projectId, applicationId } = req.params;
    const ownerId = req.user.id;
    const data = await projectService.inviteApplicant(projectId, ownerId, applicationId);
    res.status(200).json({ success: true, message: 'Gửi lời mời tham gia thành công', data });
  } catch (error) {
    next(error);
  }
};

// Route DELETE /api/projects/:projectId/members/:userId
const kickMember = async (req, res, next) => {
  try {
    const { projectId, userId } = req.params;
    const ownerId = req.user.id;
    await projectService.kickMember(projectId, ownerId, userId);
    res.status(200).json({ success: true, message: 'Đã kick thành viên khỏi dự án' });
  } catch (error) {
    next(error);
  }
};

const checkProjectLimit = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const result = await projectService.checkLimit(ownerId);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  getMyProjects,
  getMyProjectStats,
  getProjectDetail,
  updateProject,
  deleteProject,
  getProjectApplicants,
  approveApplicant,
  rejectApplicant,
  inviteApplicant,
  kickMember,
  checkProjectLimit
};
