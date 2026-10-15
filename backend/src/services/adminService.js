const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Application = require('../models/Application');
const Subscription = require('../models/Subscription');
const Department = require('../models/Department');
const Major = require('../models/Major');
const Skill = require('../models/Skill');
const Notification = require('../models/Notification');
const { IS_ACTIVE } = require('../constants/userEnum');
const { ROLE_CODE } = require('../constants/roleEnum');
const { PROJECT_STATUS } = require('../constants/projectEnum');
const { NOTIFICATION_TYPE } = require('../constants/notificationEnum');
const { SUBSCRIPTION_STATUS } = require('../constants/subscriptionEnum');

// ==========================================
// HÀM HỖ TRỢ CHUẨN HÓA TIẾNG VIỆT
// ==========================================
const removeAccents = (str) => {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
};

/**
 * Lấy toàn bộ số liệu thống kê thời gian thực cho Dashboard Quản trị
 */
const getSystemStats = async () => {
  const [
    totalUsers,
    studentUsers,
    lockedUsers,
    vipUsers,
    projectCounts,
    applicationCounts,
    revenueData,
    recentUsersCount,
    recentProjectsCount
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ roleCode: ROLE_CODE.USER }),
    User.countDocuments({ isActive: IS_ACTIVE.LOCKED }),
    User.countDocuments({ currentPackage: { $in: ['vip', 'premium'] } }),
    Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Subscription.aggregate([
      { $match: { status: SUBSCRIPTION_STATUS.ACTIVE } },
      { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
    ]),
    // Người dùng mới trong 7 ngày qua
    User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }),
    // Dự án mới trong 7 ngày qua
    Project.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
  ]);

  // Chuẩn hóa thống kê dự án theo status
  const projectsByStatus = {
    open: 0,
    in_progress: 0,
    completed: 0,
    closed: 0,
    cancelled: 0,
    suspended: 0
  };
  let totalProjects = 0;
  projectCounts.forEach((item) => {
    if (item._id && projectsByStatus[item._id] !== undefined) {
      projectsByStatus[item._id] = item.count;
    }
    totalProjects += item.count;
  });

  // Chuẩn hóa thống kê ứng tuyển theo status
  const applicationsByStatus = {
    pending: 0,
    approved: 0,
    rejected: 0
  };
  let totalApplications = 0;
  applicationCounts.forEach((item) => {
    if (item._id && applicationsByStatus[item._id] !== undefined) {
      applicationsByStatus[item._id] = item.count;
    }
    totalApplications += item.count;
  });

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  return {
    users: {
      total: totalUsers,
      students: studentUsers,
      locked: lockedUsers,
      vip: vipUsers,
      newThisWeek: recentUsersCount
    },
    projects: {
      total: totalProjects,
      newThisWeek: recentProjectsCount,
      byStatus: projectsByStatus
    },
    applications: {
      total: totalApplications,
      byStatus: applicationsByStatus
    },
    revenue: {
      total: totalRevenue
    }
  };
};

/**
 * Lấy danh sách người dùng có phân trang, tìm kiếm và lọc trạng thái
 */
