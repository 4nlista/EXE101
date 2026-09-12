const Department = require('../models/Department');
const Major = require('../models/Major');
const Skill = require('../models/Skill');

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
 * Lấy danh sách kỹ năng gợi ý (chỉ lấy những kỹ năng đã được duyệt)
 */
const getSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ isApproved: true })
      .select('name usageCount')
      .sort({ usageCount: -1 }); // Sắp xếp theo số người dùng từ cao xuống thấp
      
    // Trả về mảng string cho tiện lợi phía frontend (react-select)
    // Hoặc trả về mảng object tùy frontend cần, tôi sẽ trả về mảng chuỗi name để phù hợp với code cũ
    const skillNames = skills.map(s => s.name);

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
