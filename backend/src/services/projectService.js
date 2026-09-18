const Project = require('../models/Project');

/**
 * Lấy danh sách dự án với phân trang và bộ lọc
 */
const getProjects = async (query) => {
  const { page = 1, limit = 10, search, departmentId, status, minGrade, maxGrade, sort = 'newest' } = query;
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

  if (minGrade || maxGrade) {
    filter.gradeTarget = {};
    if (minGrade) filter.gradeTarget.$gte = parseFloat(minGrade);
    if (maxGrade) filter.gradeTarget.$lte = parseFloat(maxGrade);
  }

  // Xác định thứ tự sắp xếp
  const sortOrder = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

  // Thực hiện truy vấn với populate để lấy tên người đăng và tên ngành học
  const projects = await Project.find(filter)
    .populate('ownerId', 'name avatar university')
    .populate('departmentIds', 'name')
    .sort(sortOrder)
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
