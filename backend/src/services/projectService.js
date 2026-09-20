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

  // Xử lý lọc theo Hạn chót (Deadline)
  if (query.deadline) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(query.deadline));
    filter.deadline = {
      $gte: new Date(),
      $lte: futureDate
    };
  } else {
    // Mặc định luôn ẩn các dự án đã quá hạn nếu không truyền deadline cụ thể
    // Giả định: Các dự án không set deadline hoặc có deadline ở tương lai mới hiện
    filter.$or = [
      { deadline: { $gte: new Date() } },
      { deadline: { $exists: false } },
      { deadline: null }
    ];
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

/**
 * Tạo bài đăng dự án mới
 */
const createProject = async (projectData, ownerId) => {
  const {
    title,
    description,
    candidateRequirements,
    departmentIds,
    gradeTarget,
    maxMembers,
    deadline
  } = projectData;

  const newProject = new Project({
    ownerId,
    title,
    description,
    candidateRequirements,
    departmentIds,
    gradeTarget,
    maxMembers,
    deadline
  });

  await newProject.save();
  return newProject;
};

module.exports = {
  getProjects,
  createProject
};
