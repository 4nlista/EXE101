const Project = require('../models/Project');
const Review = require('../models/Review');
const User = require('../models/User');
const { PROJECT_STATUS } = require('../constants/projectEnum');
const { updateAverageRating } = require('../services/reviewService');
const cron = require('node-cron');

const runAutoRating = async () => {
  try {
    console.log('[Cron Job] Bắt đầu quét auto-rating 5 sao cho dự án quá hạn...');
    const now = new Date();

    // 1. Tìm tất cả dự án hoàn thành mà hạn đánh giá đã qua và chưa xử lý auto-rate
    const projects = await Project.find({
      status: PROJECT_STATUS.COMPLETED,
      reviewDeadline: { $lte: now },
      autoRatedCompleted: false
    }).populate('ownerId');

    for (const project of projects) {
      // Thu thập id tất cả thành viên (bao gồm leader)
      const allMembers = [];
      if (project.ownerId) {
        allMembers.push(project.ownerId._id.toString());
      }
      
      project.members.forEach(m => {
        if (m.userId) {
          allMembers.push(m.userId.toString());
        }
      });

      // Lọc trùng (nếu ownerId nằm trong members)
      const uniqueMembers = [...new Set(allMembers)];

      // 2. Chạy cặp từng người
      for (let i = 0; i < uniqueMembers.length; i++) {
        for (let j = 0; j < uniqueMembers.length; j++) {
          if (i !== j) {
            const reviewerId = uniqueMembers[i];
            const revieweeId = uniqueMembers[j];

            const existingReview = await Review.findOne({
              projectId: project._id,
              reviewerId,
              revieweeId
            });

            if (!existingReview) {
              const newReview = new Review({
                projectId: project._id,
                reviewerId,
                revieweeId,
                rating: 5,
                isAutoRated: true
              });
              await newReview.save();
            }
          }
        }
      }

      // 3. Cập nhật lại rating của tất cả member trong dự án
      for (const memberId of uniqueMembers) {
        await updateAverageRating(memberId);
      }

      // 4. Đánh dấu đã quét
      project.autoRatedCompleted = true;
      await project.save();
      console.log(`[Cron Job] Đã hoàn thành auto-rating cho dự án: ${project._id}`);
    }
  } catch (error) {
    console.error('[Cron Job Error] Lỗi auto rating:', error);
  }
};

// Chạy 1 ngày 1 lần vào 00:00
module.exports = () => {
  cron.schedule('0 0 * * *', runAutoRating);
  console.log('[Cron Job] Đã khởi tạo tiến trình auto-rating dự án.');
};
