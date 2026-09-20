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
  const existingApplication = await Application.findOne({ projectId, applicantId });
  if (existingApplication) {
    throw new Error('Bạn đã nộp hồ sơ cho dự án này rồi.');
  }

  // 6. Tạo hồ sơ
  const newApplication = new Application({
    projectId,
    applicantId,
    cvFileUrl,
    note,
    status: APPLICATION_STATUS.PENDING
  });

  await newApplication.save();

  return newApplication;
};

module.exports = {
  createApplication
};
