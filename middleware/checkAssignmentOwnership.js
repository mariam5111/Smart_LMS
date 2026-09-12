const Assignment = require('../models/assignment.model');
const Course = require('../models/course.model');
const AppError = require('../utils/appError');

const checkAssignmentOwnership = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return next(new AppError('Assignment not found', 404));
    }

    const course = await Course.findById(assignment.course);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

  
    if (req.user.role === 'Admin') {
      req.assignment = assignment;
      req.course = course;
      return next();
    }

  
    if (course.instructor.toString() !== req.user._id.toString()) {
      return next(
        new AppError('You are not authorized to modify this assignment', 403)
      );
    }

    req.assignment = assignment;
    req.course = course;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkAssignmentOwnership;