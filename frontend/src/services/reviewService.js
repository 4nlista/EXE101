import axiosClient from '../utils/axiosClient';

/**
 * Gửi đánh giá cho 1 thành viên
 * @param {Object} data - { projectId, revieweeId, rating }
 */
export const createReview = async (data) => {
  return await axiosClient.post('/reviews', data);
};

/**
 * Lấy trạng thái đánh giá của dự án
 * @param {String} projectId
 */
export const getProjectReviewStatus = async (projectId) => {
  return await axiosClient.get(`/reviews/project/${projectId}`);
};

/**
 * Lấy danh sách reviews nhận được của 1 user
 * @param {String} userId
 */
export const getUserReviews = async (userId) => {
  return await axiosClient.get(`/reviews/user/${userId}`);
};
