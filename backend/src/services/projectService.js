const Project = require('../models/Project');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { APPLICATION_STATUS } = require('../constants/applicationEnum');
const { PROJECT_STATUS } = require('../constants/projectEnum');
const { NOTIFICATION_TYPE } = require('../constants/notificationEnum');
const User = require('../models/User');
const { PACKAGE_TYPE } = require('../constants/subscriptionEnum');

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
  } else {
    // Luôn luôn chỉ lấy các dự án Đang tuyển (OPEN) ở Feed trừ khi filter cụ thể
    filter.status = PROJECT_STATUS.OPEN;
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
    .populate({
      path: 'ownerId',
      select: 'name avatar departmentId',
      populate: { path: 'departmentId', select: 'name' }
    })
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

const checkLimit = async (ownerId) => {
  const user = await User.findById(ownerId);
  if (!user) throw new Error('Không tìm thấy người dùng');

  const currentPackage = user.currentPackage || PACKAGE_TYPE.FREE;

  if (currentPackage === PACKAGE_TYPE.PREMIUM) {
    return { isAllowed: true, message: 'Gói PREMIUM không giới hạn' };
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const projectCount = await Project.countDocuments({
    ownerId,
    createdAt: { $gte: startOfMonth }
  });

  if (currentPackage === PACKAGE_TYPE.FREE && projectCount >= 3) {
    return { isAllowed: false, message: 'Bạn đã đạt giới hạn đăng 3 dự án/tháng của gói Cơ bản. Vui lòng nâng cấp.' };
  }

  if (currentPackage === PACKAGE_TYPE.VIP && projectCount >= 10) {
    return { isAllowed: false, message: 'Bạn đã đạt giới hạn đăng 10 dự án/tháng của gói VIP. Vui lòng nâng cấp.' };
  }

  return { isAllowed: true, message: 'Thỏa mãn điều kiện' };
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

  // 1. Kiểm tra giới hạn tạo dự án trong tháng dựa trên Gói đăng ký
  const limitCheck = await checkLimit(ownerId);
  if (!limitCheck.isAllowed) {
    const err = new Error(limitCheck.message);
    err.statusCode = 403;
    throw err;
  }

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

const getMyProjects = async (ownerId, query) => {
  const { search, sort = 'newest', page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  let filter = { ownerId };
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  const sortOrder = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('departmentIds', 'name')
      .sort(sortOrder)
      .skip(skip)
      .limit(parseInt(limit)),
    Project.countDocuments(filter)
  ]);

  return {
    projects,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page)
  };
};

const getMyProjectStats = async (ownerId) => {
  const [openCount, closedCount, inProgressCount, completedCount] = await Promise.all([
    Project.countDocuments({ ownerId, status: PROJECT_STATUS.OPEN }),
    Project.countDocuments({ ownerId, status: PROJECT_STATUS.CLOSED }),
    Project.countDocuments({ ownerId, status: PROJECT_STATUS.IN_PROGRESS }),
    Project.countDocuments({ ownerId, status: PROJECT_STATUS.COMPLETED })
  ]);

  const projects = await Project.find({ ownerId }).select('_id');
  const projectIds = projects.map(p => p._id);

  const pendingCount = await Application.countDocuments({
    projectId: { $in: projectIds },
    status: APPLICATION_STATUS.PENDING
  });

  return {
    openProjects: openCount,
    closedProjects: closedCount,
    inProgressProjects: inProgressCount,
    completedProjects: completedCount,
    pendingApplications: pendingCount
  };
};

const getProjectDetail = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate('departmentIds', 'name')
    .populate('ownerId', 'name avatar');
  
  if (!project) throw new Error('Không tìm thấy dự án.');
  return project;
};

const updateProject = async (projectId, ownerId, updateData) => {
  const project = await Project.findOne({ _id: projectId, ownerId });
  if (!project) throw new Error('Không tìm thấy dự án hoặc bạn không có quyền sửa.');

  Object.assign(project, updateData);
  await project.save();
  return project;
};

const deleteProject = async (projectId, ownerId) => {
  const project = await Project.findOne({ _id: projectId, ownerId });
  if (!project) throw new Error('Không tìm thấy dự án hoặc bạn không có quyền hủy.');

  if (project.members && project.members.length > 0) {
    throw new Error('Không thể hủy dự án vì đã có thành viên chính thức tham gia.');
  }

  // Hủy các đơn nộp (nếu có)
  await Application.deleteMany({ projectId });
  
  // Chuyển trạng thái thành CANCELLED thay vì xóa vật lý
  project.status = PROJECT_STATUS.CANCELLED;
  await project.save();
  
  return true;
};

const getProjectApplicants = async (projectId, ownerId, query) => {
  const project = await Project.findOne({ _id: projectId, ownerId })
    .populate({
      path: 'members.userId',
      select: 'name avatar departmentId majorId',
      populate: [
        { path: 'departmentId', select: 'name' },
        { path: 'majorId', select: 'name' }
      ]
    });
  if (!project) throw new Error('Không tìm thấy dự án hoặc bạn không có quyền xem.');

  const { status } = query;
  let filter = { projectId };
  if (status) filter.status = status;

  const applications = await Application.find(filter)
    .populate({
      path: 'applicantId',
      select: 'name avatar departmentId majorId',
      populate: [
        { path: 'departmentId', select: 'name' },
        { path: 'majorId', select: 'name' }
      ]
    })
    .sort({ createdAt: -1 });

  return {
    projectMembers: project.members,
    applications
  };
};

