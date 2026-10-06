const cron = require('node-cron');
const Project = require('../models/Project');
const Application = require('../models/Application');
const { PROJECT_STATUS } = require('../constants/projectEnum');
const { APPLICATION_STATUS } = require('../constants/applicationEnum');

/**
 * Quét và cập nhật tự động các dự án và hồ sơ ứng tuyển đã quá hạn chót (deadline)
 */
const checkAndUpdateExpiredProjects = async () => {
  try {
    const now = new Date();

    // 1. Tìm các dự án OPEN đã quá hạn deadline -> chuyển sang CLOSED
    const expiredOpenProjects = await Project.find({
      status: PROJECT_STATUS.OPEN,
      deadline: { $lt: now }
    }).select('_id title');

    if (expiredOpenProjects.length > 0) {
      const expiredProjectIds = expiredOpenProjects.map(p => p._id);

      // Cập nhật trạng thái dự án sang CLOSED
      await Project.updateMany(
        { _id: { $in: expiredProjectIds } },
        { status: PROJECT_STATUS.CLOSED }
      );

      // Cập nhật tất cả hồ sơ PENDING và INVITED của các dự án này sang EXPIRED
      await Application.updateMany(
        {
          projectId: { $in: expiredProjectIds },
          status: { $in: [APPLICATION_STATUS.PENDING, APPLICATION_STATUS.INVITED] }
        },
        { status: APPLICATION_STATUS.EXPIRED }
      );
    }

    // 2. Quét tất cả dự án có deadline trong quá khứ mà còn hồ sơ PENDING hoặc INVITED
    const projectsWithPastDeadline = await Project.find({
      deadline: { $lt: now }
    }).select('_id');

    if (projectsWithPastDeadline.length > 0) {
      const pastDeadlineIds = projectsWithPastDeadline.map(p => p._id);
      await Application.updateMany(
        {
          projectId: { $in: pastDeadlineIds },
          status: { $in: [APPLICATION_STATUS.PENDING, APPLICATION_STATUS.INVITED] }
        },
        { status: APPLICATION_STATUS.EXPIRED }
      );
    }
  } catch (error) {
    console.error('[Expire Project Job Error] Lỗi khi quét dự án và hồ sơ quá hạn:', error);
  }
};

/**
 * Khởi tạo tiến trình Cron Job chạy ngầm
 */
const initExpireProjectCron = () => {
  // Chạy ngay 1 lần khi server vừa bật
  checkAndUpdateExpiredProjects();

  // Định kỳ chạy mỗi 15 phút một lần
  cron.schedule('*/15 * * * *', checkAndUpdateExpiredProjects);
  console.log('[Cron Job] Đã khởi tạo tiến trình tự động đóng dự án và hồ sơ quá hạn (expireProjectJob).');
};

module.exports = {
  checkAndUpdateExpiredProjects,
  initExpireProjectCron
};
