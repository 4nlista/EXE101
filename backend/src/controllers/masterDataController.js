const Major = require('../models/Major');
const Specialization = require('../models/Specialization');

/**
 * GET /api/master-data/majors
 * Lấy danh sách chuyên ngành
 */
const getMajors = async (req, res, next) => {
  try {
    const majors = await Major.find({ isActive: true }).select('name description');
    res.status(200).json({
      success: true,
      data: majors
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/master-data/specializations/:majorId
 * Lấy danh sách chuyên ngành hẹp theo chuyên ngành
 */
const getSpecializations = async (req, res, next) => {
  try {
    const { majorId } = req.params;
    const specializations = await Specialization.find({ majorId, isActive: true }).select('name description');
    res.status(200).json({
      success: true,
      data: specializations
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/master-data/skills
 * Lấy danh sách kỹ năng cứng (dùng cho mảng mainSkills)
 */
const getSkills = async (req, res, next) => {
  try {
    // Vì DB không có bảng skills, ta định nghĩa một mảng constant ở server trả về
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
  getMajors,
  getSpecializations,
  getSkills
};
