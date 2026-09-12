const reviewService = require('../services/review.service');

const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(
      req.user._id,
      req.params.courseId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

const getCourseReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getCourseReviews(req.params.courseId);

    res.status(200).json({
      success: true,
      count: result.stats.count,
      avgRating: result.stats.avgRating,
      data: result.reviews,
    });
  } catch (error) {
    next(error);
  }
};

const getReview = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await reviewService.updateReview(
      req.params.id,
      req.user._id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.params.id, req.user);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getCourseReviews,
  getReview,
  updateReview,
  deleteReview,
};