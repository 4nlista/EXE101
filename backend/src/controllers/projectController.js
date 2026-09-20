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

module.exports = {
  getProjects,
  createProject
};
