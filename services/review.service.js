const mongoose = require('mongoose');
const Review = require('../models/review.model');
const Course = require('../models/course.model');
const Enrollment = require('../models/enrollment.model');
const AppError = require('../utils/appError');


const recalculateCourseRating = async (courseId) => {
  const result = await Review.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = result[0]?.avgRating || 0;
  const rounded = Math.round(avg * 10) / 10; 

  await Course.findByIdAndUpdate(courseId, { ratingAverage: rounded });

  return rounded;
};

const createReview = async (studentId, courseId, reviewData) => {
 
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

 
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (!enrollment) {
    throw new AppError('You must be enrolled in this course to review it', 403);
  }

  
  if (enrollment.status !== 'completed') {
    throw new AppError(
      'You can only review a course after completing it',
      403
    );
  }

  
  const existingReview = await Review.findOne({
    student: studentId,
    course: courseId,
  });
  if (existingReview) {
    throw new AppError('You have already reviewed this course', 409);
  }

 
  const review = await Review.create({
    student: studentId,
    course: courseId,
    rating: reviewData.rating,
    comment: reviewData.comment || '',
  });

  await recalculateCourseRating(courseId);

  return review;
};

const getCourseReviews = async (courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const reviews = await Review.find({ course: courseId })
    .populate('student', 'name')
    .sort({ createdAt: -1 });

 
  const stats = await Review.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const avgRating = stats[0]?.avgRating || 0;
  const count = stats[0]?.count || 0;

  return {
    reviews,
    stats: {
      avgRating: Math.round(avgRating * 10) / 10,
      count,
    },
  };
};

const getReviewById = async (reviewId) => {
  const review = await Review.findById(reviewId)
    .populate('student', 'name')
    .populate('course', 'title instructor');

  if (!review) {
    throw new AppError('Review not found', 404);
  }
  return review;
};

const updateReview = async (reviewId, studentId, updateData) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError('Review not found', 404);
  }

 
  if (review.student.toString() !== studentId.toString()) {
    throw new AppError('You can only update your own review', 403);
  }

  if (updateData.rating !== undefined) review.rating = updateData.rating;
  if (updateData.comment !== undefined) review.comment = updateData.comment;

  await review.save();

  
  await recalculateCourseRating(review.course);

  return review;
};

const deleteReview = async (reviewId, user) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError('Review not found', 404);
  }

  const isOwner = review.student.toString() === user._id.toString();
  const isAdmin = user.role === 'Admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('You are not authorized to delete this review', 403);
  }

  const courseId = review.course;
  await Review.findByIdAndDelete(reviewId);


  await recalculateCourseRating(courseId);

  return review;
};

module.exports = {
  createReview,
  getCourseReviews,
  getReviewById,
  updateReview,
  deleteReview,
  recalculateCourseRating,
};