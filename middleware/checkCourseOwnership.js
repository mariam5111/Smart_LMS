const Course = require('../models/course.model');
const AppError = require('../utils/appError');

const checkCourseOwnership = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id || req.params.courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    // Admin can do anything
    if (req.user.role === 'Admin') {
      req.course = course;
      return next();
    }

    // Instructor must be the owner
    if (course.instructor.toString() !== req.user._id.toString()) {
      return next(new AppError('You are not authorized to modify this course', 403));
    }

    req.course = course;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkCourseOwnership;