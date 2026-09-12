const Course = require('../models/course.model');
const AppError = require('../utils/appError');

const checkCourseOwnership = async (req, res, next) => {
  try {
   const courseId = req.params.courseId || req.params.id;
   const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    
    if (req.user.role === 'Admin') {
      req.course = course;
      return next();
    }

    
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