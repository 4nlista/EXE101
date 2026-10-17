const adminService = require('../services/adminService');
const { adminChatWithAI } = require('../services/aiAdminService');
const {
  lockUserSchema,
  moderateProjectSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  createMajorSchema,
  updateMajorSchema,
  createSkillSchema
} = require('../validations/adminValidation');

// [GET] /api/admin/stats - Lấy thống kê tổng quan toàn hệ thống
const getSystemStats = async (req, res, next) => {
  try {
    const stats = await adminService.getSystemStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

// [GET] /api/admin/users - Danh sách người dùng
const getUsersList = async (req, res, next) => {
  try {
    const result = await adminService.getUsersList(req.query);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// [PUT] /api/admin/users/:id/lock - Khóa tài khoản người dùng
const lockUser = async (req, res, next) => {
  try {
    const { error, value } = lockUserSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const currentAdminId = req.user.id;
    const targetUserId = req.params.id;
    const result = await adminService.lockUser(targetUserId, value.reason, currentAdminId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.user
    });
  } catch (err) {
    next(err);
  }
};

// [PUT] /api/admin/users/:id/unlock - Mở khóa tài khoản người dùng
const unlockUser = async (req, res, next) => {
  try {
    const currentAdminId = req.user.id;
    const targetUserId = req.params.id;
    const result = await adminService.unlockUser(targetUserId, currentAdminId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.user
    });
  } catch (err) {
    next(err);
  }
};

// [GET] /api/admin/projects - Danh sách bài đăng dự án
const getProjectsList = async (req, res, next) => {
  try {
    const result = await adminService.getProjectsList(req.query);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// [POST] /api/admin/projects/:id/moderate - Kiểm duyệt dự án (Đình chỉ / Xóa / Khôi phục)
const moderateProject = async (req, res, next) => {
  try {
    const { error, value } = moderateProjectSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const currentAdminId = req.user.id;
    const projectId = req.params.id;
    const result = await adminService.moderateProject(projectId, value.action, value.reason, currentAdminId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.project || null
    });
  } catch (err) {
    next(err);
  }
};

// [GET] /api/admin/majors - Danh sách chuyên ngành
const getMajorsList = async (req, res, next) => {
  try {
    const majors = await adminService.getMajorsList(req.query.departmentId);
    res.status(200).json({
      success: true,
      data: majors
    });
  } catch (err) {
    next(err);
  }
};

// [POST] /api/admin/majors - Thêm mới chuyên ngành
const createMajor = async (req, res, next) => {
  try {
    const { error, value } = createMajorSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const newMajor = await adminService.createMajor(value.name, value.departmentId);
    res.status(201).json({
      success: true,
      message: 'Tạo chuyên ngành mới thành công.',
      data: newMajor
    });
  } catch (err) {
    next(err);
  }
};

// [PUT] /api/admin/majors/:id/toggle - Ẩn/Hiện chuyên ngành
const toggleMajorStatus = async (req, res, next) => {
  try {
    const major = await adminService.toggleMajorStatus(req.params.id);
    res.status(200).json({
      success: true,
      message: `Đã ${major.isActive ? 'kích hoạt' : 'ẩn'} chuyên ngành thành công.`,
      data: major
    });
  } catch (err) {
    next(err);
  }
};

// [PUT] /api/admin/majors/:id - Cập nhật thông tin chuyên ngành
const updateMajor = async (req, res, next) => {
  try {
    const { error, value } = updateMajorSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const updated = await adminService.updateMajor(req.params.id, value);
    res.status(200).json({
      success: true,
      message: 'Cập nhật chuyên ngành thành công.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// [GET] /api/admin/skills - Danh sách kỹ năng
const getSkillsList = async (req, res, next) => {
  try {
    const skills = await adminService.getSkillsList(req.query);
    res.status(200).json({
      success: true,
      data: skills
    });
  } catch (err) {
    next(err);
  }
};

// [POST] /api/admin/skills - Thêm mới kỹ năng nổi bật
const createSkill = async (req, res, next) => {
  try {
    const { error, value } = createSkillSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const newSkill = await adminService.createSkill(value.name);
    res.status(201).json({
      success: true,
      message: 'Thêm kỹ năng mới thành công.',
      data: newSkill
    });
  } catch (err) {
    next(err);
  }
};

// [PUT] /api/admin/skills/:id/approve - Duyệt kỹ năng
const approveSkill = async (req, res, next) => {
  try {
    const skill = await adminService.approveSkill(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Phê duyệt kỹ năng thành công.',
      data: skill
    });
  } catch (err) {
    next(err);
  }
};

// [POST] /api/admin/ai-chat - Chat thông minh với Gemini AI phục vụ quản trị
const aiChat = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      const err = new Error('Vui lòng nhập câu hỏi hoặc yêu cầu cho AI.');
      err.statusCode = 400;
      throw err;
    }

    const aiResponse = await adminChatWithAI(prompt.trim());
    if (!aiResponse.success) {
      const err = new Error(aiResponse.message || 'AI gặp lỗi khi xử lý.');
      err.statusCode = 500;
      throw err;
    }

    res.status(200).json({
      success: true,
      data: aiResponse.data
    });
  } catch (err) {
    next(err);
  }
};

// [GET] /api/admin/departments - Danh sách ngành học
const getDepartmentsList = async (req, res, next) => {
  try {
    const departments = await adminService.getDepartmentsList();
    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (err) {
    next(err);
  }
};

// [POST] /api/admin/departments - Thêm mới ngành học
const createDepartment = async (req, res, next) => {
  try {
    const { error, value } = createDepartmentSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const newDepartment = await adminService.createDepartment(value.name, value.description);
    res.status(201).json({
      success: true,
      message: 'Tạo ngành học mới thành công.',
      data: newDepartment
    });
  } catch (err) {
    next(err);
  }
};

// [PUT] /api/admin/departments/:id/toggle - Ẩn/Hiện ngành học
const toggleDepartmentStatus = async (req, res, next) => {
  try {
    const dept = await adminService.toggleDepartmentStatus(req.params.id);
    res.status(200).json({
      success: true,
      message: `Đã ${dept.isActive ? 'kích hoạt' : 'ẩn'} ngành học thành công.`,
      data: dept
    });
  } catch (err) {
    next(err);
  }
};

// [PUT] /api/admin/departments/:id - Cập nhật thông tin ngành học
const updateDepartment = async (req, res, next) => {
  try {
    const { error, value } = updateDepartmentSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const updated = await adminService.updateDepartment(req.params.id, value);
    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin ngành học thành công.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSystemStats,
  getUsersList,
  lockUser,
  unlockUser,
  getProjectsList,
  moderateProject,
  getDepartmentsList,
  createDepartment,
  updateDepartment,
  toggleDepartmentStatus,
  getMajorsList,
  createMajor,
  updateMajor,
  toggleMajorStatus,
  getSkillsList,
  createSkill,
  approveSkill,
  aiChat
};
