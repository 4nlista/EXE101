const Application = require('../models/Application');
const Project = require('../models/Project');
const { APPLICATION_STATUS } = require('../constants/applicationEnum');

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
  if (project.status !== 'open') {
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
      error.reason = 'PENDING';
      throw error;
    }
    if (application.status === APPLICATION_STATUS.APPROVED) {
      const error = new Error('Bạn đã là thành viên của dự án này.');
      error.reason = 'APPROVED';
      throw error;
    }
    if (application.status === APPLICATION_STATUS.REJECTED) {
      if (application.rejectionCount >= 3) {
        const error = new Error('Bạn đã bị từ chối tối đa 3 lần.');
        error.reason = 'MAX_REJECTED';
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
    return { canApply: true, reason: null };
  }

  if (application.status === APPLICATION_STATUS.PENDING) {
    return { canApply: false, reason: 'PENDING' };
  }
  
  if (application.status === APPLICATION_STATUS.APPROVED) {
    return { canApply: false, reason: 'APPROVED' };
  }
  
  if (application.status === APPLICATION_STATUS.REJECTED) {
    if (application.rejectionCount >= 3) {
      return { canApply: false, reason: 'MAX_REJECTED' };
    } else {
      return { canApply: true, reason: null };
    }
  }

  return { canApply: false, reason: 'ALREADY_APPLIED' };
};

module.exports = {
  createApplication,
  checkApplicationStatus
};