const getUsersList = async (query = {}) => {
  const { search, status, packageType, roleCode, page = 1, limit = 10 } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};

  // Lọc theo vai trò (0: Admin, 1: User)
  if (roleCode !== undefined && roleCode !== '') {
    filter.roleCode = Number(roleCode);
  }

  // Lọc theo gói tài khoản
  if (packageType && packageType !== 'all') {
    filter.currentPackage = packageType;
  }

  // Lọc theo trạng thái hoạt động
  if (status === 'locked') {
    filter.isActive = IS_ACTIVE.LOCKED;
  } else if (status === 'active') {
    filter.isActive = { $ne: IS_ACTIVE.LOCKED };
  }

  // Tìm kiếm theo tên hoặc email
  if (search && search.trim()) {
    const clean = search.trim();
    filter.$or = [
      { name: { $regex: clean, $options: 'i' } },
      { email: { $regex: clean, $options: 'i' } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('name email avatar phone roleCode isActive currentPackage onboardingCompleted semester departmentId majorId lockReason lockedAt createdAt lastActiveAt')
      .populate('departmentId', 'name')
      .populate('majorId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter)
  ]);

  // Thống kê nhanh số dự án mà từng user đang sở hữu
  const userIds = users.map(u => u._id);
  const projectStats = await Project.aggregate([
    { $match: { ownerId: { $in: userIds } } },
    { $group: { _id: '$ownerId', count: { $sum: 1 } } }
  ]);

  const projectCountMap = {};
  projectStats.forEach(item => {
    projectCountMap[item._id.toString()] = item.count;
  });

  const formattedUsers = users.map(u => {
    const obj = u.toObject();
    obj.hostedProjectsCount = projectCountMap[u._id.toString()] || 0;
    return obj;
  });

  return {
    users: formattedUsers,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

/**
 * Khóa tài khoản người dùng kèm lý do và xử lý an toàn dữ liệu
 */
const lockUser = async (targetUserId, reason, currentAdminId) => {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    const error = new Error('ID người dùng không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Không cho phép tự khóa chính tài khoản Admin đang thao tác
  if (targetUserId.toString() === currentAdminId.toString()) {
    const error = new Error('Bạn không thể tự khóa tài khoản của chính mình.');
    error.statusCode = 400;
    throw error;
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    const error = new Error('Không tìm thấy người dùng cần khóa.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Không cho phép khóa tài khoản Quản trị viên
  if (targetUser.roleCode === ROLE_CODE.ADMIN) {
    const error = new Error('Không thể khóa tài khoản có vai trò Quản trị viên.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Kiểm tra xem đã bị khóa chưa
  if (targetUser.isActive === IS_ACTIVE.LOCKED) {
    const error = new Error('Tài khoản này đã bị khóa từ trước.');
    error.statusCode = 400;
    throw error;
  }

  // Cập nhật trạng thái người dùng
  targetUser.isActive = IS_ACTIVE.LOCKED;
  targetUser.lockReason = reason.trim();
  targetUser.lockedAt = new Date();
  await targetUser.save();

  // 4. Cascade: Tự động tạm ẩn/đình chỉ các dự án đang mở tuyển của người dùng này để tránh người khác nộp hồ sơ
  await Project.updateMany(
    { ownerId: targetUserId, status: PROJECT_STATUS.OPEN },
    {
      status: PROJECT_STATUS.SUSPENDED,
      moderationReason: 'Tài khoản chủ dự án tạm thời bị khóa kiểm duyệt',
      moderatedAt: new Date(),
      moderatedBy: currentAdminId
    }
  );

  // 5. Gửi thông báo đến chuông của người dùng
  try {
    await Notification.create({
      userId: targetUserId,
      type: NOTIFICATION_TYPE.SYSTEM,
      title: 'Tài khoản của bạn đã bị khóa',
      content: `Tài khoản của bạn đã bị khóa bởi Quản trị viên. Lý do: ${reason.trim()}`
    });
  } catch (err) {
    console.error('[Admin] Lỗi khi tạo thông báo khóa tài khoản:', err);
  }

  return {
    message: 'Khóa tài khoản thành công.',
    user: {
      _id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      isActive: targetUser.isActive,
      lockReason: targetUser.lockReason,
      lockedAt: targetUser.lockedAt
    }
  };
};

/**
 * Mở khóa tài khoản người dùng
 */
const unlockUser = async (targetUserId, currentAdminId) => {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    const error = new Error('ID người dùng không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    const error = new Error('Không tìm thấy người dùng cần mở khóa.');
    error.statusCode = 404;
    throw error;
  }

  if (targetUser.isActive !== IS_ACTIVE.LOCKED) {
    const error = new Error('Tài khoản này hiện không ở trạng thái bị khóa.');
    error.statusCode = 400;
    throw error;
  }

  targetUser.isActive = IS_ACTIVE.OFFLINE; // Sẽ chuyển thành ONLINE khi họ đăng nhập lại
  targetUser.lockReason = null;
  targetUser.lockedAt = null;
  await targetUser.save();

  // Gửi thông báo mở khóa tới chuông người dùng
  try {
    await Notification.create({
      userId: targetUserId,
      type: NOTIFICATION_TYPE.SYSTEM,
      title: 'Tài khoản đã được mở khóa',
      content: 'Tài khoản của bạn đã được mở khóa bởi Quản trị viên. Bạn có thể tiếp tục sử dụng UniVerse AI.'
    });
  } catch (err) {
    console.error('[Admin] Lỗi khi tạo thông báo mở khóa:', err);
  }

  return {
    message: 'Mở khóa tài khoản thành công.',
    user: {
      _id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      isActive: targetUser.isActive
    }
  };
};

/**
 * Lấy danh sách tất cả dự án trong hệ thống để phục vụ kiểm duyệt
 */
const getProjectsList = async (query = {}) => {
  const { search, status, departmentId, page = 1, limit = 10 } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
    filter.departmentIds = departmentId;
  }

  if (search && search.trim()) {
    filter.title = { $regex: search.trim(), $options: 'i' };
  }

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('ownerId', 'name email avatar currentPackage phone')
      .populate('departmentIds', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Project.countDocuments(filter)
  ]);

  // Thống kê số lượng ứng tuyển cho mỗi dự án
  const projectIds = projects.map(p => p._id);
  const applicationStats = await Application.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: '$projectId', count: { $sum: 1 } } }
  ]);

  const appCountMap = {};
  applicationStats.forEach(item => {
    appCountMap[item._id.toString()] = item.count;
  });

  const formattedProjects = projects.map(p => {
    const obj = p.toObject();
    obj.applicationCount = appCountMap[p._id.toString()] || 0;
    obj.currentMemberCount = (p.members ? p.members.length : 0) + 1; // Tính cả chủ dự án
    return obj;
  });

  return {
    projects: formattedProjects,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

/**
 * Kiểm duyệt dự án (Đình chỉ / Xóa bài / Khôi phục) kèm lý do và bảo vệ dữ liệu thành viên
 */
const moderateProject = async (projectId, action, reason, currentAdminId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    const error = new Error('ID dự án không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }

  const project = await Project.findById(projectId).populate('ownerId', 'name email');
  if (!project) {
    const error = new Error('Không tìm thấy dự án cần kiểm duyệt.');
    error.statusCode = 404;
    throw error;
  }

  const trimmedReason = reason.trim();
  const ownerId = project.ownerId?._id || project.ownerId;
  const projectTitle = project.title;

  // ===== TRƯỜNG HỢP 1: XÓA HOÀN TOÀN (DELETE) =====
  if (action === 'delete') {
    // RÀNG BUỘC NGHIỆP VỤ: Nếu dự án đã có thành viên tham gia (members > 0 ngoài owner), KHÔNG cho phép xóa cứng
    const approvedMemberCount = project.members ? project.members.length : 0;
    if (approvedMemberCount > 0) {
      const error = new Error(
        `Không thể xóa hoàn toàn dự án đã có ${approvedMemberCount} thành viên tham gia. Vui lòng chọn hành động "Đình chỉ / Ẩn bài đăng vi phạm" để bảo vệ quyền lợi và dữ liệu của các thành viên khác.`
      );
      error.statusCode = 400;
      throw error;
    }

    // Xóa dự án khỏi cơ sở dữ liệu
    await Project.findByIdAndDelete(projectId);

    // Tự động từ chối các đơn ứng tuyển đang pending
    await Application.updateMany(
      { projectId, status: 'pending' },
      { status: 'rejected', rejectReason: 'Dự án đã bị gỡ bỏ bởi Quản trị viên' }
    );

    // Gửi thông báo đến chuông của Chủ dự án
    try {
      await Notification.create({
        userId: ownerId,
        type: NOTIFICATION_TYPE.SYSTEM,
        title: `Bài đăng dự án "${projectTitle}" đã bị gỡ bỏ`,
        content: `Quản trị viên đã gỡ bỏ bài đăng dự án của bạn. Lý do: ${trimmedReason}`,
        referenceModel: 'Project'
      });
    } catch (err) {
      console.error('[Admin] Lỗi khi tạo thông báo gỡ dự án:', err);
    }

    return { message: 'Đã gỡ bỏ bài đăng dự án thành công và gửi thông báo tới tác giả.' };
  }

  // ===== TRƯỜNG HỢP 2: ĐÌNH CHỈ / ẨN DỰ ÁN VI PHẠM (SUSPEND) =====
  if (action === 'suspend') {
    project.status = PROJECT_STATUS.SUSPENDED;
    project.moderationReason = trimmedReason;
    project.moderatedAt = new Date();
    project.moderatedBy = currentAdminId;
    await project.save();

    // 1. Gửi thông báo đến Chủ dự án
    try {
      await Notification.create({
        userId: ownerId,
        type: NOTIFICATION_TYPE.SYSTEM,
        title: `Dự án "${projectTitle}" đã bị tạm đình chỉ`,
        content: `Dự án của bạn đã bị tạm đình chỉ hiển thị bởi Quản trị viên. Lý do: ${trimmedReason}`,
        referenceId: project._id,
        referenceModel: 'Project'
      });

      // 2. Nếu đã có thành viên tham gia: Gửi thông báo cho từng thành viên biết dự án bị đình chỉ
      if (project.members && project.members.length > 0) {
        for (const member of project.members) {
          if (member.userId && member.userId.toString() !== ownerId.toString()) {
            await Notification.create({
              userId: member.userId,
              type: NOTIFICATION_TYPE.SYSTEM,
              title: `Dự án "${projectTitle}" bạn tham gia đã bị tạm đình chỉ`,
              content: `Dự án bạn đang tham gia đã bị tạm đình chỉ kiểm duyệt bởi Quản trị viên. Lý do: ${trimmedReason}`,
              referenceId: project._id,
              referenceModel: 'Project'
            });
          }
        }
      }
    } catch (err) {
      console.error('[Admin] Lỗi khi tạo thông báo đình chỉ dự án:', err);
    }

    return { message: 'Dự án đã được chuyển sang trạng thái đình chỉ thành công.', project };
  }

  // ===== TRƯỜNG HỢP 3: KHÔI PHỤC DỰ ÁN (RESTORE) =====
  if (action === 'restore') {
    project.status = PROJECT_STATUS.OPEN;
    project.moderationReason = null;
    project.moderatedAt = null;
    project.moderatedBy = null;
    await project.save();

    // Gửi thông báo khôi phục cho chủ dự án
    try {
      await Notification.create({
        userId: ownerId,
        type: NOTIFICATION_TYPE.SYSTEM,
        title: `Dự án "${projectTitle}" đã được khôi phục`,
        content: 'Dự án của bạn đã được Quản trị viên phê duyệt khôi phục hoạt động bình thường.',
        referenceId: project._id,
        referenceModel: 'Project'
      });
    } catch (err) {
      console.error('[Admin] Lỗi khi tạo thông báo khôi phục dự án:', err);
    }

    return { message: 'Dự án đã được khôi phục hoạt động thành công.', project };
  }

  const error = new Error('Hành động kiểm duyệt không hợp lệ.');
  error.statusCode = 400;
  throw error;
};

/**
 * Lấy danh sách chuyên ngành có lọc theo ngành học
 */
const getMajorsList = async (departmentId = null) => {
  const filter = {};
  if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
    filter.departmentId = departmentId;
  }

  const majors = await Major.find(filter)
    .populate('departmentId', 'name')
    .sort({ departmentId: 1, name: 1 });

  return majors;
};

/**
 * Tạo mới chuyên ngành hẹp gắn với ngành học cha
 */
const createMajor = async (name, departmentId) => {
  const trimmedName = name.trim();

  // Kiểm tra ngành học cha có tồn tại không
  const dept = await Department.findById(departmentId);
  if (!dept) {
    const error = new Error('Ngành học cha không tồn tại.');
    error.statusCode = 404;
    throw error;
  }

  // Kiểm tra trùng tên trong cùng một ngành học (so sánh không phân biệt hoa thường và dấu tiếng Việt)
  const existingMajors = await Major.find({ departmentId });
  const normalizedTarget = removeAccents(trimmedName);

  const isDuplicate = existingMajors.some(m => removeAccents(m.name) === normalizedTarget);
  if (isDuplicate) {
    const error = new Error(`Chuyên ngành "${trimmedName}" đã tồn tại trong ngành học "${dept.name}".`);
    error.statusCode = 400;
    throw error;
  }

  const newMajor = await Major.create({
    name: trimmedName,
    departmentId,
    isActive: true
  });

  return await newMajor.populate('departmentId', 'name');
};

/**
 * Bật/tắt trạng thái hiển thị của chuyên ngành
 */
const toggleMajorStatus = async (majorId) => {
  if (!mongoose.Types.ObjectId.isValid(majorId)) {
    const error = new Error('ID chuyên ngành không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }

  const major = await Major.findById(majorId);
  if (!major) {
    const error = new Error('Không tìm thấy chuyên ngành.');
    error.statusCode = 404;
    throw error;
  }

  major.isActive = !major.isActive;
  await major.save();

  return major;
};

/**
 * Lấy danh sách kỹ năng trong hệ thống
 */
const getSkillsList = async (query = {}) => {
  const { search, isApproved } = query;
  const filter = {};

  if (isApproved !== undefined && isApproved !== '') {
    filter.isApproved = isApproved === 'true' || isApproved === true;
  }

  if (search && search.trim()) {
    filter.name = { $regex: search.trim(), $options: 'i' };
  }

  const skills = await Skill.find(filter).sort({ usageCount: -1, createdAt: -1 }).limit(100);
  return skills;
};

/**
 * Thêm kỹ năng nổi bật mới vào từ điển hệ thống
 */
const createSkill = async (name) => {
  const trimmedName = name.trim();

  // Kiểm tra trùng lặp kỹ năng không phân biệt hoa thường và dấu
  const normalizedTarget = removeAccents(trimmedName);
  const existingSkills = await Skill.find();

  const isDuplicate = existingSkills.some(s => removeAccents(s.name) === normalizedTarget);
  if (isDuplicate) {
    const error = new Error(`Kỹ năng "${trimmedName}" đã tồn tại trong từ điển hệ thống.`);
    error.statusCode = 400;
    throw error;
  }

  const newSkill = await Skill.create({
    name: trimmedName,
    isApproved: true,
    usageCount: 1
  });

  return newSkill;
};

/**
 * Phê duyệt một kỹ năng do người dùng tự nhập
 */
const approveSkill = async (skillId) => {
  if (!mongoose.Types.ObjectId.isValid(skillId)) {
    const error = new Error('ID kỹ năng không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }

  const skill = await Skill.findById(skillId);
  if (!skill) {
    const error = new Error('Không tìm thấy kỹ năng.');
    error.statusCode = 404;
    throw error;
  }

  skill.isApproved = true;
  await skill.save();

  return skill;
};

module.exports = {
  getSystemStats,
  getUsersList,
  lockUser,
  unlockUser,
  getProjectsList,
  moderateProject,
  getMajorsList,
  createMajor,
  toggleMajorStatus,
  getSkillsList,
  createSkill,
  approveSkill
};
