const reviewService = require('../services/reviewService');
const { createReviewValidate } = require('../validators/reviewValidate');

const createReview = async (req, res, next) => {
  try {
    const { error } = createReviewValidate.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const data = await reviewService.createReview(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getProjectReviewStatus = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const data = await reviewService.getProjectReviewStatus(projectId, req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const data = await reviewService.getUserReviews(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProjectReviewStatus,
  getUserReviews
};
