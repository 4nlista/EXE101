const Department = require('../models/Department');
const Major = require('../models/Major');

/**
 * GET /api/master-data/departments
 * Lấy danh sách ngành học (Departments)
 */
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).select('name description');
    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/master-data/majors/:departmentId
 * Lấy danh sách chuyên ngành (Majors) theo ngành học (Department)
 */
const getMajorsByDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const majors = await Major.find({ departmentId, isActive: true }).select('name description');
    res.status(200).json({
      success: true,
      data: majors
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/master-data/skills
 * Lấy danh sách kỹ năng gợi ý 
 */
const getSkills = async (req, res, next) => {
  try {
    const SKILLS = [
      'React', 'Node.js', 'Figma', 'Python', 'Marketing', 
      'Data Analysis', 'UI/UX Design', 'Project Management',
      'Java', 'C++', 'Photoshop', 'Illustrator', 'SEO', 'Content Writing'
    ];
    res.status(200).json({
      success: true,
      data: SKILLS
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
