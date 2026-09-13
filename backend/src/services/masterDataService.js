const Department = require('../models/Department');
const Major = require('../models/Major');
const Skill = require('../models/Skill');

/**
 * Lấy danh sách ngành học (đang active)
 */
const getActiveDepartments = async () => {
  return await Department.find({}).select('name description');
};

/**
 * Lấy danh sách chuyên ngành theo mã ngành
 * @param {string} departmentId 
 */
const getMajorsByDepartmentId = async (departmentId) => {
  return await Major.find({ departmentId }).select('name description');
};

/**
 * Lấy danh sách kỹ năng đã được duyệt (trả về mảng tên)
 */
const getApprovedSkills = async () => {
  const skills = await Skill.find({ isApproved: true })
    .select('name usageCount')
    .sort({ usageCount: -1 });

  return skills.map(s => s.name);
};

module.exports = {
  getActiveDepartments,
  getMajorsByDepartmentId,
  getApprovedSkills
};
