const router = require('express').Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, reviewController.createReview);
router.get('/project/:projectId', verifyToken, reviewController.getProjectReviewStatus);
router.get('/user/:userId', verifyToken, reviewController.getUserReviews);

module.exports = router;
