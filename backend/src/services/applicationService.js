const Application = require('../models/Application');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const { APPLICATION_STATUS } = require('../constants/applicationEnum');
const { PROJECT_STATUS } = require('../constants/projectEnum');
const { NOTIFICATION_TYPE } = require('../constants/notificationEnum');

/**
 * Xử lý logic nộp hồ sơ ứng tuyển
 * @param {string} projectId ID của dự án
 * @param {string} applicantId ID của người ứng tuyển
 * @param {string} cvFileUrl Link Cloudinary của CV
 * @param {string} note Ghi chú ứng tuyển
 */
const createApplication = async (projectId, applicantId, cvFileUrl, note) => {
  // 1. Kiểm tra dự án tồn tại
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Dự án không tồn tại.');
  }

  // 2. Kiểm tra dự án có đang mở tuyển không
  if (project.status !== PROJECT_STATUS.OPEN) {
    throw new Error('Dự án này đã đóng tuyển thành viên.');
  }

  // 3. Kiểm tra owner không được tự ứng tuyển vào dự án của mình
  if (project.ownerId.toString() === applicantId.toString()) {
    throw new Error('Bạn không thể ứng tuyển vào dự án do chính mình tạo ra.');
  }

  // 4. Kiểm tra dự án đã đủ thành viên chưa
  if (project.members.length >= project.maxMembers) {
    throw new Error('Dự án này đã tuyển đủ thành viên.');
  }

  // 5. Kiểm tra người dùng đã ứng tuyển chưa
  let application = await Application.findOne({ projectId, applicantId });
  if (application) {
    if (application.status === APPLICATION_STATUS.PENDING) {
      const error = new Error('Hồ sơ của bạn đang được duyệt.');
      error.appStatus = application.status;
      throw error;
    }
    if (application.status === APPLICATION_STATUS.APPROVED) {
      const error = new Error('Bạn đã là thành viên của dự án này.');
      error.appStatus = application.status;
      throw error;
    }
    if (application.status === APPLICATION_STATUS.REJECTED) {
      if (application.rejectionCount >= 3) {
        const error = new Error('Bạn đã bị từ chối tối đa 3 lần.');
        error.appStatus = application.status;
        error.rejectionCount = application.rejectionCount;
        throw error;
      }
      
      // Cho phép nộp lại: cập nhật thông tin và chuyển trạng thái về PENDING
      application.cvFileUrl = cvFileUrl;
      application.note = note;
      application.status = APPLICATION_STATUS.PENDING;
      await application.save();
      
      return application;
    }
  }

  // 6. Tạo hồ sơ mới nếu chưa từng nộp
  const newApplication = new Application({
    projectId,
    applicantId,
    cvFileUrl,
    note,
    status: APPLICATION_STATUS.PENDING,
    rejectionCount: 0
  });

  await newApplication.save();

  return newApplication;
};

const checkApplicationStatus = async (projectId, applicantId) => {
  const application = await Application.findOne({ projectId, applicantId });
  
  if (!application) {
    return { canApply: true, status: null, rejectionCount: 0 };
  }

  if (application.status === APPLICATION_STATUS.PENDING || application.status === APPLICATION_STATUS.APPROVED || application.status === APPLICATION_STATUS.INVITED) {
    return { canApply: false, status: application.status, rejectionCount: application.rejectionCount };
  }
  
  if (application.status === APPLICATION_STATUS.REJECTED) {
    if (application.rejectionCount >= 3) {
      return { canApply: false, status: application.status, rejectionCount: application.rejectionCount };
    } else {
      return { canApply: true, status: application.status, rejectionCount: application.rejectionCount };
    }
  }

  return { canApply: false, status: application.status, rejectionCount: application.rejectionCount };
};

