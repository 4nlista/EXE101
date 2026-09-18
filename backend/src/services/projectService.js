const Project = require('../models/Project');

/**
 * Lấy danh sách dự án với phân trang và bộ lọc
 */
const getProjects = async (query) => {
  const { page = 1, limit = 10, search, departmentId, status, gradeTarget } = query;
  const skip = (page - 1) * limit;

  // Xây dựng query filter
  const filter = {};

  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }
  
  if (departmentId) {
    filter.departmentIds = departmentId;
  }

  if (status) {
    filter.status = status;
  }

  if (query.minGrade || query.maxGrade) {
    filter.gradeTarget = {};
    if (query.minGrade) filter.gradeTarget.$gte = parseFloat(query.minGrade);
    if (query.maxGrade) filter.gradeTarget.$lte = parseFloat(query.maxGrade);
  }

  // Thực hiện truy vấn với populate để lấy tên người đăng và tên ngành học
  const projects = await Project.find(filter)
    .populate('ownerId', 'name avatar')
    .populate('departmentIds', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Project.countDocuments(filter);

  return {
    projects,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  getProjects
};
