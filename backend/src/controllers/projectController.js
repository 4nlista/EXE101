const projectService = require('../services/projectService');

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

module.exports = {
  getProjects
};