const getMyApplications = async (applicantId, query) => {
  const { status, search, page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  let filter = { applicantId };
  if (status) filter.status = status;

  // Nếu có tìm kiếm theo tên dự án, ta cần populate và sau đó filter, 
  // nhưng MongoDB khó search field của bảng populate, 
  // do đó ưu tiên tìm dự án trước
  if (search) {
    const projects = await Project.find({ title: { $regex: search, $options: 'i' } }).select('_id');
    const projectIds = projects.map(p => p._id);
    filter.projectId = { $in: projectIds };
  }

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate({
        path: 'projectId',
        select: 'title departmentIds deadline status maxMembers members ownerId gradeTarget',
        populate: { path: 'departmentIds', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Application.countDocuments(filter)
  ]);

  return {
    applications,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page)
  };
};

const cancelApplication = async (applicationId, applicantId) => {
  const application = await Application.findOne({ _id: applicationId, applicantId });
  
  if (!application) {
    throw new Error('Không tìm thấy đơn đăng ký.');
  }

  if (application.status !== APPLICATION_STATUS.PENDING) {
    throw new Error('Chỉ có thể hủy đơn đang chờ duyệt.');
  }

  await application.deleteOne();
  return true;
};

const acceptInvite = async (applicationId, applicantId) => {
  const application = await Application.findOne({ _id: applicationId, applicantId });
  
  if (!application) throw new Error('Không tìm thấy đơn.');
  if (application.status !== APPLICATION_STATUS.INVITED) {
    throw new Error('Đơn đăng ký không ở trạng thái được mời.');
  }

  const project = await Project.findById(application.projectId);
  if (!project) throw new Error('Dự án không tồn tại.');
  
  if (project.status !== PROJECT_STATUS.OPEN) {
    throw new Error('Dự án đã đóng tuyển.');
  }
  if (project.members.length >= project.maxMembers) {
    throw new Error('Dự án đã đủ thành viên.');
  }

  // Thêm vào project.members
  project.members.push({
    userId: applicantId,
    role: 'Member'
  });

  // Cập nhật trạng thái application
  application.status = APPLICATION_STATUS.APPROVED;

  // Auto-close project nếu đã đủ slot
  if (project.members.length >= project.maxMembers) {
    project.status = PROJECT_STATUS.CLOSED;
    
    // Tự động từ chối các đơn PENDING còn lại
    const pendingApps = await Application.find({ projectId: project._id, status: APPLICATION_STATUS.PENDING });
    for (const app of pendingApps) {
      app.status = APPLICATION_STATUS.REJECTED;
      app.rejectionCount += 1;
      await app.save();

      // Gửi thông báo từ chối
      await Notification.create({
        userId: app.applicantId,
        type: NOTIFICATION_TYPE.REJECTED,
        title: 'Hồ sơ bị từ chối',
        content: `Dự án "${project.title}" đã tuyển đủ thành viên. Đơn của bạn đã bị từ chối.`,
        referenceId: project._id,
        referenceModel: 'Project'
      });
    }
  }

  await Promise.all([project.save(), application.save()]);

  // Gửi thông báo cho chủ dự án
  await Notification.create({
    userId: project.ownerId,
    type: NOTIFICATION_TYPE.INVITATION_ACCEPTED,
    title: 'Lời mời được chấp nhận',
    content: `Ứng viên đã chấp nhận lời mời tham gia dự án "${project.title}".`,
    referenceId: project._id,
    referenceModel: 'Project'
  });

  return application;
};

const declineInvite = async (applicationId, applicantId) => {
  const application = await Application.findOne({ _id: applicationId, applicantId });
  
  if (!application) throw new Error('Không tìm thấy đơn.');
  if (application.status !== APPLICATION_STATUS.INVITED) {
    throw new Error('Đơn đăng ký không ở trạng thái được mời.');
  }

  application.status = APPLICATION_STATUS.REJECTED;
  await application.save();

  // Có thể gửi thông báo cho chủ dự án nếu cần, tạm thời ko cần thiết
  return true;
};

module.exports = {
  createApplication,
  checkApplicationStatus,
  getMyApplications,
  cancelApplication,
  acceptInvite,
  declineInvite
};
