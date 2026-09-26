const mongoose = require('mongoose');
const Review = require('../models/Review');
const Project = require('../models/Project');
const User = require('../models/User');
const { PROJECT_STATUS } = require('../constants/projectEnum');

// 1. Cập nhật averageRating của user
const updateAverageRating = async (userId) => {
  const result = await Review.aggregate([
    { $match: { revieweeId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  const avg = result.length > 0 ? result[0].avg : 0;
  const count = result.length > 0 ? result[0].count : 0;

  await User.findByIdAndUpdate(userId, {
    averageRating: Number(avg.toFixed(1)),
    totalReviewsReceived: count
  });
};

// 2. Gửi đánh giá cho 1 đồng đội
const createReview = async (reviewerId, data) => {
  const { projectId, revieweeId, rating } = data;

  if (reviewerId.toString() === revieweeId.toString()) {
    throw new Error('Không thể tự đánh giá chính mình');
  }

  const project = await Project.findById(projectId);
  if (!project) throw new Error('Dự án không tồn tại');

  if (project.status !== PROJECT_STATUS.COMPLETED) {
    throw new Error('Dự án chưa hoàn thành, không thể đánh giá');
  }

  const now = new Date();
  if (project.reviewDeadline && project.reviewDeadline < now) {
    throw new Error('Đã hết hạn đánh giá cho dự án này');
  }

  const isReviewerMember = project.members.some(m => m.userId.toString() === reviewerId.toString()) || project.ownerId.toString() === reviewerId.toString();
  const isRevieweeMember = project.members.some(m => m.userId.toString() === revieweeId.toString()) || project.ownerId.toString() === revieweeId.toString();

  if (!isReviewerMember) throw new Error('Bạn không phải là thành viên của dự án này');
  if (!isRevieweeMember) throw new Error('Người được đánh giá không phải là thành viên của dự án này');

  const existingReview = await Review.findOne({ projectId, reviewerId, revieweeId });
  if (existingReview) {
    throw new Error('Bạn đã đánh giá người này trong dự án này rồi');
  }

  const newReview = new Review({
    projectId,
    reviewerId,
    revieweeId,
    rating
  });

  await newReview.save();
  await updateAverageRating(revieweeId);

  return { reviewId: newReview._id };
};

// 3. Lấy trạng thái đánh giá của dự án
const getProjectReviewStatus = async (projectId, userId) => {
  const project = await Project.findById(projectId)
    .populate('members.userId', 'name avatar')
    .populate('ownerId', 'name avatar');
  
  if (!project) throw new Error('Dự án không tồn tại');

  const isExpired = project.reviewDeadline ? project.reviewDeadline < new Date() : false;

  const allMembers = [];
  if (project.ownerId) {
    allMembers.push({
      userId: project.ownerId._id,
      name: project.ownerId.name,
      avatar: project.ownerId.avatar,
      role: 'Leader'
    });
  }

  project.members.forEach(m => {
    if (m.userId && m.userId._id.toString() !== (project.ownerId ? project.ownerId._id.toString() : '')) {
      allMembers.push({
        userId: m.userId._id,
        name: m.userId.name,
        avatar: m.userId.avatar,
        role: m.role || 'Member'
      });
    }
  });

  const targetMembers = allMembers.filter(m => m.userId.toString() !== userId.toString());

  const myReviews = await Review.find({ projectId, reviewerId: userId }).select('revieweeId rating');
  const reviewedIds = myReviews.map(r => r.revieweeId.toString());

  const membersWithStatus = targetMembers.map(m => {
    const review = myReviews.find(r => r.revieweeId.toString() === m.userId.toString());
    return {
      ...m,
      hasBeenReviewedByMe: reviewedIds.includes(m.userId.toString()),
      myRating: review ? review.rating : null
    }
  });

  return {
    projectId: project._id,
    title: project.title,
    status: project.status,
    completedAt: project.completedAt,
    reviewDeadline: project.reviewDeadline,
    isExpired,
    members: membersWithStatus,
    myReviewProgress: `${reviewedIds.length}/${targetMembers.length}`
  };
};

// 4. Lấy reviews nhận được của user
const getUserReviews = async (userId) => {
  const user = await User.findById(userId).select('averageRating totalReviewsReceived');
  if (!user) throw new Error('Người dùng không tồn tại');

  const reviews = await Review.find({ revieweeId: userId })
    .populate('projectId', 'title')
    .sort({ createdAt: -1 });

  const formattedReviews = reviews.map(r => ({
    _id: r._id,
    projectTitle: r.projectId ? r.projectId.title : 'Dự án đã xóa',
    rating: r.rating,
    isAutoRated: r.isAutoRated,
    createdAt: r.createdAt
  }));

  return {
    averageRating: user.averageRating,
    totalReviews: user.totalReviewsReceived,
    reviews: formattedReviews
  };
};

module.exports = {
  createReview,
  getProjectReviewStatus,
  getUserReviews,
  updateAverageRating
};