const approveApplicant = async (projectId, ownerId, applicationId) => {
  const project = await Project.findOne({ _id: projectId, ownerId });
  if (!project) throw new Error('Không tìm thấy dự án.');
  if (project.status !== PROJECT_STATUS.OPEN) throw new Error('Dự án đã đóng tuyển.');
  if (project.members.length >= project.maxMembers) throw new Error('Dự án đã đủ thành viên.');

  const application = await Application.findOne({ _id: applicationId, projectId });
  if (!application) throw new Error('Không tìm thấy đơn.');
  if (application.status !== APPLICATION_STATUS.PENDING) throw new Error('Chỉ duyệt đơn đang chờ.');

  // Thêm member
  project.members.push({ userId: application.applicantId, role: 'Member' });
  application.status = APPLICATION_STATUS.APPROVED;

  // Nếu đủ người -> đóng -> reject tất cả PENDING còn lại
  if (project.members.length >= project.maxMembers) {
    project.status = PROJECT_STATUS.CLOSED;
    const pendingApps = await Application.find({ projectId, status: APPLICATION_STATUS.PENDING });
    for (const app of pendingApps) {
      app.status = APPLICATION_STATUS.REJECTED;
      app.rejectionCount += 1;
      await app.save();
      await Notification.create({
        userId: app.applicantId,
        type: NOTIFICATION_TYPE.REJECTED,
        title: 'Hồ sơ bị từ chối',
        content: `Dự án "${project.title}" đã tuyển đủ thành viên.`,
        referenceId: project._id,
        referenceModel: 'Project'
      });
    }
  }

  await Promise.all([project.save(), application.save()]);

  await Notification.create({
    userId: application.applicantId,
    type: NOTIFICATION_TYPE.APPROVED,
    title: 'Hồ sơ được duyệt',
    content: `Chúc mừng! Bạn đã được duyệt tham gia dự án "${project.title}".`,
    referenceId: project._id,
    referenceModel: 'Project'
  });

  return application;
};

const rejectApplicant = async (projectId, ownerId, applicationId) => {
  const project = await Project.findOne({ _id: projectId, ownerId });
  if (!project) throw new Error('Không tìm thấy dự án.');

  const application = await Application.findOne({ _id: applicationId, projectId });
  if (!application) throw new Error('Không tìm thấy đơn.');
  if (application.status !== APPLICATION_STATUS.PENDING) throw new Error('Chỉ từ chối đơn đang chờ.');

  application.status = APPLICATION_STATUS.REJECTED;
  application.rejectionCount += 1;
  await application.save();

  await Notification.create({
    userId: application.applicantId,
    type: NOTIFICATION_TYPE.REJECTED,
    title: 'Hồ sơ bị từ chối',
    content: `Hồ sơ ứng tuyển dự án "${project.title}" của bạn đã bị từ chối.`,
    referenceId: project._id,
    referenceModel: 'Project'
  });

  return application;
};

const inviteApplicant = async (projectId, ownerId, applicationId) => {
  const project = await Project.findOne({ _id: projectId, ownerId });
  if (!project) throw new Error('Không tìm thấy dự án.');
  if (project.members.length >= project.maxMembers) throw new Error('Dự án đã đủ người.');

  const application = await Application.findOne({ _id: applicationId, projectId });
  if (!application) throw new Error('Không tìm thấy đơn.');
  if (application.status !== APPLICATION_STATUS.REJECTED) throw new Error('Chỉ mời người đã bị từ chối.');

  application.status = APPLICATION_STATUS.INVITED;
  await application.save();

  await Notification.create({
    userId: application.applicantId,
    type: NOTIFICATION_TYPE.INVITATION,
    title: 'Lời mời tham gia dự án',
    content: `Bạn được mời tham gia dự án "${project.title}".`,
    referenceId: project._id,
    referenceModel: 'Project'
  });

  return application;
};

const kickMember = async (projectId, ownerId, userId) => {
  const project = await Project.findOne({ _id: projectId, ownerId });
  if (!project) throw new Error('Không tìm thấy dự án.');

  const initialLength = project.members.length;
  project.members = project.members.filter(m => m.userId.toString() !== userId.toString());
  
  if (project.members.length === initialLength) {
    throw new Error('Người dùng không phải thành viên dự án.');
  }

  // Mở lại dự án nếu đang đóng
  if (project.status === PROJECT_STATUS.CLOSED) {
    project.status = PROJECT_STATUS.OPEN;
  }
  await project.save();

  // Đổi trạng thái đơn của người này thành REJECTED (để không còn nằm trong ds APPROVED)
  await Application.findOneAndUpdate(
    { projectId, applicantId: userId, status: APPLICATION_STATUS.APPROVED },
    { status: APPLICATION_STATUS.REJECTED, $inc: { rejectionCount: 1 } }
  );

  await Notification.create({
    userId,
    type: NOTIFICATION_TYPE.MEMBER_KICKED,
    title: 'Đã rời dự án',
    content: `Bạn đã không còn là thành viên của dự án "${project.title}".`,
    referenceId: project._id,
    referenceModel: 'Project'
  });

  return true;
};

module.exports = {
  getProjects,
  createProject,
  getMyProjects,
  getMyProjectStats,
  getProjectDetail,
  updateProject,
  deleteProject,
  getProjectApplicants,
  approveApplicant,
  rejectApplicant,
  inviteApplicant,
  kickMember,
  checkLimit
};
