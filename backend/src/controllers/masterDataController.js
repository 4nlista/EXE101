const masterDataService = require('../services/masterDataService');

/**
 * GET /api/departments
 * Lấy danh sách ngành học (Departments)
 */
const getDepartments = async (req, res, next) => {
  try {
    const departments = await masterDataService.getActiveDepartments();
    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/majors/:departmentId
 * Lấy danh sách chuyên ngành (Majors) theo ngành học (Department)
 */
const getMajorsByDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const majors = await masterDataService.getMajorsByDepartmentId(departmentId);
    res.status(200).json({
      success: true,
      data: majors
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/skills
 * Lấy danh sách kỹ năng gợi ý
 */
const getSkills = async (req, res, next) => {
  try {
    const skillNames = await masterDataService.getApprovedSkills();
    res.status(200).json({
      success: true,
      data: skillNames
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDepartments,
  getMajorsByDepartment,
  getSkills
};
